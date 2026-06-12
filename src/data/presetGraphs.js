// Preset graph configurations for all Phase 1 problems.
// Each preset is keyed by the problem's presetGraphKey.
// Positions are designed for a ~700×500 canvas to avoid overlaps.

export const presetGraphs = {
  /* ─── BFS basic: 7-node undirected graph ─── */
  'bfs-basic': {
    nodes: [
      { id: '0', position: { x: 300, y: 30 },  data: { label: '0' } },
      { id: '1', position: { x: 150, y: 130 }, data: { label: '1' } },
      { id: '2', position: { x: 450, y: 130 }, data: { label: '2' } },
      { id: '3', position: { x: 75,  y: 250 }, data: { label: '3' } },
      { id: '4', position: { x: 225, y: 250 }, data: { label: '4' } },
      { id: '5', position: { x: 375, y: 250 }, data: { label: '5' } },
      { id: '6', position: { x: 525, y: 250 }, data: { label: '6' } },
    ],
    edges: [
      { id: 'e0-1', source: '0', target: '1', data: {} },
      { id: 'e0-2', source: '0', target: '2', data: {} },
      { id: 'e1-3', source: '1', target: '3', data: {} },
      { id: 'e1-4', source: '1', target: '4', data: {} },
      { id: 'e2-5', source: '2', target: '5', data: {} },
      { id: 'e2-6', source: '2', target: '6', data: {} },
      { id: 'e3-4', source: '3', target: '4', data: {} },
      { id: 'e5-6', source: '5', target: '6', data: {} },
    ],
    directed: false,
    weighted: false,
    startNode: '0',
  },

  /* ─── DFS basic: 7-node undirected graph (deeper structure) ─── */
  'dfs-basic': {
    nodes: [
      { id: '0', position: { x: 300, y: 30 },  data: { label: '0' } },
      { id: '1', position: { x: 150, y: 130 }, data: { label: '1' } },
      { id: '2', position: { x: 450, y: 130 }, data: { label: '2' } },
      { id: '3', position: { x: 75,  y: 250 }, data: { label: '3' } },
      { id: '4', position: { x: 225, y: 250 }, data: { label: '4' } },
      { id: '5', position: { x: 375, y: 250 }, data: { label: '5' } },
      { id: '6', position: { x: 525, y: 250 }, data: { label: '6' } },
    ],
    edges: [
      { id: 'e0-1', source: '0', target: '1', data: {} },
      { id: 'e0-2', source: '0', target: '2', data: {} },
      { id: 'e1-3', source: '1', target: '3', data: {} },
      { id: 'e1-4', source: '1', target: '4', data: {} },
      { id: 'e2-5', source: '2', target: '5', data: {} },
      { id: 'e2-6', source: '2', target: '6', data: {} },
      { id: 'e4-5', source: '4', target: '5', data: {} },
    ],
    directed: false,
    weighted: false,
    startNode: '0',
  },

  /* ─── Cycle detection undirected: 6-node graph WITH a cycle ─── */
  'cycle-undirected': {
    nodes: [
      { id: '0', position: { x: 100, y: 50 },  data: { label: '0' } },
      { id: '1', position: { x: 300, y: 50 },  data: { label: '1' } },
      { id: '2', position: { x: 500, y: 50 },  data: { label: '2' } },
      { id: '3', position: { x: 100, y: 250 }, data: { label: '3' } },
      { id: '4', position: { x: 300, y: 250 }, data: { label: '4' } },
      { id: '5', position: { x: 500, y: 250 }, data: { label: '5' } },
    ],
    edges: [
      { id: 'e0-1', source: '0', target: '1', data: {} },
      { id: 'e1-2', source: '1', target: '2', data: {} },
      { id: 'e0-3', source: '0', target: '3', data: {} },
      { id: 'e3-4', source: '3', target: '4', data: {} },
      { id: 'e4-5', source: '4', target: '5', data: {} },
      { id: 'e2-5', source: '2', target: '5', data: {} },
      // This edge creates the cycle: 1-4 forms cycle 0-1-4-3-0
      { id: 'e1-4', source: '1', target: '4', data: {} },
    ],
    directed: false,
    weighted: false,
    startNode: '0',
  },

  /* ─── Dijkstra: 6-node weighted undirected graph ─── */
  'dijkstra-weighted': {
    nodes: [
      { id: '0', position: { x: 80,  y: 150 }, data: { label: '0' } },
      { id: '1', position: { x: 250, y: 50 },  data: { label: '1' } },
      { id: '2', position: { x: 250, y: 270 }, data: { label: '2' } },
      { id: '3', position: { x: 430, y: 50 },  data: { label: '3' } },
      { id: '4', position: { x: 430, y: 270 }, data: { label: '4' } },
      { id: '5', position: { x: 600, y: 150 }, data: { label: '5' } },
    ],
    edges: [
      { id: 'e0-1', source: '0', target: '1', data: { weight: 4 } },
      { id: 'e0-2', source: '0', target: '2', data: { weight: 1 } },
      { id: 'e1-3', source: '1', target: '3', data: { weight: 1 } },
      { id: 'e2-1', source: '2', target: '1', data: { weight: 2 } },
      { id: 'e2-4', source: '2', target: '4', data: { weight: 5 } },
      { id: 'e3-5', source: '3', target: '5', data: { weight: 3 } },
      { id: 'e4-3', source: '4', target: '3', data: { weight: 3 } },
      { id: 'e4-5', source: '4', target: '5', data: { weight: 1 } },
    ],
    directed: false,
    weighted: true,
    startNode: '0',
  },

  /* ─── Bellman-Ford: 5-node weighted directed graph ─── */
  'bellman-ford-weighted': {
    nodes: [
      { id: '0', position: { x: 80,  y: 150 }, data: { label: '0' } },
      { id: '1', position: { x: 250, y: 50 },  data: { label: '1' } },
      { id: '2', position: { x: 250, y: 270 }, data: { label: '2' } },
      { id: '3', position: { x: 450, y: 50 },  data: { label: '3' } },
      { id: '4', position: { x: 450, y: 270 }, data: { label: '4' } },
    ],
    edges: [
      { id: 'e0-1', source: '0', target: '1', data: { weight: 6 } },
      { id: 'e0-2', source: '0', target: '2', data: { weight: 7 } },
      { id: 'e1-3', source: '1', target: '3', data: { weight: 5 } },
      { id: 'e1-2', source: '1', target: '2', data: { weight: 8 } },
      { id: 'e1-4', source: '1', target: '4', data: { weight: -4 } },
      { id: 'e2-3', source: '2', target: '3', data: { weight: -3 } },
      { id: 'e2-4', source: '2', target: '4', data: { weight: 9 } },
      { id: 'e3-1', source: '3', target: '1', data: { weight: -2 } },
      { id: 'e4-3', source: '4', target: '3', data: { weight: 7 } },
    ],
    directed: true,
    weighted: true,
    startNode: '0',
  },

  /* ─── MST graph: 7-node weighted undirected (shared by Prim & Kruskal) ─── */
  'mst-graph': {
    nodes: [
      { id: '0', position: { x: 300, y: 30 },  data: { label: '0' } },
      { id: '1', position: { x: 130, y: 130 }, data: { label: '1' } },
      { id: '2', position: { x: 470, y: 130 }, data: { label: '2' } },
      { id: '3', position: { x: 60,  y: 270 }, data: { label: '3' } },
      { id: '4', position: { x: 230, y: 270 }, data: { label: '4' } },
      { id: '5', position: { x: 380, y: 270 }, data: { label: '5' } },
      { id: '6', position: { x: 540, y: 270 }, data: { label: '6' } },
    ],
    edges: [
      { id: 'e0-1', source: '0', target: '1', data: { weight: 2 } },
      { id: 'e0-2', source: '0', target: '2', data: { weight: 6 } },
      { id: 'e1-2', source: '1', target: '2', data: { weight: 8 } },
      { id: 'e1-3', source: '1', target: '3', data: { weight: 5 } },
      { id: 'e1-4', source: '1', target: '4', data: { weight: 7 } },
      { id: 'e2-4', source: '2', target: '4', data: { weight: 9 } },
      { id: 'e2-5', source: '2', target: '5', data: { weight: 3 } },
      { id: 'e2-6', source: '2', target: '6', data: { weight: 4 } },
      { id: 'e3-4', source: '3', target: '4', data: { weight: 1 } },
      { id: 'e5-6', source: '5', target: '6', data: { weight: 2 } },
      { id: 'e4-5', source: '4', target: '5', data: { weight: 4 } },
    ],
    directed: false,
    weighted: true,
    startNode: '0',
  },
};

export default presetGraphs;
