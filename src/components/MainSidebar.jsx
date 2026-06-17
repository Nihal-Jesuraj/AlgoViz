import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Database, 
  Layers, 
  ArrowLeftSquare, 
  List, 
  Binary, 
  Network, 
  MessageSquare, 
  Equal, 
  X, 
  Hash, 
  ArrowRightLeft,
  BrainCircuit,
  Code
} from 'lucide-react';

export default function MainSidebar({ isCollapsed, onToggleCollapse }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      title: "Navigation",
      items: [
        { label: "Home", icon: Home, path: "/" },
        { label: "Dashboard", icon: Database, path: "/dashboard" },
        { label: "Code Sandbox", icon: Code, path: "/sandbox" }
      ]
    },
    {
      title: "Data Structures",
      items: [
        { label: "Array", icon: Hash, path: "/visualizer/array" },
        { label: "Linked List", icon: List, path: "/visualizer/linked-list" },
        { label: "Binary Search Tree", icon: Binary, path: "/visualizer/bst" },
        { label: "AVL Tree", icon: Network, path: "/visualizer/avl" }
      ]
    },
    {
      title: "Graph Algorithms",
      items: [
        { label: "Breadth-First Search", icon: Network, path: "/visualizer/bfs" },
        { label: "Depth-First Search", icon: Layers, path: "/visualizer/dfs" },
        { label: "Cycle Detection", icon: ArrowRightLeft, path: "/visualizer/cycle" },
        { label: "Topological Sort", icon: List, path: "/visualizer/topo" },
        { label: "Dijkstra's Algorithm", icon: Database, path: "/visualizer/dijkstra" }
      ]
    }
  ];

  return (
    <motion.aside
      className="glass-panel relative flex flex-col h-full border-r border-[var(--glass-border)] z-[100] backdrop-blur-xl"
      animate={{ width: isCollapsed ? 60 : 280 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header - click to toggle */}
      <div
        onClick={onToggleCollapse}
        className="flex items-center gap-3 p-4 border-b border-[var(--glass-border)] h-[56px] shrink-0 cursor-pointer select-none"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-accent)] shadow-sm shrink-0">
          <BrainCircuit size={isCollapsed ? 18 : 20} strokeWidth={2.5} />
        </div>
        {!isCollapsed && (
          <span className="font-heading font-bold text-[var(--color-text)] tracking-tight whitespace-nowrap overflow-hidden">
            AlgoViz
          </span>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 custom-scrollbar">
        {navItems.map((section, idx) => (
          <div key={idx} className="mb-6">
            {!isCollapsed && (
              <h3 className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.15em] mb-2 px-3">
                {section.title}
              </h3>
            )}
            <div className="flex flex-col gap-1">
              {section.items.map((item, itemIdx) => {
                const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/');
                return (
                  <button
                    key={itemIdx}
                    onClick={() => navigate(item.path)}
                    title={isCollapsed ? item.label : ""}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 w-full text-left
                      ${isActive 
                        ? 'bg-[rgba(var(--color-highlight-rgb),0.1)] text-[var(--color-text)]' 
                        : 'text-[var(--color-text-muted)] hover:bg-[var(--glass-fill-hover)] hover:text-[var(--color-text)]'
                      }
                    `}
                  >
                    <item.icon size={18} className="shrink-0" />
                    {!isCollapsed && (
                      <span className="font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.aside>
  );
}
