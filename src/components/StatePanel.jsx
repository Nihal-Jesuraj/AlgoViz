import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Layers } from 'lucide-react';
import { useVisualizer } from '../contexts/VisualizerContext';

const badgeVariants = {
  initial: { opacity: 0, scale: 0.7 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.7 },
};

function StateBadge({ value, className = '' }) {
  return (
    <motion.span
      className={`state-badge ${className}`}
      variants={badgeVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.15 }}
    >
      {value}
    </motion.span>
  );
}

function StatePanel() {
  const { activeAlgorithmState, statePanelExpanded: isExpanded, onToggleStatePanel: onToggle } = useVisualizer();
  const { queue, stack, visited, distances, parent, mstEdges } = activeAlgorithmState || {};

  const [activeTab, setActiveTab] = useState('data');

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

  const tabs = [
    { id: 'data', label: 'Structures', visible: true },
    { id: 'distances', label: 'Distances', visible: hasDistances },
    { id: 'parent', label: 'Parents', visible: hasParent },
  ].filter(t => t.visible);

  // Reset to first tab if current one is no longer visible
  const safeActive = tabs.some(t => t.id === activeTab) ? activeTab : tabs[0]?.id || 'data';

  const noData = !hasData && !hasDistances && !hasParent;

  return (
    <div id="state-panel" className="absolute top-4 right-4 z-20 flex flex-col w-80 pointer-events-auto">

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
            {tabs.length > 1 && (
              <div className="flex border-b border-[var(--glass-border)] bg-[var(--glass-fill)]">
                {tabs.map(t => (
                  <button
                    key={t.id}
                    className={`flex-1 py-2 text-[10px] font-heading font-semibold uppercase tracking-wider transition-colors ${activeTab === t.id ? 'text-[var(--color-text)] border-b-2 border-[var(--color-accent)] bg-[var(--color-surface)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
                    onClick={() => setActiveTab(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            <div className="p-3 overflow-y-auto">
              {noData && (
                <p className="text-xs text-[var(--color-text-subtle)] text-center py-4">
                  No state to display. Start the algorithm to see runtime data.
                </p>
              )}

              {/* TAB: Structures */}
              {safeActive === 'data' && (
                <div className="flex flex-col gap-3">
                  {queue && queue.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-amber)' }} />
                        <span className="font-heading text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">Queue</span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        <AnimatePresence>
                          {queue.map((item, i) => <StateBadge key={`q-${item}-${i}`} value={item} className="badge-queued" />)}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

                  {stack && stack.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-purple)' }} />
                        <span className="font-heading text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">Stack</span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        <AnimatePresence>
                          {stack.map((item, i) => <StateBadge key={`s-${item}-${i}`} value={item} className="badge-current" />)}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

                  {visitedArray.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-teal)' }} />
                        <span className="font-heading text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">Visited</span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        <AnimatePresence>
                          {visitedArray.map((item) => <StateBadge key={`v-${item}`} value={item} className="badge-visited" />)}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

                  {mstEdges && mstEdges.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-teal-light)' }} />
                        <span className="font-heading text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">MST Edges</span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        <AnimatePresence>
                          {mstEdges.map((edge, i) => (
                            <StateBadge key={`mst-${i}`} value={`${edge.source || edge.u}→${edge.target || edge.v}${edge.weight !== undefined ? ` (${edge.weight})` : ''}`} className="badge-visited" />
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: Distances */}
              {safeActive === 'distances' && hasDistances && (
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <th className="text-left py-1 pr-4 font-heading font-semibold text-[var(--color-text-subtle)] text-[10px] uppercase tracking-wider">Node</th>
                      <th className="text-right py-1 font-heading font-semibold text-[var(--color-text-subtle)] text-[10px] uppercase tracking-wider">Distance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {Object.entries(distances).map(([node, dist]) => (
                        <motion.tr key={`d-${node}`} style={{ borderBottom: '1px solid var(--glass-border)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <td className="py-1 pr-4 font-mono font-semibold text-[var(--color-text)]">{node}</td>
                          <td className="py-1 text-right font-mono text-[var(--color-text-muted)]">{dist === Infinity ? '∞' : dist}</td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              )}

              {/* TAB: Parent */}
              {safeActive === 'parent' && hasParent && (
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <th className="text-left py-1 pr-4 font-heading font-semibold text-[var(--color-text-subtle)] text-[10px] uppercase tracking-wider">Node</th>
                      <th className="text-right py-1 font-heading font-semibold text-[var(--color-text-subtle)] text-[10px] uppercase tracking-wider">Parent</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {Object.entries(parent).map(([node, par]) => (
                        <motion.tr key={`p-${node}`} style={{ borderBottom: '1px solid var(--glass-border)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <td className="py-1 pr-4 font-mono font-semibold text-[var(--color-text)]">{node}</td>
                          <td className="py-1 text-right font-mono text-[var(--color-text-muted)]">{par ?? '—'}</td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(StatePanel);
