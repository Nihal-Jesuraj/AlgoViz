import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * useGridAlgorithm — Animation controller for grid-based algorithms.
 * Uses refs for the animation loop to avoid stale closures (same pattern as useAlgorithm).
 */
export function useGridAlgorithm(generatorFn, rawGrid, ...extraArgs) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [currentGrid, setCurrentGrid] = useState([]);
  const [stepDescription, setStepDescription] = useState('');
  const [algorithmData, setAlgorithmData] = useState({});
  const [currentLine, setCurrentLine] = useState(-1);

  const generatorRef = useRef(null);
  const historyRef = useRef([]);
  const isPlayingRef = useRef(false);
  const isCompleteRef = useRef(false);
  const timerRef = useRef(null);
  const speedRef = useRef(speed);
  const currentStepRef = useRef(0);

  useEffect(() => { speedRef.current = speed; }, [speed]);

  const getDelay = () => Math.max(80, 500 / speedRef.current);

  // Initialize grid display from raw data
  const initGrid = useCallback(() => {
    if (!rawGrid || rawGrid.length === 0) return;
    const initial = rawGrid.map(row =>
      row.map(val => ({ value: val, status: 'default', distance: undefined }))
    );
    setCurrentGrid(initial);
  }, [rawGrid]);

  const initGenerator = useCallback(() => {
    if (!generatorFn || !rawGrid) return;
    generatorRef.current = generatorFn(rawGrid, ...extraArgs);
    historyRef.current = [];
    isCompleteRef.current = false;
    currentStepRef.current = 0;
    setCurrentStep(0);
    setStepDescription('');
    setAlgorithmData({});
    setCurrentLine(-1);
    initGrid();
  }, [generatorFn, rawGrid, extraArgs, initGrid]);

  const applyStep = useCallback((step) => {
    if (!step) return;
    if (step.grid) setCurrentGrid(step.grid);
    setStepDescription(step.description || '');
    setAlgorithmData(step.data || {});
    setCurrentLine(step.line ?? -1);
  }, []);

  const doStep = useCallback(() => {
    const idx = currentStepRef.current;

    if (idx < historyRef.current.length) {
      applyStep(historyRef.current[idx]);
      currentStepRef.current = idx + 1;
      setCurrentStep(idx + 1);
      return true;
    }

    if (!generatorRef.current || isCompleteRef.current) return false;

    const { value, done } = generatorRef.current.next();
    if (done || !value) { isCompleteRef.current = true; return false; }

    historyRef.current.push(value);
    applyStep(value);
    currentStepRef.current = historyRef.current.length;
    setCurrentStep(historyRef.current.length);

    if (value.type === 'complete') isCompleteRef.current = true;
    return true;
  }, [applyStep]);

  const play = useCallback(() => {
    if (!generatorRef.current && generatorFn) initGenerator();
    if (isCompleteRef.current) initGenerator();

    setIsPlaying(true);
    isPlayingRef.current = true;

    const tick = () => {
      if (!isPlayingRef.current) return;
      if (!doStep()) { setIsPlaying(false); isPlayingRef.current = false; return; }
      timerRef.current = setTimeout(tick, getDelay());
    };
    timerRef.current = setTimeout(tick, getDelay());
  }, [generatorFn, initGenerator, doStep]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  const stepForward = useCallback(() => {
    if (!generatorRef.current && generatorFn) initGenerator();
    doStep();
  }, [generatorFn, initGenerator, doStep]);

  const stepBack = useCallback(() => {
    const idx = currentStepRef.current;
    if (idx <= 0) return;
    const target = idx - 1;
    if (target === 0) { initGrid(); setStepDescription(''); setAlgorithmData({}); setCurrentLine(-1); }
    else applyStep(historyRef.current[target - 1]);
    currentStepRef.current = target;
    setCurrentStep(target);
  }, [applyStep, initGrid]);

  const reset = useCallback(() => { pause(); initGenerator(); }, [pause, initGenerator]);

  useEffect(() => { return () => { if (timerRef.current) clearTimeout(timerRef.current); }; }, []);
  useEffect(() => { pause(); initGenerator(); }, [generatorFn, rawGrid]);

  return {
    play, pause, stepForward, stepBack, reset,
    isPlaying, currentStep, totalSteps: historyRef.current.length,
    speed, setSpeed, currentGrid, stepDescription, algorithmData, currentLine,
  };
}

export default useGridAlgorithm;
