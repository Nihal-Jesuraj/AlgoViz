import React, { memo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Network, GitGraph, Palette, ImagePlus, Bot } from 'lucide-react';

function Navbar({ 
  problemTitle = 'DSA Algorithm Visualizer', 
  algorithmName = '', 
  currentTheme = 'apple',
  onChangeTheme, 
  onImageUpload,
  overallProgress = { completed: 0, total: 0, percentage: 0 }
}) {
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
    // Reset input so the same file can be selected again if needed
    e.target.value = '';
  };
  return (
    <motion.nav
      id="navbar"
      className="glass-nav fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-5"
      data-glass-panel="navbar"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Left — Logo & Progress Badge */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-accent)] text-white shadow-sm">
            <Network size={18} strokeWidth={2.5} />
          </div>
          <span className="font-heading font-bold text-[17px] tracking-tight text-[var(--color-text)]">
            AlgoViz
          </span>
        </div>
        
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

      {/* Center — Problem title + Algorithm name */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
        <h1 className="font-heading font-medium text-sm text-[var(--color-text-muted)] truncate max-w-[320px]">
          {problemTitle}
        </h1>
        {algorithmName && (
          <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[var(--color-accent)] text-white font-medium shadow-sm">
            {algorithmName}
          </span>
        )}
      </div>

      {/* Right — Controls & GitHub */}
      <div className="flex items-center gap-2">
        {onImageUpload && (
          <>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="glass-button !p-2 !rounded-lg hover:!shadow-purple-glow"
              aria-label="Upload Background Image"
              title="Upload Background Image"
            >
              <ImagePlus size={18} />
            </button>
          </>
        )}
        {import.meta.env.DEV && (
          <button
            onClick={() => {
              if (window.runBatchVisionExtraction) {
                window.runBatchVisionExtraction();
              } else {
                console.warn('Batch extractor not loaded on window.');
              }
            }}
            className="glass-button !p-2 !rounded-lg hover:!shadow-purple-glow text-[var(--color-accent)]"
            aria-label="Run Batch Vision Extractor"
            title="Run Batch Vision Extractor (Dev Only)"
          >
            <Bot size={18} />
          </button>
        )}
        {onChangeTheme && (
          <div className="relative">
            <select
              value={currentTheme}
              onChange={(e) => onChangeTheme(e.target.value)}
              className="glass-button !py-1.5 !pl-3 !pr-8 appearance-none outline-none font-medium text-xs cursor-pointer"
            >
              <option value="glass">Glass</option>
              <option value="cyberpunk">Cyberpunk</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="blueprint">Blueprint</option>
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
