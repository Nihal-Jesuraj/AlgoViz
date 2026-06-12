/**
 * DAG Shortest Path — Topological Sort + Relaxation
 */
export function* dagShortestPathGenerator(graph, startNode) {
  const nodes = Object.keys(graph);
  const INF = Infinity;
  const dist = {};
  for (const n of nodes) dist[n] = INF;
  dist[startNode] = 0;

  // Step 1: Topological sort via DFS
  const visited = new Set();
  const stack = [];

  yield { type: 'init', node: null, edge: null, line: 2, data: { distances: { ...dist } }, description: 'Initialize distances to ∞. Will perform topo sort first.' };

  function* topoSort(node) {
    visited.add(node);
    for (const raw of (graph[node] || [])) {
      const v = typeof raw === 'object' ? raw.node : raw;
      if (!visited.has(v)) yield* topoSort(v);
    }
    stack.push(node);
    yield { type: 'topo-push', node, edge: null, line: 6, data: { stack: [...stack] }, description: `Push node ${node} onto topo stack.` };
  }

  for (const n of nodes) {
    if (!visited.has(n)) yield* topoSort(n);
  }

  yield { type: 'topo-complete', node: null, edge: null, line: 8, data: { stack: [...stack] }, description: `Topo order: [${[...stack].reverse().join(', ')}]. Now relax edges.` };

  // Step 2: Process in topo order
  while (stack.length > 0) {
    const u = stack.pop();
    yield { type: 'visit', node: u, edge: null, line: 11, data: { distances: { ...dist } }, description: `Process node ${u} (dist=${dist[u] === INF ? '∞' : dist[u]}).` };

    if (dist[u] === INF) continue;

    for (const raw of (graph[u] || [])) {
      const v = typeof raw === 'object' ? raw.node : raw;
      const w = typeof raw === 'object' ? raw.weight : 1;

      if (dist[u] + w < dist[v]) {
        yield { type: 'relax', node: v, edge: [u, v], line: 15, data: { distances: { ...dist }, oldDist: dist[v], newDist: dist[u] + w }, description: `Relax: dist[${v}] = ${dist[u]} + ${w} = ${dist[u] + w}.` };
        dist[v] = dist[u] + w;
        yield { type: 'update', node: v, edge: [u, v], line: 16, data: { distances: { ...dist } }, description: `Updated dist[${v}] = ${dist[v]}.` };
      }
    }
  }

  yield { type: 'complete', node: null, edge: null, line: 20, data: { distances: { ...dist } }, description: `DAG Shortest Paths from ${startNode}: ${Object.entries(dist).map(([n, d]) => `${n}:${d === INF ? '∞' : d}`).join(', ')}` };
}
export default dagShortestPathGenerator;
