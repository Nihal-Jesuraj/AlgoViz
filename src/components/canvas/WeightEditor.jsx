import { useState, useRef, useEffect } from 'react';

export default function WeightEditor({ edgeId, initialWeight, onSave, onCancel, position }) {
  const [weight, setWeight] = useState(String(initialWeight ?? 1));
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) { inputRef.current.focus(); inputRef.current.select(); }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onSave(edgeId, weight);
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div
      className="absolute z-50 glass-panel p-2 flex flex-col gap-2 rounded-lg"
      style={{ left: position.x, top: position.y, transform: 'translate(-50%, -50%)' }}
      onClick={(e) => e.stopPropagation()}
    >
      <label className="text-[10px] uppercase font-heading font-semibold text-[var(--color-text-subtle)] px-1">
        Edge Weight
      </label>
      <input
        ref={inputRef}
        type="number"
        className="glass-input !w-24 !text-center !py-1"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => onSave(edgeId, weight)}
      />
    </div>
  );
}
