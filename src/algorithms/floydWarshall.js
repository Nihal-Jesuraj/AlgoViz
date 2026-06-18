/**
 * Floyd-Warshall — All-pairs shortest path
 */
export function* floydWarshallGenerator(graph, _startNode) {
  const nodes = Object.keys(graph);
  const INF = Infinity;

  // Build distance matrix
  const dist = {};
  for (const i of nodes) {
    dist[i] = {};
    for (const j of nodes) dist[i][j] = i === j ? 0 : INF;
  }
  for (const u of nodes) {
    for (const raw of (graph[u] || [])) {
      const v = typeof raw === 'object' ? raw.node : raw;
      const w = typeof raw === 'object' ? raw.weight : 1;
      dist[u][v] = w;
    }
  }

  const copyDist = () => {
    const c = {};
    for (const i of nodes) { c[i] = { ...dist[i] }; }
    return c;
  };

  yield { type: 'init', node: null, edge: null, line: 3, data: { dist: copyDist() }, description: 'Initialize distance matrix from edge weights.' };

  for (const k of nodes) {
    yield { type: 'pick-intermediate', node: k, edge: null, line: 7, data: { dist: copyDist(), k }, description: `Use node ${k} as intermediate vertex.` };

    for (const i of nodes) {
      for (const j of nodes) {
        if (dist[i][k] !== INF && dist[k][j] !== INF && dist[i][k] + dist[k][j] < dist[i][j]) {
          const oldVal = dist[i][j];
          dist[i][j] = dist[i][k] + dist[k][j];
          yield { type: 'relax', node: null, edge: [i, j], line: 11, data: { dist: copyDist(), i, j, k, oldVal, newVal: dist[i][j] }, description: `dist[${i}][${j}] = ${dist[i][k]} + ${dist[k][j]} = ${dist[i][j]} (was ${oldVal === INF ? '∞' : oldVal}).` };
        }
      }
    }
  }

  yield { type: 'complete', node: null, edge: null, line: 16, data: { dist: copyDist() }, description: 'Floyd-Warshall complete. All-pairs shortest paths computed.' };
}
export default floydWarshallGenerator;
