import { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Shuffle, Save, Link as LinkIcon, LayoutGrid, Network } from 'lucide-react';
import FetchTab from './sandbox/FetchTab';
import ArrayCodeTab from './sandbox/ArrayCodeTab';
import PasteTab from './sandbox/PasteTab';
import TemplatesTab from './sandbox/TemplatesTab';
import RandomGraphTab from './sandbox/RandomGraphTab';
import SavedGraphsTab from './sandbox/SavedGraphsTab';

const TABS = [
  { id: 'fetch', label: 'LeetCode / GFG URL', icon: <LinkIcon size={14} /> },
  { id: 'array', label: 'Code Analysis (Arrays)', icon: <Code size={14} /> },
  { id: 'paste', label: 'Paste Example Input', icon: <Code size={14} /> },
  { id: 'templates', label: 'Manual Builder / Templates', icon: <LayoutGrid size={14} /> },
  { id: 'random', label: 'Random Graph', icon: <Shuffle size={14} /> },
  { id: 'saved', label: 'Saved Layouts', icon: <Save size={14} /> },
];

export default function DryRunView({ onLoadGraph, currentGraphData }) {
  const [activeTab, setActiveTab] = useState('fetch');

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent pointer-events-auto p-6 z-10 overflow-y-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-accent)] mb-4 shadow-sm">
          <Network size={32} strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-bold uppercase tracking-wider mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif", color: 'var(--color-text)' }}>Dry Run & Builder</h1>
        <p className="text-[var(--color-text-muted)] max-w-md mx-auto">Acquire input from external sources or build your own custom graph structure.</p>
      </div>

      <motion.div
        className="glass-panel w-full max-w-3xl bg-[var(--color-surface)]/80 border border-[var(--glass-border)] rounded-2xl shadow-2xl flex flex-col min-h-[400px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex border-b border-[var(--glass-border)] px-4 pt-2 gap-2 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-label={`${tab.label} tab`}
              className={`flex items-center gap-2 px-5 py-3 font-heading font-semibold text-xs tracking-wider transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[var(--color-accent)] text-[var(--color-text)] bg-[var(--glass-fill)]'
                  : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-fill)]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-8 flex-1">
          {activeTab === 'fetch' && <FetchTab onLoadGraph={onLoadGraph} />}
          {activeTab === 'array' && <ArrayCodeTab onLoadGraph={onLoadGraph} />}
          {activeTab === 'paste' && <PasteTab onLoadGraph={onLoadGraph} />}
          {activeTab === 'templates' && <TemplatesTab onLoadGraph={onLoadGraph} />}
          {activeTab === 'random' && <RandomGraphTab onLoadGraph={onLoadGraph} />}
          {activeTab === 'saved' && <SavedGraphsTab onLoadGraph={onLoadGraph} currentGraphData={currentGraphData} />}
        </div>
      </motion.div>
    </div>
  );
}
