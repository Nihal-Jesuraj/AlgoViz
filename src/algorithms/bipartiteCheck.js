/**
 * Bipartite Check — BFS 2-coloring
 * @param {Object} graph - adjacency list
 * @param {string} startNode - starting node
 */
export function* bipartiteCheckBFS(graph, startNode) {
  const nodes = Object.keys(graph);
  const color = {};
  for (const n of nodes) color[n] = -1;
  let isBipartite = true;
  let conflictEdge = null;

  yield { type: 'init', node: null, edge: null, line: 2, data: { colors: { ...color } }, description: 'Initialize all nodes as uncolored (-1).' };

  for (const src of nodes) {
    if (color[src] !== -1) continue;
    color[src] = 0;
    const queue = [src];

    yield { type: 'color-node', node: src, edge: null, line: 4, data: { colors: { ...color } }, description: `Color node ${src} with color 0.` };

    while (queue.length > 0) {
      const u = queue.shift();
      yield { type: 'dequeue', node: u, edge: null, line: 7, data: { colors: { ...color } }, description: `Dequeue node ${u} (color ${color[u]}).` };

      const neighbors = graph[u] || [];
      for (const raw of neighbors) {
        const v = typeof raw === 'object' ? raw.node : raw;
        yield { type: 'check-neighbor', node: v, edge: [u, v], line: 9, data: { colors: { ...color } }, description: `Check neighbor ${v} of ${u}.` };

        if (color[v] === -1) {
          color[v] = 1 - color[u];
          queue.push(v);
          yield { type: 'color-node', node: v, edge: [u, v], line: 10, data: { colors: { ...color } }, description: `Color node ${v} with color ${color[v]}.` };
        } else if (color[v] === color[u]) {
          isBipartite = false;
          conflictEdge = [u, v];
          yield { type: 'conflict', node: v, edge: [u, v], line: 12, data: { colors: { ...color }, isBipartite: false }, description: `Conflict! Nodes ${u} and ${v} have same color ${color[u]}.` };
          break;
        }
      }
      if (!isBipartite) break;
    }
    if (!isBipartite) break;
  }

  yield { type: 'complete', node: null, edge: null, line: 16, data: { colors: { ...color }, isBipartite, conflictEdge }, description: isBipartite ? 'Graph IS bipartite.' : `Graph is NOT bipartite. Conflict: ${conflictEdge}.` };
}
export default bipartiteCheckBFS;
