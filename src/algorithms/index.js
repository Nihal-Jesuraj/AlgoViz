/**
 * Algorithm Registry — All graph + grid algorithm generators
 */
import { bfsGenerator } from './bfs';
import { dfsGenerator } from './dfs';
import { dijkstraGenerator } from './dijkstra';
import { bellmanFordGenerator } from './bellmanFord';
import { topologicalSortGenerator } from './topologicalSort';
import { kruskalsGenerator } from './kruskals';
import { primsGenerator } from './prims';
import { cycleDetectionUndirectedDFS, cycleDetectionDirectedDFS } from './cycleDetection';
import { bipartiteCheckBFS } from './bipartiteCheck';
import { kahnsTopoSortGenerator } from './kahnsTopoSort';
import { eventualSafeStatesGenerator } from './eventualSafeStates';
import { dagShortestPathGenerator } from './dagShortestPath';
import { bfsShortestPathGenerator } from './bfsShortestPath';
import { floydWarshallGenerator } from './floydWarshall';
import { dsuVisualizationGenerator, dsuRedundantConnectionGenerator } from './dsuVisualization';
import { kosarajuSCCGenerator } from './kosarajuSCC';
import { tarjanBridgesGenerator, articulationPointsGenerator } from './tarjanBridges';
import { eulerPathGenerator } from './eulerPath';

// Grid algorithms
import { rottenOrangesGenerator, shortestPathBinaryMatrixGenerator, floodFillGenerator, nearestCellGenerator, distanceFromGuardGenerator } from './gridBFS';
import { numberOfIslandsGenerator, surroundedRegionsGenerator, numberOfEnclavesGenerator, distinctIslandsGenerator } from './gridDFS';

/**
 * Custom JSON Generator
 * Safely iterates through a pre-computed dryRun JSON array without using eval()
 */
export function* jsonDryRunGenerator(graph, startNode, dryRunArray = []) {
  for (const step of dryRunArray) {
    yield {
      type: step.action || 'visit',
      node: step.node || null,
      edge: step.edge || null,
      line: step.step || -1,
      data: step.state || {},
      description: step.description || 'AI Step',
    };
  }
}

export const algorithms = {
  // ── Graph Traversal ──
  bfs: { name: 'BFS Traversal', generator: bfsGenerator, category: 'traversal' },
  dfs: { name: 'DFS Traversal', generator: dfsGenerator, category: 'traversal' },

  // ── Cycle Detection ──
  cycleDetectionUndirectedDFS: { name: 'Cycle Detection (Undirected)', generator: cycleDetectionUndirectedDFS, category: 'cycle-detection' },
  cycleDetectionDirectedDFS: { name: 'Cycle Detection (Directed)', generator: cycleDetectionDirectedDFS, category: 'cycle-detection' },

  // ── Bipartite ──
  bipartiteCheckBFS: { name: 'Bipartite Check (BFS)', generator: bipartiteCheckBFS, category: 'bipartite' },

  // ── Topological Sort ──
  topologicalSort: { name: 'Topological Sort (DFS)', generator: topologicalSortGenerator, category: 'topological' },
  kahnsTopoSort: { name: "Kahn's Topological Sort (BFS)", generator: kahnsTopoSortGenerator, category: 'topological' },
  eventualSafeStates: { name: 'Eventual Safe States', generator: eventualSafeStatesGenerator, category: 'topological' },

  // ── Shortest Path ──
  dijkstra: { name: "Dijkstra's Algorithm", generator: dijkstraGenerator, category: 'shortest-path' },
  bellmanFord: { name: 'Bellman-Ford Algorithm', generator: bellmanFordGenerator, category: 'shortest-path' },
  dagShortestPath: { name: 'Shortest Path in DAG', generator: dagShortestPathGenerator, category: 'shortest-path' },
  bfsShortestPath: { name: 'BFS Shortest Path (Unit Weight)', generator: bfsShortestPathGenerator, category: 'shortest-path' },
  floydWarshall: { name: 'Floyd-Warshall (All Pairs)', generator: floydWarshallGenerator, category: 'shortest-path' },

  // ── MST ──
  kruskals: { name: "Kruskal's Algorithm", generator: kruskalsGenerator, category: 'mst' },
  prims: { name: "Prim's Algorithm", generator: primsGenerator, category: 'mst' },

  // ── DSU ──
  dsuVisualization: { name: 'Disjoint Set Union', generator: dsuVisualizationGenerator, category: 'dsu' },
  dsuRedundantConnection: { name: 'DSU — Redundant Connection', generator: dsuRedundantConnectionGenerator, category: 'dsu' },

  // ── Advanced ──
  kosarajuSCC: { name: "Kosaraju's SCC", generator: kosarajuSCCGenerator, category: 'scc' },
  tarjanBridges: { name: "Tarjan's Bridges", generator: tarjanBridgesGenerator, category: 'bridges' },
  articulationPoints: { name: 'Articulation Points', generator: articulationPointsGenerator, category: 'bridges' },
  eulerPath: { name: 'Euler Path/Circuit', generator: eulerPathGenerator, category: 'euler' },

  // ── Grid BFS ──
  rottenOranges: { name: 'Rotten Oranges', generator: rottenOrangesGenerator, category: 'grid', isGrid: true },
  shortestPathBinaryMatrix: { name: 'Shortest Path Binary Matrix', generator: shortestPathBinaryMatrixGenerator, category: 'grid', isGrid: true },
  floodFill: { name: 'Flood Fill', generator: floodFillGenerator, category: 'grid', isGrid: true },
  nearestCell: { name: 'Nearest Cell Having 1', generator: nearestCellGenerator, category: 'grid', isGrid: true },
  distanceFromGuard: { name: 'Distance from Guard', generator: distanceFromGuardGenerator, category: 'grid', isGrid: true },

  // ── Grid DFS ──
  numberOfIslands: { name: 'Number of Islands', generator: numberOfIslandsGenerator, category: 'grid', isGrid: true },
  surroundedRegions: { name: 'Surrounded Regions', generator: surroundedRegionsGenerator, category: 'grid', isGrid: true },
  numberOfEnclaves: { name: 'Number of Enclaves', generator: numberOfEnclavesGenerator, category: 'grid', isGrid: true },
  distinctIslands: { name: 'Distinct Islands', generator: distinctIslandsGenerator, category: 'grid', isGrid: true },

  // ── AI Custom ──
  custom: { name: 'AI Custom Solution', generator: jsonDryRunGenerator, category: 'custom' },
};

export default algorithms;
