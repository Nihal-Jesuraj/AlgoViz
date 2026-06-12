/**
 * Tarjan's Bridges & Articulation Points
 */
export function* tarjanBridgesGenerator(graph, _startNode) {
  const nodes = Object.keys(graph);
  const disc = {}, low = {}, parent = {};
  let timer = 0;
  const visited = new Set();
  const bridges = [];

  for (const n of nodes) { disc[n] = -1; low[n] = -1; parent[n] = null; }

  yield { type: 'init', node: null, edge: null, line: 2, data: { disc: { ...disc }, low: { ...low }, bridges: [] }, description: 'Initialize disc/low arrays. Finding bridges.' };

  function* dfs(u) {
    visited.add(u);
    disc[u] = low[u] = timer++;
    yield { type: 'visit', node: u, edge: null, line: 6, data: { disc: { ...disc }, low: { ...low } }, description: `Visit ${u}: disc=${disc[u]}, low=${low[u]}.` };

    for (const raw of (graph[u] || [])) {
      const v = typeof raw === 'object' ? raw.node : raw;
      if (!visited.has(v)) {
        parent[v] = u;
        yield { type: 'check-neighbor', node: v, edge: [u, v], line: 10, data: { disc: { ...disc }, low: { ...low } }, description: `${v} unvisited — DFS.` };
        yield* dfs(v);

        low[u] = Math.min(low[u], low[v]);
        yield { type: 'update-low', node: u, edge: [u, v], line: 13, data: { disc: { ...disc }, low: { ...low } }, description: `low[${u}] = min(low[${u}], low[${v}]) = ${low[u]}.` };

        if (low[v] > disc[u]) {
          bridges.push([u, v]);
          yield { type: 'found-bridge', node: null, edge: [u, v], line: 15, data: { disc: { ...disc }, low: { ...low }, bridges: bridges.map(b => [...b]) }, description: `Bridge found: ${u}—${v} (low[${v}]=${low[v]} > disc[${u}]=${disc[u]}).` };
        }
      } else if (v !== parent[u]) {
        low[u] = Math.min(low[u], disc[v]);
        yield { type: 'update-low', node: u, edge: [u, v], line: 18, data: { disc: { ...disc }, low: { ...low } }, description: `Back edge ${u}→${v}: low[${u}] = min(low[${u}], disc[${v}]) = ${low[u]}.` };
      }
    }
  }

  for (const n of nodes) { if (!visited.has(n)) yield* dfs(n); }

  yield { type: 'complete', node: null, edge: null, line: 23, data: { disc: { ...disc }, low: { ...low }, bridges: bridges.map(b => [...b]) }, description: `Found ${bridges.length} bridge(s): ${bridges.map(b => `${b[0]}—${b[1]}`).join(', ') || 'none'}.` };
}

export function* articulationPointsGenerator(graph, _startNode) {
  const nodes = Object.keys(graph);
  const disc = {}, low = {}, parentMap = {};
  let timer = 0;
  const visited = new Set();
  const aps = new Set();

  for (const n of nodes) { disc[n] = -1; low[n] = -1; parentMap[n] = null; }

  yield { type: 'init', node: null, edge: null, line: 2, data: { disc: { ...disc }, low: { ...low }, aps: [] }, description: 'Initialize. Finding articulation points.' };

  function* dfs(u) {
    visited.add(u);
    disc[u] = low[u] = timer++;
    let children = 0;
    yield { type: 'visit', node: u, edge: null, line: 6, data: { disc: { ...disc }, low: { ...low } }, description: `Visit ${u}: disc=${disc[u]}.` };

    for (const raw of (graph[u] || [])) {
      const v = typeof raw === 'object' ? raw.node : raw;
      if (!visited.has(v)) {
        children++;
        parentMap[v] = u;
        yield* dfs(v);
        low[u] = Math.min(low[u], low[v]);
        yield { type: 'update-low', node: u, edge: [u, v], line: 13, data: { disc: { ...disc }, low: { ...low } }, description: `low[${u}] = ${low[u]}.` };

        if (parentMap[u] === null && children > 1) {
          aps.add(u);
          yield { type: 'found-ap', node: u, edge: null, line: 16, data: { aps: [...aps] }, description: `Root ${u} has ${children} children — articulation point!` };
        }
        if (parentMap[u] !== null && low[v] >= disc[u]) {
          aps.add(u);
          yield { type: 'found-ap', node: u, edge: [u, v], line: 19, data: { aps: [...aps] }, description: `${u} is articulation point (low[${v}]=${low[v]} >= disc[${u}]=${disc[u]}).` };
        }
      } else if (v !== parentMap[u]) {
        low[u] = Math.min(low[u], disc[v]);
      }
    }
  }

  for (const n of nodes) { if (!visited.has(n)) yield* dfs(n); }

  yield { type: 'complete', node: null, edge: null, line: 25, data: { disc: { ...disc }, low: { ...low }, aps: [...aps] }, description: `Articulation points: [${[...aps].join(', ') || 'none'}].` };
}
export default tarjanBridgesGenerator;
