import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings2,
  Undo2,
  Redo2,
  Trash2,
  RefreshCcw,
  Network,
} from 'lucide-react';
import { useVisualizer } from '../contexts/VisualizerContext';

export default function GraphEditorToolbar() {
  const {
    isEditing, toggleEditing, isDirected, toggleDirected,
    isWeighted, toggleWeighted, undo, redo, canUndo, canRedo,
    clearGraph, handleResetToPreset, handleAutoLayout,
    nodeCount, edgeCount,
  } = useVisualizer();

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
      <div className="flex gap-2">
        <motion.button
          className={`glass-button !px-6 !py-2 !rounded-full shadow-glass-elevated ${
            isEditing ? 'primary animate-glass-glow-pulse' : ''
          }`}
          onClick={toggleEditing}
          whileTap={{ scale: 0.95 }}
          aria-label={isEditing ? 'Exit editor mode' : 'Enter editor mode'}
        >
          <Settings2 size={16} className={isEditing ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'} />
          <span className="font-heading font-semibold text-sm">
            {isEditing ? 'Exit Editor Mode' : 'Enter Editor Mode'}
          </span>
        </motion.button>
      </div>

      <AnimatePresence>
        {isEditing && (
          <motion.div
            className="glass-panel flex items-center gap-2 px-3 py-2 rounded-xl shadow-glass-elevated"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-3 px-2">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                <input
                  type="checkbox"
                  checked={isDirected}
                  onChange={toggleDirected}
                  aria-label="Toggle directed graph"
                  className="accent-accent-purple w-3.5 h-3.5 rounded" style={{ background: 'var(--glass-fill)', border: '1px solid var(--glass-border)' }}
                />
                Directed
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                <input
                  type="checkbox"
                  checked={isWeighted}
                  onChange={toggleWeighted}
                  aria-label="Toggle weighted graph"
                  className="accent-accent-purple w-3.5 h-3.5 rounded" style={{ background: 'var(--glass-fill)', border: '1px solid var(--glass-border)' }}
                />
                Weighted
              </label>
            </div>

            <div className="w-px h-6 mx-1" style={{ background: 'var(--glass-border)' }} />

            <div className="flex gap-1">
              <button
                className="p-1.5 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-fill)] disabled:opacity-30 disabled:hover:bg-transparent"
                onClick={undo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
                aria-label="Undo"
              >
                <Undo2 size={16} />
              </button>
              <button
                className="p-1.5 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-fill)] disabled:opacity-30 disabled:hover:bg-transparent"
                onClick={redo}
                disabled={!canRedo}
                title="Redo (Ctrl+Y)"
                aria-label="Redo"
              >
                <Redo2 size={16} />
              </button>
            </div>

            <div className="w-px h-6 mx-1" style={{ background: 'var(--glass-border)' }} />

            <div className="flex gap-1">
              <motion.button
                className="glass-button !p-2 !rounded-lg"
                onClick={handleAutoLayout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Auto Layout (Hierarchical)"
                aria-label="Auto layout"
              >
                <Network size={16} />
              </motion.button>
              <motion.button
                className="glass-button !p-2 !rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/10"
                onClick={clearGraph}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Clear Graph"
                aria-label="Clear graph"
              >
                <Trash2 size={16} />
              </motion.button>
              <motion.button
                className="glass-button !p-2 !rounded-lg text-orange-400 hover:text-orange-300 hover:bg-orange-400/10"
                onClick={handleResetToPreset}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Reset to Problem Default"
                aria-label="Reset to problem default"
              >
                <RefreshCcw size={16} />
              </motion.button>
            </div>
            
            <div className="ml-2 px-2 py-1 bg-[var(--glass-fill)] rounded-md text-[10px] font-mono text-[var(--color-text-subtle)] border border-[var(--glass-border)] shadow-inner">
              N:{nodeCount} E:{edgeCount}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
