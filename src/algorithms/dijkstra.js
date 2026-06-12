/**
 * Dijkstra's Shortest Path Generator
 *
 * Yields step objects tracing Dijkstra's algorithm on a weighted graph.
 *
 * @param {Object} graph  – weighted adjacency list
 *   { '0': [{node:'1', weight:4}, …], … }
 * @param {string} startNode – source vertex
 */
export function* dijkstraGenerator(graph, startNode) {
  const nodes = Object.keys(graph);
  const INF = Infinity;

  // Distance map
  const dist = {};
  for (const n of nodes) dist[n] = INF;
  dist[startNode] = 0;

  // Simple priority-queue using an array (min-heap semantics)
  // Each entry: { node, distance }
  let pq = [{ node: startNode, distance: 0 }];
  const visited = new Set();

  // Java line mapping (0-indexed within the javaCode template literal):
  //  2: int[] dist = new int[V];
  //  3: Arrays.fill(dist, Integer.MAX_VALUE);
  //  4: dist[src] = 0;
  //  8: pq.add(new int[]{0, src});
  // 10: while (!pq.isEmpty())
  // 11: int[] top = pq.poll();
  // 14: if (d > dist[u]) continue;
  // 16: for (int[] edge : adj.get(u))
  // 18: if (dist[u] + w < dist[v])        // relaxation check
  // 19: dist[v] = dist[u] + w;            // update distance
  // 20: pq.add(new int[]{dist[v], v});     // add to PQ
  // 24: return dist;

  /* ── Initialisation ── */
  yield {
    type: 'init',
    node: null,
    edge: null,
    line: 3,
    data: { distances: { ...dist }, pq: pq.map((e) => ({ ...e })), visited: [] },
    description: 'Initialize all distances to ∞.',
  };

  yield {
    type: 'update',
    node: startNode,
    edge: null,
    line: 4,
    data: { distances: { ...dist }, pq: pq.map((e) => ({ ...e })), visited: [] },
    description: `Set distance of source node ${startNode} to 0 and add to PQ.`,
  };

  /* ── Main loop ── */
  while (pq.length > 0) {
    yield {
      type: 'check-loop',
      node: null,
      edge: null,
      line: 10,
      data: { distances: { ...dist }, pq: pq.map((e) => ({ ...e })), visited: [...visited] },
      description: 'Check if priority queue is not empty.',
    };

    // Extract min
    pq.sort((a, b) => a.distance - b.distance);
    const { node: u, distance: d } = pq.shift();

    yield {
      type: 'extract-min',
      node: u,
      edge: null,
      line: 11,
      data: { distances: { ...dist }, pq: pq.map((e) => ({ ...e })), visited: [...visited] },
      description: `Extract min from PQ: node ${u} with distance ${d}.`,
    };

    // Skip stale entry
    if (d > dist[u]) {
      yield {
        type: 'skip',
        node: u,
        edge: null,
        line: 14,
        data: { distances: { ...dist }, pq: pq.map((e) => ({ ...e })), visited: [...visited] },
        description: `Stale entry for node ${u} (d=${d} > dist=${dist[u]}) – skip.`,
      };
      continue;
    }

    visited.add(u);

    yield {
      type: 'visit',
      node: u,
      edge: null,
      line: 14,
      data: { distances: { ...dist }, pq: pq.map((e) => ({ ...e })), visited: [...visited] },
      description: `Process node ${u} with shortest distance ${dist[u]}.`,
    };

    const neighbors = graph[u] || [];

    for (const edge of neighbors) {
      const v = typeof edge === 'object' ? edge.node : edge;
      const w = typeof edge === 'object' ? edge.weight : 1;

      yield {
        type: 'check-neighbor',
        node: v,
        edge: [u, v],
        line: 16,
        data: { distances: { ...dist }, pq: pq.map((e) => ({ ...e })), visited: [...visited] },
        description: `Examine edge ${u} → ${v} with weight ${w}.`,
      };

      if (dist[u] + w < dist[v]) {
        yield {
          type: 'relax',
          node: v,
          edge: [u, v],
          line: 18,
          data: {
            distances: { ...dist },
            pq: pq.map((e) => ({ ...e })),
            visited: [...visited],
            oldDist: dist[v],
            newDist: dist[u] + w,
          },
          description: `Relaxation: dist[${v}] = ${dist[u]} + ${w} = ${dist[u] + w} (was ${dist[v] === INF ? '∞' : dist[v]}).`,
        };

        dist[v] = dist[u] + w;
        pq.push({ node: v, distance: dist[v] });

        yield {
          type: 'update',
          node: v,
          edge: [u, v],
          line: 19,
          data: { distances: { ...dist }, pq: pq.map((e) => ({ ...e })), visited: [...visited] },
          description: `Update dist[${v}] = ${dist[v]} and add to PQ.`,
        };
      } else {
        yield {
          type: 'no-relax',
          node: v,
          edge: [u, v],
          line: 18,
          data: { distances: { ...dist }, pq: pq.map((e) => ({ ...e })), visited: [...visited] },
          description: `No relaxation: dist[${u}] + ${w} = ${dist[u] + w} ≥ dist[${v}] = ${dist[v] === INF ? '∞' : dist[v]}.`,
        };
      }
    }
  }

  /* ── Complete ── */
  const distDisplay = Object.entries(dist)
    .map(([n, d]) => `${n}:${d === INF ? '∞' : d}`)
    .join(', ');

  yield {
    type: 'complete',
    node: null,
    edge: null,
    line: 24,
    data: { distances: { ...dist }, pq: [], visited: [...visited] },
    description: `Dijkstra complete. Distances: {${distDisplay}}.`,
  };
}

export default dijkstraGenerator;
