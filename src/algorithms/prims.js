/**
 * Prim's MST Generator
 *
 * Yields step objects tracing Prim's algorithm with a simulated priority
 * queue on a weighted undirected graph.
 *
 * @param {Object} graph  – weighted adjacency list
 *   { '0': [{node:'1', weight:2}, …], … }
 * @param {string} startNode – node to begin from (default '0')
 */
export function* primsGenerator(graph, startNode) {
  const nodes = Object.keys(graph);
  const V = nodes.length;

  const inMST = new Set();
  let pq = []; // Each entry: { weight, node, parent }
  const mstEdges = [];
  let mstWeight = 0;

  // Java line mapping (0-indexed within the javaCode template literal):
  //  3: boolean[] inMST = new boolean[V];
  //  5: PriorityQueue<int[]> pq = ...
  //  6: pq.add(new int[]{0, 0, -1});
  //  9: List<int[]> mstEdges = new ArrayList<>();
  // 11: while (!pq.isEmpty())
  // 12: int[] top = pq.poll();
  // 15: if (inMST[u]) continue;
  // 16: inMST[u] = true;
  // 19: mstEdges.add(...)
  // 22: for (int[] edge : adj.get(u))
  // 24: if (!inMST[v])
  // 25: pq.add(new int[]{edgeW, v, u});
  // 29: return mstWeight;

  /* ── Initialisation ── */
  yield {
    type: 'init',
    node: null,
    edge: null,
    line: 3,
    data: {
      inMST: [],
      mstEdges: [],
      mstWeight: 0,
      pq: [],
    },
    description: 'Initialize inMST array and priority queue.',
  };

  pq.push({ weight: 0, node: startNode, parent: null });

  yield {
    type: 'enqueue',
    node: startNode,
    edge: null,
    line: 6,
    data: {
      inMST: [...inMST],
      mstEdges: [...mstEdges],
      mstWeight,
      pq: pq.map((e) => ({ ...e })),
    },
    description: `Add source node ${startNode} to PQ with weight 0.`,
  };

  /* ── Main loop ── */
  while (pq.length > 0) {
    yield {
      type: 'check-loop',
      node: null,
      edge: null,
      line: 11,
      data: {
        inMST: [...inMST],
        mstEdges: mstEdges.map((e) => ({ ...e })),
        mstWeight,
        pq: pq.map((e) => ({ ...e })),
      },
      description: 'Check if priority queue is not empty.',
    };

    // Extract min
    pq.sort((a, b) => a.weight - b.weight);
    const { weight: w, node: u, parent: par } = pq.shift();

    yield {
      type: 'extract-min',
      node: u,
      edge: par ? [par, u] : null,
      line: 12,
      data: {
        inMST: [...inMST],
        mstEdges: mstEdges.map((e) => ({ ...e })),
        mstWeight,
        pq: pq.map((e) => ({ ...e })),
      },
      description: `Extract min from PQ: node ${u} (weight ${w}${par !== null ? `, parent ${par}` : ''}).`,
    };

    // Skip if already in MST
    if (inMST.has(u)) {
      yield {
        type: 'skip',
        node: u,
        edge: null,
        line: 15,
        data: {
          inMST: [...inMST],
          mstEdges: mstEdges.map((e) => ({ ...e })),
          mstWeight,
          pq: pq.map((e) => ({ ...e })),
        },
        description: `Node ${u} already in MST – skip.`,
      };
      continue;
    }

    // Add to MST
    inMST.add(u);
    mstWeight += w;

    yield {
      type: 'add-to-mst',
      node: u,
      edge: par ? [par, u] : null,
      line: 16,
      data: {
        inMST: [...inMST],
        mstEdges: mstEdges.map((e) => ({ ...e })),
        mstWeight,
        pq: pq.map((e) => ({ ...e })),
      },
      description: `Add node ${u} to MST. MST weight so far: ${mstWeight}.`,
    };

    if (par !== null) {
      mstEdges.push({ u: par, v: u, w });

      yield {
        type: 'record-edge',
        node: null,
        edge: [par, u],
        line: 19,
        data: {
          inMST: [...inMST],
          mstEdges: mstEdges.map((e) => ({ ...e })),
          mstWeight,
          pq: pq.map((e) => ({ ...e })),
        },
        description: `Record MST edge ${par} – ${u} (weight ${w}).`,
      };
    }

    // Explore neighbours
    const neighbors = graph[u] || [];

    for (const entry of neighbors) {
      const v = typeof entry === 'object' ? entry.node : entry;
      const edgeW = typeof entry === 'object' ? entry.weight : 1;

      yield {
        type: 'check-neighbor',
        node: v,
        edge: [u, v],
        line: 22,
        data: {
          inMST: [...inMST],
          mstEdges: mstEdges.map((e) => ({ ...e })),
          mstWeight,
          pq: pq.map((e) => ({ ...e })),
        },
        description: `Examine neighbor ${v} of node ${u} (edge weight ${edgeW}).`,
      };

      if (!inMST.has(v)) {
        pq.push({ weight: edgeW, node: v, parent: u });

        yield {
          type: 'enqueue',
          node: v,
          edge: [u, v],
          line: 25,
          data: {
            inMST: [...inMST],
            mstEdges: mstEdges.map((e) => ({ ...e })),
            mstWeight,
            pq: pq.map((e) => ({ ...e })),
          },
          description: `Add edge to ${v} (weight ${edgeW}) to PQ.`,
        };
      } else {
        yield {
          type: 'skip',
          node: v,
          edge: [u, v],
          line: 24,
          data: {
            inMST: [...inMST],
            mstEdges: mstEdges.map((e) => ({ ...e })),
            mstWeight,
            pq: pq.map((e) => ({ ...e })),
          },
          description: `Node ${v} already in MST – skip.`,
        };
      }
    }
  }

  /* ── Complete ── */
  yield {
    type: 'complete',
    node: null,
    edge: null,
    line: 29,
    data: {
      inMST: [...inMST],
      mstEdges: mstEdges.map((e) => ({ ...e })),
      mstWeight,
      pq: [],
    },
    description: `Prim's complete. MST weight: ${mstWeight}. Edges: [${mstEdges.map((e) => `${e.u}-${e.v}`).join(', ')}].`,
  };
}

export default primsGenerator;
