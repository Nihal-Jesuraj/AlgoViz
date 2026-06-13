import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Code, LayoutGrid, Shuffle, Save, Link as LinkIcon, Loader2 } from 'lucide-react';
import {
  parseLeetCodeFormat,
  generateRandomGraph
} from '../utils/graphInputParser';
import { getLayoutedElements } from '../utils/LayoutManager';
import * as templates from '../data/graphTemplates';
import { useGraphStorage } from '../hooks/useGraphStorage';

export default function GraphInputModal({ isOpen, onClose, onLoadGraph, onSaveCurrent, currentGraphData }) {
  const [activeTab, setActiveTab] = useState('paste');
  const [pasteInput, setPasteInput] = useState('');
  const [error, setError] = useState('');
  
  // URL Fetching
  const [fetchUrl, setFetchUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  
  // Random options
  const [randomNodes, setRandomNodes] = useState(6);
  const [randomDensity, setRandomDensity] = useState(0.5);
  const [randomDirected, setRandomDirected] = useState(false);
  const [randomWeighted, setRandomWeighted] = useState(false);
  
  // Storage
  const { savedGraphs, saveGraph, loadGraph: storageLoadGraph, deleteGraph } = useGraphStorage();
  const [saveName, setSaveName] = useState('');

  if (!isOpen) return null;

  const handleParse = () => {
    try {
      setError('');
      let data = parseLeetCodeFormat(pasteInput);
      
      // Auto-layout the parsed graph
      if (data && data.nodes && data.nodes.length > 0) {
        data.nodes = getLayoutedElements(data.nodes, data.edges, 'TB', data.isDirected);
      }
      
      onLoadGraph(data);
      onClose();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleFetchUrl = async () => {
    if (!fetchUrl.trim()) return;
    try {
      setError('');
      setIsFetching(true);
      // Use local Vite proxy to bypass CORS and WAFs
      const proxyUrl = `/api/scrape?url=${encodeURIComponent(fetchUrl.trim())}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error(`Network response was not ok (${response.status})`);
      const htmlText = await response.text();
      
      // Look for adj = [[...]] or edges = [[...]] or Input: ... [[...]]
      const arrayRegex = /\[\s*\[.*?\]\s*\]/g;
      const matches = htmlText.match(arrayRegex);
      if (!matches || matches.length === 0) {
        throw new Error('Could not find a valid 2D array test case in the URL.');
      }
      
      // Try to parse the first match
      let data;
      for (const match of matches) {
        try {
          data = parseLeetCodeFormat(match);
          if (data && data.nodes.length > 0) break;
        } catch (e) {
          // Ignore and try next match
        }
      }
      
      if (!data || data.nodes.length === 0) {
        throw new Error('Failed to parse any valid graph array from the URL.');
      }
      
      // Auto-layout
      data.nodes = getLayoutedElements(data.nodes, data.edges, 'TB', data.isDirected);
      onLoadGraph(data);
      onClose();
    } catch (e) {
      setError('Fetch failed: ' + e.message);
    } finally {
      setIsFetching(false);
    }
  };

  const handleTemplate = (templateFn, ...args) => {
    onLoadGraph(templateFn(...args));
    onClose();
  };

  const handleRandom = () => {
    onLoadGraph(generateRandomGraph({
      nodeCount: randomNodes,
      edgeDensity: randomDensity,
      isDirected: randomDirected,
      isWeighted: randomWeighted
    }));
    onClose();
  };

  const handleSave = () => {
    if (!saveName.trim()) return;
    saveGraph(saveName.trim(), currentGraphData());
    setSaveName('');
  };

  const handleLoadSaved = (name) => {
    const data = storageLoadGraph(name);
    if (data) {
      onLoadGraph(data);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        className="glass-panel w-full max-w-2xl bg-[#140F1E]/90 border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[85vh]"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="font-heading font-semibold text-lg">Graph Tools</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 px-4 pt-2 gap-2">
          {[
            { id: 'paste', label: 'Paste Code', icon: <Code size={14} /> },
            { id: 'fetch', label: 'Fetch URL', icon: <LinkIcon size={14} /> },
            { id: 'templates', label: 'Templates', icon: <LayoutGrid size={14} /> },
            { id: 'random', label: 'Random', icon: <Shuffle size={14} /> },
            { id: 'saved', label: 'Saved', icon: <Save size={14} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-heading font-semibold text-xs tracking-wider transition-colors ${
                activeTab === tab.id 
                  ? 'border-accent-purple text-accent-purple bg-accent-purple/5' 
                  : 'border-transparent text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
          
          {/* TAB: Paste */}
          {activeTab === 'paste' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">Paste Input</label>
                <textarea 
                  className="glass-input !h-32 !p-3 font-mono text-sm leading-relaxed"
                  placeholder={`Examples:\nAdjacency List: [[1,2], [0,3], [1,4]]\nEdge List: [[0,1,5], [1,2,3]]`}
                  value={pasteInput}
                  onChange={(e) => setPasteInput(e.target.value)}
                />
              </div>
              {error && <div className="text-red-400 text-xs bg-red-400/10 p-2 rounded border border-red-400/20">{error}</div>}
              <button className="glass-button !py-2.5 primary w-full font-semibold" onClick={handleParse}>
                Parse & Load Graph
              </button>
            </div>
          )}

          {/* TAB: Fetch URL */}
          {activeTab === 'fetch' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white/70 uppercase tracking-wider">GeeksForGeeks or LeetCode URL</label>
                <input 
                  type="text"
                  className="glass-input !p-3 font-mono text-sm"
                  placeholder="https://practice.geeksforgeeks.org/problems/..."
                  value={fetchUrl}
                  onChange={(e) => setFetchUrl(e.target.value)}
                />
              </div>
              {error && <div className="text-red-400 text-xs bg-red-400/10 p-2 rounded border border-red-400/20">{error}</div>}
              <button 
                className="glass-button !py-2.5 primary w-full font-semibold flex items-center justify-center gap-2" 
                onClick={handleFetchUrl}
                disabled={isFetching}
              >
                {isFetching ? <Loader2 size={16} className="animate-spin" /> : <LinkIcon size={16} />}
                {isFetching ? 'Fetching and Parsing...' : 'Extract Graph from URL'}
              </button>
            </div>
          )}

          {/* TAB: Templates */}
          {activeTab === 'templates' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { name: 'Binary Tree', fn: () => handleTemplate(templates.binaryTree, 3) },
                { name: 'Complete Graph', fn: () => handleTemplate(templates.completeGraph, 5) },
                { name: 'Grid Graph', fn: () => handleTemplate(templates.gridGraph, 3, 3) },
                { name: 'Random DAG', fn: () => handleTemplate(templates.dagGraph, 6) },
                { name: 'Cycle Graph', fn: () => handleTemplate(templates.cycleGraph, 6) },
                { name: 'Star Graph', fn: () => handleTemplate(templates.starGraph, 7) },
              ].map(t => (
                <button 
                  key={t.name}
                  onClick={t.fn}
                  className="glass-button !h-20 flex flex-col items-center justify-center gap-2 hover:!border-accent-purple/50 group"
                >
                  <LayoutGrid className="text-white/40 group-hover:text-accent-purple transition-colors" />
                  <span className="text-xs font-medium">{t.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* TAB: Random */}
          {activeTab === 'random' && (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-white/70">Nodes: {randomNodes}</label>
                  <input type="range" min="3" max="20" value={randomNodes} onChange={e => setRandomNodes(Number(e.target.value))} className="accent-accent-purple" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-white/70">Density: {randomDensity.toFixed(2)}</label>
                  <input type="range" min="0.1" max="1" step="0.1" value={randomDensity} onChange={e => setRandomDensity(Number(e.target.value))} className="accent-accent-purple" />
                </div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={randomDirected} onChange={() => setRandomDirected(!randomDirected)} className="accent-accent-purple w-4 h-4" />
                  Directed
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={randomWeighted} onChange={() => setRandomWeighted(!randomWeighted)} className="accent-accent-purple w-4 h-4" />
                  Weighted
                </label>
              </div>
              <button className="glass-button !py-2.5 primary w-full font-semibold mt-2" onClick={handleRandom}>
                Generate Random Graph
              </button>
            </div>
          )}

          {/* TAB: Saved */}
          {activeTab === 'saved' && (
            <div className="flex flex-col gap-4 h-full">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Graph name..." 
                  value={saveName}
                  onChange={e => setSaveName(e.target.value)}
                  className="glass-input flex-1"
                />
                <button className="glass-button !px-4 primary" onClick={handleSave}>Save Current</button>
              </div>
              
              <div className="flex-1 overflow-y-auto border border-white/5 rounded-xl bg-black/20 divide-y divide-white/5">
                {savedGraphs.length === 0 ? (
                  <div className="p-6 text-center text-white/40 text-sm">No saved graphs yet.</div>
                ) : (
                  savedGraphs.map(g => (
                    <div key={g.name} className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{g.name}</span>
                        <span className="text-[10px] text-white/50">{g.nodeCount} nodes, {g.edgeCount} edges • {new Date(g.savedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleLoadSaved(g.name)} className="glass-button !px-3 !py-1 text-xs">Load</button>
                        <button onClick={() => deleteGraph(g.name)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/20"><X size={14}/></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
