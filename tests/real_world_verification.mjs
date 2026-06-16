import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { mapNodesByTopology } from '../src/utils/TopologyMapper.js';

// If API key is missing, mock the run
const apiKey = process.env.VITE_GEMINI_API_KEY;

// Real GeeksForGeeks Image URLs
const TEST_CASES = [
  {
    name: '1. GFG Binary Tree (Real Image)',
    imageUrl: 'https://media.geeksforgeeks.org/wp-content/uploads/20221124153129/Treedatastructure.png',
    expectedNodeIds: ['1', '2', '3', '4', '5', '6', '7'],
    expectedEdges: [
      ['1', '2'], ['1', '3'],
      ['2', '4'], ['2', '5'],
      ['3', '6'], ['3', '7']
    ],
    mockResponse: `\`\`\`json
{
  "confidence": 0.95,
  "coordinates": {
    "1": { "x": 300, "y": 50 },
    "2": { "x": 150, "y": 150 },
    "3": { "x": 450, "y": 150 },
    "4": { "x": 50, "y": 250 },
    "5": { "x": 250, "y": 250 },
    "6": { "x": 350, "y": 250 },
    "7": { "x": 550, "y": 250 }
  },
  "visual_edges": [
    ["1", "2"], ["1", "3"], ["2", "4"], ["2", "5"], ["3", "6"], ["3", "7"]
  ]
}
\`\`\``
  },
  {
    name: '2. GFG Directed Graph (Non-sequential/Letters)',
    imageUrl: 'https://media.geeksforgeeks.org/wp-content/uploads/20200318142240/graph63.png',
    // Internal parser sees [0,1,2,3,4] but image uses A, B, C, D, E
    expectedNodeIds: ['0', '1', '2', '3', '4'],
    expectedEdges: [
      ['0', '1'], ['0', '4'],
      ['1', '2'], ['1', '3'], ['1', '4'],
      ['2', '3'],
      ['3', '4']
    ],
    mockResponse: `\`\`\`json
{
  "confidence": 0.90,
  "coordinates": {
    "A": { "x": 100, "y": 100 },
    "B": { "x": 300, "y": 100 },
    "C": { "x": 400, "y": 200 },
    "D": { "x": 300, "y": 300 },
    "E": { "x": 100, "y": 300 }
  },
  "visual_edges": [
    ["A", "B"], ["A", "E"], ["B", "C"], ["B", "D"], ["B", "E"], ["C", "D"], ["D", "E"]
  ]
}
\`\`\``
  }
];

async function runTest(tc) {
  console.log(`\n==================================================`);
  console.log(`[TEST] ${tc.name}`);
  console.log(`Image URL: ${tc.imageUrl}`);
  console.log(`Expected Nodes: ${tc.expectedNodeIds.length}`);
  console.log(`Expected Edges: ${tc.expectedEdges.length}`);
  
  let responseText = tc.mockResponse;

  if (apiKey) {
    console.log(`(Live Gemini API Call in progress...)`);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const imgResp = await fetch(tc.imageUrl);
      const buffer = await imgResp.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      
      const prompt = `
You are an expert Graph Layout Reconstructor.
I am providing you with an image of a graph/tree diagram.
I also have a list of expected node IDs: [${tc.expectedNodeIds.join(', ')}]

Your task:
1. Identify all nodes in the image.
2. Estimate their approximate X and Y coordinates (in pixels, assuming the top-left of the image is 0,0 and the image is roughly 600x600 scale. Provide values like x: 150, y: 300).
3. Read the exact raw text/number written inside each node. Do not guess or map it to the expected IDs. Just report exactly what you see visually.
4. Identify the edges (lines/arrows) connecting the nodes. Provide a list of visual edges represented as pairs of raw visual labels: ["label1", "label2"].

You MUST respond with a pure JSON object in the following format:
{
  "confidence": 0.9,
  "coordinates": {
    "raw_visual_label_1": { "x": 100, "y": 50 }
  },
  "visual_edges": [
    ["raw_visual_label_1", "raw_visual_label_2"]
  ]
}
      `;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64,
            mimeType: "image/png"
          }
        }
      ]);
      responseText = result.response.text();
    } catch (e) {
      console.log(`Live API Failed (${e.message}). Falling back to expected mock response.`);
    }
  }

  let cleanJson = responseText.trim();
  if (cleanJson.startsWith('```json')) cleanJson = cleanJson.substring(7);
  if (cleanJson.startsWith('```')) cleanJson = cleanJson.substring(3);
  if (cleanJson.endsWith('```')) cleanJson = cleanJson.substring(0, cleanJson.length - 3);

  const parsed = JSON.parse(cleanJson);
  console.log(`\n--- Gemini JSON Response ---`);
  console.log(`Confidence: ${parsed.confidence}`);
  console.log(`Nodes Detected: ${Object.keys(parsed.coordinates).length}`);
  console.log(`Edges Detected: ${parsed.visual_edges.length}`);
  
  console.log(`\n--- Topology Node Mapping ---`);
  const mapping = mapNodesByTopology(parsed.coordinates, parsed.visual_edges, tc.expectedNodeIds, tc.expectedEdges);
  
  console.log(`Mapped ${mapping.mappedCount} / ${mapping.totalExpected} Nodes via Graph Degree Matching.`);
  
  console.log(`\n--- Final React Flow Coordinates ---`);
  console.log(mapping.mappedCoordinates);
}

async function main() {
  for (const tc of TEST_CASES) {
    await runTest(tc);
  }
}

main();
