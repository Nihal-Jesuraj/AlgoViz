/**
 * Euler Path/Circuit — Hierholzer's Algorithm
 */
export function* eulerPathGenerator(graph, _startNode) {
  const nodes = Object.keys(graph);

  // Build adj list with edge usage tracking
  const adj = {};
  const degree = {};
  for (const n of nodes) { adj[n] = []; degree[n] = 0; }
  const edgeUsed = new Set();

  for (const u of nodes) {
    for (const raw of (graph[u] || [])) {
      const v = typeof raw === 'object' ? raw.node : raw;
      const key = [u, v].sort().join('-');
      if (!edgeUsed.has(key)) {
        adj[u].push(v);
        adj[v].push(u);
        degree[u]++;
        degree[v]++;
        edgeUsed.add(key);
      }
    }
  }

  // Find start node: odd-degree node or first node
  const oddNodes = nodes.filter(n => degree[n] % 2 !== 0);
  let start = oddNodes.length > 0 ? oddNodes[0] : nodes[0];
  const isCircuit = oddNodes.length === 0;

  yield { type: 'init', node: start, edge: null, line: 2, data: { degree: { ...degree }, oddNodes, isCircuit }, description: `${isCircuit ? 'Euler Circuit' : 'Euler Path'} exists. Start from node ${start}. Odd-degree nodes: [${oddNodes.join(',')}].` };

  if (oddNodes.length !== 0 && oddNodes.length !== 2) {
    yield { type: 'complete', node: null, edge: null, line: 5, data: { path: [] }, description: `No Euler path/circuit exists (${oddNodes.length} odd-degree nodes).` };
    return;
  }

  // Hierholzer's
  const usedEdges = new Set();
  const localAdj = {};
  for (const n of nodes) localAdj[n] = [...(adj[n] || [])];

  const tempStack = [start];
  const path = [];

  while (tempStack.length > 0) {
    const u = tempStack[tempStack.length - 1];

    if (localAdj[u] && localAdj[u].length > 0) {
      const v = localAdj[u].pop();
      const ek = [u, v].sort().join('-');
      if (usedEdges.has(ek)) continue;
      usedEdges.add(ek);
      // Also remove from v's list implicitly
      const idx = localAdj[v]?.indexOf(u);
      if (idx > -1) localAdj[v].splice(idx, 1);

      tempStack.push(v);
      yield { type: 'visit-edge', node: v, edge: [u, v], line: 14, data: { stack: [...tempStack], path: [...path] }, description: `Traverse edge ${u}—${v}. Push ${v} to stack.` };
    } else {
      tempStack.pop();
      path.push(u);
      yield { type: 'add-to-path', node: u, edge: null, line: 18, data: { stack: [...tempStack], path: [...path] }, description: `Backtrack: add ${u} to path.` };
    }
  }

  path.reverse();
  yield { type: 'complete', node: null, edge: null, line: 22, data: { path: [...path] }, description: `Euler ${isCircuit ? 'Circuit' : 'Path'}: [${path.join(' → ')}].` };
}
export default eulerPathGenerator;
