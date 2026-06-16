import { GoogleGenerativeAI } from '@google/generative-ai';
import VisionProvider from './VisionProvider';

/**
 * Gemini Vision Provider
 * Uses @google/generative-ai and VITE_GEMINI_API_KEY.
 */
export default class GeminiVisionProvider extends VisionProvider {
  constructor() {
    super();
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      const modelName = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
      this.model = this.genAI.getGenerativeModel({ model: modelName });
    }
  }

  async reconstructDiagram(imageUrl, expectedNodeIds, expectedEdges = []) {
    if (!this.model) {
      throw new Error("Gemini API Key is missing. Cannot use GeminiVisionProvider.");
    }

    console.log(`[GeminiVisionProvider] Analyzing image: ${imageUrl}`);
    console.log(`[GeminiVisionProvider] Expected nodes:`, expectedNodeIds);
    console.log(`[GeminiVisionProvider] Expected edges:`, expectedEdges);

    // 1. Fetch the image base64 via our local Vite proxy to avoid CORS
    const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
    const imgResponse = await fetch(proxyUrl);
    if (!imgResponse.ok) throw new Error("Failed to fetch image via proxy");
    
    const { base64, mimeType, error } = await imgResponse.json();
    if (error) throw new Error(`Proxy error: ${error}`);

    // 2. Prepare the prompt
    const prompt = `
You are an expert Graph Layout Reconstructor.
I am providing you with an image of a graph/tree diagram.
I also have a list of expected node IDs that should appear in this diagram: [${expectedNodeIds.join(', ')}]

Your task:
1. Identify all nodes in the image.
2. Estimate their approximate X and Y coordinates (in pixels, assuming the top-left of the image is 0,0 and the image is roughly 600x600 scale. Provide values like x: 150, y: 300).
3. Read the exact raw text/number written inside each node. Do not guess or map it to the expected IDs. Just report exactly what you see visually.
4. Identify the edges (lines/arrows) connecting the nodes. Provide a list of visual edges represented as pairs of raw visual labels: ["label1", "label2"].

You MUST respond with a pure JSON object in the following format, with NO markdown code blocks, NO backticks, and NO additional text.
{
  "confidence": <float between 0.0 and 1.0 representing how confident you are that this is a valid graph diagram and you successfully extracted all nodes>,
  "coordinates": {
    "raw_visual_label_1": { "x": 100, "y": 50 },
    "raw_visual_label_2": { "x": 200, "y": 150 }
  },
  "visual_edges": [
    ["raw_visual_label_1", "raw_visual_label_2"]
  ]
}

If the image is NOT a graph diagram (e.g. it's a company logo or an unrelated picture), return a confidence of 0.1 and an empty coordinates object.
`;

    // 3. Call Gemini
    const result = await this.model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64,
          mimeType: mimeType
        }
      }
    ]);

    const responseText = result.response.text();
    
    // 4. Parse output (strip potential markdown wrapping just in case)
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
        throw new Error("Invalid or missing 'confidence'. Must be a float between 0.0 and 1.0");
      }
      
      if (typeof parsed.coordinates !== 'object' || parsed.coordinates === null) {
        throw new Error("Invalid or missing 'coordinates'. Must be an object mapping labels to {x,y}");
      }
      
      for (const [label, coords] of Object.entries(parsed.coordinates)) {
        if (typeof coords !== 'object' || coords === null) {
          throw new Error(`Coordinate for label '${label}' is not an object`);
        }
        if (typeof coords.x !== 'number' || typeof coords.y !== 'number') {
          throw new Error(`Coordinate for label '${label}' missing numeric x or y values`);
        }
      }

      if (!Array.isArray(parsed.visual_edges)) {
        // Fallback or accept empty if model forgets, but ideally we enforce it.
        parsed.visual_edges = [];
      }

      return {
        coordinates: parsed.coordinates,
        confidence: parsed.confidence,
        visualEdges: parsed.visual_edges
      };
    } catch (e) {
      console.error("Gemini returned invalid JSON or failed schema validation:", e.message, responseText);
      throw new Error(`Failed schema validation: ${e.message}`);
    }
  }
}
