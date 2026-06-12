/**
 * BFS Shortest Path — Unit weight graphs
 */
export function* bfsShortestPathGenerator(graph, startNode) {
  const nodes = Object.keys(graph);
  const INF = Infinity;
  const dist = {};
  for (const n of nodes) dist[n] = INF;
  dist[startNode] = 0;
  const queue = [startNode];
  const visited = new Set([startNode]);

  yield { type: 'init', node: startNode, edge: null, line: 3, data: { distances: { ...dist } }, description: `Set dist[${startNode}] = 0. All others = ∞.` };

  while (queue.length > 0) {
    const u = queue.shift();
    yield { type: 'visit', node: u, edge: null, line: 7, data: { distances: { ...dist }, visited: [...visited] }, description: `Dequeue node ${u} (dist=${dist[u]}).` };

    for (const raw of (graph[u] || [])) {
      const v = typeof raw === 'object' ? raw.node : raw;
      yield { type: 'check-neighbor', node: v, edge: [u, v], line: 9, data: { distances: { ...dist } }, description: `Check neighbor ${v}.` };

      if (dist[u] + 1 < dist[v]) {
        dist[v] = dist[u] + 1;
        visited.add(v);
        queue.push(v);
        yield { type: 'update', node: v, edge: [u, v], line: 11, data: { distances: { ...dist }, visited: [...visited] }, description: `dist[${v}] = ${dist[v]}. Enqueue.` };
      }
    }
  }

  yield { type: 'complete', node: null, edge: null, line: 16, data: { distances: { ...dist } }, description: `BFS complete. ${Object.entries(dist).map(([n, d]) => `${n}:${d === INF ? '∞' : d}`).join(', ')}` };
}
export default bfsShortestPathGenerator;
