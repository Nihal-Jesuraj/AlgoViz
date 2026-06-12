/**
 * Topological Sort Generator (DFS-based)
 *
 * Yields step objects tracing the DFS-based topological sort.
 * Only valid on a directed acyclic graph (DAG).
 *
 * @param {Object} graph  – adjacency list (directed), e.g. { '0': ['1','2'], … }
 * @param {string} _startNode – unused, we iterate over all nodes
 */
export function* topologicalSortGenerator(graph, _startNode) {
  const nodes = Object.keys(graph);
  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;

  const color = {};
  for (const n of nodes) color[n] = WHITE;

  const resultStack = []; // topological order (reversed at end)
  const visiting = new Set(); // gray nodes
  const visitedSet = new Set(); // black nodes

  /* ── Initialisation ── */
  yield {
    type: 'init',
    node: null,
    edge: null,
    line: 0,
    data: { stack: [], visiting: [], visited: [], color: { ...color } },
    description: 'Initialize all nodes as unvisited (WHITE).',
  };

  /**
   * Iterative DFS helper using an explicit stack that simulates the call stack.
   * Each frame: { node, neighborIdx }
   */
  function* dfs(start) {
    const callStack = [{ node: start, neighborIdx: 0 }];
    color[start] = GRAY;
    visiting.add(start);

    yield {
      type: 'visit',
      node: start,
      edge: null,
      line: 2,
      data: {
        stack: [...resultStack],
        visiting: [...visiting],
        visited: [...visitedSet],
        color: { ...color },
      },
      description: `Start DFS from node ${start} – mark GRAY (visiting).`,
    };

    while (callStack.length > 0) {
      const frame = callStack[callStack.length - 1];
      const neighbors = graph[frame.node] || [];

      if (frame.neighborIdx < neighbors.length) {
        const neighbor = neighbors[frame.neighborIdx];
        frame.neighborIdx++;

        yield {
          type: 'check-neighbor',
          node: neighbor,
          edge: [frame.node, neighbor],
          line: 4,
          data: {
            stack: [...resultStack],
            visiting: [...visiting],
            visited: [...visitedSet],
            color: { ...color },
          },
          description: `Examine neighbor ${neighbor} of node ${frame.node}.`,
        };

        if (color[neighbor] === WHITE) {
          color[neighbor] = GRAY;
          visiting.add(neighbor);

          yield {
            type: 'visit',
            node: neighbor,
            edge: [frame.node, neighbor],
            line: 5,
            data: {
              stack: [...resultStack],
              visiting: [...visiting],
              visited: [...visitedSet],
              color: { ...color },
            },
            description: `Node ${neighbor} is WHITE – mark GRAY and recurse.`,
          };

          callStack.push({ node: neighbor, neighborIdx: 0 });
        } else if (color[neighbor] === GRAY) {
          yield {
            type: 'back-edge',
            node: neighbor,
            edge: [frame.node, neighbor],
            line: 6,
            data: {
              stack: [...resultStack],
              visiting: [...visiting],
              visited: [...visitedSet],
              color: { ...color },
            },
            description: `Node ${neighbor} is GRAY – back edge detected (graph has a cycle!).`,
          };
        } else {
          yield {
            type: 'skip',
            node: neighbor,
            edge: [frame.node, neighbor],
            line: 7,
            data: {
              stack: [...resultStack],
              visiting: [...visiting],
              visited: [...visitedSet],
              color: { ...color },
            },
            description: `Node ${neighbor} is BLACK – already processed, skip.`,
          };
        }
      } else {
        // All neighbors processed – mark BLACK and add to result stack
        callStack.pop();
        color[frame.node] = BLACK;
        visiting.delete(frame.node);
        visitedSet.add(frame.node);
        resultStack.push(frame.node);

        yield {
          type: 'add-to-stack',
          node: frame.node,
          edge: null,
          line: 8,
          data: {
            stack: [...resultStack],
            visiting: [...visiting],
            visited: [...visitedSet],
            color: { ...color },
          },
          description: `All neighbors of ${frame.node} processed – mark BLACK and push to result stack.`,
        };
      }
    }
  }

  /* ── Iterate over all nodes ── */
  for (const node of nodes) {
    if (color[node] === WHITE) {
      yield {
        type: 'start-component',
        node,
        edge: null,
        line: 1,
        data: {
          stack: [...resultStack],
          visiting: [...visiting],
          visited: [...visitedSet],
          color: { ...color },
        },
        description: `Node ${node} is unvisited – start DFS from it.`,
      };

      yield* dfs(node);
    }
  }

  /* ── Complete ── */
  const topoOrder = [...resultStack].reverse();

  yield {
    type: 'complete',
    node: null,
    edge: null,
    line: 9,
    data: {
      stack: [...resultStack],
      topologicalOrder: topoOrder,
      visiting: [...visiting],
      visited: [...visitedSet],
    },
    description: `Topological sort complete. Order: [${topoOrder.join(', ')}].`,
  };
}

export default topologicalSortGenerator;
