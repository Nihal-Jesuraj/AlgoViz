export default function AnalysisMetricsPanel({ analysisData }) {
  if (!analysisData) return null;

  const { algorithmName, category, timeComplexity, spaceComplexity, isCorrect, explanation, bugs, codeLines } = analysisData;

  const cards = [
    { label: "Algorithm", value: algorithmName, color: "text-slate-800", darkColor: "text-slate-100" },
    { label: "Category", value: category, color: "text-blue-500", darkColor: "text-blue-400" },
    { label: "Time", value: timeComplexity, color: "text-purple-500", darkColor: "text-purple-400" },
    { label: "Space", value: spaceComplexity, color: "text-cyan-500", darkColor: "text-cyan-400" }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 mt-6 pb-20 px-6 font-mono">
      
      {/* 4-Card Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="glass-panel p-3 rounded-xl shadow-sm" style={{ background: 'var(--glass-fill)', border: '1px solid var(--glass-border)' }}>
            <div className="font-heading text-[10px] text-[var(--color-text-muted)] font-semibold tracking-wider uppercase mb-1">{c.label}</div>
            <div className={`text-sm font-extrabold ${c.color} dark:${c.darkColor} truncate`} title={c.value}>{c.value || '--'}</div>
          </div>
        ))}
      </div>

      {/* Correctness Caveat Block — only shown when AI analysis populated isCorrect */}
      {isCorrect !== undefined && (
        <div className={`p-4 rounded-xl border ${isCorrect ? 'bg-green-500/10 border-green-500/20' : 'bg-orange-500/10 border-orange-500/20'}`}>
          <div className={`text-xs font-bold mb-1 ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
            AI's read of the approach: {isCorrect ? 'Looks Correct' : 'Potential Issues Found'}
          </div>
          <div className={`text-xs leading-relaxed ${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'}`}>
            {isCorrect ? explanation : (bugs || []).join(" | ")}
          </div>
          <div className="mt-2 pt-2 text-[10px] text-[var(--color-text-subtle)] italic" style={{ borderTop: '1px solid var(--glass-border)' }}>
            * Note: AI analysis can sometimes miss subtle edge cases or hallucinate logic. Treat this as a helpful peer review, not an absolute verdict.
          </div>
        </div>
      )}

      {/* Line-by-Line Breakdown */}
      {codeLines && codeLines.length > 0 && (
        <div className="rounded-xl overflow-hidden mt-2" style={{ background: 'var(--glass-fill)', border: '1px solid var(--glass-border)' }}>
          <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--glass-border)', background: 'var(--color-surface-hover)' }}>
            <span className="font-heading text-[10px] font-semibold text-[var(--color-text-muted)] tracking-wider uppercase">Line-by-line Explanation</span>
          </div>
          <div className="flex flex-col">
            {codeLines.map((item, i) => (
              <div key={i} className={`flex gap-4 p-3 ${i < codeLines.length - 1 ? '' : ''} items-start`} style={i < codeLines.length - 1 ? { borderBottom: '1px solid var(--glass-border)' } : {}}>
                <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-[var(--color-text-muted)] flex-shrink-0" style={{ background: 'rgba(var(--color-highlight-rgb), 0.1)' }}>
                  {i + 1}
                </span>
                <code className="text-[11px] text-[var(--color-text)] px-2 py-1 rounded max-w-[240px] flex-shrink-0 overflow-x-auto whitespace-pre-wrap word-break-all" style={{ background: 'var(--glass-fill)' }}>
                  {item.line}
                </code>
                <span className="text-xs text-[var(--color-text-muted)] leading-relaxed flex-1">
                  {item.explain}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
