import React, { memo, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';

function Sidebar({
  problems = [],
  selectedProblem = null,
  onSelectProblem = () => {},
  isCollapsed = false,
  onToggleCollapse = () => {},
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({});

  // Group problems by sectionName
  const sections = useMemo(() => {
    const grouped = {};
    problems.forEach((p) => {
      const section = p.sectionName || 'Uncategorized';
      if (!grouped[section]) grouped[section] = [];
      grouped[section].push(p);
    });
    return grouped;
  }, [problems]);

  // Filter by search
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();
    const result = {};
    Object.entries(sections).forEach(([section, items]) => {
      const filtered = items.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.id?.toLowerCase().includes(q)
      );
      if (filtered.length) result[section] = filtered;
    });
    return result;
  }, [sections, searchQuery]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const isSectionExpanded = (section) => {
    return expandedSections[section] !== false; // default to open
  };

  const difficultyClass = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy':
        return 'easy';
      case 'medium':
        return 'medium';
      case 'hard':
        return 'hard';
      default:
        return '';
    }
  };

  return (
    <motion.aside
      id="sidebar"
      className="glass-panel sidebar-panel flex flex-col h-full overflow-hidden border-r border-white/20"
      data-glass-panel="sidebar"
      animate={{ width: isCollapsed ? 60 : 280 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Header: Toggle + Search */}
      <div className="flex items-center gap-2 p-3 border-b border-black/5">
        <button
          id="sidebar-toggle"
          className="glass-button !p-2 !rounded-lg flex-shrink-0"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              className="relative flex-1"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)]"
              />
              <input
                id="sidebar-search"
                type="text"
                placeholder="Search problems…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input !pl-8 !py-1.5 !text-xs"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Problem list */}
      <div className="flex-1 overflow-y-auto py-1">
        <AnimatePresence>
          {!isCollapsed &&
            Object.entries(filteredSections).map(([section, items]) => (
              <div key={section}>
                {/* Section header */}
                <button
                  className="section-header w-full flex items-center justify-between cursor-pointer hover:text-[var(--color-text-muted)] transition-colors"
                  onClick={() => toggleSection(section)}
                  id={`section-${section.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  <span className="truncate">{section}</span>
                  {isSectionExpanded(section) ? (
                    <ChevronUp size={12} className="flex-shrink-0 ml-1" />
                  ) : (
                    <ChevronDown size={12} className="flex-shrink-0 ml-1" />
                  )}
                </button>

                {/* Section items */}
                <AnimatePresence>
                  {isSectionExpanded(section) &&
                    items.map((problem, idx) => {
                      const isSelected = selectedProblem?.id === problem.id;

                      return (
                        <motion.button
                          key={problem.id}
                          id={`problem-${problem.id}`}
                          className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-all duration-200 hover:bg-accent-purple/5 group ${
                            isSelected
                              ? 'bg-accent-purple-lighter/60 border-l-[3px] border-l-accent-purple pl-[13px]'
                              : 'border-l-[3px] border-l-transparent'
                          }`}
                          onClick={() => onSelectProblem(problem)}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.15, delay: idx * 0.02 }}
                        >
                          {/* Problem ID badge */}
                          <span className="flex-shrink-0 w-8 h-6 flex items-center justify-center rounded-md bg-black/[0.04] font-mono text-[10px] font-semibold text-[var(--color-text-muted)]">
                            {problem.id}
                          </span>

                          {/* Title + difficulty */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-[var(--color-text)] truncate">
                                {problem.title}
                              </span>
                            </div>
                          </div>

                          {/* Difficulty pill */}
                          {problem.difficulty && (
                            <span
                              className={`difficulty-pill flex-shrink-0 ${difficultyClass(
                                problem.difficulty
                              )}`}
                            >
                              {problem.difficulty}
                            </span>
                          )}

                          {/* LeetCode link */}
                          {problem.leetcodeUrl && (
                            <a
                              href={problem.leetcodeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-shrink-0 opacity-0 group-hover:opacity-60 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`Open ${problem.title} on LeetCode`}
                            >
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </motion.button>
                      );
                    })}
                </AnimatePresence>
              </div>
            ))}
        </AnimatePresence>

        {/* Collapsed: show only icons */}
        {isCollapsed && (
          <div className="flex flex-col items-center gap-1 pt-2">
            {problems.slice(0, 12).map((problem) => {
              const isSelected = selectedProblem?.id === problem.id;
              return (
                <button
                  key={problem.id}
                  id={`problem-collapsed-${problem.id}`}
                  className={`w-9 h-8 flex items-center justify-center rounded-lg text-[10px] font-mono font-semibold transition-all duration-200 ${
                    isSelected
                      ? 'bg-accent-purple text-white shadow-purple-glow'
                      : 'hover:bg-black/5 text-[var(--color-text-muted)]'
                  }`}
                  onClick={() => onSelectProblem(problem)}
                  title={problem.title}
                >
                  {problem.id}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </motion.aside>
  );
}

export default memo(Sidebar);
