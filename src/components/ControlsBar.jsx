import React, { memo } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
} from 'lucide-react';

function ControlsBar({
  isPlaying = false,
  onPlay = () => {},
  onPause = () => {},
  onStepForward = () => {},
  onStepBack = () => {},
  onReset = () => {},
  speed = 1,
  onSpeedChange = () => {},
  currentStep = 0,
  totalSteps = 0,
  disabled = false,
  onAISolve = null,
  isSolving = false,
}) {
  const buttonBase =
    'glass-button !rounded-full !p-2.5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:!transform-none disabled:hover:!shadow-none';
  const activeButton =
    'glass-button primary !rounded-full !p-2.5';

  const speedOptions = [0.25, 0.5, 1, 1.5, 2, 4];
  const speedIndex = speedOptions.indexOf(speed);
  const sliderValue = speedIndex >= 0 ? speedIndex : 2; // default to 1x

  const handleSpeedSlider = (e) => {
    const idx = parseInt(e.target.value, 10);
    onSpeedChange(speedOptions[idx]);
  };

  return (
    <motion.div
      id="controls-bar"
      className="glass-panel absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 px-4 py-2.5 rounded-full shadow-glass-elevated"
      data-glass-panel="controls"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
    >
      {/* Left — Transport controls */}
      <div className="flex items-center gap-1.5">
        {/* AI Solve Button (conditionally rendered) */}
        {onAISolve && (
          <>
            <motion.button
              className="glass-button !py-2 !px-4 !rounded-full shadow-purple-glow primary font-semibold tracking-wide flex items-center gap-2"
              onClick={onAISolve}
              disabled={isSolving}
              whileTap={{ scale: 0.95 }}
              title="Solve Problem using AI"
            >
              {isSolving ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <span className="text-[var(--color-accent)] text-lg leading-none mt-[-2px]">✧</span>
              )}
              <span className="text-xs">AI Solve</span>
            </motion.button>
            <div className="w-px h-6 bg-black/10 mx-1" />
          </>
        )}

        {/* Step Back */}
        <motion.button
          id="btn-step-back"
          className={buttonBase}
          onClick={onStepBack}
          disabled={disabled || currentStep <= 0}
          whileTap={{ scale: 0.9 }}
          title="Step Back"
        >
          <SkipBack size={15} />
        </motion.button>

        {/* Play / Pause */}
        <motion.button
          id="btn-play-pause"
          className={isPlaying ? activeButton : buttonBase}
          onClick={isPlaying ? onPause : onPlay}
          disabled={disabled}
          whileTap={{ scale: 0.9 }}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
        </motion.button>

        {/* Step Forward */}
        <motion.button
          id="btn-step-forward"
          className={buttonBase}
          onClick={onStepForward}
          disabled={disabled || currentStep >= totalSteps}
          whileTap={{ scale: 0.9 }}
          title="Step Forward"
        >
          <SkipForward size={15} />
        </motion.button>

        {/* Reset */}
        <motion.button
          id="btn-reset"
          className={buttonBase}
          onClick={onReset}
          disabled={disabled}
          whileTap={{ scale: 0.9 }}
          title="Reset"
        >
          <RotateCcw size={15} />
        </motion.button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-black/10" />

      {/* Center — Step counter */}
      <div className="flex items-center px-2">
        <span className="font-mono text-xs font-medium text-[var(--color-text-muted)] whitespace-nowrap">
          Step{' '}
          <span className="text-[var(--color-text)] font-semibold">{currentStep}</span>
          {' / '}
          <span className="text-[var(--color-text)]">{totalSteps}</span>
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-black/10" />

      {/* Right — Speed control */}
      <div className="flex items-center gap-2 pl-1">
        <span className="text-[10px] font-mono font-semibold text-[var(--color-text-muted)] uppercase tracking-wider w-8 text-right">
          {speed}x
        </span>
        <input
          id="speed-slider"
          type="range"
          min="0"
          max={speedOptions.length - 1}
          step="1"
          value={sliderValue}
          onChange={handleSpeedSlider}
          disabled={disabled}
          className="w-20 h-1.5 rounded-full appearance-none cursor-pointer accent-[var(--color-accent)] bg-black/10 disabled:opacity-40"
          title={`Speed: ${speed}x`}
        />
      </div>
    </motion.div>
  );
}

export default memo(ControlsBar);
