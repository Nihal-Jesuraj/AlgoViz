import { memo } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Terminal,
} from 'lucide-react';
import { useVisualizer } from '../contexts/VisualizerContext';

function ControlsBar() {
  const {
    isPlaying, play, pause, stepForward, stepBack, handleReset,
    speed, setSpeed, currentStep, totalSteps, algorithmDef,
    isEditing, handleAISolve, isAISolving,
    stepDescription, isArray,
  } = useVisualizer();

  const disabled = (!algorithmDef && !isArray) || isEditing;

  const buttonBase =
    'glass-button !rounded-full !p-2.5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:!transform-none disabled:hover:!shadow-none';
  const activeButton =
    'glass-button primary !rounded-full !p-2.5';

  const speedOptions = [0.25, 0.5, 1, 1.5, 2, 4];
  const speedIndex = speedOptions.indexOf(speed);
  const sliderValue = speedIndex >= 0 ? speedIndex : 2;

  const handleSpeedSlider = (e) => {
    const idx = parseInt(e.target.value, 10);
    setSpeed(speedOptions[idx]);
  };

  const progressPct = totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0;
  const progressWidth = Math.min(100, Math.max(0, progressPct));

  return (
    <motion.div
      id="controls-bar"
      className="glass-panel absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex flex-col overflow-hidden rounded-2xl shadow-glass-elevated"
      data-glass-panel="controls"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
    >
      {stepDescription && (
        <div className="px-4 py-2 border-b border-[var(--glass-border)] flex items-center gap-2 min-h-[36px]">
          <Terminal size={13} className="text-[var(--color-accent)] shrink-0" />
          <span className="font-mono text-xs text-[var(--color-text)] leading-relaxed">
            <span className="text-[var(--color-text-muted)] font-medium">
              Step <span className="text-[var(--color-text)] font-semibold">{currentStep}</span> / {totalSteps}
            </span>
            <span className="mx-1.5 text-[var(--color-text-muted)]">&mdash;</span>
            {stepDescription}
          </span>
        </div>
      )}
      <div className="flex items-center gap-3 pl-4 pr-6 py-2.5">
        <div className="flex items-center gap-1.5">
          {handleAISolve && (
            <>
              <motion.button
                className="glass-button !py-2 !px-4 !rounded-full shadow-purple-glow primary font-semibold tracking-wide flex items-center gap-2"
                onClick={handleAISolve}
                disabled={isAISolving}
                whileTap={{ scale: 0.95 }}
                title="Solve Problem using AI"
                aria-label="AI solve"
              >
                {isAISolving ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="text-[var(--color-accent)] text-lg leading-none mt-[-2px]">✧</span>
                )}
                <span className="text-xs">AI Solve</span>
              </motion.button>
              <div className="w-px h-6 mx-1" style={{ background: 'var(--glass-border)' }} />
            </>
          )}

          <motion.button
            id="btn-step-back"
            className={buttonBase}
            onClick={stepBack}
            disabled={disabled || currentStep <= 0}
            whileTap={{ scale: 0.9 }}
            title="Step Back (←)"
            aria-label="Step back"
          >
            <SkipBack size={15} />
          </motion.button>

          <motion.button
            id="btn-play-pause"
            className={isPlaying ? activeButton : buttonBase}
            onClick={isPlaying ? pause : play}
            disabled={disabled}
            whileTap={{ scale: 0.9 }}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
          </motion.button>

          <motion.button
            id="btn-step-forward"
            className={buttonBase}
            onClick={stepForward}
            disabled={disabled || currentStep >= totalSteps}
            whileTap={{ scale: 0.9 }}
            title="Step Forward (→)"
            aria-label="Step forward"
          >
            <SkipForward size={15} />
          </motion.button>

          <motion.button
            id="btn-reset"
            className={buttonBase}
            onClick={handleReset}
            disabled={disabled}
            whileTap={{ scale: 0.9 }}
            title="Reset (R)"
            aria-label="Reset"
          >
            <RotateCcw size={15} />
          </motion.button>
        </div>

        <div className="w-px h-6" style={{ background: 'var(--glass-border)' }} />

        <div className="flex items-center px-2">
          <span className="font-mono text-xs font-medium text-[var(--color-text-muted)] whitespace-nowrap">
            Step{' '}
            <span className="text-[var(--color-text)] font-semibold">{currentStep}</span>
            {' / '}
            <span className="text-[var(--color-text)]">{totalSteps}</span>
          </span>
        </div>

        <div className="w-px h-6" style={{ background: 'var(--glass-border)' }} />

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
              className="w-20 h-1.5 rounded-full appearance-none cursor-pointer accent-[var(--color-accent)] disabled:opacity-40"
              style={{ background: 'var(--glass-border)' }}
              title={`Speed: ${speed}x`}
              aria-label={`Speed: ${speed}x`}
            />
        </div>
      </div>

      <div className="h-1 w-full bg-[var(--glass-border)]">
        <div
          className="h-full transition-all duration-300 ease-out"
          style={{ width: `${progressWidth}%`, background: 'var(--color-accent)' }}
        />
      </div>
    </motion.div>
  );
}

export default memo(ControlsBar);
