import { motion } from 'framer-motion';
import { LayoutGrid } from 'lucide-react';
import * as templates from '../../data/graphTemplates';

export default function TemplatesTab({ onLoadGraph }) {
  const handleTemplate = (templateFn, ...args) => onLoadGraph(templateFn(...args));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
      <div className="text-center mb-6">
        <h3 className="font-semibold text-[var(--color-text)] mb-1">Start from a Template</h3>
        <p className="text-xs text-[var(--color-text-subtle)]">Pick a base structure, then use the Editor tools in the canvas to add or remove edges.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto w-full">
        {[
          { name: 'Binary Tree', fn: () => handleTemplate(templates.binaryTree, 3) },
          { name: 'Complete Graph', fn: () => handleTemplate(templates.completeGraph, 5) },
          { name: 'Grid Graph', fn: () => handleTemplate(templates.gridGraph, 3, 3) },
          { name: 'Random DAG', fn: () => handleTemplate(templates.dagGraph, 6) },
          { name: 'Cycle Graph', fn: () => handleTemplate(templates.cycleGraph, 6) },
          { name: 'Star Graph', fn: () => handleTemplate(templates.starGraph, 7) },
        ].map(t => (
          <button key={t.name} onClick={t.fn} className="glass-button !h-24 flex flex-col items-center justify-center gap-3 hover:!border-[var(--color-accent)] group" style={{ background: 'var(--glass-fill)' }} aria-label={`Load ${t.name} template`}>
            <LayoutGrid className="text-[var(--color-text-subtle)] group-hover:text-[var(--color-accent)] transition-colors" size={24} />
            <span className="text-sm font-medium">{t.name}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
