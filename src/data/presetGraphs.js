import { parseLeetCodeFormat } from '../utils/graphInputParser';
import { getLayoutedElements } from '../utils/LayoutManager';

function createPreset(inputStr, isDirected = false, isWeighted = false, startNode = '0') {
  try {
    const data = parseLeetCodeFormat(inputStr);
    data.directed = isDirected;
    data.weighted = isWeighted;
    data.startNode = startNode;
    
    // Auto-layout the graph using Dagre
    if (data.nodes && data.nodes.length > 0) {
      data.nodes = getLayoutedElements(data.nodes, data.edges, 'TB', isDirected);
    }
    return data;
  } catch (e) {
    console.error("Failed to parse preset:", e);
    return { nodes: [], edges: [], directed: isDirected, weighted: isWeighted, startNode };
  }
}

export const presetGraphs = {
  // GFG BFS Testcase 1
  'bfs-basic': createPreset('[[2, 3, 1], [0], [0, 4], [0], [2]]', false, false),
  
  // GFG DFS Testcase 1
  'dfs-basic': createPreset('[[1, 2], [0, 2], [0, 1, 3, 4], [2], [2]]', false, false),
  
  // Cycle in Undirected (GFG Testcase)
  'cycle-undirected': createPreset('[[1], [0, 2, 4], [1, 3], [2, 4], [1, 3]]', false, false),
  
  // Dijkstra / Bellman Ford / Shortest Path
  'dijkstra-weighted': createPreset('[[0,1,4], [0,2,4], [1,2,2], [1,0,4], [2,0,4], [2,1,2], [2,3,3], [2,4,1], [2,5,6], [3,2,3], [3,5,2], [4,2,1], [4,5,3], [5,2,6], [5,3,2], [5,4,3]]', false, true),
  
  'bellman-ford-weighted': createPreset('[[0,1,5], [1,2,-2], [1,5,-3], [2,4,3], [3,2,6], [3,4,-2], [4,5,2]]', true, true),
  
  // MST / Kruskal / Prim (Standard 6-node weighted)
  'mst-graph': createPreset('[[0,1,2], [0,3,1], [0,4,4], [1,2,3], [1,3,3], [1,5,7], [2,3,5], [2,5,8], [3,4,9]]', false, true),
  
  // Bipartite Graph
  'bipartite': createPreset('[[1,3], [0,2], [1,3], [0,2]]', false, false),
  
  // Directed Cycle
  'cycle-directed': createPreset('[[1], [2], [3, 4], [1], []]', true, false),
  
  // Topological Sort DAG
  'topo-sort': createPreset('[[], [], [3], [1], [0, 1], [0, 2]]', true, false),
  
  // Eventual Safe States
  'safe-states': createPreset('[[1, 2], [2, 3], [5], [0], [5], [], []]', true, false),
  
  // Word Ladder (Unweighted)
  'word-ladder': createPreset('[[1,2], [0,3], [0,3], [1,2,4], [3]]', false, false),
  
  // Alien Dictionary
  'alien-dict': createPreset('[[1,2], [3], [4], [4], []]', true, false),
  
  // DAG Shortest Path
  'dag-shortest': createPreset('[[0,1,2], [0,2,4], [1,2,1], [1,3,7], [2,4,3], [3,5,1], [4,3,2], [4,5,5]]', true, true),
  
  // Floyd Warshall
  'floyd-warshall': createPreset('[[0,1,3], [0,2,8], [0,4,-4], [1,3,1], [1,4,7], [2,1,4], [3,0,2], [3,2,-5], [4,3,6]]', true, true),
  
  // DSU Basic
  'dsu-basic': createPreset('[[0,1], [1,2], [2,3], [4,5], [5,6]]', false, false),
  
  // SCC (Tarjan / Kosaraju)
  'scc-graph': createPreset('[[1], [2], [0,3], [4], [5], [3,6], [7], [6]]', true, false),
  
  // Bridges and Articulation Points
  'bridges-graph': createPreset('[[1,2], [0,2], [0,1,3], [2,4], [3,5], [4,6], [5]]', false, false),
  
  // Euler Graph
  'euler-graph': createPreset('[[1,2,3,4], [0,2], [0,1], [0,4], [0,3]]', false, false),
  
  // Shortest Path with Unit Weights
  'shortest-unit': createPreset('[[0,1], [0,3], [1,2], [3,4], [2,4], [4,5]]', false, false),
};

// Aliases
presetGraphs['mst-weighted'] = presetGraphs['mst-graph'];

export default presetGraphs;
