/**
 * Kosaraju's Strongly Connected Components — Two DFS passes
 */
export function* kosarajuSCCGenerator(graph, _startNode) {
  const nodes = Object.keys(graph);
  const visited = new Set();
  const stack = [];

  yield { type: 'init', node: null, edge: null, line: 2, data: { phase: 'DFS-1' }, description: 'Phase 1: DFS on original graph to fill finish stack.' };

  // Phase 1: DFS to fill stack
  function* dfs1(node) {
    visited.add(node);
    yield { type: 'dfs1-visit', node, edge: null, line: 5, data: { visited: [...visited], stack: [...stack] }, description: `[Phase 1] Visit node ${node}.` };
    for (const raw of (graph[node] || [])) {
      const v = typeof raw === 'object' ? raw.node : raw;
      if (!visited.has(v)) yield* dfs1(v);
    }
    stack.push(node);
    yield { type: 'dfs1-push-stack', node, edge: null, line: 9, data: { visited: [...visited], stack: [...stack] }, description: `[Phase 1] Push ${node} to stack.` };
  }

  for (const n of nodes) { if (!visited.has(n)) yield* dfs1(n); }

  // Phase 2: Build transpose
  const transpose = {};
  for (const n of nodes) transpose[n] = [];
  for (const u of nodes) {
    for (const raw of (graph[u] || [])) {
      const v = typeof raw === 'object' ? raw.node : raw;
      transpose[v].push(u);
    }
  }

  yield { type: 'transpose', node: null, edge: null, line: 13, data: { stack: [...stack], phase: 'Transpose' }, description: 'Graph transposed. Phase 2: DFS on transposed graph.' };

  // Phase 3: DFS on transpose in stack order
  visited.clear();
  const sccs = [];
  let currentSCC = [];

  function* dfs2(node) {
    visited.add(node);
    currentSCC.push(node);
    yield { type: 'dfs2-visit', node, edge: null, line: 17, data: { visited: [...visited], sccs: sccs.map(s => [...s]), currentSCC: [...currentSCC] }, description: `[Phase 2] Visit ${node}, add to current SCC.` };
    for (const v of (transpose[node] || [])) {
      if (!visited.has(v)) yield* dfs2(v);
    }
  }

  while (stack.length > 0) {
    const node = stack.pop();
    if (!visited.has(node)) {
      currentSCC = [];
      yield* dfs2(node);
      sccs.push([...currentSCC]);
      yield { type: 'mark-scc', node: null, edge: null, line: 22, data: { sccs: sccs.map(s => [...s]) }, description: `SCC found: {${currentSCC.join(', ')}}.` };
    }
  }

  yield { type: 'complete', node: null, edge: null, line: 25, data: { sccs: sccs.map(s => [...s]) }, description: `Kosaraju complete. ${sccs.length} SCC(s): ${sccs.map(s => `{${s.join(',')}}`).join(' ')}` };
}
export default kosarajuSCCGenerator;
