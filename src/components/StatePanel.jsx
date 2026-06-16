import React, { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Layers, Terminal } from 'lucide-react';

const badgeVariants = {
  initial: { opacity: 0, scale: 0.7, y: 5 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.7, y: -5 },
};

function StateBadge({ value, className = '' }) {
  return (
    <motion.span
      className={`state-badge ${className}`}
      variants={badgeVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.2 }}
      layout
    >
      {value}
    </motion.span>
  );
}

function TypewriterText({ text }) {
  const [displayed, setDisplayed] = useState('');
  
  useEffect(() => {
    setDisplayed('');
    if (!text) return;
    
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayed(text.substring(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(intervalId);
    }, 15); // Fast typing speed
    
    return () => clearInterval(intervalId);
  }, [text]);

  return <span>{displayed}</span>;
}

function StatePanel({ algorithmState = {}, stepDescription = '', isExpanded = true, onToggle = () => {} }) {
  const { queue, stack, visited, distances, parent, mstEdges, currentNode } = algorithmState;
  
  const [activeTab, setActiveTab] = useState('data'); // 'data', 'distances', 'parent'

  const visitedArray = visited
    ? visited instanceof Set
      ? [...visited]
      : Array.isArray(visited)
      ? visited
      : []
    : [];

  const hasData = queue?.length > 0 || stack?.length > 0 || visitedArray.length > 0 || mstEdges?.length > 0;
  const hasDistances = distances && Object.keys(distances).length > 0;
  const hasParent = parent && Object.keys(parent).length > 0;

  // Auto-switch tabs based on what data is available if current tab is empty
  useEffect(() => {
    if (activeTab === 'data' && !hasData && hasDistances) setActiveTab('distances');
    if (activeTab === 'distances' && !hasDistances && hasData) setActiveTab('data');
  }, [hasData, hasDistances, hasParent, activeTab]);

  return (
    <div id="state-panel" className="absolute top-4 right-4 z-20 flex flex-col w-80 pointer-events-none">
      
      {/* Dry-run Description Box */}
      <AnimatePresence>
        {stepDescription && (
          <motion.div
            className="glass-panel mb-3 p-3 rounded-xl border border-accent-purple/30 shadow-purple-glow pointer-events-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-center gap-1.5 mb-1.5 text-[var(--color-accent)]">
              <Terminal size={14} />
              <span className="font-heading text-[10px] font-bold uppercase tracking-wider">Dry Run</span>
            </div>
            <p className="text-xs text-[var(--color-text)] font-mono leading-relaxed min-h-[40px]">
              <TypewriterText text={stepDescription} />
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* State Panel Toggle button */}
      <button
        id="state-panel-toggle"
        className="glass-button !rounded-xl w-full flex items-center justify-between !px-3 !py-2 pointer-events-auto"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-[var(--color-accent)]" />
          <span className="font-heading text-xs font-semibold">Algorithm State</span>
        </div>
        {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="glass-card mt-2 p-0 overflow-hidden flex flex-col max-h-[320px] pointer-events-auto"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Tabs */}
            <div className="flex border-b border-white/10 bg-black/20">
              <button 
                className={`flex-1 py-2 text-[10px] font-heading font-semibold uppercase tracking-wider transition-colors ${activeTab === 'data' ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)] bg-[var(--glass-fill)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
                onClick={() => setActiveTab('data')}
              >
                Structures
              </button>
              <button 
                className={`flex-1 py-2 text-[10px] font-heading font-semibold uppercase tracking-wider transition-colors ${activeTab === 'distances' ? 'text-accent-cyan border-b-2 border-accent-cyan bg-[var(--glass-fill)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
                onClick={() => setActiveTab('distances')}
              >
                Distances
              </button>
              <button 
                className={`flex-1 py-2 text-[10px] font-heading font-semibold uppercase tracking-wider transition-colors ${activeTab === 'parent' ? 'text-accent-teal border-b-2 border-accent-teal bg-[var(--glass-fill)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
                onClick={() => setActiveTab('parent')}
              >
                Parents
              </button>
            </div>

            <div className="p-3 overflow-y-auto">
              {!hasData && !hasDistances && !hasParent && (
                <p className="text-xs text-[var(--color-text-subtle)] text-center py-4">
                  No state to display. Start the algorithm to see runtime data.
                </p>
              )}

              {/* Current Node (Always visible if exists) */}
              {currentNode !== undefined && currentNode !== null && (
                <div className="mb-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-glow-pulse" />
                    <span className="font-heading text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
                      Current Node
                    </span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    <StateBadge value={currentNode} className="badge-current" />
                  </div>
                </div>
              )}

              {/* TAB: Structures */}
              {activeTab === 'data' && (
                <div className="flex flex-col gap-3">
                  {/* Queue */}
                  {queue && queue.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-node-queued" />
                        <span className="font-heading text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">Queue</span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        <AnimatePresence mode="popLayout">
                          {queue.map((item, i) => <StateBadge key={`q-${item}-${i}`} value={item} className="badge-queued" />)}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

                  {/* Stack */}
                  {stack && stack.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-purple-light" />
                        <span className="font-heading text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">Stack</span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        <AnimatePresence mode="popLayout">
                          {stack.map((item, i) => <StateBadge key={`s-${item}-${i}`} value={item} className="badge-current" />)}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

                  {/* Visited */}
                  {visitedArray.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-teal" />
                        <span className="font-heading text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">Visited</span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        <AnimatePresence mode="popLayout">
                          {visitedArray.map((item) => <StateBadge key={`v-${item}`} value={item} className="badge-visited" />)}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

                  {/* MST Edges */}
                  {mstEdges && mstEdges.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-teal-dark" />
                        <span className="font-heading text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">MST Edges</span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        <AnimatePresence mode="popLayout">
                          {mstEdges.map((edge, i) => (
                            <StateBadge key={`mst-${i}`} value={`${edge.source}→${edge.target}${edge.weight !== undefined ? ` (${edge.weight})` : ''}`} className="badge-visited" />
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                  
                  {!hasData && (hasDistances || hasParent) && (
                    <p className="text-[10px] text-[var(--color-text-subtle)] italic">Check other tabs for data</p>
                  )}
                </div>
              )}

              {/* TAB: Distances */}
              {activeTab === 'distances' && (
                <div>
                  {distances && Object.keys(distances).length > 0 ? (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-black/5">
                          <th className="text-left py-1 pr-4 font-heading font-semibold text-[var(--color-text-subtle)] text-[10px] uppercase tracking-wider">Node</th>
                          <th className="text-right py-1 font-heading font-semibold text-[var(--color-text-subtle)] text-[10px] uppercase tracking-wider">Distance</th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {Object.entries(distances).map(([node, dist]) => (
                            <motion.tr key={`d-${node}`} className="border-b border-black/[0.03]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                              <td className="py-1 pr-4 font-mono font-semibold text-[var(--color-text)]">{node}</td>
                              <td className="py-1 text-right font-mono text-[var(--color-text-muted)]">{dist === Infinity ? '∞' : dist}</td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-[10px] text-[var(--color-text-subtle)] italic">No distances recorded yet.</p>
                  )}
                </div>
              )}

              {/* TAB: Parent */}
              {activeTab === 'parent' && (
                <div>
                  {parent && Object.keys(parent).length > 0 ? (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-black/5">
                          <th className="text-left py-1 pr-4 font-heading font-semibold text-[var(--color-text-subtle)] text-[10px] uppercase tracking-wider">Node</th>
                          <th className="text-right py-1 font-heading font-semibold text-[var(--color-text-subtle)] text-[10px] uppercase tracking-wider">Parent</th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {Object.entries(parent).map(([node, par]) => (
                            <motion.tr key={`p-${node}`} className="border-b border-black/[0.03]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                              <td className="py-1 pr-4 font-mono font-semibold text-[var(--color-text)]">{node}</td>
                              <td className="py-1 text-right font-mono text-[var(--color-text-muted)]">{par ?? '—'}</td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-[10px] text-[var(--color-text-subtle)] italic">No parent pointers recorded yet.</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(StatePanel);
