import { memo } from 'react';
import { motion } from 'framer-motion';
import { Network, GitGraph, Palette } from 'lucide-react';

import { Link } from 'react-router-dom';

function Navbar({ 
  problemTitle = 'DSA Algorithm Visualizer', 
  showTitle = false,
  sidebarWidth = 0,
  currentTheme = 'apple',
  onChangeTheme,
  overallProgress = { completed: 0, total: 0, percentage: 0 }
}) {
  return (
    <motion.nav
      id="navbar"
      className="glass-nav fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between pr-5"
      data-glass-panel="navbar"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{ paddingLeft: `${sidebarWidth + 20}px` }}
    >
      {/* Left — Logo & Progress Badge */}
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-accent)] shadow-sm">
            <Network size={18} strokeWidth={2.5} />
          </div>
          <span className="font-heading font-bold text-[17px] tracking-tight text-[var(--color-text)]">
            AlgoViz
          </span>
        </Link>
        
        {/* Overall Progress Badge */}
        {overallProgress.total > 0 && (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-[var(--glass-border)] shadow-inner" style={{ background: 'var(--glass-fill)' }}>
             {/* Simple circular progress ring */}
             <div className="relative w-5 h-5 flex items-center justify-center">
               <svg className="w-5 h-5 transform -rotate-90">
                 <circle cx="10" cy="10" r="8" stroke="var(--color-text-subtle)" strokeWidth="2.5" fill="none" />
                 <circle cx="10" cy="10" r="8" stroke="var(--color-teal)" strokeWidth="2.5" fill="none" 
                   strokeDasharray="50.2" 
                   strokeDashoffset={50.2 - (50.2 * overallProgress.percentage) / 100} 
                   className="transition-all duration-500 ease-out"
                 />
               </svg>
             </div>
             <div className="flex flex-col">
               <span className="text-[10px] font-mono leading-none text-[var(--color-text-muted)]">{overallProgress.completed}/{overallProgress.total}</span>
             </div>
          </div>
        )}
      </div>

      {/* Center — Problem title (only on visualizer/sandbox pages) */}
      {showTitle && (
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <h1 className="font-heading font-medium text-sm text-[var(--color-text-muted)] truncate max-w-[320px]">
            {problemTitle}
          </h1>
        </div>
      )}

      {/* Right — Controls & GitHub */}
      <div className="flex items-center gap-2">

        {onChangeTheme && (
          <div className="relative">
            <select
              value={currentTheme}
              onChange={(e) => onChangeTheme(e.target.value)}
              className="glass-button !py-1.5 !pl-3 !pr-8 appearance-none outline-none font-medium text-xs cursor-pointer"
              aria-label="Select theme"
            >
              <option value="glass">Theme: Glass</option>
              <option value="cyberpunk">Theme: Cyberpunk</option>
              <option value="light">Theme: Light</option>
              <option value="dark">Theme: Dark</option>
              <option value="blueprint">Theme: Blueprint</option>
              <option value="brutalist">Theme: Brutalist</option>
            </select>
            <Palette size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-muted)]" />
          </div>
        )}
        <a
          id="github-link"
          href="https://github.com/Nihal-Jesuraj/AlgoViz"
          target="_blank"
          rel="noopener noreferrer"
          className="glass-button !p-2 !rounded-lg hover:!shadow-purple-glow"
          aria-label="GitHub repository"
        >
          <GitGraph size={18} />
        </a>
      </div>
    </motion.nav>
  );
}

export default memo(Navbar);
