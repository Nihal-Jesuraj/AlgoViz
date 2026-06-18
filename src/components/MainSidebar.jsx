import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Database,
  Layers,
  List,
  Binary,
  Network,
  Hash,
  BrainCircuit,
  ArrowRightLeft,
  Code,
  Grid3X3,
  Save,
  FolderOpen,
  FolderPlus,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
  Pencil,
} from 'lucide-react';
import { useSavedProblems } from '../hooks/useSavedProblems';

export default function MainSidebar({ isCollapsed, onToggleCollapse, customProblemData, onSaveCurrentProblem, onLoadSavedProblem }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { savedProblems, folders, saveProblem, loadProblem, deleteProblem, createFolder, renameFolder, deleteFolder, moveProblemToFolder } = useSavedProblems();
  const isImportActive = customProblemData && (customProblemData.algorithmType === 'grid' || customProblemData.algorithmType === 'custom');

  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renamingFolder, setRenamingFolder] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [movingProblem, setMovingProblem] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(() => {
    try {
      const stored = localStorage.getItem('algoviz-expanded-folders');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  const toggleFolder = (fid) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(fid)) next.delete(fid); else next.add(fid);
      localStorage.setItem('algoviz-expanded-folders', JSON.stringify([...next]));
      return next;
    });
  };

  const navItems = [
    {
      title: "Navigation",
      items: [
        { label: "Home", icon: Home, path: "/" },
        { label: "Dashboard", icon: Database, path: "/dashboard" },
        { label: "Code Sandbox", icon: Code, path: "/sandbox" }
      ]
    },
    {
      title: "Data Structures",
      items: [
        { label: "Array", icon: Hash, path: "/visualizer/array" },
        { label: "Linked List", icon: List, path: "/visualizer/linked-list" },
        { label: "Binary Search Tree", icon: Binary, path: "/visualizer/bst" },
        { label: "AVL Tree", icon: Network, path: "/visualizer/avl" }
      ]
    },
    {
      title: "Graph Algorithms",
      items: [
        { label: "Breadth-First Search", icon: Network, path: "/visualizer/bfs" },
        { label: "Depth-First Search", icon: Layers, path: "/visualizer/dfs" },
        { label: "Cycle Detection", icon: ArrowRightLeft, path: "/visualizer/cycle" },
        { label: "Topological Sort", icon: List, path: "/visualizer/topo" },
        { label: "Dijkstra's Algorithm", icon: Database, path: "/visualizer/dijkstra" }
      ]
    }
  ];

  const handleSaveCurrent = () => {
    const data = onSaveCurrentProblem();
    if (!data) return;
    const name = customProblemData?.title || 'Imported Problem';
    saveProblem(name, data);
  };

  const handleLoadSaved = (name) => {
    const data = loadProblem(name);
    if (data) onLoadSavedProblem(data);
    setMovingProblem(null);
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    createFolder(newFolderName.trim());
    setNewFolderName('');
    setCreatingFolder(false);
  };

  const handleStartRename = (f) => {
    setRenamingFolder(f.id);
    setRenameValue(f.name);
  };

  const handleConfirmRename = () => {
    if (!renameValue.trim() || !renamingFolder) return;
    renameFolder(renamingFolder, renameValue.trim());
    setRenamingFolder(null);
    setRenameValue('');
  };

  const handleMoveProblem = (problemName, folderId) => {
    moveProblemToFolder(problemName, folderId);
    setMovingProblem(null);
  };

  const unfiled = savedProblems.filter(p => !p.folder);
  const grouped = folders.map(f => ({
    ...f,
    problems: savedProblems.filter(p => p.folder === f.id),
  }));

  const renderProblemItem = (g) => (
    <div
      key={g.name}
      className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg transition-all duration-200 w-full text-left group hover:bg-[var(--glass-fill-hover)] relative"
    >
      <button
        onClick={() => handleLoadSaved(g.name)}
        className="flex items-center gap-2 flex-1 min-w-0 text-left"
      >
        <Grid3X3 size={12} className="shrink-0 text-[var(--color-text-muted)]" />
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-xs whitespace-nowrap overflow-hidden text-ellipsis leading-tight">
            {g.title}
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
            {new Date(g.savedAt).toLocaleDateString()}
          </span>
        </div>
      </button>
      <div className="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setMovingProblem(movingProblem === g.name ? null : g.name)}
          className="p-1 rounded text-[var(--color-text-muted)] hover:text-blue-400 hover:bg-blue-400/20 transition-colors"
          title="Move to folder"
          aria-label={`Move ${g.title}`}
        >
          <FolderOpen size={11} />
        </button>
        <button
          onClick={() => deleteProblem(g.name)}
          className="p-1 rounded text-red-400 hover:bg-red-400/20 transition-colors"
          title="Delete"
          aria-label={`Delete ${g.title}`}
        >
          <Trash2 size={11} />
        </button>
      </div>
      {movingProblem === g.name && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[140px] rounded-lg border border-[var(--glass-border)] bg-[var(--color-surface)] shadow-xl p-1"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => handleMoveProblem(g.name, null)}
            className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-md hover:bg-[var(--glass-fill-hover)] text-left"
          >
            <FolderOpen size={12} /> Unfiled
          </button>
          {folders.map(f => (
            <button
              key={f.id}
              onClick={() => handleMoveProblem(g.name, f.id)}
              className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-md hover:bg-[var(--glass-fill-hover)] text-left"
            >
              <FolderPlus size={12} /> {f.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <motion.aside
      className="glass-panel relative flex flex-col h-full border-r border-[var(--glass-border)] z-[100] backdrop-blur-xl"
      animate={{ width: isCollapsed ? 60 : 280 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header - click to toggle */}
      <div
        onClick={onToggleCollapse}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggleCollapse(); }}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="flex items-center gap-3 p-4 border-b border-[var(--glass-border)] h-[56px] shrink-0 cursor-pointer select-none"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-accent)] shadow-sm shrink-0">
          <BrainCircuit size={isCollapsed ? 18 : 20} strokeWidth={2.5} />
        </div>
        {!isCollapsed && (
          <span className="font-heading font-bold text-[var(--color-text)] tracking-tight whitespace-nowrap overflow-hidden">
            AlgoViz
          </span>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 custom-scrollbar">
        {navItems.map((section, idx) => (
          <div key={idx} className="mb-6">
            {!isCollapsed && (
              <h3 className="font-heading text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 px-3">
                {section.title}
              </h3>
            )}
            <div className="flex flex-col gap-1">
              {section.items.map((item, itemIdx) => {
                const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/');
                return (
                  <button
                    key={itemIdx}
                    onClick={() => navigate(item.path)}
                    title={isCollapsed ? item.label : ""}
                    aria-label={item.label}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 w-full text-left
                      ${isActive 
                        ? 'bg-[rgba(var(--color-highlight-rgb),0.1)] text-[var(--color-text)]' 
                        : 'text-[var(--color-text-muted)] hover:bg-[var(--glass-fill-hover)] hover:text-[var(--color-text)]'
                      }
                    `}
                  >
                    <item.icon size={18} className="shrink-0" />
                    {!isCollapsed && (
                      <span className="font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {customProblemData && (
          <div className="mb-6">
            {!isCollapsed && (
              <h3 className="font-heading text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 px-3">
                Custom Imports
              </h3>
            )}
            <div className="flex flex-col gap-1">
              <div
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 w-full text-left
                  ${location.pathname === '/visualizer/' + customProblemData.id
                    ? 'bg-[rgba(var(--color-highlight-rgb),0.1)] text-[var(--color-text)]'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--glass-fill-hover)] hover:text-[var(--color-text)]'
                  }
                `}
              >
                <button
                  onClick={() => navigate('/visualizer/' + customProblemData.id)}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <Grid3X3 size={18} className="shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                      {customProblemData.title || 'Imported Problem'}
                    </span>
                  )}
                </button>
                {!isCollapsed && isImportActive && (
                  <button
                    onClick={handleSaveCurrent}
                    className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-green-400 hover:bg-green-400/20 transition-colors shrink-0"
                    title="Save to Saved Problems"
                    aria-label="Save current problem"
                  >
                    <Save size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Saved Problems with Folders */}
        <div className="mb-6">
          {!isCollapsed && (
            <div className="flex items-center justify-between mb-2 px-3">
              <h3 className="font-heading text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-2">
                <FolderOpen size={12} /> Saved Problems
              </h3>
              <button
                onClick={() => setCreatingFolder(!creatingFolder)}
                className="p-1 rounded text-[var(--color-text-muted)] hover:text-blue-400 hover:bg-blue-400/20 transition-colors"
                title="Create folder"
                aria-label="Create folder"
              >
                <FolderPlus size={14} />
              </button>
            </div>
          )}

          {!isCollapsed && creatingFolder && (
            <div className="flex gap-2 mb-2 px-3">
              <input
                type="text"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') { setCreatingFolder(false); setNewFolderName(''); } }}
                placeholder="Folder name..."
                className="glass-input !p-2 text-xs flex-1"
                autoFocus
                aria-label="New folder name"
              />
              <button onClick={handleCreateFolder} className="glass-button !px-2.5 !py-1 text-xs primary" aria-label="Confirm create folder">
                <Plus size={12} />
              </button>
            </div>
          )}

          {savedProblems.length === 0 ? (
            !isCollapsed && (
              <div className="px-3">
                <p className="text-[10px] text-[var(--color-text-subtle)]">No saved problems yet.</p>
              </div>
            )
          ) : (
            <div className="flex flex-col gap-1">
              {/* Folders */}
              {grouped.map(f => (
                <div key={f.id}>
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg w-full text-left text-[var(--color-text-muted)] hover:bg-[var(--glass-fill-hover)] transition-all group">
                    <button onClick={() => toggleFolder(f.id)} className="flex items-center gap-1 flex-1 min-w-0">
                      {expandedFolders.has(f.id) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      <FolderPlus size={13} className="shrink-0" />
                      {renamingFolder === f.id ? (
                        <input
                          type="text"
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          onKeyDown={e => {
                            e.stopPropagation();
                            if (e.key === 'Enter') handleConfirmRename();
                            if (e.key === 'Escape') { setRenamingFolder(null); setRenameValue(''); }
                          }}
                          onBlur={handleConfirmRename}
                          className="glass-input !p-0.5 !px-1.5 text-xs flex-1 min-w-0"
                          autoFocus
                          onClick={e => e.stopPropagation()}
                          aria-label="Rename folder"
                        />
                      ) : (
                        <span
                          className="font-semibold text-xs flex-1 truncate cursor-text"
                          onDoubleClick={e => { e.stopPropagation(); handleStartRename(f); }}
                        >{f.name}</span>
                      )}
                    </button>
                    <span className="text-[10px] font-mono text-[var(--color-text-subtle)] shrink-0">{f.problems.length}</span>
                    <button
                      onClick={e => { e.stopPropagation(); handleStartRename(f); }}
                      className="p-0.5 rounded text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 hover:text-blue-400 hover:bg-blue-400/20 transition-all shrink-0"
                      title="Rename folder (double-click name)"
                    >
                      <Pencil size={10} />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); deleteFolder(f.id); }}
                      className="p-0.5 rounded text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-400/20 transition-all shrink-0"
                      title="Delete folder"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                  {expandedFolders.has(f.id) && (
                    <div className="ml-2 mt-0.5 flex flex-col">
                      {f.problems.length === 0 ? (
                        <span className="pl-3 py-1 text-[10px] text-[var(--color-text-subtle)]">Empty folder</span>
                      ) : (
                        f.problems.map(renderProblemItem)
                      )}
                    </div>
                  )}
                </div>
              ))}
              {/* Unfiled */}
              {unfiled.length > 0 && (
                <div>
                  <button
                    onClick={() => toggleFolder('__unfiled__')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg w-full text-left text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-fill-hover)] transition-all"
                  >
                    {expandedFolders.has('__unfiled__') ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    <FolderOpen size={13} className="shrink-0" />
                    <span className="font-semibold text-xs flex-1 truncate">Unfiled</span>
                    <span className="text-[10px] font-mono text-[var(--color-text-subtle)]">{unfiled.length}</span>
                  </button>
                  {expandedFolders.has('__unfiled__') && (
                    <div className="ml-2 mt-0.5 flex flex-col">
                      {unfiled.map(renderProblemItem)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
