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
          <Settings2 size={16} className={isEditing ? 'text-[var(--color-text)]' : 'text-accent-purple'} />
          <span className="font-heading font-semibold text-sm">
            {isEditing ? 'Exit Editor Mode' : 'Enter Editor Mode'}
          </span>
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
            {/* Toggles */}
            <div className="flex items-center gap-3 px-2">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                <input
                  type="checkbox"
                  checked={isDirected}
                  onChange={toggleDirected}
                  className="accent-accent-purple w-3.5 h-3.5 rounded bg-black/30 border-white/20"
                />
                Directed
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
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
                className="p-1.5 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-fill)] disabled:opacity-30 disabled:hover:bg-transparent"
                onClick={undo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
              >
                <Undo2 size={16} />
              </button>
              <button
                className="p-1.5 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-fill)] disabled:opacity-30 disabled:hover:bg-transparent"
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
            <div className="ml-2 px-2 py-1 bg-[var(--glass-fill)] rounded-md text-[10px] font-mono text-[var(--color-text-subtle)] border border-[var(--glass-border)] shadow-inner">
              N:{nodeCount} E:{edgeCount}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
