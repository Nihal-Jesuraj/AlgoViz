/**
 * DFS Traversal Generator (Iterative with Stack)
 *
 * Yields step objects that trace a Depth-First Search through an
 * unweighted adjacency-list graph.
 *
 * @param {Object} graph  – adjacency list, e.g. { '0': ['1','2'], … }
 * @param {string} startNode – node to begin DFS from
 */
export function* dfsGenerator(graph, startNode) {
  const visited = new Set();
  const stack = [];
  const result = [];

  // Java line mapping (0-indexed within the javaCode template literal):
  //  5: ArrayList<Integer> dfs = new ArrayList<>();
  //  6: boolean[] visited = new boolean[V];
  //  7: Stack<Integer> stack = new Stack<>();
  //  9: stack.push(0);
  // 11: while (!stack.isEmpty())
  // 12: int node = stack.pop();
  // 13: if (visited[node]) continue;
  // 15: visited[node] = true;
  // 16: dfs.add(node);
  // 20: for (int i = neighbors.size() - 1; i >= 0; i--)
  // 21: if (!visited[neighbors.get(i)])
  // 22: stack.push(neighbors.get(i));
  // 26: return dfs;

  /* ── Initialisation ── */
  yield {
    type: 'init',
    node: null,
    edge: null,
    line: 6,
    data: { stack: [], visited: [], result: [] },
    description: 'Initialize visited array and stack.',
  };

  /* Push source */
  stack.push(startNode);

  yield {
    type: 'push',
    node: startNode,
    edge: null,
    line: 9,
    data: { stack: [...stack], visited: [...visited], result: [...result] },
    description: `Push source node ${startNode} onto the stack.`,
  };

  /* ── Main DFS loop ── */
  while (stack.length > 0) {
    yield {
      type: 'check-loop',
      node: null,
      edge: null,
      line: 11,
      data: { stack: [...stack], visited: [...visited], result: [...result] },
      description: 'Check if stack is not empty.',
    };

    const node = stack.pop();

    yield {
      type: 'pop',
      node,
      edge: null,
      line: 12,
      data: { stack: [...stack], visited: [...visited], result: [...result] },
      description: `Pop node ${node} from the top of the stack.`,
    };

    if (visited.has(node)) {
      yield {
        type: 'skip',
        node,
        edge: null,
        line: 13,
        data: { stack: [...stack], visited: [...visited], result: [...result] },
        description: `Node ${node} already visited – skip (continue).`,
      };
      continue;
    }

    visited.add(node);
    result.push(node);

    yield {
      type: 'visit',
      node,
      edge: null,
      line: 15,
      data: { stack: [...stack], visited: [...visited], result: [...result] },
      description: `Mark node ${node} as visited and add to DFS result.`,
    };

    const neighbors = graph[node] || [];
    // Push neighbours in reverse so that the first neighbour is processed first
    const reversed = [...neighbors].reverse();

    for (const neighbor of reversed) {
      yield {
        type: 'check-neighbor',
        node: neighbor,
        edge: [node, neighbor],
        line: 20,
        data: { stack: [...stack], visited: [...visited], result: [...result] },
        description: `Examine neighbor ${neighbor} of node ${node}.`,
      };

      if (!visited.has(neighbor)) {
        stack.push(neighbor);

        yield {
          type: 'push',
          node: neighbor,
          edge: [node, neighbor],
          line: 22,
          data: { stack: [...stack], visited: [...visited], result: [...result] },
          description: `Push unvisited neighbor ${neighbor} onto stack.`,
        };
      } else {
        yield {
          type: 'skip',
          node: neighbor,
          edge: [node, neighbor],
          line: 21,
          data: { stack: [...stack], visited: [...visited], result: [...result] },
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
    line: 26,
    data: { stack: [], visited: [...visited], result: [...result] },
    description: `DFS complete. Traversal order: [${result.join(', ')}].`,
  };
}

export default dfsGenerator;
