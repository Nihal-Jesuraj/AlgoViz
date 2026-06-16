import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { jsonrepair } from 'jsonrepair';

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
      const openAiKey = import.meta.env.VITE_OPENAI_API_KEY;
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      const groqKey = import.meta.env.VITE_groqApi || import.meta.env.VITE_GROQ_API_KEY;
      if (!openAiKey && !geminiKey && !openRouterKey && !groqKey) throw new Error("Missing API Key in .env");

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
4. "explanation": Markdown formatted string explaining the algorithm approach.
5. "javaCode": The Java code solving the problem.
6. "stateVariables": Array of string names for state tracked (e.g. ["queue", "visited"]).
7. "dryRun": Provide a complete step-by-step trace matching the graph structure for ALL problems.
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
${problemHtml.substring(0, 5000)} // Truncated for safety

### Output Schema:
Respond ONLY with the JSON object.
CRITICAL: Output STRICT, VALID JSON. All property names and string values MUST be wrapped in double quotes. Do not use single quotes or unquoted keys.
`;

      const responseSchema = {
        type: SchemaType.OBJECT,
        properties: {
          problemType: { type: SchemaType.STRING },
          algorithmType: { type: SchemaType.STRING },
          timeComplexity: { type: SchemaType.STRING },
          spaceComplexity: { type: SchemaType.STRING },
          explanation: { type: SchemaType.STRING },
          javaCode: { type: SchemaType.STRING },
          stateVariables: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          graphStructure: {
            type: SchemaType.OBJECT,
            nullable: true,
            properties: {
              nodes: { type: SchemaType.ARRAY, items: { type: SchemaType.OBJECT, properties: { id: { type: SchemaType.STRING }, label: { type: SchemaType.STRING } } } },
              edges: { type: SchemaType.ARRAY, items: { type: SchemaType.OBJECT, properties: { source: { type: SchemaType.STRING }, target: { type: SchemaType.STRING }, weight: { type: SchemaType.NUMBER, nullable: true } } } },
              isDirected: { type: SchemaType.BOOLEAN, nullable: true },
              isWeighted: { type: SchemaType.BOOLEAN, nullable: true }
            }
          },
          dryRun: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                step: { type: SchemaType.NUMBER },
                action: { type: SchemaType.STRING },
                node: { type: SchemaType.STRING, nullable: true },
                edge: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, nullable: true },
                state: { type: SchemaType.OBJECT, nullable: true },
                description: { type: SchemaType.STRING }
              }
            }
          }
        },
        required: ["problemType", "algorithmType", "timeComplexity", "spaceComplexity", "explanation", "javaCode", "stateVariables", "dryRun"]
      };

      let responseText = "";
      let lastError = null;

      // Real Fallback Cascade
      const tryFetch = async (fetchLogic) => {
        if (responseText) return; // already succeeded
        try {
          responseText = await fetchLogic();
        } catch (e) {
          console.warn("AI Fallback triggered due to error:", e.message);
          lastError = e;
        }
      };

      if (geminiKey) {
        await tryFetch(async () => {
          const res = await fetch("/api/gemini", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, apiKey: geminiKey })
          });
          if (!res.ok) {
            const txt = await res.text();
            throw new Error(`Gemini Proxy Error: ${res.status} ${txt}`);
          }
          const data = await res.json();
          if (!data.text || data.error) throw new Error(data.error || "Empty response from Gemini");
          return data.text;
        });
      }

      if (openAiKey) {
        await tryFetch(async () => {
          const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${openAiKey}`
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              response_format: { type: "json_object" },
              messages: [{ role: "user", content: prompt }]
            })
          });
          if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);
          const data = await res.json();
          return data.choices[0].message.content;
        });
      }

      if (openRouterKey) {
        await tryFetch(async () => {
          const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${openRouterKey}`,
              "HTTP-Referer": "http://localhost:5173",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [{ role: "user", content: prompt }]
            })
          });
          if (!res.ok) throw new Error(`OpenRouter API error: ${res.status}`);
          const data = await res.json();
          return data.choices[0].message.content;
        });
      }

      if (groqKey) {
        await tryFetch(async () => {
          const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${groqKey}`
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: [{ role: "user", content: prompt }]
            })
          });
          if (!res.ok) throw new Error(`Groq API error: ${res.status}`);
          const data = await res.json();
          return data.choices[0].message.content;
        });
      }

      if (!responseText) {
        throw new Error(lastError ? `All API fallbacks failed. Last Error: ${lastError.message}` : "No API keys found in .env");
      }

      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      let parsed;
      try {
        parsed = JSON.parse(responseText);
      } catch (parseError) {
        console.warn("Initial JSON parse failed, attempting jsonrepair:", parseError);
        
        try {
            const repairedJSON = jsonrepair(responseText);
            parsed = JSON.parse(repairedJSON);
        } catch (e2) {
            console.error("jsonrepair and second pass JSON parse failed. Raw string end:", responseText.substring(responseText.length - 200));
            throw new Error("AI returned severely truncated or invalid JSON.");
        }
      }

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
