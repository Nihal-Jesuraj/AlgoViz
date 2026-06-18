import { useState, useRef, useCallback, useEffect } from 'react';
import { useAnimationController } from './useAnimationController';

export function useAlgorithm(generatorFn, getAdjacencyList, startNode, directed, _weighted) {
  const [currentLine, setCurrentLine] = useState(-1);
  const [algorithmState, setAlgorithmState] = useState({});
  const [nodeStates, setNodeStates] = useState(new Map());
  const [edgeStates, setEdgeStates] = useState(new Map());
  const [stepDescription, setStepDescription] = useState('');

  const nodeStatesRef = useRef(new Map());
  const edgeStatesRef = useRef(new Map());
  const directedRef = useRef(directed);

  useEffect(() => { directedRef.current = directed; }, [directed]);

  const applyStep = useCallback((step) => {
    if (!step) return;
    const dir = directedRef.current;
    const nStates = new Map(nodeStatesRef.current);
    const eStates = new Map(edgeStatesRef.current);

    switch (step.type) {
      case 'visit': case 'dequeue': case 'extract-min':
        for (const [id, status] of nStates) {
          if (status === 'current') nStates.set(id, 'visited');
        }
        if (step.node) nStates.set(step.node, 'current');
        break;
      case 'enqueue': case 'mark-visited':
        if (step.node) {
          const cur = nStates.get(step.node);
          if (!cur || cur === 'default') nStates.set(step.node, 'queued');
        }
        break;
      case 'relax': case 'update':
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

    nodeStatesRef.current = nStates;
    edgeStatesRef.current = eStates;

    setNodeStates(new Map(nStates));
    setEdgeStates(new Map(eStates));
    setCurrentLine(step.line ?? -1);
    setAlgorithmState(step.data || {});
    setStepDescription(step.description || '');
  }, []);

  const resetState = useCallback(() => {
    nodeStatesRef.current = new Map();
    edgeStatesRef.current = new Map();
    setCurrentLine(-1);
    setAlgorithmState({});
    setStepDescription('');
    setNodeStates(new Map());
    setEdgeStates(new Map());
  }, []);

  const controller = useAnimationController({
    createGenerator: generatorFn && getAdjacencyList
      ? () => generatorFn(getAdjacencyList(), startNode)
      : undefined,
    deps: [generatorFn, getAdjacencyList, startNode],
    applyStep,
    resetState,
    minDelay: 100,
    baseDelay: 700,
  });

  return {
    ...controller,
    currentLine,
    algorithmState,
    nodeStates,
    edgeStates,
    stepDescription,
  };
}

export default useAlgorithm;
