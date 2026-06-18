import { useEffect } from 'react';

export default function ContextMenu({ position, onAction, onCancel }) {
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onCancel(); };
    const handleClick = () => onCancel();
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClick);
    };
  }, [onCancel]);

  return (
    <div
      className="absolute z-50 glass-panel p-1 flex flex-col gap-1 rounded-lg min-w-[120px]"
      style={{ left: position.x, top: position.y }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="px-3 py-1.5 text-sm text-left text-red-400 rounded-md transition-colors w-full hover:bg-[var(--glass-fill)]"
        onClick={() => { onAction('delete'); onCancel(); }}
      >
        Delete
      </button>
    </div>
  );
}
