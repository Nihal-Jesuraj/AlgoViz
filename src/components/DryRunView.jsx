import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Shuffle, Save, Link as LinkIcon, Loader2, LayoutGrid, Network } from 'lucide-react';
import {
  parseLeetCodeFormat,
  generateRandomGraph
} from '../utils/graphInputParser';
import { getLayoutedElements } from '../utils/LayoutManager';
import * as templates from '../data/graphTemplates';
import { useGraphStorage } from '../hooks/useGraphStorage';
import { diagramExtractionService } from '../services/DiagramExtractionService';
import { ExampleExtractionService } from '../services/ExampleExtractionService';
import { GraphFingerprintService } from '../services/GraphFingerprintService';
import { LayoutPersistenceService } from '../services/LayoutPersistenceService';

import { AICodeAnalyzerService } from '../services/AICodeAnalyzerService';

const DEMOS = {
  remove_dup: {
    label: "C++ Remove Duplicates",
    code: `// C++ - Remove Duplicates from Sorted Array
int removeDuplicates(vector<int>& nums) {
    int count = 1;
    for (int i = 1; i < nums.size(); i++) {
        if (nums[i] != nums[i-1]) {
            nums[count] = nums[i];
            count++;
        }
    }
    return count;
}`
  },
  binary: {
    label: "Python Binary Search",
    code: `# Python - Binary Search
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`
  },
  two_sum: {
    label: "JS Two Pointers",
    code: `// JavaScript - Two Pointers
function twoSum(arr, target) {
    let left = 0, right = arr.length - 1;
    while (left < right) {
        let sum = arr[left] + arr[right];
        if (sum === target) return [left, right];
        else if (sum < target) left++;
        else right--;
    }
    return [-1, -1];
}`
  }
};

