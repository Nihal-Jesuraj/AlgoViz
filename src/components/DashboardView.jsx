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
    <div className="flex-1 overflow-y-auto p-12 bg-black/90 text-white min-h-screen">
      <div className="max-w-6xl mx-auto mt-8">
        <h1 className="text-4xl font-bold mb-2 tracking-tight text-[#a3e635]">Data Structures</h1>
        <p className="text-white/60 mb-12 text-lg">Select a data structure to explore its interactive visualizer.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {structures.map((s) => (
            <button
              key={s.id}
              onClick={() => navigate(`/visualizer/${s.id}`)}
              className="flex items-start gap-4 p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-[#a3e635]/50 hover:shadow-[0_0_20px_rgba(163,230,53,0.15)] transition-all text-left group"
            >
              <div className="p-3 bg-black/50 border border-white/10 rounded-lg group-hover:border-[#a3e635]/50 group-hover:text-[#a3e635] transition-colors">
                <s.icon size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white group-hover:text-[#a3e635] transition-colors">{s.title}</h3>
                <p className="text-white/50 mt-2 text-sm leading-relaxed">{s.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
