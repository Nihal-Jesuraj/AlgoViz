import { useState, useRef, useCallback, useEffect } from 'react';

export default function useGeneratorDriver() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentStepInfo, setCurrentStepInfo] = useState(null);

  const generatorRef = useRef(null);
  const timeoutRef = useRef(null);
  const speedRef = useRef(speed);

  useEffect(() => { speedRef.current = speed; }, [speed]);

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const playGenerator = useCallback((generatorFn) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    generatorRef.current = generatorFn();
    setIsPlaying(true);
    setCurrentStepInfo(null);
  }, []);

  const stop = useCallback(() => {
    setIsPlaying(false);
    generatorRef.current = null;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setCurrentStepInfo(null);
  }, []);

  useEffect(() => {
    if (!isPlaying || !generatorRef.current) return;

    const runStep = () => {
      if (!generatorRef.current) return;
      const { value, done } = generatorRef.current.next();
      if (done) {
        setIsPlaying(false);
        generatorRef.current = null;
        setCurrentStepInfo(null);
      } else {
        setCurrentStepInfo(value);
        timeoutRef.current = setTimeout(runStep, 1000 / speedRef.current);
      }
    };

    timeoutRef.current = setTimeout(runStep, 1000 / speedRef.current);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [isPlaying]);

  return { isPlaying, speed, setSpeed, currentStepInfo, playGenerator, stop };
}
