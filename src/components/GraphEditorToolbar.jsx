import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MousePointer2,
  PlusCircle,
  GitCommit,
  ArrowRightLeft,
  Settings2,
  Undo2,
  Redo2,
  Trash2,
  RefreshCcw,
  LayoutGrid,
  Network,
} from 'lucide-react';

export default function GraphEditorToolbar({
  editorMode,
  setEditorMode,
  isEditing,
  toggleEditing,
  isDirected,
  toggleDirected,
  isWeighted,
  toggleWeighted,
  undo,
  redo,
  canUndo,
  canRedo,
  clearGraph,
  resetToPreset,
  autoLayout,
  nodeCount,
  edgeCount,
  onOpenInputModal,
}) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
      {/* Edit Toggle & Tools Buttons */}
      <div className="flex gap-2">
        <motion.button
          className={`glass-button !px-6 !py-2 !rounded-full shadow-glass-elevated ${
            isEditing ? 'primary animate-glass-glow-pulse' : ''
          }`}
          onClick={toggleEditing}
          whileTap={{ scale: 0.95 }}
        >
          <Settings2 size={16} className={isEditing ? 'text-white' : 'text-accent-purple'} />
          <span className="font-heading font-semibold text-sm">
            {isEditing ? 'Exit Editor Mode' : 'Enter Editor Mode'}
          </span>
        </motion.button>

        <motion.button
          className="glass-button !px-4 !py-2 !rounded-full shadow-glass-elevated hover:!shadow-purple-glow"
          onClick={onOpenInputModal}
          whileTap={{ scale: 0.95 }}
          title="Import, Generate, or Save Graphs"
        >
          <LayoutGrid size={16} className="text-accent-purple" />
          <span className="font-heading font-semibold text-sm">Tools</span>
        </motion.button>
      </div>

      {/* Editor Toolbar */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            className="glass-panel flex items-center gap-2 px-3 py-2 rounded-xl shadow-glass-elevated"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Modes */}
            <div className="flex bg-black/20 rounded-lg p-1 gap-1">
              <button
                className={`p-1.5 rounded-md transition-colors ${
                  editorMode === 'select' ? 'bg-white/20 text-white shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setEditorMode('select')}
                title="Select (V)"
              >
                <MousePointer2 size={18} />
              </button>
              <button
                className={`p-1.5 rounded-md transition-colors ${
                  editorMode === 'addNode' ? 'bg-accent-purple/40 text-white shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setEditorMode('addNode')}
                title="Add Node (N)"
              >
                <PlusCircle size={18} />
              </button>
              <button
                className={`p-1.5 rounded-md transition-colors ${
                  editorMode === 'addEdge' ? 'bg-accent-teal/40 text-white shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setEditorMode('addEdge')}
                title="Add Edge (E)"
              >
                <GitCommit size={18} className="transform rotate-45" />
              </button>
            </div>

            <div className="w-px h-6 bg-white/10 mx-1" />

            {/* Toggles */}
            <div className="flex items-center gap-3 px-2">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-white/80 hover:text-white">
                <input
                  type="checkbox"
                  checked={isDirected}
                  onChange={toggleDirected}
                  className="accent-accent-purple w-3.5 h-3.5 rounded bg-black/30 border-white/20"
                />
                Directed
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-white/80 hover:text-white">
                <input
                  type="checkbox"
                  checked={isWeighted}
                  onChange={toggleWeighted}
                  className="accent-accent-purple w-3.5 h-3.5 rounded bg-black/30 border-white/20"
                />
                Weighted
              </label>
            </div>

            <div className="w-px h-6 bg-white/10 mx-1" />

            {/* Undo/Redo */}
            <div className="flex gap-1">
              <button
                className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
                onClick={undo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
              >
                <Undo2 size={16} />
              </button>
              <button
                className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
                onClick={redo}
                disabled={!canRedo}
                title="Redo (Ctrl+Y)"
              >
                <Redo2 size={16} />
              </button>
            </div>

            <div className="w-px h-6 bg-white/10 mx-1" />

            {/* Actions */}
            <div className="flex gap-1">
              <motion.button
                className="glass-button !p-2 !rounded-lg"
                onClick={autoLayout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Auto Layout (Hierarchical)"
              >
                <Network size={16} />
              </motion.button>
              <motion.button
                className="glass-button !p-2 !rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/10"
                onClick={clearGraph}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Clear Graph"
              >
                <Trash2 size={16} />
              </motion.button>
              <motion.button
                className="glass-button !p-2 !rounded-lg text-orange-400 hover:text-orange-300 hover:bg-orange-400/10"
                onClick={resetToPreset}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Reset to Problem Default"
              >
                <RefreshCcw size={16} />
              </motion.button>
            </div>
            
            {/* Stats */}
            <div className="ml-2 px-2 py-1 bg-black/20 rounded-md text-[10px] font-mono text-white/50 border border-white/5 shadow-inner">
              N:{nodeCount} E:{edgeCount}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
