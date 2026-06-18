import { useState, useRef, useCallback, useEffect } from 'react';

export function useAnimationController({
  createGenerator,
  deps = [],
  applyStep,
  resetState,
  minDelay = 80,
  baseDelay = 700,
  defaultSpeed = 1,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [speed, setSpeed] = useState(defaultSpeed);

  const generatorRef = useRef(null);
  const historyRef = useRef([]);
  const isPlayingRef = useRef(false);
  const isCompleteRef = useRef(false);
  const timerRef = useRef(null);
  const speedRef = useRef(speed);
  const currentStepRef = useRef(0);

  const createGeneratorRef = useRef(createGenerator);
  createGeneratorRef.current = createGenerator;
  const applyStepRef = useRef(applyStep);
  applyStepRef.current = applyStep;
  const resetStateRef = useRef(resetState);
  resetStateRef.current = resetState;

  useEffect(() => { speedRef.current = speed; }, [speed]);

  const getDelay = useCallback(() => Math.max(minDelay, baseDelay / speedRef.current), [minDelay, baseDelay]);

  const initGenerator = useCallback(() => {
    if (!createGeneratorRef.current) return;
    generatorRef.current = createGeneratorRef.current();
    historyRef.current = [];
    isCompleteRef.current = false;
    currentStepRef.current = 0;
    setCurrentStep(0);
    resetStateRef.current?.();
  }, []);

  const doStep = useCallback(() => {
    const idx = currentStepRef.current;

    if (idx < historyRef.current.length) {
      applyStepRef.current(historyRef.current[idx]);
      currentStepRef.current = idx + 1;
      setCurrentStep(idx + 1);
      return true;
    }

    if (!generatorRef.current || isCompleteRef.current) return false;

    const { value, done } = generatorRef.current.next();
    if (done || !value) { isCompleteRef.current = true; return false; }

    historyRef.current.push(value);
    applyStepRef.current(value);
    currentStepRef.current = historyRef.current.length;
    setCurrentStep(historyRef.current.length);

    if (value.type === 'complete') isCompleteRef.current = true;
    return true;
  }, []);

  const play = useCallback(() => {
    if (!generatorRef.current && createGeneratorRef.current) initGenerator();
    if (isCompleteRef.current) initGenerator();

    setIsPlaying(true);
    isPlayingRef.current = true;

    const tick = () => {
      if (!isPlayingRef.current) return;
      if (!doStep()) { setIsPlaying(false); isPlayingRef.current = false; return; }
      timerRef.current = setTimeout(tick, getDelay());
    };
    timerRef.current = setTimeout(tick, getDelay());
  }, [initGenerator, doStep, getDelay]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  const stepForward = useCallback(() => {
    if (!generatorRef.current && createGeneratorRef.current) initGenerator();
    doStep();
  }, [initGenerator, doStep]);

  const stepBack = useCallback(() => {
    const idx = currentStepRef.current;
    if (idx <= 0) return;
    const target = idx - 1;
    if (target === 0) {
      resetStateRef.current?.();
    } else {
      applyStepRef.current(historyRef.current[target - 1]);
    }
    currentStepRef.current = target;
    setCurrentStep(target);
  }, []);

  const reset = useCallback(() => { pause(); initGenerator(); }, [pause, initGenerator]);

  useEffect(() => { return () => { if (timerRef.current) clearTimeout(timerRef.current); }; }, []);

  useEffect(() => {
    pause();
    initGenerator();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

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
  };
}

export default useAnimationController;
