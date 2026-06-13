import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'algoviz-progress';

/**
 * useProgress — Tracks which Striver Graph Series problems the user has completed.
 * Persists to localStorage.
 */
export function useProgress() {
  // Initialize from localStorage
  const [completedProblems, setCompletedProblems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Persist to localStorage whenever completedProblems changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...completedProblems]));
    } catch { /* ignore quota errors */ }
  }, [completedProblems]);

  const toggleCompleted = useCallback((problemId) => {
    setCompletedProblems(prev => {
      const next = new Set(prev);
      if (next.has(problemId)) {
        next.delete(problemId);
      } else {
        next.add(problemId);
      }
      return next;
    });
  }, []);

  const isCompleted = useCallback((problemId) => {
    return completedProblems.has(problemId);
  }, [completedProblems]);

  const getSectionProgress = useCallback((problems, sectionNumber) => {
    const sectionProblems = problems.filter(p => p.section === sectionNumber);
    const completed = sectionProblems.filter(p => completedProblems.has(p.id)).length;
    return {
      completed,
      total: sectionProblems.length,
      percentage: sectionProblems.length > 0 ? Math.round((completed / sectionProblems.length) * 100) : 0,
    };
  }, [completedProblems]);

  const getOverallProgress = useCallback((problems) => {
    const completed = problems.filter(p => completedProblems.has(p.id)).length;
    return {
      completed,
      total: problems.length,
      percentage: problems.length > 0 ? Math.round((completed / problems.length) * 100) : 0,
    };
  }, [completedProblems]);

  return {
    completedProblems,
    toggleCompleted,
    isCompleted,
    getSectionProgress,
    getOverallProgress,
  };
}

export default useProgress;
