/**
 * DSU (Disjoint Set Union) Visualization
 * Shows union-find operations processing edges.
 */
export function* dsuVisualizationGenerator(graph, _startNode) {
  const nodes = Object.keys(graph);
  const parent = {};
  const rank = {};
  for (const n of nodes) { parent[n] = n; rank[n] = 0; }

  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }

  yield { type: 'init', node: null, edge: null, line: 2, data: { parent: { ...parent }, rank: { ...rank } }, description: 'Initialize DSU: each node is its own parent.' };

  // Collect all edges
  const edges = [];
  const seen = new Set();
  for (const u of nodes) {
    for (const raw of (graph[u] || [])) {
      const v = typeof raw === 'object' ? raw.node : raw;
      const key = [u, v].sort().join('-');
      if (!seen.has(key)) { seen.add(key); edges.push([u, v]); }
    }
  }

  let components = nodes.length;

  for (const [u, v] of edges) {
    const pu = find(u);
    const pv = find(v);
    yield { type: 'find-parent', node: u, edge: [u, v], line: 8, data: { parent: { ...parent }, rank: { ...rank }, pu, pv, components }, description: `find(${u})=${pu}, find(${v})=${pv}.` };

    if (pu !== pv) {
      if (rank[pu] < rank[pv]) { parent[pu] = pv; }
      else if (rank[pu] > rank[pv]) { parent[pv] = pu; }
      else { parent[pv] = pu; rank[pu]++; }
      components--;
      yield { type: 'union', node: null, edge: [u, v], line: 12, data: { parent: { ...parent }, rank: { ...rank }, components }, description: `Union ${u}-${v}: merge sets. Components: ${components}.` };
    } else {
      yield { type: 'skip-same-set', node: null, edge: [u, v], line: 15, data: { parent: { ...parent }, rank: { ...rank }, components }, description: `${u} and ${v} already in same set — skip.` };
    }
  }

  yield { type: 'complete', node: null, edge: null, line: 19, data: { parent: { ...parent }, rank: { ...rank }, components }, description: `DSU complete. ${components} connected component(s).` };
}

export function* dsuRedundantConnectionGenerator(graph, _startNode) {
  const nodes = Object.keys(graph);
  const parent = {};
  const rank = {};
  for (const n of nodes) { parent[n] = n; rank[n] = 0; }

  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }

  yield { type: 'init', node: null, edge: null, line: 2, data: { parent: { ...parent } }, description: 'Initialize DSU. Looking for redundant connection.' };

  const edges = [];
  const seen = new Set();
  for (const u of nodes) {
    for (const raw of (graph[u] || [])) {
      const v = typeof raw === 'object' ? raw.node : raw;
      const key = [u, v].sort().join('-');
      if (!seen.has(key)) { seen.add(key); edges.push([u, v]); }
    }
  }

  let redundant = null;
  for (const [u, v] of edges) {
    const pu = find(u); const pv = find(v);
    yield { type: 'find-parent', node: u, edge: [u, v], line: 8, data: { parent: { ...parent }, pu, pv }, description: `find(${u})=${pu}, find(${v})=${pv}.` };

    if (pu === pv) {
      redundant = [u, v];
      yield { type: 'cycle-found', node: null, edge: [u, v], line: 11, data: { parent: { ...parent }, redundant }, description: `Redundant edge found: ${u}-${v} (already connected).` };
      break;
    }
    if (rank[pu] < rank[pv]) parent[pu] = pv;
    else if (rank[pu] > rank[pv]) parent[pv] = pu;
    else { parent[pv] = pu; rank[pu]++; }
    yield { type: 'union', node: null, edge: [u, v], line: 14, data: { parent: { ...parent } }, description: `Union ${u}-${v}.` };
  }

  yield { type: 'complete', node: null, edge: null, line: 18, data: { parent: { ...parent }, redundant }, description: redundant ? `Redundant edge: [${redundant}].` : 'No redundant edge.' };
}
export default dsuVisualizationGenerator;
