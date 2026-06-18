import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import { useGraphStorage } from '../../hooks/useGraphStorage';

export default function SavedGraphsTab({ onLoadGraph, currentGraphData }) {
  const { savedGraphs, saveGraph, loadGraph, deleteGraph } = useGraphStorage();
  const [saveName, setSaveName] = useState('');

  const handleSave = () => {
    if (!saveName.trim()) return;
    saveGraph(saveName.trim(), currentGraphData());
    setSaveName('');
  };

  const handleLoadSaved = (name) => {
    const data = loadGraph(name);
    if (data) onLoadGraph(data);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 h-full max-w-2xl mx-auto w-full">
      <div className="flex gap-3">
        <input type="text" placeholder="Graph name to save current..." value={saveName} onChange={e => setSaveName(e.target.value)} className="glass-input flex-1 !p-3" aria-label="Save name" />
        <button className="glass-button !px-6 primary" onClick={handleSave} aria-label="Save canvas state">
          <Save size={16} className="inline mr-2" />
          Save Canvas State
        </button>
      </div>

      <div className="flex-1 min-h-[250px] max-h-[300px] overflow-y-auto rounded-xl" style={{ background: 'var(--glass-fill)', border: '1px solid var(--glass-border)' }}>
        {savedGraphs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[var(--color-text-subtle)] text-sm">No saved layouts.</div>
        ) : (
          savedGraphs.map(g => (
            <div key={g.name} className="p-4 flex items-center justify-between transition-colors group hover:bg-[var(--glass-fill)]">
              <div className="flex flex-col">
                <span className="font-semibold text-sm mb-1">{g.name}</span>
                <span className="text-xs text-[var(--color-text-muted)] font-mono">{g.nodeCount} nodes, {g.edgeCount} edges • {new Date(g.savedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleLoadSaved(g.name)} className="glass-button !px-4 !py-1.5 text-xs font-semibold primary">Load</button>
                <button onClick={() => deleteGraph(g.name)} className="p-2 rounded-lg text-red-400 hover:bg-red-400/20 transition-colors"><span className="text-xs font-semibold">Delete</span></button>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
