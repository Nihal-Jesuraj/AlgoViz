/**
 * Kruskal's MST Generator
 *
 * Yields step objects tracing Kruskal's algorithm with Union-Find (DSU)
 * on a weighted undirected graph.
 *
 * @param {Object} graph  – weighted adjacency list
 *   { '0': [{node:'1', weight:2}, …], … }
 * @param {string} _startNode – unused (Kruskal operates on all edges)
 */
export function* kruskalsGenerator(graph, _startNode) {
  const nodes = Object.keys(graph);
  const V = nodes.length;

  // ── DSU (Disjoint Set Union) ──
  const parent = {};
  const rank = {};
  for (const n of nodes) {
    parent[n] = n;
    rank[n] = 0;
  }

  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x]); // path compression
    return parent[x];
  }

  function union(x, y) {
    const px = find(x);
    const py = find(y);
    if (px === py) return false;
    if (rank[px] < rank[py]) parent[px] = py;
    else if (rank[px] > rank[py]) parent[py] = px;
    else {
      parent[py] = px;
      rank[px]++;
    }
    return true;
  }

  // ── Collect edges (avoid duplicates for undirected graph) ──
  const edgeSet = new Set();
  const edges = [];
  for (const u of nodes) {
    for (const entry of graph[u] || []) {
      const v = typeof entry === 'object' ? entry.node : entry;
      const w = typeof entry === 'object' ? entry.weight : 1;
      const key = u < v ? `${u}-${v}` : `${v}-${u}`;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push({ u, v, w });
      }
    }
  }

  // Java line mapping (0-indexed within the javaCode template literal):
  // 17: List<int[]> edges = new ArrayList<>();
  // 20: if (u < e[0]) edges.add(...)
  // 22: edges.sort(...)
  // 24: parent = new int[V];
  // 26: for (int i = 0; i < V; i++) parent[i] = i;
  // 29: for (int[] edge : edges)
  // 30: int w = edge[0], u = edge[1], v = edge[2];
  // 31: if (find(u) != find(v))     // no cycle?
  // 32: union(u, v);                // union sets
  // 33: mstWeight += w;             // add weight
  // 37: return mstWeight;

  /* ── Initialisation ── */
  yield {
    type: 'init',
    node: null,
    edge: null,
    line: 26,
    data: {
      parent: { ...parent },
      mstEdges: [],
      mstWeight: 0,
      sortedEdges: edges.map((e) => ({ ...e })),
    },
    description: `Initialize DSU. Collected ${edges.length} edges.`,
  };

  // Sort edges by weight
  edges.sort((a, b) => a.w - b.w);

  yield {
    type: 'sort-edges',
    node: null,
    edge: null,
    line: 22,
    data: {
      parent: { ...parent },
      mstEdges: [],
      mstWeight: 0,
      sortedEdges: edges.map((e) => ({ ...e })),
    },
    description: `Sorted all edges by weight: [${edges.map((e) => `(${e.u}-${e.v}:${e.w})`).join(', ')}].`,
  };

  /* ── Process edges ── */
  const mstEdges = [];
  let mstWeight = 0;

  for (let i = 0; i < edges.length; i++) {
    const { u, v, w } = edges[i];

    yield {
      type: 'check-edge',
      node: null,
      edge: [u, v],
      line: 30,
      data: {
        parent: { ...parent },
        mstEdges: mstEdges.map((e) => ({ ...e })),
        mstWeight,
        edgeIndex: i,
      },
      description: `Consider edge ${u} – ${v} (weight ${w}).`,
    };

    const pu = find(u);
    const pv = find(v);

    if (pu !== pv) {
      yield {
        type: 'no-cycle',
        node: null,
        edge: [u, v],
        line: 31,
        data: {
          parent: { ...parent },
          mstEdges: mstEdges.map((e) => ({ ...e })),
          mstWeight,
          parentU: pu,
          parentV: pv,
        },
        description: `find(${u})=${pu}, find(${v})=${pv} – different sets, no cycle.`,
      };

      union(u, v);

      yield {
        type: 'union',
        node: null,
        edge: [u, v],
        line: 32,
        data: { parent: { ...parent }, mstEdges: mstEdges.map((e) => ({ ...e })), mstWeight },
        description: `Union sets of ${u} and ${v}.`,
      };

      mstWeight += w;
      mstEdges.push({ u, v, w });

      yield {
        type: 'add-to-mst',
        node: null,
        edge: [u, v],
        line: 33,
        data: {
          parent: { ...parent },
          mstEdges: mstEdges.map((e) => ({ ...e })),
          mstWeight,
        },
        description: `Add edge ${u} – ${v} (weight ${w}) to MST. Total weight: ${mstWeight}.`,
      };

      if (mstEdges.length === V - 1) break;
    } else {
      yield {
        type: 'cycle',
        node: null,
        edge: [u, v],
        line: 31,
        data: {
          parent: { ...parent },
          mstEdges: mstEdges.map((e) => ({ ...e })),
          mstWeight,
          parentU: pu,
          parentV: pv,
        },
        description: `find(${u})=${pu} = find(${v})=${pv} – same set, adding would create cycle. Skip.`,
      };
    }
  }

  /* ── Complete ── */
  yield {
    type: 'complete',
    node: null,
    edge: null,
    line: 37,
    data: {
      parent: { ...parent },
      mstEdges: mstEdges.map((e) => ({ ...e })),
      mstWeight,
    },
    description: `Kruskal's complete. MST weight: ${mstWeight}. Edges: [${mstEdges.map((e) => `${e.u}-${e.v}`).join(', ')}].`,
  };
}

export default kruskalsGenerator;
