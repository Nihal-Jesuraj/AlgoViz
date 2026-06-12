/**
 * Bellman-Ford Shortest Path Generator
 *
 * Yields step objects tracing the Bellman-Ford algorithm on a weighted
 * directed graph. Detects negative-weight cycles.
 *
 * @param {Object} graph  – weighted adjacency list
 *   { '0': [{node:'1', weight:6}, …], … }
 * @param {string} startNode – source vertex
 */
export function* bellmanFordGenerator(graph, startNode) {
  const nodes = Object.keys(graph);
  const V = nodes.length;
  const INF = 1e8;

  // Build edge list from adjacency list (directed edges only)
  const edges = [];
  for (const u of nodes) {
    for (const entry of graph[u] || []) {
      const v = typeof entry === 'object' ? entry.node : entry;
      const w = typeof entry === 'object' ? entry.weight : 1;
      edges.push({ u, v, w });
    }
  }

  // Distance map
  const dist = {};
  for (const n of nodes) dist[n] = INF;
  dist[startNode] = 0;

  // Java line mapping (0-indexed within the javaCode template literal):
  //  2: int[] dist = new int[V];
  //  3: Arrays.fill(dist, (int) 1e8);
  //  4: dist[src] = 0;
  //  7: for (int i = 0; i < V - 1; i++)
  //  8: for (int[] edge : edges)
  //  9: int u = edge[0], v = edge[1], w = edge[2];
  // 10: if (dist[u] != (int) 1e8 && dist[u] + w < dist[v])
  // 11: dist[v] = dist[u] + w;
  // 15: for (int[] edge : edges)    (negative cycle check)
  // 16: int u = edge[0], v = edge[1], w = edge[2];
  // 17: if (dist[u] != (int) 1e8 && dist[u] + w < dist[v])
  // 18: return new int[]{-1};
  // 20: return dist;

  /* ── Initialisation ── */
  yield {
    type: 'init',
    node: null,
    edge: null,
    line: 3,
    data: { distances: { ...dist }, pass: 0, totalPasses: V - 1, edges: edges.length },
    description: `Initialize all distances to ∞. Will perform ${V - 1} relaxation passes over ${edges.length} edges.`,
  };

  yield {
    type: 'update',
    node: startNode,
    edge: null,
    line: 4,
    data: { distances: { ...dist }, pass: 0, totalPasses: V - 1 },
    description: `Set distance of source node ${startNode} to 0.`,
  };

  /* ── V-1 relaxation passes ── */
  for (let i = 0; i < V - 1; i++) {
    yield {
      type: 'pass-start',
      node: null,
      edge: null,
      line: 7,
      data: { distances: { ...dist }, pass: i + 1, totalPasses: V - 1 },
      description: `Begin relaxation pass ${i + 1} of ${V - 1}.`,
    };

    for (const { u, v, w } of edges) {
      yield {
        type: 'check-edge',
        node: null,
        edge: [u, v],
        line: 9,
        data: { distances: { ...dist }, pass: i + 1, currentEdge: { u, v, w } },
        description: `Examine edge ${u} → ${v} (weight ${w}).`,
      };

      if (dist[u] !== INF && dist[u] + w < dist[v]) {
        const oldDist = dist[v];
        dist[v] = dist[u] + w;

        yield {
          type: 'relax',
          node: v,
          edge: [u, v],
          line: 11,
          data: {
            distances: { ...dist },
            pass: i + 1,
            oldDist: oldDist === INF ? '∞' : oldDist,
            newDist: dist[v],
          },
          description: `Relax: dist[${v}] = dist[${u}] + ${w} = ${dist[v]} (was ${oldDist === INF ? '∞' : oldDist}).`,
        };
      } else {
        yield {
          type: 'no-relax',
          node: v,
          edge: [u, v],
          line: 10,
          data: { distances: { ...dist }, pass: i + 1 },
          description:
            dist[u] === INF
              ? `dist[${u}] = ∞ – cannot relax.`
              : `No relaxation: dist[${u}] + ${w} = ${dist[u] + w} ≥ dist[${v}] = ${dist[v] === INF ? '∞' : dist[v]}.`,
        };
      }
    }
  }

  /* ── Negative-cycle detection (Vth pass) ── */
  let negativeCycle = false;

  yield {
    type: 'cycle-check-start',
    node: null,
    edge: null,
    line: 15,
    data: { distances: { ...dist } },
    description: 'Begin negative-cycle detection (Vth relaxation pass).',
  };

  for (const { u, v, w } of edges) {
    yield {
      type: 'check-edge',
      node: null,
      edge: [u, v],
      line: 16,
      data: { distances: { ...dist }, currentEdge: { u, v, w } },
      description: `Check edge ${u} → ${v} (weight ${w}) for further relaxation.`,
    };

    if (dist[u] !== INF && dist[u] + w < dist[v]) {
      negativeCycle = true;

      yield {
        type: 'negative-cycle',
        node: v,
        edge: [u, v],
        line: 18,
        data: { distances: { ...dist }, negativeCycle: true },
        description: `Negative cycle detected! Edge ${u} → ${v} can still be relaxed.`,
      };
      break;
    }
  }

  /* ── Complete ── */
  if (negativeCycle) {
    yield {
      type: 'complete',
      node: null,
      edge: null,
      line: 18,
      data: { distances: { ...dist }, negativeCycle: true },
      description: 'Bellman-Ford complete. Negative-weight cycle exists – shortest paths undefined.',
    };
  } else {
    const distDisplay = Object.entries(dist)
      .map(([n, d]) => `${n}:${d === INF ? '∞' : d}`)
      .join(', ');

    yield {
      type: 'complete',
      node: null,
      edge: null,
      line: 20,
      data: { distances: { ...dist }, negativeCycle: false },
      description: `Bellman-Ford complete. Distances: {${distDisplay}}.`,
    };
  }
}

export default bellmanFordGenerator;
