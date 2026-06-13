import { useState, useCallback, useEffect } from 'react';

const STORAGE_PREFIX = 'algoviz-graph-';
const INDEX_KEY = 'algoviz-graph-index';

/**
 * useGraphStorage — Save/load custom graphs to localStorage.
 */
export function useGraphStorage() {
  const [savedGraphs, setSavedGraphs] = useState([]);

  // Load index on mount
  useEffect(() => {
    refreshIndex();
  }, []);

  const refreshIndex = useCallback(() => {
    try {
      const index = JSON.parse(localStorage.getItem(INDEX_KEY) || '[]');
      setSavedGraphs(index);
    } catch {
      setSavedGraphs([]);
    }
  }, []);

  const saveGraph = useCallback((name, graphData) => {
    const entry = {
      name,
      nodeCount: graphData.nodes?.length || 0,
      edgeCount: graphData.edges?.length || 0,
      isDirected: graphData.isDirected || false,
      isWeighted: graphData.isWeighted || false,
      savedAt: new Date().toISOString(),
    };

    // Save data
    localStorage.setItem(STORAGE_PREFIX + name, JSON.stringify(graphData));

    // Update index
    const index = JSON.parse(localStorage.getItem(INDEX_KEY) || '[]');
    const existing = index.findIndex(e => e.name === name);
    if (existing >= 0) {
      index[existing] = entry;
    } else {
      index.push(entry);
    }
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
    setSavedGraphs([...index]);
  }, []);

  const loadGraph = useCallback((name) => {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_PREFIX + name));
      return data;
    } catch {
      return null;
    }
  }, []);

  const deleteGraph = useCallback((name) => {
    localStorage.removeItem(STORAGE_PREFIX + name);
    const index = JSON.parse(localStorage.getItem(INDEX_KEY) || '[]');
    const filtered = index.filter(e => e.name !== name);
    localStorage.setItem(INDEX_KEY, JSON.stringify(filtered));
    setSavedGraphs(filtered);
  }, []);

  return {
    savedGraphs,
    saveGraph,
    loadGraph,
    deleteGraph,
    refreshIndex,
  };
}

export default useGraphStorage;
