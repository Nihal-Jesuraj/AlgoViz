import { useState, useCallback, useEffect } from 'react';

const STORAGE_PREFIX = 'algoviz-saved-problem-';
const INDEX_KEY = 'algoviz-saved-problems-index';
const FOLDERS_KEY = 'algoviz-folders';

export function useSavedProblems() {
  const [savedProblems, setSavedProblems] = useState([]);
  const [folders, setFolders] = useState([]);

  useEffect(() => {
    refreshIndex();
    refreshFolders();
  }, []);

  // ---- Index (problems) ----

  const refreshIndex = useCallback(() => {
    try {
      const index = JSON.parse(localStorage.getItem(INDEX_KEY) || '[]');
      setSavedProblems(index);
    } catch {
      setSavedProblems([]);
    }
  }, []);

  const saveProblem = useCallback((name, problemData, folderId) => {
    const entry = {
      name,
      type: problemData.isGridAnalysis ? 'grid' : 'graph',
      title: problemData.title || name,
      savedAt: new Date().toISOString(),
      folder: folderId || null,
    };

    localStorage.setItem(STORAGE_PREFIX + name, JSON.stringify(problemData));

    const index = JSON.parse(localStorage.getItem(INDEX_KEY) || '[]');
    const existing = index.findIndex(e => e.name === name);
    if (existing >= 0) {
      index[existing] = entry;
    } else {
      index.push(entry);
    }
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
    setSavedProblems([...index]);
  }, []);

  const loadProblem = useCallback((name) => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_PREFIX + name));
    } catch {
      return null;
    }
  }, []);

  const deleteProblem = useCallback((name) => {
    localStorage.removeItem(STORAGE_PREFIX + name);
    const index = JSON.parse(localStorage.getItem(INDEX_KEY) || '[]');
    const filtered = index.filter(e => e.name !== name);
    localStorage.setItem(INDEX_KEY, JSON.stringify(filtered));
    setSavedProblems(filtered);
  }, []);

  const moveProblemToFolder = useCallback((problemName, folderId) => {
    const index = JSON.parse(localStorage.getItem(INDEX_KEY) || '[]');
    const entry = index.find(e => e.name === problemName);
    if (!entry) return;
    entry.folder = folderId || null;
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
    setSavedProblems([...index]);
  }, []);

  // ---- Folders ----

  const refreshFolders = useCallback(() => {
    try {
      const f = JSON.parse(localStorage.getItem(FOLDERS_KEY) || '[]');
      setFolders(f);
    } catch {
      setFolders([]);
    }
  }, []);

  const createFolder = useCallback((name) => {
    const f = JSON.parse(localStorage.getItem(FOLDERS_KEY) || '[]');
    const newFolder = { id: `folder-${Date.now()}`, name, createdAt: new Date().toISOString() };
    f.push(newFolder);
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(f));
    setFolders([...f]);
  }, []);

  const renameFolder = useCallback((folderId, newName) => {
    const f = JSON.parse(localStorage.getItem(FOLDERS_KEY) || '[]');
    const folder = f.find(fo => fo.id === folderId);
    if (!folder) return;
    folder.name = newName;
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(f));
    setFolders([...f]);
  }, []);

  const deleteFolder = useCallback((folderId) => {
    // Remove folder from folders list
    const f = JSON.parse(localStorage.getItem(FOLDERS_KEY) || '[]');
    const filtered = f.filter(fo => fo.id !== folderId);
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(filtered));
    setFolders(filtered);

    // Unlink problems in that folder
    const index = JSON.parse(localStorage.getItem(INDEX_KEY) || '[]');
    let changed = false;
    index.forEach(e => {
      if (e.folder === folderId) {
        e.folder = null;
        changed = true;
      }
    });
    if (changed) {
      localStorage.setItem(INDEX_KEY, JSON.stringify(index));
      setSavedProblems([...index]);
    }
  }, []);

  return {
    savedProblems,
    folders,
    saveProblem,
    loadProblem,
    deleteProblem,
    refreshIndex,
    createFolder,
    renameFolder,
    deleteFolder,
    moveProblemToFolder,
  };
}

export default useSavedProblems;
