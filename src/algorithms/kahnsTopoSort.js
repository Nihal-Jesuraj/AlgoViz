/**
 * Kahn's Topological Sort — BFS-based using in-degree
 */
export function* kahnsTopoSortGenerator(graph, _startNode) {
  const nodes = Object.keys(graph);
  const inDegree = {};
  for (const n of nodes) inDegree[n] = 0;
  for (const u of nodes) {
    for (const raw of (graph[u] || [])) {
      const v = typeof raw === 'object' ? raw.node : raw;
      inDegree[v] = (inDegree[v] || 0) + 1;
    }
  }

  const queue = [];
  const topoOrder = [];

  yield { type: 'init', node: null, edge: null, line: 3, data: { inDegree: { ...inDegree }, topoOrder: [] }, description: 'Compute in-degrees for all nodes.' };

  for (const n of nodes) {
    if (inDegree[n] === 0) {
      queue.push(n);
      yield { type: 'enqueue', node: n, edge: null, line: 6, data: { inDegree: { ...inDegree }, topoOrder: [...topoOrder], queue: [...queue] }, description: `Node ${n} has in-degree 0 — add to queue.` };
    }
  }

  while (queue.length > 0) {
    const u = queue.shift();
    topoOrder.push(u);
    yield { type: 'visit', node: u, edge: null, line: 9, data: { inDegree: { ...inDegree }, topoOrder: [...topoOrder], queue: [...queue] }, description: `Dequeue ${u}, add to topological order (position ${topoOrder.length}).` };

    for (const raw of (graph[u] || [])) {
      const v = typeof raw === 'object' ? raw.node : raw;
      inDegree[v]--;
      yield { type: 'decrement-indegree', node: v, edge: [u, v], line: 12, data: { inDegree: { ...inDegree }, topoOrder: [...topoOrder] }, description: `Decrement in-degree of ${v} to ${inDegree[v]}.` };

      if (inDegree[v] === 0) {
        queue.push(v);
        yield { type: 'enqueue', node: v, edge: [u, v], line: 14, data: { inDegree: { ...inDegree }, topoOrder: [...topoOrder], queue: [...queue] }, description: `Node ${v} now has in-degree 0 — enqueue.` };
      }
    }
  }

  const hasCycle = topoOrder.length !== nodes.length;
  yield { type: 'complete', node: null, edge: null, line: 18, data: { inDegree: { ...inDegree }, topoOrder: [...topoOrder], hasCycle }, description: hasCycle ? 'Cycle detected! Topological sort not possible.' : `Topological order: [${topoOrder.join(', ')}].` };
}
export default kahnsTopoSortGenerator;
