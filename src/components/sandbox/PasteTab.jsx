import { useState } from 'react';
import { motion } from 'framer-motion';
import { parseLeetCodeFormat } from '../../utils/graphInputParser';
import { getLayoutedElements } from '../../utils/LayoutManager';

export default function PasteTab({ onLoadGraph }) {
  const [pasteInput, setPasteInput] = useState('');
  const [error, setError] = useState('');

  const handleParse = () => {
    try {
      setError('');
      let data = parseLeetCodeFormat(pasteInput);
      if (data && data.nodes && data.nodes.length > 0) {
        data.nodes = getLayoutedElements(data.nodes, data.edges, 'TB', data.isDirected);
      }
      onLoadGraph(data);
    } catch (e) { setError(e.message); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 max-w-xl mx-auto mt-2">
      <div className="text-center">
        <h3 className="font-semibold text-[var(--color-text)] mb-1">Raw Data Import</h3>
        <p className="text-xs text-[var(--color-text-subtle)]">Paste an adjacency list or an edge list. We'll auto-detect the format.</p>
      </div>
      <div className="flex flex-col gap-2">
        <textarea className="glass-input !h-40 !p-4 font-mono text-sm leading-relaxed" placeholder={`Examples:\nAdjacency List: [[1,2], [0,3], [1,4]]\nEdge List: [[0,1,5], [1,2,3]]`} value={pasteInput} onChange={(e) => setPasteInput(e.target.value)} aria-label="Paste graph data" />
      </div>
      {error && <div className="text-red-400 text-xs bg-red-400/10 p-3 rounded-lg border border-red-400/20 text-center">{error}</div>}
      <button className="glass-button !py-3.5 primary w-full font-semibold shadow-glass-elevated" onClick={handleParse} aria-label="Parse and load graph">Parse & Load Graph</button>
    </motion.div>
  );
}
