import { useState } from 'react';
import { motion } from 'framer-motion';
import { LinkIcon, Loader2, Save, Trash2, FolderOpen, CheckCircle } from 'lucide-react';
import { getLayoutedElements } from '../../utils/LayoutManager';
import { ExampleExtractionService } from '../../services/ExampleExtractionService';
import { GraphFingerprintService } from '../../services/GraphFingerprintService';
import { LayoutPersistenceService } from '../../services/LayoutPersistenceService';
import { diagramExtractionService } from '../../services/DiagramExtractionService';
import { useSavedProblems } from '../../hooks/useSavedProblems';

export default function FetchTab({ onLoadGraph }) {
  const [fetchUrl, setFetchUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const [lastData, setLastData] = useState(null);
  const [saveName, setSaveName] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  const { savedProblems, saveProblem, loadProblem, deleteProblem } = useSavedProblems();

  const handleFetchUrl = async () => {
    if (!fetchUrl.trim()) return;
    try { new URL(fetchUrl.trim()); } catch { setError('Please enter a valid URL.'); return; }

    const url = new URL(fetchUrl.trim());
    const allowedDomains = ['leetcode.com', 'geeksforgeeks.org', 'gfg.org'];
    if (!allowedDomains.some(domain => url.hostname.includes(domain))) {
      setError('Only LeetCode and GeeksForGeeks URLs are supported.');
      return;
    }

    try {
      setError('');
      setIsFetching(true);
      const t0 = performance.now();
      const proxyUrl = `/api/scrape?url=${encodeURIComponent(fetchUrl.trim())}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error(response.status === 403 ? 'Domain not allowed.' : `Network error (${response.status})`);
      const htmlText = await response.text();
      if (!htmlText || htmlText.trim().length === 0) throw new Error('No problem content found.');

      let data;
      try { data = ExampleExtractionService.extractAndParse(htmlText, fetchUrl.trim()); }
      catch (parseError) { throw new Error(`Failed to extract: ${parseError.message}`); }

      const urlKey = fetchUrl.trim();

      // Non-graph data (grid, array) — pass through directly
      if (!data.nodes) {
        setLastData(data);
        onLoadGraph(data, { source: 'Extraction', timeMs: Math.round(performance.now() - t0), status: 'success', problemHtml: htmlText });
        return;
      }

      const availableLayouts = [];
      const autoLayoutCoords = {};
      const autoLayoutedNodes = getLayoutedElements(data.nodes, data.edges, 'TB', data.isDirected);
      if (autoLayoutedNodes) autoLayoutedNodes.forEach(n => autoLayoutCoords[n.id] = { ...n.position });
      availableLayouts.push({ source: 'Auto-Layout', coordinates: autoLayoutCoords });

      const applyLayout = (coords, source, fingerprint = null, confidence = null) => {
        data.nodes = data.nodes.map(n => ({ ...n, position: coords[n.id] || n.position }));
        setLastData(data);
        onLoadGraph(data, { source, timeMs: Math.round(performance.now() - t0), status: 'success', fingerprint, confidence, availableLayouts, problemHtml: htmlText });
      };

      const userLayout = LayoutPersistenceService.loadUserLayout(urlKey);
      if (userLayout) {
        availableLayouts.push({ source: 'User Saved', coordinates: userLayout.coordinates });
        return applyLayout(userLayout.coordinates, 'User Saved');
      }

      const fingerprintHash = GraphFingerprintService.generateFingerprint(data.nodes, data.edges, data.isDirected);
      const fingerprintLayout = LayoutPersistenceService.loadFingerprintLayout(fingerprintHash);
      if (fingerprintLayout) {
        availableLayouts.push({ source: 'Fingerprint Cache', coordinates: fingerprintLayout.coordinates });
        return applyLayout(fingerprintLayout.coordinates, 'Fingerprint Cache', fingerprintHash);
      }

      const images = diagramExtractionService.extractImagesFromHTML(htmlText);
      if (images.length > 0) {
        try {
          const { coordinates, debugInfo } = await diagramExtractionService.reconstruct(urlKey, images, data.nodes.map(n => n.id), data.edges);
          if (coordinates) {
            availableLayouts.push({ source: 'Vision AI', coordinates });
            LayoutPersistenceService.saveFingerprintLayout(fingerprintHash, coordinates, true);
            return applyLayout(coordinates, 'Vision AI', fingerprintHash, debugInfo.confidence);
          }
        } catch (visionError) {
          console.warn('Vision AI failed:', visionError.message);
        }
      }

      applyLayout(autoLayoutCoords, 'Auto-Layout', fingerprintHash);
    } catch (e) { setError('Fetch failed: ' + e.message); }
    finally { setIsFetching(false); }
  };

  const handleSave = () => {
    if (!saveName.trim() || !lastData) return;
    saveProblem(saveName.trim(), lastData);
    setSavedMessage(`Saved "${saveName.trim()}"`);
    setSaveName('');
    setTimeout(() => setSavedMessage(''), 2500);
  };

  const handleLoadSaved = (name) => {
    const data = loadProblem(name);
    if (data) onLoadGraph(data);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 max-w-xl mx-auto mt-4">
      <div className="text-center">
        <h3 className="font-heading font-semibold uppercase tracking-wider text-[var(--color-text)] mb-1">Problem Solver</h3>
        <p className="text-xs text-[var(--color-text-subtle)]">Paste a link to a LeetCode or GeeksForGeeks problem. We will extract the exact example diagram and reconstruct it perfectly.</p>
      </div>
      <div className="flex flex-col gap-2">
        <input type="text" className="glass-input !p-4 font-mono text-sm w-full transition-colors" placeholder="https://leetcode.com/problems/..." value={fetchUrl} onChange={(e) => setFetchUrl(e.target.value)} aria-label="Problem URL" />
      </div>
      {error && <div className="text-red-400 text-xs bg-red-400/10 p-3 rounded-lg border border-red-400/20 text-center">{error}</div>}
      <button className="glass-button !py-4 primary w-full font-semibold flex items-center justify-center gap-3 text-sm shadow-purple-glow hover:shadow-glass-elevated transition-all" onClick={handleFetchUrl} disabled={isFetching} aria-label="Extract problem from URL">
        {isFetching ? <Loader2 size={18} className="animate-spin" /> : <LinkIcon size={18} />}
        {isFetching ? 'Extracting Problem...' : 'Extract Problem from URL'}
      </button>

      {lastData && (
        <div className="flex gap-3 items-center">
          <input type="text" placeholder="Name for this problem..." value={saveName}
            onChange={e => setSaveName(e.target.value)}
            className="glass-input flex-1 !p-3 text-sm" aria-label="Save name" />
          <button className="glass-button !px-5 primary flex items-center gap-2" onClick={handleSave} aria-label="Save problem">
            <Save size={16} />
            Save
          </button>
          {savedMessage && (
            <span className="text-xs text-green-400 flex items-center gap-1 whitespace-nowrap">
              <CheckCircle size={14} /> {savedMessage}
            </span>
          )}
        </div>
      )}

      {savedProblems.length > 0 && (
        <div className="mt-2">
          <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-3 flex items-center gap-2">
            <FolderOpen size={14} /> Saved Problems ({savedProblems.length})
          </h4>
          <div className="max-h-[220px] overflow-y-auto rounded-xl" style={{ background: 'var(--glass-fill)', border: '1px solid var(--glass-border)' }}>
            {savedProblems.map(g => (
              <div key={g.name} className="p-3 flex items-center justify-between transition-colors group hover:bg-[var(--glass-fill)] border-b border-[var(--glass-border)] last:border-b-0">
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-sm truncate">{g.title}</span>
                  <span className="text-xs text-[var(--color-text-muted)] font-mono">
                    {g.type === 'grid' ? 'Grid' : 'Graph'} &middot; {new Date(g.savedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-3">
                  <button onClick={() => handleLoadSaved(g.name)} className="glass-button !px-3 !py-1.5 text-xs font-semibold primary flex items-center gap-1">
                    <FolderOpen size={12} /> Load
                  </button>
                  <button onClick={() => deleteProblem(g.name)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/20 transition-colors" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
