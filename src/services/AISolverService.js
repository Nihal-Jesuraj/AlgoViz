import { callAIWithFallback } from './AIServiceClient';

const VALID_ALGORITHMS = [
  'bfs', 'dfs', 'cycleDetectionUndirectedDFS', 'cycleDetectionDirectedDFS',
  'bipartiteCheckBFS', 'topologicalSort', 'kahnsTopoSort', 'eventualSafeStates',
  'dijkstra', 'bellmanFord', 'dagShortestPath', 'bfsShortestPath', 'floydWarshall',
  'kruskals', 'prims', 'dsuVisualization', 'dsuRedundantConnection',
  'kosarajuSCC', 'tarjanBridges', 'articulationPoints', 'eulerPath'
];

export class AISolverService {
  static async solveProblem(problemHtml, nodes, edges, isDirected) {
    try {
      const prompt = `
You are an expert algorithm visualizer. Given the LeetCode problem description and the extracted graph's nodes and edges, you must classify the problem and provide a structured JSON solution.

### Valid Algorithm Types:
You must pick one of the following exact strings if the problem matches a standard algorithm perfectly:
${VALID_ALGORITHMS.map(a => `"${a}"`).join(', ')}

If the problem requires custom state logic, dynamic programming on graphs, bitmasks, or custom greedy that does not cleanly fit any of the above, use exactly: "custom"

### Instructions:
1. "problemType": Should be "graph", "tree", "grid", "matrix", or "linkedlist".
2. "algorithmType": Must be one of the valid strings above or "custom".
3. "graphStructure": The AI MUST read the problem HTML, find the first Example Testcase, and generate the corresponding graph structure.
   - "nodes": [{"id": "0", "label": "0"}, ...]
   - "edges": [{"source": "0", "target": "1", "weight": 5}, ...]
   - "isDirected": boolean
4. "timeComplexity" & "spaceComplexity": Big-O notation.
5. "explanation": Markdown formatted string explaining the algorithm approach.
6. "javaCode": The Java code solving the problem.
7. "stateVariables": Array of string names for state tracked (e.g. ["queue", "visited"]).
8. "dryRun": Provide a complete step-by-step trace matching the graph structure for ALL problems.
   - Each step should have: 
     "step": number (the line number in your javaCode corresponding to this action, 1-indexed)
     "action": "visit", "enqueue", "dequeue", "check-neighbor", "mark-visited", "relax", "update", "add-to-mst", "cycle-found", "complete"
     "node": string id of node (optional)
     "edge": [sourceId, targetId] (optional)
     "state": { object mapping stateVariables to current values. For sets/lists like "visited" or "queue", use arrays e.g. "visited": ["0", "1"]. For maps, use objects. }
     "description": Short string (max 5 words).

CRITICAL REQUIREMENT: You MUST trace the algorithm until the queue/stack is completely empty and the algorithm fully terminates, BUT YOU MUST NOT EXCEED 40 STEPS TOTAL. If the algorithm requires more than 40 steps, gracefully stop at step 40, close the JSON array, and finish. Do NOT generate invalid or truncated JSON.

CRITICAL RULES FOR STATE & GRIDS:
- Do NOT include large matrices or 2D arrays (like the entire grid) in the "state" object.
- For grid problems, only track coordinates of active elements in your state variables (e.g., "queue": ["(0,1)", "(2,2)"]).

### Provided Canvas Graph (Fallback):
Nodes: ${JSON.stringify(nodes.map(n => n.id))}
Edges: ${JSON.stringify(edges.map(e => ({ source: e.source, target: e.target, weight: e.data?.weight })))}
Directed: ${isDirected}
Use this provided graph ONLY if you cannot find a clear testcase in the problem HTML. Otherwise, construct the "graphStructure" directly from the Example 1 testcase in the HTML.

### Problem Description HTML:
${problemHtml.substring(0, 5000)}

### Output Schema:
Respond ONLY with the JSON object.
CRITICAL: Output STRICT, VALID JSON. All property names and string values MUST be wrapped in double quotes. Do not use single quotes or unquoted keys.
`;
      const parsed = await callAIWithFallback(prompt);

      return {
        success: true,
        data: parsed
      };

    } catch (e) {
      console.error("AI Solver failed:", e);
      return {
        success: false,
        error: e.message,
        data: {
          problemType: "unknown",
          algorithmType: "unknown",
          timeComplexity: "Unknown",
          spaceComplexity: "Unknown",
          explanation: "AI Classification failed. Could not parse solution.",
          javaCode: "// AI Classification failed.",
          stateVariables: [],
          dryRun: []
        }
      };
    }
  }
}