export default function DryRunView({ onLoadGraph, currentGraphData }) {
  const [activeTab, setActiveTab] = useState('fetch');
  const [pasteInput, setPasteInput] = useState('');
  const [error, setError] = useState('');
  
  // URL Fetching
  const [fetchUrl, setFetchUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  
  // Array Code Analysis
  const [rawCodeInput, setRawCodeInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Random options
  const [randomNodes, setRandomNodes] = useState(6);
  const [randomDensity, setRandomDensity] = useState(0.5);
  const [randomDirected, setRandomDirected] = useState(false);
  const [randomWeighted, setRandomWeighted] = useState(false);
  
  // Storage
  const { savedGraphs, saveGraph, loadGraph: storageLoadGraph, deleteGraph } = useGraphStorage();
  const [saveName, setSaveName] = useState('');

  const handleParse = () => {
    try {
      setError('');
      let data = parseLeetCodeFormat(pasteInput);
      
      // Auto-layout the parsed graph
      if (data && data.nodes && data.nodes.length > 0) {
        data.nodes = getLayoutedElements(data.nodes, data.edges, 'TB', data.isDirected);
      }
      
      onLoadGraph(data);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleFetchUrl = async () => {
    if (!fetchUrl.trim()) return;
    
    // Validate URL client-side
    try {
      new URL(fetchUrl.trim());
    } catch (_) {
      setError('Please enter a valid URL (e.g. https://leetcode.com/problems/...)');
      return;
    }

    // Check domain whitelist
    const url = new URL(fetchUrl.trim());
    const allowedDomains = ['leetcode.com', 'geeksforgeeks.org', 'gfg.org'];
    const isDomainAllowed = allowedDomains.some(domain => url.hostname.includes(domain));
    if (!isDomainAllowed) {
      setError('Only LeetCode and GeeksForGeeks problem URLs are supported.');
      return;
    }

    try {
      setError('');
      setIsFetching(true);
      const t0 = performance.now();
      
      // Use local Vite proxy to bypass CORS and WAFs
      const proxyUrl = `/api/scrape?url=${encodeURIComponent(fetchUrl.trim())}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Domain not allowed. Only LeetCode and GeeksForGeeks are supported.');
        }
        throw new Error(`Network response was not ok (${response.status})`);
      }
      const htmlText = await response.text();
      
      if (!htmlText || htmlText.trim().length === 0) {
        throw new Error('No problem content found. Please check the URL and try again.');
      }
      
      // 1. Extract and Parse using the new service
      let data;
      try {
        data = ExampleExtractionService.extractAndParse(htmlText);
      } catch (parseError) {
        throw new Error(`Failed to extract problem data: ${parseError.message}`);
      }
      
      const urlKey = fetchUrl.trim();
      
      // Create a collection of available layouts to allow switching later
      const availableLayouts = [];
      const autoLayoutCoords = {};
      const autoLayoutedNodes = getLayoutedElements(data.nodes, data.edges, 'TB', data.isDirected);
      autoLayoutedNodes.forEach(n => autoLayoutCoords[n.id] = { ...n.position });
      availableLayouts.push({ source: 'Auto-Layout', coordinates: autoLayoutCoords });

      const applyLayout = (coords, source, fingerprint = null, confidence = null) => {
        data.nodes = data.nodes.map(n => ({
          ...n,
          position: coords[n.id] || n.position
        }));
        const debugInfoObj = {
          source,
          timeMs: Math.round(performance.now() - t0),
          status: 'success',
          fingerprint,
          confidence,
          availableLayouts,
          problemHtml: htmlText
        };
        // Send data
        onLoadGraph(data, debugInfoObj);
      };

      // 2. Check User Layout
      const userLayout = LayoutPersistenceService.loadUserLayout(urlKey);
      if (userLayout) {
        availableLayouts.push({ source: 'User Saved', coordinates: userLayout.coordinates });
        return applyLayout(userLayout.coordinates, 'User Saved');
      }

      // 3. Compute Fingerprint
      const fingerprintHash = GraphFingerprintService.generateFingerprint(data.nodes, data.edges, data.isDirected);
      
      // 4. Check Fingerprint Cache
      const fingerprintLayout = LayoutPersistenceService.loadFingerprintLayout(fingerprintHash);
      if (fingerprintLayout) {
        availableLayouts.push({ source: 'Fingerprint Cache', coordinates: fingerprintLayout.coordinates });
        return applyLayout(fingerprintLayout.coordinates, 'Fingerprint Cache', fingerprintHash);
      }
      
      // 5. AI Diagram Reconstruction (Vision API) — optional, will fall back gracefully
      const images = diagramExtractionService.extractImagesFromHTML(htmlText);
      let visionSuccess = false;
      if (images.length > 0) {
        try {
          const { coordinates, debugInfo } = await diagramExtractionService.reconstruct(
            urlKey, 
            images, 
            data.nodes.map(n => n.id),
            data.edges
          );
          
          if (coordinates) {
            // AI Success
            availableLayouts.push({ source: 'Vision AI', coordinates });
            LayoutPersistenceService.saveFingerprintLayout(fingerprintHash, coordinates, true);
            visionSuccess = true;
            return applyLayout(coordinates, 'Vision AI', fingerprintHash, debugInfo.confidence);
          }
        } catch (visionError) {
          console.warn('Vision AI reconstruction failed (will use auto-layout):', visionError.message);
          // Fall through to auto-layout
        }
      }
      
      // 6. Fallback: Auto-layout
      applyLayout(autoLayoutCoords, 'Auto-Layout', fingerprintHash);
      
    } catch (e) {
      setError('Fetch failed: ' + e.message);
    } finally {
      setIsFetching(false);
    }
  };

  const handleTemplate = (templateFn, ...args) => {
    onLoadGraph(templateFn(...args));
  };

  const handleRandom = () => {
    onLoadGraph(generateRandomGraph({
      nodeCount: randomNodes,
      edgeDensity: randomDensity,
      isDirected: randomDirected,
      isWeighted: randomWeighted
    }));
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
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent pointer-events-auto p-6 z-10 overflow-y-auto">
      
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--glass-fill)] border border-[var(--color-accent)] mb-4 shadow-sm">
          <Network size={32} className="text-[var(--color-accent)]" />
        </div>
        <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-2">Dry Run & Builder</h1>
        <p className="text-[var(--color-text-muted)] max-w-md mx-auto">Acquire input from external sources or build your own custom graph structure.</p>
      </div>

      <motion.div 
        className="glass-panel w-full max-w-3xl bg-[var(--color-surface)]/80 border border-white/10 rounded-2xl shadow-2xl flex flex-col min-h-[400px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Tabs */}
        <div className="flex border-b border-white/5 px-4 pt-2 gap-2 overflow-x-auto">
          {[
            { id: 'fetch', label: 'LeetCode / GFG URL', icon: <LinkIcon size={14} /> },
            { id: 'array', label: 'Code Analysis (Arrays)', icon: <Code size={14} /> },
            { id: 'paste', label: 'Paste Example Input', icon: <Code size={14} /> },
            { id: 'templates', label: 'Manual Builder / Templates', icon: <LayoutGrid size={14} /> },
            { id: 'random', label: 'Random Graph', icon: <Shuffle size={14} /> },
            { id: 'saved', label: 'Saved Layouts', icon: <Save size={14} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 font-heading font-semibold text-xs tracking-wider transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--glass-fill)]' 
                  : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--glass-fill)]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-8 flex-1">
          
          {/* TAB: Fetch URL */}
          {activeTab === 'fetch' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 max-w-xl mx-auto mt-4">
              <div className="text-center">
                <h3 className="font-semibold text-[var(--color-text)] mb-1">AI Problem Solver</h3>
                <p className="text-xs text-[var(--color-text-subtle)]">Paste a link to a LeetCode or GeeksForGeeks problem. We will extract the exact example diagram and reconstruct it perfectly using AI.</p>
              </div>

              <div className="flex flex-col gap-2">
                <input 
                  type="text"
                  className="glass-input !p-4 font-mono text-sm w-full bg-black/40 border-white/10 focus:border-[var(--color-accent)] transition-colors"
                  placeholder="https://leetcode.com/problems/..."
                  value={fetchUrl}
                  onChange={(e) => setFetchUrl(e.target.value)}
                />
              </div>
              {error && <div className="text-red-400 text-xs bg-red-400/10 p-3 rounded-lg border border-red-400/20 text-center">{error}</div>}
              
              <button 
                className="glass-button !py-4 primary w-full font-semibold flex items-center justify-center gap-3 text-sm shadow-purple-glow hover:shadow-glass-elevated transition-all" 
                onClick={handleFetchUrl}
                disabled={isFetching}
              >
                {isFetching ? <Loader2 size={18} className="animate-spin" /> : <LinkIcon size={18} />}
                {isFetching ? 'Extracting & Reconstructing Graph...' : 'Extract Graph from URL'}
              </button>
            </motion.div>
          )}

          {/* TAB: Array Code Analysis */}
          {activeTab === 'array' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 max-w-2xl mx-auto mt-2 h-full">
              <div className="text-center">
                <h3 className="font-semibold text-[var(--color-text)] mb-1">Raw Code Dry Run</h3>
                <p className="text-xs text-[var(--color-text-subtle)]">Paste your Array, Sorting, or Two Pointers code (C++, Java, Python, JS). We will use AI to perform a line-by-line step visualization.</p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center mt-2 mb-1">
                <span className="text-[10px] text-[var(--color-text-subtle)] font-bold uppercase tracking-wide self-center mr-1">Try a demo:</span>
                {Object.entries(DEMOS).map(([key, d]) => (
                  <button 
                    key={key} 
                    onClick={() => setRawCodeInput(d.code)} 
                    className="px-3 py-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-fill)] hover:bg-[var(--color-accent)] hover:text-white transition-colors text-xs font-medium text-[var(--color-text-muted)]"
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2 flex-1">
                <textarea 
                  className="glass-input flex-1 !p-4 font-mono text-sm leading-relaxed bg-black/40 border-white/10"
                  placeholder={`// Example: Bubble Sort
void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n-1; i++) {
        for (int j = 0; j < n-i-1; j++) {
            if (arr[j] > arr[j+1]) {
                int temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
            }
        }
    }
}`}
                  value={rawCodeInput}
                  onChange={(e) => setRawCodeInput(e.target.value)}
                />
              </div>
              {error && <div className="text-red-400 text-xs bg-red-400/10 p-3 rounded-lg border border-red-400/20 text-center">{error}</div>}
              <button 
                className="glass-button !py-3.5 primary w-full font-semibold shadow-glass-elevated flex items-center justify-center gap-2" 
                onClick={async () => {
                  if (!rawCodeInput.trim()) return;
                  setIsAnalyzing(true);
                  setError('');
                  const res = await AICodeAnalyzerService.analyzeCode(rawCodeInput);
                  setIsAnalyzing(false);
                  if (res.success) {
                    onLoadGraph({ isArrayAnalysis: true, arrayData: res.data });
                  } else {
                    setError(res.error);
                  }
                }}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Code size={18} />}
                {isAnalyzing ? 'Analyzing Code...' : 'Analyze & Visualize'}
              </button>
            </motion.div>
          )}

          {/* TAB: Paste */}
          {activeTab === 'paste' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 max-w-xl mx-auto mt-2">
               <div className="text-center">
                <h3 className="font-semibold text-[var(--color-text)] mb-1">Raw Data Import</h3>
                <p className="text-xs text-[var(--color-text-subtle)]">Paste an adjacency list or an edge list. We'll auto-detect the format.</p>
              </div>
              <div className="flex flex-col gap-2">
                <textarea 
                  className="glass-input !h-40 !p-4 font-mono text-sm leading-relaxed bg-black/40 border-white/10"
                  placeholder={`Examples:\nAdjacency List: [[1,2], [0,3], [1,4]]\nEdge List: [[0,1,5], [1,2,3]]`}
                  value={pasteInput}
                  onChange={(e) => setPasteInput(e.target.value)}
                />
              </div>
              {error && <div className="text-red-400 text-xs bg-red-400/10 p-3 rounded-lg border border-red-400/20 text-center">{error}</div>}
              <button className="glass-button !py-3.5 primary w-full font-semibold shadow-glass-elevated" onClick={handleParse}>
                Parse & Load Graph
              </button>
            </motion.div>
          )}

          {/* TAB: Templates */}
          {activeTab === 'templates' && (
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
                  <button 
                    key={t.name}
                    onClick={t.fn}
                    className="glass-button !h-24 flex flex-col items-center justify-center gap-3 hover:!border-[var(--color-accent)] group bg-black/20"
                  >
                    <LayoutGrid className="text-[var(--color-text-subtle)] group-hover:text-[var(--color-accent)] transition-colors" size={24} />
                    <span className="text-sm font-medium">{t.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB: Random */}
          {activeTab === 'random' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 max-w-md mx-auto mt-4">
              <div className="grid grid-cols-2 gap-6 bg-black/20 p-6 rounded-xl border border-white/5">
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-semibold text-[var(--color-text-muted)]">Nodes: <span className="text-[var(--color-text)]">{randomNodes}</span></label>
                  <input type="range" min="3" max="50" value={randomNodes} onChange={e => setRandomNodes(Number(e.target.value))} className="w-full accent-[var(--color-accent)]" />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-sm font-semibold text-[var(--color-text-muted)]">Density: <span className="text-[var(--color-text)]">{randomDensity.toFixed(2)}</span></label>
                  <input type="range" min="0.1" max="1" step="0.1" value={randomDensity} onChange={e => setRandomDensity(Number(e.target.value))} className="accent-[var(--color-accent)]" />
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
              <button className="glass-button !py-4 primary w-full font-semibold shadow-glass-elevated mt-2" onClick={handleRandom}>
                Generate Random Graph
              </button>
            </motion.div>
          )}

          {/* TAB: Saved */}
          {activeTab === 'saved' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 h-full max-w-2xl mx-auto w-full">
               <div className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="Graph name to save current..." 
                  value={saveName}
                  onChange={e => setSaveName(e.target.value)}
                  className="glass-input flex-1 !p-3"
                />
                <button className="glass-button !px-6 primary" onClick={handleSave}>Save Canvas State</button>
              </div>
              
              <div className="flex-1 min-h-[250px] max-h-[300px] overflow-y-auto border border-white/5 rounded-xl bg-black/40 divide-y divide-white/5">
                {savedGraphs.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[var(--color-text-subtle)] text-sm">No saved layouts.</div>
                ) : (
                  savedGraphs.map(g => (
                    <div key={g.name} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
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
          )}
        </div>
      </motion.div>
    </div>
  );
}
