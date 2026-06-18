import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, BookOpen, BrainCircuit } from 'lucide-react';
import CodePanel from './CodePanel';
import ReactMarkdown from 'react-markdown';

export default function AISolutionPanel({ customProblemData, themeId = 'dark' }) {
  const [activeTab, setActiveTab] = useState('explanation');

  if (!customProblemData) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[var(--glass-fill)] border-r border-[var(--glass-border)]">
        <div className="text-center p-6 text-[var(--color-text-subtle)] font-mono text-sm">
          <BrainCircuit size={32} className="mx-auto mb-3 opacity-50" />
          <p>Import a custom problem to generate an explanation and solution.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-[var(--color-surface)] border-r border-[var(--glass-border)] backdrop-blur-md">
      {/* Header Info */}
      <div className="p-4 border-b border-[var(--glass-border)] bg-gradient-to-b from-[var(--glass-fill)] to-transparent">
        <h2 className="font-heading font-semibold text-[var(--color-text)] text-sm mb-2 flex items-center gap-2">
          <BrainCircuit size={16} className="text-[var(--color-text-muted)]" />
          Solution
        </h2>
        <div className="flex gap-2 text-[10px] font-mono">
          <div className="px-2 py-1 bg-[var(--glass-fill)] rounded border border-[var(--glass-border)] text-[var(--color-text-muted)]">
            Algo: <span className="text-[var(--color-text)] font-semibold">{customProblemData.algorithmType}</span>
          </div>
          <div className="px-2 py-1 bg-[var(--glass-fill)] rounded border border-[var(--glass-border)] text-[var(--color-text-muted)]">
            Time: <span className="text-[var(--color-teal)] font-semibold">{customProblemData.timeComplexity || 'O(?)'}</span>
          </div>
          <div className="px-2 py-1 bg-[var(--glass-fill)] rounded border border-[var(--glass-border)] text-[var(--color-text-muted)]">
            Space: <span className="text-orange-400 font-semibold">{customProblemData.spaceComplexity || 'O(?)'}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--glass-border)] px-2 pt-2 gap-1 bg-[var(--color-surface-sunken)]">
        <button
          onClick={() => setActiveTab('explanation')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg font-heading text-xs tracking-wider transition-colors ${
            activeTab === 'explanation' 
              ? 'bg-[var(--glass-fill)] text-[var(--color-text)] border-t border-x border-[var(--glass-border)]' 
              : 'text-[var(--color-text-subtle)] hover:text-[var(--color-text-muted)] hover:bg-[var(--glass-fill)] border-t border-x border-transparent'
          }`}
        >
          <BookOpen size={12} /> Explanation
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg font-heading text-xs tracking-wider transition-colors ${
            activeTab === 'code' 
              ? 'bg-[var(--glass-fill)] text-[var(--color-text)] border-t border-x border-[var(--glass-border)]' 
              : 'text-[var(--color-text-subtle)] hover:text-[var(--color-text-muted)] hover:bg-[var(--glass-fill)] border-t border-x border-transparent'
          }`}
        >
          <Code size={12} /> Java Code
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto relative min-h-0">
        <AnimatePresence mode="wait">
          {activeTab === 'explanation' && (
            <motion.div
              key="explanation"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`absolute inset-0 p-5 prose prose-sm max-w-none prose-headings:text-[var(--color-text)] prose-a:text-[var(--color-text)] prose-a:underline text-[var(--color-text-muted)] ${themeId === 'light' ? '' : 'prose-invert'}`}
            >
              <ReactMarkdown>{customProblemData.explanation}</ReactMarkdown>
            </motion.div>
          )}

          {activeTab === 'code' && (
            <motion.div
              key="code"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute inset-0"
            >
              <CodePanel
                code={customProblemData.javaCode || '// No code provided'}
                language="java"
                currentLine={-1} // Can wire this up to algorithm state if AI mapped it
                title=""
                hideHeader={true}
                themeId={themeId}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
