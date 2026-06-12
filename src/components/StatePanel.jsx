import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Layers } from 'lucide-react';

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

function StateSection({ title, children, icon }) {
  if (!children) return null;
  return (
    <div className="mb-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        {icon}
        <span className="font-heading text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function StatePanel({ algorithmState = {}, isExpanded = true, onToggle = () => {} }) {
  const { queue, stack, visited, distances, parent, mstEdges, currentNode } =
    algorithmState;

  const hasAnyState =
    queue?.length ||
    stack?.length ||
    visited?.size ||
    visited?.length ||
    distances ||
    parent ||
    mstEdges?.length;

  const visitedArray = visited
    ? visited instanceof Set
      ? [...visited]
      : Array.isArray(visited)
      ? visited
      : []
    : [];

  return (
    <div id="state-panel" className="absolute top-4 right-4 z-20 flex flex-col w-80 pointer-events-none">
      {/* Toggle button */}
      <button
        id="state-panel-toggle"
        className="glass-button !rounded-xl w-full flex items-center justify-between !px-3 !py-2 pointer-events-auto"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-accent-purple" />
          <span className="font-heading text-xs font-semibold">Algorithm State</span>
        </div>
        {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="glass-card mt-2 p-3 overflow-y-auto max-h-[320px] pointer-events-auto"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            {!hasAnyState && (
              <p className="text-xs text-[var(--color-text-subtle)] text-center py-4">
                No state to display. Start the algorithm to see runtime data.
              </p>
            )}

            {/* Current Node */}
            {currentNode !== undefined && currentNode !== null && (
              <StateSection
                title="Current Node"
                icon={
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-glow-pulse" />
                }
              >
                <div className="flex gap-1.5 flex-wrap">
                  <StateBadge value={currentNode} className="badge-current" />
                </div>
              </StateSection>
            )}

            {/* Queue */}
            {queue && queue.length > 0 && (
              <StateSection
                title="Queue"
                icon={
                  <div className="w-1.5 h-1.5 rounded-full bg-node-queued" />
                }
              >
                <div className="flex gap-1.5 flex-wrap">
                  <AnimatePresence mode="popLayout">
                    {queue.map((item, i) => (
                      <StateBadge
                        key={`q-${item}-${i}`}
                        value={item}
                        className="badge-queued"
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </StateSection>
            )}

            {/* Stack */}
            {stack && stack.length > 0 && (
              <StateSection
                title="Stack"
                icon={
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-purple-light" />
                }
              >
                <div className="flex gap-1.5 flex-wrap">
                  <AnimatePresence mode="popLayout">
                    {stack.map((item, i) => (
                      <StateBadge
                        key={`s-${item}-${i}`}
                        value={item}
                        className="badge-current"
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </StateSection>
            )}

            {/* Visited */}
            {visitedArray.length > 0 && (
              <StateSection
                title="Visited"
                icon={
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-teal" />
                }
              >
                <div className="flex gap-1.5 flex-wrap">
                  <AnimatePresence mode="popLayout">
                    {visitedArray.map((item) => (
                      <StateBadge
                        key={`v-${item}`}
                        value={item}
                        className="badge-visited"
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </StateSection>
            )}

            {/* Distances table */}
            {distances && Object.keys(distances).length > 0 && (
              <StateSection
                title="Distances"
                icon={
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
                }
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-black/5">
                        <th className="text-left py-1 pr-4 font-heading font-semibold text-[var(--color-text-subtle)] text-[10px] uppercase tracking-wider">
                          Node
                        </th>
                        <th className="text-right py-1 font-heading font-semibold text-[var(--color-text-subtle)] text-[10px] uppercase tracking-wider">
                          Dist
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {Object.entries(distances).map(([node, dist]) => (
                          <motion.tr
                            key={`d-${node}`}
                            className="border-b border-black/[0.03]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <td className="py-1 pr-4 font-mono font-semibold text-[var(--color-text)]">
                              {node}
                            </td>
                            <td className="py-1 text-right font-mono text-[var(--color-text-muted)]">
                              {dist === Infinity ? '∞' : dist}
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </StateSection>
            )}

            {/* Parent table */}
            {parent && Object.keys(parent).length > 0 && (
              <StateSection
                title="Parent"
                icon={
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-purple" />
                }
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-black/5">
                        <th className="text-left py-1 pr-4 font-heading font-semibold text-[var(--color-text-subtle)] text-[10px] uppercase tracking-wider">
                          Node
                        </th>
                        <th className="text-right py-1 font-heading font-semibold text-[var(--color-text-subtle)] text-[10px] uppercase tracking-wider">
                          Parent
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {Object.entries(parent).map(([node, par]) => (
                          <motion.tr
                            key={`p-${node}`}
                            className="border-b border-black/[0.03]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <td className="py-1 pr-4 font-mono font-semibold text-[var(--color-text)]">
                              {node}
                            </td>
                            <td className="py-1 text-right font-mono text-[var(--color-text-muted)]">
                              {par ?? '—'}
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </StateSection>
            )}

            {/* MST Edges */}
            {mstEdges && mstEdges.length > 0 && (
              <StateSection
                title="MST Edges"
                icon={
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-teal-dark" />
                }
              >
                <div className="flex gap-1.5 flex-wrap">
                  <AnimatePresence mode="popLayout">
                    {mstEdges.map((edge, i) => (
                      <StateBadge
                        key={`mst-${i}`}
                        value={`${edge.source}→${edge.target}${
                          edge.weight !== undefined ? ` (${edge.weight})` : ''
                        }`}
                        className="badge-visited"
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </StateSection>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(StatePanel);
