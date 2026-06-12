/**
 * BFS Traversal Generator
 *
 * Yields step objects that trace a Breadth-First Search through an
 * unweighted adjacency-list graph.
 *
 * @param {Object} graph  – adjacency list, e.g. { '0': ['1','2'], … }
 * @param {string} startNode – node to begin BFS from
 */
export function* bfsGenerator(graph, startNode) {
  const visited = new Set();
  const queue = [];
  const result = [];

  // Java line mapping (0-indexed within the javaCode template literal):
  //  6: boolean[] visited = new boolean[V];
  //  7: Queue<Integer> queue = new LinkedList<>();
  //  9: visited[0] = true;
  // 10: queue.add(0);
  // 12: while (!queue.isEmpty())
  // 13: int node = queue.poll();
  // 14: bfs.add(node);
  // 16: for (int neighbor : adj.get(node))
  // 17: if (!visited[neighbor])
  // 18: visited[neighbor] = true;
  // 19: queue.add(neighbor);
  // 23: return bfs;

  /* ── Initialisation ── */
  yield {
    type: 'init',
    node: null,
    edge: null,
    line: 6,
    data: { queue: [], visited: [], result: [] },
    description: 'Initialize visited array and queue.',
  };

  /* Mark source visited & enqueue */
  visited.add(startNode);
  queue.push(startNode);

  yield {
    type: 'enqueue',
    node: startNode,
    edge: null,
    line: 9,
    data: { queue: [...queue], visited: [...visited], result: [...result] },
    description: `Mark node ${startNode} as visited and enqueue it.`,
  };

  /* ── Main BFS loop ── */
  while (queue.length > 0) {
    yield {
      type: 'check-loop',
      node: null,
      edge: null,
      line: 12,
      data: { queue: [...queue], visited: [...visited], result: [...result] },
      description: 'Check if queue is not empty.',
    };

    const node = queue.shift();

    yield {
      type: 'dequeue',
      node,
      edge: null,
      line: 13,
      data: { queue: [...queue], visited: [...visited], result: [...result] },
      description: `Dequeue node ${node} from the front of the queue.`,
    };

    result.push(node);

    yield {
      type: 'visit',
      node,
      edge: null,
      line: 14,
      data: { queue: [...queue], visited: [...visited], result: [...result] },
      description: `Visit node ${node} – add to BFS result.`,
    };

    const neighbors = graph[node] || [];

    for (const neighbor of neighbors) {
      yield {
        type: 'check-neighbor',
        node: neighbor,
        edge: [node, neighbor],
        line: 16,
        data: { queue: [...queue], visited: [...visited], result: [...result] },
        description: `Examine neighbor ${neighbor} of node ${node}.`,
      };

      if (!visited.has(neighbor)) {
        visited.add(neighbor);

        yield {
          type: 'mark-visited',
          node: neighbor,
          edge: [node, neighbor],
          line: 18,
          data: { queue: [...queue], visited: [...visited], result: [...result] },
          description: `Neighbor ${neighbor} not visited – mark it visited.`,
        };

        queue.push(neighbor);

        yield {
          type: 'enqueue',
          node: neighbor,
          edge: [node, neighbor],
          line: 19,
          data: { queue: [...queue], visited: [...visited], result: [...result] },
          description: `Enqueue neighbor ${neighbor}.`,
        };
      } else {
        yield {
          type: 'skip',
          node: neighbor,
          edge: [node, neighbor],
          line: 17,
          data: { queue: [...queue], visited: [...visited], result: [...result] },
          description: `Neighbor ${neighbor} already visited – skip.`,
        };
      }
    }
  }

  /* ── Complete ── */
  yield {
    type: 'complete',
    node: null,
    edge: null,
    line: 23,
    data: { queue: [], visited: [...visited], result: [...result] },
    description: `BFS complete. Traversal order: [${result.join(', ')}].`,
  };
}

export default bfsGenerator;
