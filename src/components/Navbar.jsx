import React, { memo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Network, GitGraph, Palette, ImagePlus } from 'lucide-react';

function Navbar({ problemTitle = 'DSA Algorithm Visualizer', algorithmName = '', onCycleTheme, onImageUpload }) {
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
      {/* Left — Logo */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple to-accent-purple-light text-white">
          <Network size={18} strokeWidth={2.5} />
        </div>
        <span className="font-heading font-bold text-[17px] tracking-tight text-[var(--color-text)]">
          AlgoViz
        </span>
      </div>

      {/* Center — Problem title + Algorithm name */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
        <h1 className="font-heading font-medium text-sm text-[var(--color-text-muted)] truncate max-w-[320px]">
          {problemTitle}
        </h1>
        {algorithmName && (
          <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-accent-purple-lighter text-accent-purple font-medium">
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
        {onCycleTheme && (
          <button
            onClick={onCycleTheme}
            className="glass-button !p-2 !rounded-lg hover:!shadow-purple-glow"
            aria-label="Change Background Theme"
            title="Change Background Theme"
          >
            <Palette size={18} />
          </button>
        )}
        <a
          id="github-link"
          href="https://github.com"
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
