import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * useAlgorithm — Custom hook for the algorithm animation controller.
 *
 * Uses refs for the animation loop to avoid stale closure issues.
 * The generator and step logic live entirely in refs, while React state
 * is only used for rendering.
 */
export function useAlgorithm(generatorFn, getAdjacencyList, startNode, directed, weighted) {
  // ── Render state (drives UI) ──
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [currentLine, setCurrentLine] = useState(-1);
  const [algorithmState, setAlgorithmState] = useState({});
  const [nodeStates, setNodeStates] = useState(new Map());
  const [edgeStates, setEdgeStates] = useState(new Map());
  const [stepDescription, setStepDescription] = useState('');

  // ── Refs (stable across renders, no stale closures) ──
  const generatorRef = useRef(null);
  const historyRef = useRef([]);        // Array of step values
  const isPlayingRef = useRef(false);
  const isCompleteRef = useRef(false);
  const timerRef = useRef(null);
  const speedRef = useRef(speed);
  const currentStepRef = useRef(0);
  const directedRef = useRef(directed);
  const nodeStatesRef = useRef(new Map());
  const edgeStatesRef = useRef(new Map());

  // Keep refs in sync with state/props
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { directedRef.current = directed; }, [directed]);

  const getDelay = () => Math.max(100, 700 / speedRef.current);

  // ── Apply a step to node/edge state refs AND React state ──
  const applyStepToRefs = useCallback((step) => {
    if (!step) return;

    const dir = directedRef.current;
    const nStates = new Map(nodeStatesRef.current);
    const eStates = new Map(edgeStatesRef.current);

    // ── Node state logic ──
    switch (step.type) {
      case 'visit':
      case 'dequeue':
      case 'extract-min':
        for (const [id, status] of nStates) {
          if (status === 'current') nStates.set(id, 'visited');
        }
        if (step.node) nStates.set(step.node, 'current');
        break;

      case 'enqueue':
      case 'mark-visited':
        if (step.node) {
          const cur = nStates.get(step.node);
          if (!cur || cur === 'default') nStates.set(step.node, 'queued');
        }
        break;

      case 'relax':
      case 'update':
        if (step.node) nStates.set(step.node, 'queued');
        break;

      case 'add-to-mst':
        if (step.node) nStates.set(step.node, 'visited');
        break;

      case 'cycle-found':
        if (step.node) nStates.set(step.node, 'in-path');
        break;

      case 'recurse':
        if (step.node) nStates.set(step.node, 'queued');
        break;

      case 'backtrack':
        if (step.node) nStates.set(step.node, 'visited');
        break;

      case 'complete':
        for (const [id, status] of nStates) {
          if (status === 'current') nStates.set(id, 'visited');
        }
        break;
      default: break;
    }

    // ── Edge state logic ──
    if (step.edge) {
      const [src, tgt] = step.edge;
      const eid1 = `e${src}-${tgt}`;
      const eid2 = `e${tgt}-${src}`;

      switch (step.type) {
        case 'visit': case 'enqueue': case 'mark-visited':
        case 'relax': case 'update': case 'recurse':
          eStates.set(eid1, 'active');
          if (!dir) eStates.set(eid2, 'active');
          break;
        case 'add-to-mst':
          eStates.set(eid1, 'in-mst');
          if (!dir) eStates.set(eid2, 'in-mst');
          break;
        case 'cycle-found':
          eStates.set(eid1, 'in-path');
          if (!dir) eStates.set(eid2, 'in-path');
          break;
        case 'check-neighbor': {
          const cur1 = eStates.get(eid1);
          if (!cur1 || cur1 === 'default') {
            eStates.set(eid1, 'active');
            if (!dir) eStates.set(eid2, 'active');
          }
          break;
        }
        default: break;
      }
    }

    // Downgrade old active edges to visited on visit steps
    if (step.type === 'visit' || step.type === 'dequeue' || step.type === 'extract-min') {
      for (const [id, status] of eStates) {
        if (status === 'active') eStates.set(id, 'visited');
      }
      if (step.edge) {
        const [src, tgt] = step.edge;
        eStates.set(`e${src}-${tgt}`, 'active');
        if (!dir) eStates.set(`e${tgt}-${src}`, 'active');
      }
    }

    // Update refs
    nodeStatesRef.current = nStates;
    edgeStatesRef.current = eStates;

    // Update React state for rendering
    setNodeStates(new Map(nStates));
    setEdgeStates(new Map(eStates));
    setCurrentLine(step.line ?? -1);
    setAlgorithmState(step.data || {});
    setStepDescription(step.description || '');
  }, []);

  // ── Initialize generator ──
  const initGenerator = useCallback(() => {
    if (!generatorFn || !getAdjacencyList) return;
    const adjList = getAdjacencyList();
    generatorRef.current = generatorFn(adjList, startNode);
    historyRef.current = [];
    isCompleteRef.current = false;
    currentStepRef.current = 0;
    nodeStatesRef.current = new Map();
    edgeStatesRef.current = new Map();
    setCurrentStep(0);
    setCurrentLine(-1);
    setAlgorithmState({});
    setNodeStates(new Map());
    setEdgeStates(new Map());
    setStepDescription('');
  }, [generatorFn, getAdjacencyList, startNode]);

  // ── Advance one step (uses refs, no stale closures) ──
  const doStep = useCallback(() => {
    const idx = currentStepRef.current;

    // Replay from history if stepping through already-computed steps
    if (idx < historyRef.current.length) {
      const step = historyRef.current[idx];
      applyStepToRefs(step);
      currentStepRef.current = idx + 1;
      setCurrentStep(idx + 1);
      return true;
    }

    // Advance generator
    if (!generatorRef.current) return false;
    if (isCompleteRef.current) return false;

    const { value, done } = generatorRef.current.next();
    if (done || !value) {
      isCompleteRef.current = true;
      return false;
    }

    historyRef.current.push(value);
    applyStepToRefs(value);
    currentStepRef.current = historyRef.current.length;
    setCurrentStep(historyRef.current.length);

    if (value.type === 'complete') {
      isCompleteRef.current = true;
    }

    return true;
  }, [applyStepToRefs]);

  // ── Play (loop using refs — no stale closures) ──
  const play = useCallback(() => {
    if (!generatorRef.current && generatorFn) {
      initGenerator();
    }
    if (isCompleteRef.current) {
      initGenerator();
    }

    setIsPlaying(true);
    isPlayingRef.current = true;

    const tick = () => {
      if (!isPlayingRef.current) return;

      const advanced = doStep();
      if (!advanced) {
        setIsPlaying(false);
        isPlayingRef.current = false;
        return;
      }

      timerRef.current = setTimeout(tick, getDelay());
    };

    timerRef.current = setTimeout(tick, getDelay());
  }, [generatorFn, initGenerator, doStep]);

  // ── Pause ──
  const pause = useCallback(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // ── Step Forward (public API wrapping doStep) ──
  const stepForward = useCallback(() => {
    if (!generatorRef.current && generatorFn) {
      initGenerator();
    }
    doStep();
  }, [generatorFn, initGenerator, doStep]);

  // ── Step Back (replay from start to step-1) ──
  const stepBack = useCallback(() => {
    const idx = currentStepRef.current;
    if (idx <= 0) return;

    const target = idx - 1;

    // Reset state refs
    nodeStatesRef.current = new Map();
    edgeStatesRef.current = new Map();

    // Replay all steps up to target
    for (let i = 0; i < target; i++) {
      applyStepToRefs(historyRef.current[i]);
    }

    currentStepRef.current = target;
    setCurrentStep(target);

    if (target === 0) {
      setNodeStates(new Map());
      setEdgeStates(new Map());
      setCurrentLine(-1);
      setAlgorithmState({});
      setStepDescription('');
    }
  }, [applyStepToRefs]);

  // ── Reset ──
  const reset = useCallback(() => {
    pause();
    initGenerator();
  }, [pause, initGenerator]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Re-init when algo or start node changes
  useEffect(() => {
    pause();
    initGenerator();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generatorFn, startNode]);

  return {
    play,
    pause,
    stepForward,
    stepBack,
    reset,
    isPlaying,
    currentStep,
    totalSteps: historyRef.current.length,
    speed,
    setSpeed,
    currentLine,
    algorithmState,
    nodeStates,
    edgeStates,
    stepDescription,
  };
}

export default useAlgorithm;
