import React, { memo, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle2,
  Circle,
  Filter
} from 'lucide-react';

function Sidebar({
  problems = [],
  customRuns = [],
  selectedProblem = null,
  selectedProblemId = '',
  onSelectProblem = () => {},
  isCollapsed = false,
  onToggleCollapse = () => {},
  completedProblems = new Set(),
  toggleCompleted = () => {},
  getSectionProgress = () => ({ completed: 0, total: 0, percentage: 0 }),
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'incomplete' | 'completed'

  // Filter problems by search and completion status
  const filteredProblems = useMemo(() => {
    let result = problems;
    
    if (filterStatus === 'completed') {
      result = result.filter(p => completedProblems.has(p.id));
    } else if (filterStatus === 'incomplete') {
      result = result.filter(p => !completedProblems.has(p.id));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.id?.toLowerCase().includes(q)
      );
    }
    
    return result;
  }, [problems, completedProblems, filterStatus, searchQuery]);

  // Group filtered problems by sectionName
  const sections = useMemo(() => {
    const grouped = {};
    filteredProblems.forEach((p) => {
      const section = p.sectionName || 'Uncategorized';
      if (!grouped[section]) grouped[section] = [];
      grouped[section].push(p);
    });
    return grouped;
  }, [filteredProblems]);

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
      case 'easy': return 'easy';
      case 'medium': return 'medium';
      case 'hard': return 'hard';
      default: return '';
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
      <div className="flex flex-col gap-2 p-3 border-b border-black/5">
        <div className="flex items-center gap-2">
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
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)]" />
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
        
        {/* Filter Toolbar */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              className="flex items-center gap-1 bg-black/10 p-1 rounded-lg mt-1"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Filter size={12} className="text-[var(--color-text-subtle)] ml-1 mr-1" />
              <button
                className={`flex-1 text-[10px] py-1 rounded font-medium transition-colors ${filterStatus === 'all' ? 'bg-[var(--glass-border-hover)] text-[var(--color-text)] shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
                onClick={() => setFilterStatus('all')}
              >
                All
              </button>
              <button
                className={`flex-1 text-[10px] py-1 rounded font-medium transition-colors ${filterStatus === 'incomplete' ? 'bg-[var(--glass-border-hover)] text-[var(--color-text)] shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
                onClick={() => setFilterStatus('incomplete')}
              >
                To Do
              </button>
              <button
                className={`flex-1 text-[10px] py-1 rounded font-medium transition-colors ${filterStatus === 'completed' ? 'bg-accent-teal/40 text-[var(--color-text)] shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
                onClick={() => setFilterStatus('completed')}
              >
                Done
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Import Button */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.button
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-button w-full !py-2 !px-3 flex items-center justify-center gap-2 primary mt-2 font-semibold tracking-wide border border-[var(--color-accent)]"
              onClick={() => onSelectProblem({ id: 'import', title: 'Dry Run' })}
            >
              <ExternalLink size={14} />
              <span>Dry Run</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Problem list */}
      <div className="flex-1 overflow-y-auto py-1">
        
        {/* Custom Runs Section */}
        <AnimatePresence>
          {!isCollapsed && customRuns.length > 0 && (
            <div className="mb-2">
              <button
                className="section-header w-full flex flex-col justify-center cursor-pointer hover:bg-white/5 transition-colors py-2 px-3 border-b border-white/5"
                onClick={() => toggleSection('customRuns')}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="truncate text-xs font-semibold text-[var(--color-accent)]">Custom Runs</span>
                  <div className="flex items-center gap-2 text-[10px] text-[var(--color-accent)]">
                    <span>{customRuns.length}</span>
                    {isSectionExpanded('customRuns') ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </div>
                </div>
              </button>
              
              <AnimatePresence>
                {isSectionExpanded('customRuns') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    {customRuns.map((run) => (
                      <div
                        key={run.id}
                        className={`group relative flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors border-l-2
                          ${selectedProblemId === run.id 
                            ? 'bg-white/5 border-[var(--color-accent)]' 
                            : 'border-transparent hover:bg-white/[0.02]'}
                        `}
                        onClick={() => onSelectProblem({ id: run.id, title: run.title })}
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-xs font-medium truncate ${selectedProblemId === run.id ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]'}`}>
                            {run.title}
                          </h3>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${run.algorithmType === 'arrayAnalysis' ? 'text-blue-400 border-blue-400/20 bg-blue-400/10' : 'text-purple-400 border-purple-400/20 bg-purple-400/10'}`}>
                          {run.algorithmType === 'arrayAnalysis' ? 'ARRAY' : 'GRAPH'}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!isCollapsed &&
            Object.entries(sections).map(([section, items]) => {
              const progress = getSectionProgress(problems, parseInt(section.match(/\d+/)?.[0] || '0'));
              
              return (
                <div key={section} className="mb-2">
                  {/* Section header */}
                  <button
                    className="section-header w-full flex flex-col justify-center cursor-pointer hover:bg-white/5 transition-colors py-2 px-3 border-b border-white/5"
                    onClick={() => toggleSection(section)}
                    id={`section-${section.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate text-xs font-semibold text-[var(--color-text)]">{section}</span>
                      <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)]">
                        <span>{progress.completed}/{progress.total}</span>
                        {isSectionExpanded(section) ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </div>
                    </div>
                    {/* Section Progress Bar */}
                    <div className="w-full h-1 bg-black/20 rounded-full mt-1.5 overflow-hidden">
                      <div 
                        className="h-full bg-accent-teal transition-all duration-500 ease-out" 
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  </button>

                  {/* Section items */}
                  <AnimatePresence>
                    {isSectionExpanded(section) &&
                      items.map((problem, idx) => {
                        const isSelected = selectedProblem?.id === problem.id;
                        const isDone = completedProblems.has(problem.id);

                        return (
                          <motion.div
                            key={problem.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.15, delay: Math.min(idx * 0.02, 0.2) }}
                            className={`w-full flex items-center group transition-colors duration-200 ${
                              isSelected
                                ? 'bg-[var(--glass-fill)] border-l-[3px] border-l-[var(--color-accent)]'
                                : 'border-l-[3px] border-l-transparent hover:bg-white/5'
                            } ${isDone ? 'opacity-80' : ''}`}
                          >
                            <button
                              id={`problem-${problem.id}`}
                              className="flex-1 flex items-center gap-3 text-left pl-3 pr-2 py-2.5 min-w-0"
                              onClick={() => onSelectProblem(problem)}
                            >
                              <span className={`flex-shrink-0 w-8 h-6 flex items-center justify-center rounded-md font-mono text-[10px] font-semibold transition-colors ${
                                isDone ? 'bg-accent-teal/20 text-accent-teal' : 'bg-black/[0.04] text-[var(--color-text-muted)]'
                              }`}>
                                {problem.id}
                              </span>

                              <div className="flex-1 min-w-0">
                                <span className={`text-xs font-medium truncate block ${
                                  isDone ? 'text-[var(--color-text-muted)] line-through opacity-60' : 'text-[var(--color-text)]'
                                }`}>
                                  {problem.title}
                                </span>
                              </div>

                              {problem.difficulty && (
                                <span className={`difficulty-pill flex-shrink-0 ${difficultyClass(problem.difficulty)} ${isDone ? 'opacity-50' : ''}`}>
                                  {problem.difficulty}
                                </span>
                              )}
                            </button>
                            
                            <div className="flex flex-col gap-1 pr-3">
                              {/* Mark as Done Checkbox */}
                              <button 
                                onClick={(e) => { e.stopPropagation(); toggleCompleted(problem.id); }}
                                className={`p-1 rounded-full transition-colors ${isDone ? 'text-accent-teal hover:text-accent-teal/70' : 'text-[var(--color-text-subtle)] hover:text-[var(--color-text-muted)]'}`}
                                title={isDone ? "Mark as incomplete" : "Mark as done"}
                              >
                                {isDone ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                  </AnimatePresence>
                </div>
              );
            })}
        </AnimatePresence>

        {/* Collapsed: show only icons */}
        {isCollapsed && (
          <div className="flex flex-col items-center gap-1 pt-2">
            {problems.slice(0, 12).map((problem) => {
              const isActive = selectedProblem?.id === problem.id;
              const isDone = completedProblems.has(problem.id);
              return (
                <button
                  key={problem.id}
                  id={`problem-collapsed-${problem.id}`}
                  className={`w-9 h-8 flex items-center justify-center rounded-lg text-[10px] font-mono font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[var(--color-accent)] text-white'
                      : isDone 
                        ? 'bg-accent-teal/10 text-accent-teal hover:bg-accent-teal/20'
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
