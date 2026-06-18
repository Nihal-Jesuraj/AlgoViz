import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shuffle } from 'lucide-react';
import { generateRandomGraph } from '../../utils/graphInputParser';

export default function RandomGraphTab({ onLoadGraph }) {
  const [randomNodes, setRandomNodes] = useState(6);
  const [randomDensity, setRandomDensity] = useState(0.5);
  const [randomDirected, setRandomDirected] = useState(false);
  const [randomWeighted, setRandomWeighted] = useState(false);

  const handleRandom = () => {
    onLoadGraph(generateRandomGraph({ nodeCount: randomNodes, edgeDensity: randomDensity, isDirected: randomDirected, isWeighted: randomWeighted }));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 max-w-md mx-auto mt-4">
      <div className="grid grid-cols-2 gap-6 bg-black/20 p-6 rounded-xl border border-white/5">
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-[var(--color-text-muted)]">Nodes: <span className="text-[var(--color-text)]">{randomNodes}</span></label>
          <input type="range" min="3" max="50" value={randomNodes} onChange={e => setRandomNodes(Number(e.target.value))} className="w-full accent-[var(--color-accent)]" aria-label="Number of nodes" />
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-sm font-semibold text-[var(--color-text-muted)]">Density: <span className="text-[var(--color-text)]">{randomDensity.toFixed(2)}</span></label>
          <input type="range" min="0.1" max="1" step="0.1" value={randomDensity} onChange={e => setRandomDensity(Number(e.target.value))} className="accent-[var(--color-accent)]" aria-label="Edge density" />
        </div>
      </div>
      <div className="flex gap-8 justify-center py-2">
        <label className="flex items-center gap-3 text-sm cursor-pointer font-medium hover:text-[var(--color-text)] text-[var(--color-text-muted)] transition-colors">
          <input type="checkbox" checked={randomDirected} onChange={() => setRandomDirected(!randomDirected)} className="accent-[var(--color-accent)] w-5 h-5 rounded" />
          Directed
        </label>
        <label className="flex items-center gap-3 text-sm cursor-pointer font-medium hover:text-[var(--color-text)] text-[var(--color-text-muted)] transition-colors">
          <input type="checkbox" checked={randomWeighted} onChange={() => setRandomWeighted(!randomWeighted)} className="accent-[var(--color-accent)] w-5 h-5 rounded" />
          Weighted
        </label>
      </div>
      <button className="glass-button !py-4 primary w-full font-semibold shadow-glass-elevated mt-2" onClick={handleRandom} aria-label="Generate random graph">
        <Shuffle size={18} className="inline mr-2" />
        Generate Random Graph
      </button>
    </motion.div>
  );
}
