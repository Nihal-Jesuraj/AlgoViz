import { useState, useRef, useEffect } from 'react';

export default function NodeRenamer({ nodeId, initialLabel, onSave, onCancel, position }) {
  const [label, setLabel] = useState(String(initialLabel ?? ''));
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) { inputRef.current.focus(); inputRef.current.select(); }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onSave(nodeId, label);
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div
      className="absolute z-50 glass-panel p-2 flex flex-col gap-2 rounded-lg"
      style={{ left: position.x, top: position.y, transform: 'translate(-50%, -50%)' }}
      onClick={(e) => e.stopPropagation()}
    >
      <label className="text-[10px] uppercase font-heading font-semibold text-[var(--color-text-subtle)] px-1">
        Rename Node
      </label>
      <input
        ref={inputRef}
        type="text"
        className="glass-input !w-32 !text-center !py-1"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => onSave(nodeId, label)}
      />
    </div>
  );
}
