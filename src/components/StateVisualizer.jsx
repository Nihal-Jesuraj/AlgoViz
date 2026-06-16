import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StateVisualizer({ algorithmState, stateVariables = [] }) {
  if (!algorithmState || Object.keys(algorithmState).length === 0) return null;

  // Render values based on their type
  const renderValue = (key, value) => {
    // Array
    if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1">
          <AnimatePresence>
            {value.length === 0 ? (
              <span className="text-[var(--color-text-subtle)] text-xs italic">empty</span>
            ) : (
              value.map((v, i) => (
                <motion.div
                  key={`${key}-${i}-${v}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="px-2 py-0.5 bg-[var(--glass-border)] rounded font-mono text-[10px] text-[var(--color-text-muted)] border border-[var(--glass-border)]"
                >
                  {typeof v === 'object' ? JSON.stringify(v) : v}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      );
    }
    
    // Set
    if (value instanceof Set) {
      const arr = Array.from(value);
      return renderValue(key, arr);
    }

    // Map or Object (like distances)
    if (typeof value === 'object' && value !== null) {
      const entries = value instanceof Map ? Array.from(value.entries()) : Object.entries(value);
      return (
        <div className="flex flex-wrap gap-2">
          {entries.length === 0 ? (
            <span className="text-[var(--color-text-subtle)] text-xs italic">empty</span>
          ) : (
            entries.map(([k, v]) => (
              <div key={`${key}-${k}`} className="flex items-center text-[10px] font-mono bg-black/5 rounded border border-[var(--glass-border)] overflow-hidden">
                <span className="px-1.5 py-0.5 bg-[var(--glass-border)] text-[var(--color-text-muted)]">{k}</span>
                <span className="px-1.5 py-0.5 text-[var(--color-purple)] font-semibold">{v === Infinity ? '∞' : (typeof v === 'boolean' ? (v ? 'true' : 'false') : v)}</span>
              </div>
            ))
          )}
        </div>
      );
    }

    // Primitive
    return <span className="font-mono text-xs text-[var(--color-text)]">{String(value)}</span>;
  };

  const standardKeys = ['queue', 'stack', 'visited', 'distances', 'parent', 'mstEdges', 'currentNode', 'result'];
  const keysToRender = stateVariables && stateVariables.length > 0 
    ? stateVariables.filter(k => algorithmState[k] !== undefined)
    : Object.keys(algorithmState).filter(k => !standardKeys.includes(k));

  if (keysToRender.length === 0) return null;

  return (
    <div className="absolute right-4 bottom-24 z-10 w-72 flex flex-col gap-2 pointer-events-none">
      {keysToRender.map(key => (
        <motion.div 
          key={key}
          className="glass-panel p-3 rounded-xl border border-[var(--glass-border)] bg-[var(--color-surface)] shadow-2xl pointer-events-auto"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="text-[10px] font-bold text-[var(--color-text-subtle)] uppercase tracking-wider mb-1.5">{key}</div>
          {renderValue(key, algorithmState[key])}
        </motion.div>
      ))}
    </div>
  );
}
