import { useState, useEffect, useCallback, useRef } from 'react';

export function useArrayAlgorithm(steps = []) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(3);
  const timerRef = useRef(null);

  const totalSteps = steps.length;
  const currentStepData = steps[currentStep] || null;

  const tick = useCallback(() => {
    setCurrentStep(p => {
      if (p >= totalSteps - 1) { 
        setIsPlaying(false); 
        return p; 
      }
      return p + 1;
    });
  }, [totalSteps]);

  useEffect(() => {
    if (isPlaying) {
      const ms = [1600, 900, 500, 220, 80][speed - 1] || 500;
      timerRef.current = setTimeout(tick, ms);
    }
    return () => clearTimeout(timerRef.current);
  }, [isPlaying, currentStep, speed, tick]);

  const play = useCallback(() => {
    if (currentStep >= totalSteps - 1) { 
      setCurrentStep(0); 
    }
    setIsPlaying(true);
  }, [currentStep, totalSteps]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const stepForward = useCallback(() => {
    setIsPlaying(false);
    if (currentStep < totalSteps - 1) {
      setCurrentStep(s => s + 1);
    }
  }, [currentStep, totalSteps]);

  const stepBack = useCallback(() => {
    setIsPlaying(false);
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    }
  }, [currentStep]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
  }, []);

  return {
    play,
    pause,
    stepForward,
    stepBack,
    reset,
    isPlaying,
    currentStep,
    totalSteps,
    speed,
    setSpeed,
    currentLine: currentStepData?.activeLine ?? -1,
    stepDescription: currentStepData?.msg || '',
    algorithmState: currentStepData, // Expose full step object
  };
}
