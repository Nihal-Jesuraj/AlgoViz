import fs from 'fs';
import { mapNodes } from '../src/utils/FuzzyNodeMapper.js';

// Setup Mock Browser Environment
global.localStorage = {
  getItem: () => null,
  setItem: () => {}
};

global.import = {
  meta: {
    env: {
      VITE_GEMINI_API_KEY: ''
    }
  }
};

// We will simulate the DiagramExtractionService flow directly here to avoid Vite module loading issues in raw Node.

const testCases = [
  {
    name: '1. GFG Tree Problem (Ideal Path)',
    expectedNodes: ['1', '2', '3', '4', '5'],
    geminiResponse: `\`\`\`json
{
  "confidence": 0.95,
  "coordinates": {
    "1": { "x": 300, "y": 50 },
    "2": { "x": 200, "y": 150 },
    "3": { "x": 400, "y": 150 },
    "4": { "x": 150, "y": 250 },
    "5": { "x": 250, "y": 250 }
  }
}
\`\`\``,
  },
  {
    name: '2. GFG Graph Problem (Fuzzy Node Mapping)',
    expectedNodes: ['0', '1', '2', '3'],
    geminiResponse: `\`\`\`json
{
  "confidence": 0.88,
  "coordinates": {
    "A": { "x": 100, "y": 100 },
    "B": { "x": 300, "y": 100 },
    "C": { "x": 100, "y": 300 },
    "D": { "x": 300, "y": 300 }
  }
}
\`\`\``,
  },
  {
    name: '3. Fallback A: Malformed JSON',
    expectedNodes: ['0', '1'],
    geminiResponse: `This is just some text, I couldn't find a graph.`,
  },
  {
    name: '4. Fallback B: Low Confidence (< 0.75)',
    expectedNodes: ['0', '1'],
    geminiResponse: `\`\`\`json
{
  "confidence": 0.40,
  "coordinates": {
    "A": { "x": 10, "y": 10 }
  }
}
\`\`\``,
  },
  {
    name: '5. Fallback C: Missing/Invalid Coordinates Schema',
    expectedNodes: ['0', '1'],
    geminiResponse: `\`\`\`json
{
  "confidence": 0.90,
  "coordinates": "Not an object"
}
\`\`\``,
  }
];

function simulateGeminiParsing(responseText) {
  let cleanJson = responseText.trim();
  if (cleanJson.startsWith('```json')) cleanJson = cleanJson.substring(7);
  if (cleanJson.startsWith('```')) cleanJson = cleanJson.substring(3);
  if (cleanJson.endsWith('```')) cleanJson = cleanJson.substring(0, cleanJson.length - 3);

  try {
    const parsed = JSON.parse(cleanJson);
    
    // Strict JSON Schema Validation
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error("Root response is not a JSON object");
    }
    if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1) {
      throw new Error("Invalid or missing 'confidence'.");
    }
    if (typeof parsed.coordinates !== 'object' || parsed.coordinates === null) {
      throw new Error("Invalid or missing 'coordinates'.");
    }
    for (const [label, coords] of Object.entries(parsed.coordinates)) {
      if (typeof coords !== 'object' || coords === null) {
        throw new Error(`Coordinate for label '${label}' is not an object`);
      }
      if (typeof coords.x !== 'number' || typeof coords.y !== 'number') {
        throw new Error(`Coordinate for label '${label}' missing numeric x or y`);
      }
    }

    return { coordinates: parsed.coordinates, confidence: parsed.confidence, error: null };
  } catch (e) {
    return { coordinates: null, confidence: null, error: e.message };
  }
}

console.log("==================================================");
console.log(" VISION PIPELINE END-TO-END VERIFICATION REPORT");
console.log("==================================================\n");

for (const tc of testCases) {
  console.log(`[TEST] ${tc.name}`);
  console.log(`Expected Internal Nodes: [${tc.expectedNodes.join(', ')}]`);
  
  const result = simulateGeminiParsing(tc.geminiResponse);
  
  if (result.error) {
    console.log(`❌ VALIDATION FAILED: ${result.error}`);
    console.log(`   Action: Triggered fallback to LayoutManager\n`);
    continue;
  }
  
  if (result.confidence < 0.75) {
    console.log(`⚠️ LOW CONFIDENCE: ${result.confidence}`);
    console.log(`   Action: Triggered fallback to LayoutManager\n`);
    continue;
  }
  
  console.log(`✅ SCHEMA VALIDATED! Confidence: ${result.confidence}`);
  
  const mappingResult = mapNodes(result.coordinates, tc.expectedNodes);
  console.log(`   Mapping Results: Mapped ${mappingResult.mappedCount} / ${mappingResult.totalExpected} nodes.`);
  console.log(`   Final Coordinates provided to React Flow:`);
  console.log(mappingResult.mappedCoordinates);
  console.log('\n');
}
