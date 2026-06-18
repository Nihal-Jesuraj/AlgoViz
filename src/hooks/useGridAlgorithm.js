import { useState, useRef, useCallback } from 'react';
import { useAnimationController } from './useAnimationController';
import { strToNum } from '../utils/gridHelpers';

export function useGridAlgorithm(generatorFn, rawGrid, ...extraArgs) {
  const [currentGrid, setCurrentGrid] = useState([]);
  const [stepDescription, setStepDescription] = useState('');
  const [algorithmData, setAlgorithmData] = useState({});
  const [currentLine, setCurrentLine] = useState(-1);

  const rawGridRef = useRef(rawGrid);
  rawGridRef.current = rawGrid;

  const initGrid = useCallback(() => {
    if (!rawGridRef.current || rawGridRef.current.length === 0) return;
    const normalized = strToNum(rawGridRef.current);
    const initial = normalized.map(row =>
      row.map(val => ({ value: val, status: 'default', distance: undefined }))
    );
    setCurrentGrid(initial);
  }, []);

  const applyStep = useCallback((step) => {
    if (!step) return;
    if (step.grid) setCurrentGrid(step.grid);
    setStepDescription(step.description || '');
    setAlgorithmData(step.data || {});
    setCurrentLine(step.line ?? -1);
  }, []);

  const controller = useAnimationController({
    createGenerator: generatorFn && rawGrid
      ? () => generatorFn(rawGrid, ...extraArgs)
      : undefined,
    deps: [generatorFn, rawGrid, ...extraArgs],
    applyStep,
    resetState: initGrid,
    minDelay: 80,
    baseDelay: 500,
  });

  return {
    ...controller,
    currentGrid,
    stepDescription,
    algorithmData,
    currentLine,
  };
}

export default useGridAlgorithm;
