/**
 * Cycle Detection Generators
 *
 * Exports two generators:
 * 1. cycleDetectionUndirectedDFS – DFS with parent tracking for undirected graphs
 * 2. cycleDetectionDirectedDFS – DFS with 3-coloring (white/gray/black) for directed graphs
 *
 * @param {Object} graph – adjacency list, e.g. { '0': ['1','2'], … }
 * @param {string} startNode – node to begin DFS from
 */

// ── Undirected Cycle Detection (DFS with parent tracking) ──
export function* cycleDetectionUndirectedDFS(graph, startNode) {
  const nodes = Object.keys(graph);
  const visited = new Set();
  let cycleFound = false;
  let cycleEdge = null;

  // Java line mapping (0-indexed):
  //  3: boolean[] visited = new boolean[V];
  //  4: for (int i = 0; i < V; i++)
  //  6: if (dfs(i, -1, visited, adj)) return true;
  // 13: visited[node] = true;
  // 15: for (int neighbor : adj.get(node))
  // 16: if (!visited[neighbor])
  // 17: if (dfs(neighbor, node, visited, adj)) return true;
  // 18: else if (neighbor != parent)
  // 19: return true; // cycle found!

  yield {
    type: 'init',
    node: null,
    edge: null,
    line: 3,
    data: { visited: [], parent: {}, cycleFound: false },
    description: 'Initialize visited array.',
  };

  // Internal recursive DFS generator
  function* dfs(node, parent) {
    visited.add(node);

    yield {
      type: 'visit',
      node,
      edge: parent !== null ? [parent, node] : null,
      line: 13,
      data: { visited: [...visited], parent: { node, parent }, cycleFound },
      description: `Mark node ${node} as visited (parent: ${parent ?? 'none'}).`,
    };

    const neighbors = graph[node] || [];

    for (const rawNeighbor of neighbors) {
      const neighbor = typeof rawNeighbor === 'object' ? rawNeighbor.node : rawNeighbor;

      yield {
        type: 'check-neighbor',
        node: neighbor,
        edge: [node, neighbor],
        line: 15,
        data: { visited: [...visited], cycleFound },
        description: `Examine neighbor ${neighbor} of node ${node}.`,
      };

      if (!visited.has(neighbor)) {
        yield {
          type: 'recurse',
          node: neighbor,
          edge: [node, neighbor],
          line: 16,
          data: { visited: [...visited], cycleFound },
          description: `Neighbor ${neighbor} not visited – recurse into DFS.`,
        };

        yield* dfs(neighbor, node);

        if (cycleFound) return;
      } else if (neighbor !== parent) {
        cycleFound = true;
        cycleEdge = [node, neighbor];

        yield {
          type: 'cycle-found',
          node: neighbor,
          edge: [node, neighbor],
          line: 19,
          data: { visited: [...visited], cycleFound: true, cycleEdge },
          description: `Cycle detected! Node ${neighbor} is visited and not parent of ${node}.`,
        };
        return;
      } else {
        yield {
          type: 'skip-parent',
          node: neighbor,
          edge: [node, neighbor],
          line: 18,
          data: { visited: [...visited], cycleFound },
          description: `Neighbor ${neighbor} is the parent of ${node} – skip.`,
        };
      }
    }
  }

  // Start DFS from each unvisited node
  for (const node of nodes) {
    if (!visited.has(node)) {
      yield {
        type: 'start-component',
        node,
        edge: null,
        line: 4,
        data: { visited: [...visited], cycleFound },
        description: `Node ${node} not visited – start DFS from it.`,
      };

      yield* dfs(node, null);

      if (cycleFound) break;
    }
  }

  yield {
    type: 'complete',
    node: null,
    edge: null,
    line: cycleFound ? 19 : 8,
    data: { visited: [...visited], cycleFound, cycleEdge },
    description: cycleFound
      ? `Cycle detected! Back edge: ${cycleEdge[0]} → ${cycleEdge[1]}.`
      : 'No cycle found in the graph.',
  };
}

// ── Directed Cycle Detection (DFS with 3-coloring) ──
export function* cycleDetectionDirectedDFS(graph, startNode) {
  const nodes = Object.keys(graph);
  // WHITE=0 (unvisited), GRAY=1 (in current path), BLACK=2 (fully processed)
  const color = {};
  for (const n of nodes) color[n] = 0;

  let cycleFound = false;
  let cycleEdge = null;

  yield {
    type: 'init',
    node: null,
    edge: null,
    line: 3,
    data: { colors: { ...color }, cycleFound: false },
    description: 'Initialize all nodes as WHITE (unvisited).',
  };

  function* dfs(node) {
    color[node] = 1; // GRAY

    yield {
      type: 'visit',
      node,
      edge: null,
      line: 13,
      data: { colors: { ...color }, cycleFound },
      description: `Mark node ${node} as GRAY (in current DFS path).`,
    };

    const neighbors = graph[node] || [];

    for (const rawNeighbor of neighbors) {
      const neighbor = typeof rawNeighbor === 'object' ? rawNeighbor.node : rawNeighbor;

      yield {
        type: 'check-neighbor',
        node: neighbor,
        edge: [node, neighbor],
        line: 15,
        data: { colors: { ...color }, cycleFound },
        description: `Check neighbor ${neighbor} of node ${node} (color: ${['WHITE', 'GRAY', 'BLACK'][color[neighbor]]}).`,
      };

      if (color[neighbor] === 0) {
        yield* dfs(neighbor);
        if (cycleFound) return;
      } else if (color[neighbor] === 1) {
        cycleFound = true;
        cycleEdge = [node, neighbor];

        yield {
          type: 'cycle-found',
          node: neighbor,
          edge: [node, neighbor],
          line: 19,
          data: { colors: { ...color }, cycleFound: true, cycleEdge },
          description: `Cycle detected! Back edge ${node} → ${neighbor} (GRAY node).`,
        };
        return;
      }
    }

    color[node] = 2; // BLACK

    yield {
      type: 'backtrack',
      node,
      edge: null,
      line: 22,
      data: { colors: { ...color }, cycleFound },
      description: `Mark node ${node} as BLACK (fully processed).`,
    };
  }

  for (const node of nodes) {
    if (color[node] === 0) {
      yield {
        type: 'start-component',
        node,
        edge: null,
        line: 4,
        data: { colors: { ...color }, cycleFound },
        description: `Node ${node} is WHITE – start DFS.`,
      };

      yield* dfs(node);
      if (cycleFound) break;
    }
  }

  yield {
    type: 'complete',
    node: null,
    edge: null,
    line: cycleFound ? 19 : 8,
    data: { colors: { ...color }, cycleFound, cycleEdge },
    description: cycleFound
      ? `Cycle detected via back edge: ${cycleEdge[0]} → ${cycleEdge[1]}.`
      : 'No cycle found in the directed graph.',
  };
}
