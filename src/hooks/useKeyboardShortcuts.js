import { useEffect } from 'react';

export default function useKeyboardShortcuts({
  isPlaying,
  onPlay,
  onPause,
  onStepForward,
  onStepBack,
  onReset,
  disabled = false,
}) {
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
      if (disabled) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (isPlaying) onPause?.();
          else onPlay?.();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onStepForward?.();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onStepBack?.();
          break;
        case 'KeyR':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            onReset?.();
          }
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isPlaying, onPlay, onPause, onStepForward, onStepBack, onReset, disabled]);
}
