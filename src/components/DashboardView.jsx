import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ArrowLeftSquare, List, Binary, Network, Database, Hash } from 'lucide-react';

const structures = [
  { id: 'array', title: 'Array', description: 'Contiguous memory allocation.', icon: Hash },
  { id: 'linked-list', title: 'Linked List', description: 'Dynamic data structure with connected nodes.', icon: List },
  { id: 'bst', title: 'Binary Search Tree', description: 'Hierarchical structure for fast searching.', icon: Binary },
  { id: 'avl', title: 'AVL Tree', description: 'Self-balancing binary search tree.', icon: Network },
];

export default function DashboardView() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 overflow-y-auto p-12 min-h-screen" style={{ background: 'var(--color-paper)', color: 'var(--color-text)' }}>
      <div className="max-w-6xl mx-auto mt-8">
        <h1 className="dashboard-heading mb-2 tracking-tight uppercase" style={{ color: 'var(--color-accent)', fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 0.85 }}>Data Structures</h1>
        <p className="mb-12 text-lg" style={{ color: 'var(--color-text-muted)' }}>Select a data structure to explore its interactive visualizer.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {structures.map((s) => (
            <button
              key={s.id}
              onClick={() => navigate(`/visualizer/${s.id}`)}
              className="flex items-start gap-4 p-6 rounded-xl transition-all text-left group"
              style={{
                background: 'var(--glass-fill)',
                border: '1px solid var(--glass-border)',
                color: 'var(--color-text)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--glass-fill-hover)';
                e.currentTarget.style.borderColor = 'var(--color-accent)';
                e.currentTarget.style.boxShadow = '0 0 20px var(--color-purple-glow, rgba(124,58,237,0.15))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--glass-fill)';
                e.currentTarget.style.borderColor = 'var(--glass-border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                className="p-3 rounded-lg transition-colors"
                style={{
                  background: 'var(--glass-fill)',
                  border: '1px solid var(--glass-border)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent)';
                  e.currentTarget.style.color = 'var(--color-accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--glass-border)';
                  e.currentTarget.style.color = '';
                }}
              >
                <s.icon size={24} />
              </div>
              <div>
                <h3
                  className="text-xl font-semibold"
                  style={{ color: 'var(--color-text)' }}
                >{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{s.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
