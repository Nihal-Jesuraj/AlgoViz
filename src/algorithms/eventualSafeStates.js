/**
 * Eventual Safe States — DFS 3-coloring
 * WHITE=0 (unvisited), GRAY=1 (in path), BLACK=2 (safe)
 */
export function* eventualSafeStatesGenerator(graph, _startNode) {
  const nodes = Object.keys(graph);
  const color = {};
  for (const n of nodes) color[n] = 0;
  const safeNodes = [];

  yield { type: 'init', node: null, edge: null, line: 2, data: { colors: { ...color }, safeNodes: [] }, description: 'Initialize all nodes as WHITE (0).' };

  function* dfs(node) {
    color[node] = 1;
    yield { type: 'visit', node, edge: null, line: 5, data: { colors: { ...color } }, description: `Mark node ${node} as GRAY (in current path).` };

    for (const raw of (graph[node] || [])) {
      const v = typeof raw === 'object' ? raw.node : raw;
      yield { type: 'check-neighbor', node: v, edge: [node, v], line: 7, data: { colors: { ...color } }, description: `Check neighbor ${v} (color: ${['WHITE','GRAY','BLACK'][color[v]]}).` };

      if (color[v] === 1) {
        yield { type: 'mark-unsafe', node, edge: [node, v], line: 9, data: { colors: { ...color } }, description: `Node ${v} is GRAY — cycle! Node ${node} is unsafe.` };
        return false;
      }
      if (color[v] === 0) {
        const safe = yield* dfs(v);
        if (!safe) {
          yield { type: 'mark-unsafe', node, edge: null, line: 9, data: { colors: { ...color } }, description: `Descendant of ${node} is unsafe — ${node} is also unsafe.` };
          return false;
        }
      }
    }

    color[node] = 2;
    safeNodes.push(node);
    yield { type: 'mark-safe', node, edge: null, line: 13, data: { colors: { ...color }, safeNodes: [...safeNodes] }, description: `Node ${node} is safe (BLACK). All paths lead to terminal nodes.` };
    return true;
  }

  for (const n of nodes) {
    if (color[n] === 0) {
      yield* dfs(n);
    }
  }

  yield { type: 'complete', node: null, edge: null, line: 17, data: { colors: { ...color }, safeNodes: [...safeNodes].sort() }, description: `Safe nodes: [${[...safeNodes].sort().join(', ')}]` };
}
export default eventualSafeStatesGenerator;
