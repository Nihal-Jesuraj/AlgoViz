import { problems } from '../data/problems';
import { diagramExtractionService } from '../services/DiagramExtractionService';
import presetGraphs from '../data/presetGraphs';
import { parseLeetCodeFormat } from './graphInputParser';

export class BatchVisionExtractor {
  static async runBatchExtraction() {
    console.log("🚀 Starting Batch Vision Extraction for all 53 problems...");
    const layouts = {};
    const failed = [];

    // Filter out grid problems, since they don't use arbitrary vision layouts
    const graphProblems = problems.filter(p => !p.isGrid);

    for (let i = 0; i < graphProblems.length; i++) {
      const p = graphProblems[i];
      console.log(`[${i+1}/${graphProblems.length}] Processing: ${p.title}`);

      try {
        // 1. Fetch HTML from Proxy
        const htmlRes = await fetch(`/api/scrape?url=${encodeURIComponent(p.leetcodeUrl)}`);
        const html = await htmlRes.text();
        
        if (!html || htmlRes.status !== 200) {
          console.warn(`⚠️ No HTML found for ${p.title}`);
          failed.push(p.id);
          continue;
        }

        // 2. Extract Images
        const imageUrls = diagramExtractionService.extractImagesFromHTML(html);
        if (imageUrls.length === 0) {
          console.warn(`⚠️ No images found in HTML for ${p.title}`);
          failed.push(p.id);
          continue;
        }

        // 3. Get Expected Graph
        let expectedNodes = [];
        let expectedEdges = [];
        
        if (p.presetGraphKey && presetGraphs[p.presetGraphKey]) {
          const preset = presetGraphs[p.presetGraphKey];
          expectedNodes = preset.nodes.map(n => n.id);
          expectedEdges = preset.edges.map(e => ({ source: e.source, target: e.target }));
        } else if (p.input) {
          const parsed = parseLeetCodeFormat(p.input);
          if (parsed && parsed.nodes) {
            expectedNodes = parsed.nodes.map(n => n.id);
            expectedEdges = parsed.edges.map(e => ({ source: e.source, target: e.target }));
          }
        }

        if (expectedNodes.length === 0) {
          console.warn(`⚠️ Could not determine expected nodes for ${p.title}`);
          failed.push(p.id);
          continue;
        }

        // 4. Run Vision Extraction
        console.log(`Sending image to Gemini for ${p.title}...`);
        const result = await diagramExtractionService.reconstruct(
          p.leetcodeUrl, 
          imageUrls, 
          expectedNodes, 
          expectedEdges
        );

        if (result.coordinates) {
          layouts[p.id] = result.coordinates;
          console.log(`✅ Success for ${p.title}! Mapped ${result.debugInfo.mappedCount}/${result.debugInfo.totalExpected} nodes.`);
        } else {
          console.warn(`❌ Vision failed for ${p.title}: ${result.debugInfo.reason}`);
          failed.push(p.id);
        }

        // Delay to avoid rate limits (4 seconds)
        if (i < graphProblems.length - 1) {
          console.log("Sleeping 4s to respect rate limits...");
          await new Promise(r => setTimeout(r, 4000));
        }

      } catch (err) {
        console.error(`💥 Error processing ${p.title}:`, err);
        failed.push(p.id);
      }
    }

    console.log("🎉 Batch Extraction Complete!");
    console.log(`Total Success: ${Object.keys(layouts).length}`);
    console.log(`Total Failed: ${failed.length}`, failed);

    // Trigger download
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(layouts, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "vision-layouts.json");
    dlAnchorElem.click();
  }
}

// Make it globally accessible for dev tools
if (import.meta.env.DEV) {
  window.runBatchVisionExtraction = BatchVisionExtractor.runBatchExtraction;
}
