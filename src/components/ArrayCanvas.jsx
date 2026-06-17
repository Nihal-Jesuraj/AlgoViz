import React from 'react';

const COLORS = {
  active:     { bg: "rgba(var(--color-highlight-rgb), 0.2)", border: "var(--color-accent)", text: "var(--color-text)" },
  secondary:  { bg: "rgba(245, 158, 11, 0.2)", border: "var(--color-amber, #F59E0B)", text: "var(--color-text)" },
  done:       { bg: "rgba(16, 185, 129, 0.2)", border: "var(--color-emerald, #10B981)", text: "var(--color-text)" },
  eliminated: { bg: "rgba(255, 255, 255, 0.05)", border: "rgba(255, 255, 255, 0.2)", text: "var(--color-text-muted)" },
  swap:       { bg: "rgba(139, 92, 246, 0.2)", border: "var(--color-purple, #8b5cf6)", text: "var(--color-text)" },
  idle:       { bg: "var(--color-surface, #ffffff)", border: "var(--color-node-stroke, #e2e8f0)", text: "var(--color-text, #334155)" },
};

function cellState(idx, step) {
  if (!step) return "idle";
  if (step.swap?.includes(idx)) return "swap";
  if (step.highlight?.includes(idx)) return "active";
  if (step.secondary?.includes(idx)) return "secondary";
  if (step.eliminated?.includes(idx)) return "eliminated";
  if (step.done?.includes(idx)) return "done";
  return "idle";
}

function parseMessageText(text) {
  if (!text) return "--";
  const parts = text.split(/`([^`]+)`/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return (
        <code key={i} className="px-1.5 py-0.5 mx-0.5 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 rounded font-mono text-[11px] text-[var(--color-accent)] font-bold shadow-sm inline-block translate-y-[-1px]">
          {part}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function ArrayCanvas({ step }) {
  if (!step?.arr) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-[var(--color-text-subtle)] font-mono text-sm opacity-50">
          No array data available.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[var(--color-surface)]/50 backdrop-blur-sm m-4 rounded-2xl border border-[var(--color-node-stroke)]">
      <div className="flex flex-wrap gap-3 items-end min-h-[120px] p-4 bg-[var(--color-surface-hover)] rounded-xl shadow-inner border border-[var(--color-node-stroke)]">
        {step.arr.map((val, idx) => {
          const s = COLORS[cellState(idx, step)];
          const ptr = step.pointers?.[idx] || step.pointers?.[idx.toString()];
          
          return (
            <div key={idx} className="flex flex-col items-center gap-2">
              <span 
                className="text-[10px] font-bold font-mono min-h-[16px] px-1 rounded"
                style={{ 
                  color: ptr ? "#3b82f6" : "transparent",
                  backgroundColor: ptr ? "rgba(59,130,246,0.1)" : "transparent"
                }}
              >
                {ptr || "."}
              </span>
              <div 
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-lg sm:text-xl font-bold font-mono transition-all duration-300 shadow-sm"
                style={{
                  border: `2px solid ${s.border}`,
                  background: s.bg,
                  color: s.text,
                  transform: s.bg !== COLORS.idle.bg ? "scale(1.05)" : "scale(1)"
                }}
              >
                {val}
              </div>
              <span className="text-[10px] text-[var(--color-text-subtle)] font-mono opacity-60">[{idx}]</span>
            </div>
          );
        })}
      </div>

      {/* Legend & What's happening */}
      <div className="w-full max-w-3xl mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-[var(--color-surface-hover)] rounded-xl border border-[var(--color-node-stroke)]">
          <div className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Color Legend</div>
          <div className="flex flex-wrap gap-4">
            {Object.entries(COLORS).map(([label, style]) => {
              if (label === 'idle') return null;
              return (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ background: style.bg, border: `1.5px solid ${style.border}` }} />
                  <span className="text-xs text-[var(--color-text-muted)] capitalize">{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-[var(--color-accent)]/10 rounded-xl border border-[var(--color-accent)]/20 shadow-sm flex flex-col justify-center">
          <div className="text-[10px] font-bold text-[var(--color-accent)] uppercase tracking-wider mb-2">What is happening</div>
          <p className="m-0 text-sm font-medium text-[var(--color-text)] leading-relaxed">
            {parseMessageText(step.msg)}
          </p>
        </div>
      </div>

      {/* State Variables Row */}
      <div className="w-full max-w-3xl mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {step.pointers && Object.keys(step.pointers).length > 0 && (
          <div className="p-3 bg-black/5 rounded-xl border border-black/5 shadow-sm">
            <div className="text-[9px] font-bold text-[var(--color-text-subtle)] uppercase tracking-widest mb-1.5">Pointers</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(step.pointers).map(([idx, name]) => (
                <div key={idx} className="text-xs font-mono font-medium text-[var(--color-text)] bg-white/50 dark:bg-black/20 px-2 py-1 rounded shadow-sm">
                  <span className="text-blue-500">{name}</span>: {idx}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {step.highlight?.length > 0 && (
          <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 shadow-sm">
            <div className="text-[9px] font-bold text-blue-500/70 uppercase tracking-widest mb-1.5">Highlight</div>
            <div className="font-mono text-xs text-blue-600 dark:text-blue-400 font-medium tracking-wide">[{step.highlight.join(', ')}]</div>
          </div>
        )}

        {step.secondary?.length > 0 && (
          <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 shadow-sm">
            <div className="text-[9px] font-bold text-amber-600/70 uppercase tracking-widest mb-1.5">Secondary</div>
            <div className="font-mono text-xs text-amber-700 dark:text-amber-500 font-medium tracking-wide">[{step.secondary.join(', ')}]</div>
          </div>
        )}
        
        {step.swap?.length > 0 && (
          <div className="p-3 bg-purple-500/5 rounded-xl border border-purple-500/10 shadow-sm">
            <div className="text-[9px] font-bold text-purple-600/70 uppercase tracking-widest mb-1.5">Swap</div>
            <div className="font-mono text-xs text-purple-700 dark:text-purple-400 font-medium tracking-wide">[{step.swap.join(', ')}]</div>
          </div>
        )}
      </div>
    </div>
  );
}
