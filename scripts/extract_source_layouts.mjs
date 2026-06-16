import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import dotenv from 'dotenv';

import { problems } from '../src/data/problems.js';
import { parseLeetCodeFormat } from '../src/utils/graphInputParser.js';
import { mapNodesByTopology } from '../src/utils/TopologyMapper.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const outputPath = path.join(projectRoot, 'src/data/visionLayouts.js');
const reportPath = path.join(projectRoot, 'SOURCE_LAYOUT_EXTRACTION_REPORT.md');

// Automatically skip problems we already extracted successfully
let existingLayouts = {};
try {
  const existingContent = await fs.readFile(outputPath, 'utf8');
  // Hacky but safe way to parse the export const visionLayouts = { ... }
  const jsonMatch = existingContent.match(/export const visionLayouts = ([\s\S]*?);/);
  if (jsonMatch) {
    existingLayouts = JSON.parse(jsonMatch[1]);
  }
} catch (e) {
  console.log("No existing layouts found or parse error. Starting fresh.");
}

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const openAIApiKey = process.env.OPENAI_API_KEY;

// Try multiple available models
const modelNames = (process.env.GEMINI_MODEL || 'gemini-flash-latest,gemini-2.5-flash,gemini-2.0-flash-lite,gpt-4o,gpt-4o-mini')
  .split(',')
  .map((name) => name.trim())
  .filter(Boolean);
const limit = Number(process.env.LAYOUT_LIMIT || '0');
const minConfidence = Number(process.env.LAYOUT_MIN_CONFIDENCE || '0.78');
const delayMs = Number(process.env.LAYOUT_DELAY_MS || '65000');
// Maximum number of images to try per problem to reduce API calls
const maxImageAttempts = Number(process.env.LAYOUT_MAX_IMAGES || '3');
// Max exponential backoff (ms)
const maxBackoffMs = 120000;

if (!apiKey && !openAIApiKey) {
  console.error('Missing API keys. Set OPENAI_API_KEY or GEMINI_API_KEY in .env.');
  process.exit(1);
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const openai = openAIApiKey ? new OpenAI({ apiKey: openAIApiKey }) : null;
let activeModelName = modelNames[0];

async function loadPresetGraphsForNode() {
  const source = await fs.readFile(path.join(projectRoot, 'src/data/presetGraphs.js'), 'utf8');
  const presets = {};

  const entryRegex = /['"]([^'"]+)['"]:\s*createPreset\(\s*(['"`])([\s\S]*?)\2\s*,\s*(true|false)\s*,\s*(true|false)/g;
  let match;
  while ((match = entryRegex.exec(source)) !== null) {
    const [, key, , input, directed, weighted] = match;
    try {
      const parsed = parseLeetCodeFormat(input);
      parsed.directed = directed === 'true';
      parsed.weighted = weighted === 'true';
      presets[key] = parsed;
    } catch (error) {
      console.warn(`Could not parse preset ${key}: ${error.message}`);
    }
  }

  const aliasRegex = /presetGraphs\[['"]([^'"]+)['"]\]\s*=\s*presetGraphs\[['"]([^'"]+)['"]\]/g;
  while ((match = aliasRegex.exec(source)) !== null) {
    const [, aliasKey, targetKey] = match;
    if (presets[targetKey]) presets[aliasKey] = presets[targetKey];
  }

  return presets;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function absoluteUrl(src, pageUrl) {
  try {
    return new URL(src, pageUrl).href;
  } catch {
    return null;
  }
}

function extractImagesFromHTML(html, pageUrl) {
  const images = [];
  const imgRegex = /<img[^>]+src=["']([^"'>]+)["']/g;
  let match;

  while ((match = imgRegex.exec(html)) !== null) {
    const url = absoluteUrl(match[1], pageUrl);
    if (url) images.push(url);
  }

  const rawUrlRegex = /https?:\/\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+\.(?:png|jpg|jpeg|gif|webp)/gi;
  while ((match = rawUrlRegex.exec(html)) !== null) {
    images.push(match[0]);
  }

  return [...new Set(images)].filter((src) => {
    const lower = src.toLowerCase();
    if (lower.includes('logo') || lower.includes('icon') || lower.includes('avatar') || lower.includes('favicon')) return false;
    if (lower.includes('gfg_') || lower.includes('200x200') || lower.includes('cdn-uploads')) return false;
    if (lower.includes('profile') || lower.includes('user')) return false;
    return true;
  });
}

function getRetryDelayMs(error) {
  const message = String(error?.message || error);
  // If the error contains HTTP headers with Retry-After, prefer that
  try {
    const headers = error?.response?.headers || error?.headers || error?.response?.httpResponse?.headers;
    if (headers) {
      const headerValue = (typeof headers.get === 'function') ? headers.get('retry-after') : (headers['retry-after'] || headers['Retry-After']);
      if (headerValue) {
        const seconds = Number(headerValue);
        if (!Number.isNaN(seconds)) return (seconds + 5) * 1000;
        // If header is a date, fallback to default long wait
        return 65000;
      }
    }
  } catch (e) {
    // ignore header parsing errors
  }

  const retryDelayMatch = message.match(/retryDelay["']?\s*:\s*["']?(\d+)s/i);
  if (retryDelayMatch) return (Number(retryDelayMatch[1]) + 5) * 1000;

  const humanDelayMatch = message.match(/retry in\s+([\d.]+)s/i);
  if (humanDelayMatch) return Math.ceil(Number(humanDelayMatch[1]) + 5) * 1000;

  if (message.includes('429') || message.toLowerCase().includes('too many requests') || message.includes('quota')) {
    return 65000;
  }

  return 0;
}

async function fetchProblemHTML(problemUrl) {
  const isLeetCode = problemUrl.includes('leetcode.com');

  if (isLeetCode) {
    const slug = problemUrl.match(/problems\/([^/]+)/)?.[1];
    if (slug) {
      const response = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0',
        },
        body: JSON.stringify({
          operationName: 'questionData',
          variables: { titleSlug: slug },
          query: 'query questionData($titleSlug: String!) { question(titleSlug: $titleSlug) { content } }',
        }),
      });

      if (response.ok) {
        const json = await response.json();
        return json?.data?.question?.content || '';
      }
    }
  }

  const response = await fetch(problemUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function imageToInlineData(imageUrl) {
  const response = await fetch(imageUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  if (!response.ok) throw new Error(`Image fetch failed: ${response.status}`);

  const mimeType = response.headers.get('content-type')?.split(';')[0] || 'image/png';
  const arrayBuffer = await response.arrayBuffer();
  return {
    inlineData: {
      data: Buffer.from(arrayBuffer).toString('base64'),
      mimeType,
    },
  };
}

function getExpectedGraph(problem, presetGraphs) {
  if (problem.presetGraphKey && presetGraphs[problem.presetGraphKey]) {
    const preset = presetGraphs[problem.presetGraphKey];
    return {
      nodes: preset.nodes.map((node) => node.id),
      edges: preset.edges.map((edge) => ({ source: edge.source, target: edge.target })),
    };
  }

  if (problem.input) {
    const parsed = parseLeetCodeFormat(problem.input);
    return {
      nodes: parsed.nodes.map((node) => node.id),
      edges: parsed.edges.map((edge) => ({ source: edge.source, target: edge.target })),
    };
  }

  return { nodes: [], edges: [] };
}

function parseGeminiJson(text) {
  let clean = text.trim();
  if (clean.startsWith('```json')) clean = clean.slice(7);
  if (clean.startsWith('```')) clean = clean.slice(3);
  if (clean.endsWith('```')) clean = clean.slice(0, -3);
  return JSON.parse(clean.trim());
}

async function reconstructFromImage(problem, imageUrl, expectedNodes, expectedEdges) {
  const prompt = `
You are reconstructing an official LeetCode or GeeksForGeeks problem diagram.
Problem: ${problem.title}
Expected internal node ids: ${expectedNodes.join(', ')}
Expected internal edges: ${expectedEdges.map((edge) => `${edge.source}->${edge.target}`).join(', ')}

Identify the graph/tree nodes in this image and return their center coordinates in image pixels.
Read the exact visible label in each node. Also return visible graph edges as pairs of raw labels.

Return only valid JSON:
{
  "confidence": 0.0,
  "coordinates": {
    "raw_visible_label": { "x": 100, "y": 120 }
  },
  "visual_edges": [
    ["raw_visible_label_a", "raw_visible_label_b"]
  ]
}

If the image is not the main graph/tree/grid diagram for this problem, return confidence 0.1 and empty coordinates.
`;

  const imageData = await imageToInlineData(imageUrl);
  let result;
  let lastError;

  for (const modelName of modelNames) {
    if (modelName.startsWith('gpt-') && !openai) continue;
    if (modelName.startsWith('gemini-') && !genAI) continue;

    let retries = modelName.startsWith('gpt-') ? 2 : 1; // OpenAI is more stable, can retry a bit more
    let attemptIndex = 0; // used for exponential backoff/jitter
    while (retries >= 0) {
      try {
        activeModelName = modelName;
        
        if (modelName.startsWith('gpt-')) {
          const response = await openai.chat.completions.create({
            model: modelName,
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: prompt },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:${imageData.inlineData.mimeType};base64,${imageData.inlineData.data}`,
                    },
                  },
                ],
              },
            ],
          });
          const text = response.choices[0]?.message?.content || '{}';
          result = { response: { text: () => text } };
        } else {
          const model = genAI.getGenerativeModel({ model: modelName });
          result = await model.generateContent([prompt, imageData]);
        }
        
        break; // Success, break out of while loop
      } catch (error) {
        lastError = error;
        const retryDelay = getRetryDelayMs(error);
        if (retryDelay > 0 && retries > 0) {
          console.warn(`  API rate limit hit [${error.message.split('\n')[0]}]; waiting ${Math.round(retryDelay / 1000)}s before retrying ${modelName} (retries left: ${retries})`);
          await sleep(retryDelay);
          attemptIndex = 0;
          retries--;
          continue; // Retry the same model
        } else if (retryDelay > 0 && retries === 0) {
           console.warn(`  API rate limit hit; out of retries for ${modelName}, trying next model...`);
           break; // Out of retries, try next model
        }

        // No explicit retry delay provided: use exponential backoff with jitter
        if (retries > 0) {
          const backoff = Math.min(maxBackoffMs, 2000 * Math.pow(2, attemptIndex));
          const jitter = Math.floor(Math.random() * 1000);
          const wait = backoff + jitter;
          console.warn(`  API error without retry header; backing off ${Math.round(wait/1000)}s before retrying (attempt ${attemptIndex + 1})`);
          await sleep(wait);
          attemptIndex++;
          retries--;
          continue;
        }

        const message = String(error?.message || error);
        const shouldTryNext = message.includes('404') || message.includes('not found') || message.includes('not supported') || message.includes('insufficient_quota');
        if (!shouldTryNext) throw error;
        console.warn(`  model ${modelName} unavailable; trying next model`);
        break; // Break out of while loop, try next model
      }
    }
    if (result) break; // Break out of model loop if we got a result
  }

  if (!result) {
    throw lastError || new Error('No AI model was available for generation or out of retries');
  }

  const parsed = parseGeminiJson(result.response.text());

  if (typeof parsed.confidence !== 'number' || parsed.confidence < minConfidence) {
    return {
      accepted: false,
      reason: `confidence ${parsed.confidence ?? 'missing'} below ${minConfidence}`,
      confidence: parsed.confidence ?? 0,
    };
  }

  if (!parsed.coordinates || typeof parsed.coordinates !== 'object') {
    return { accepted: false, reason: 'missing coordinates', confidence: parsed.confidence };
  }

  const mapped = mapNodesByTopology(
    parsed.coordinates,
    Array.isArray(parsed.visual_edges) ? parsed.visual_edges : [],
    expectedNodes,
    expectedEdges
  );

  if (mapped.mappedCount === 0) {
    return {
      accepted: false,
      reason: `mapped 0/${mapped.totalExpected} nodes`,
      confidence: parsed.confidence,
      mapped,
    };
  }

  return {
    accepted: true,
    confidence: parsed.confidence,
    coordinates: mapped.mappedCoordinates,
  };
}

async function writeLayouts(layouts, report = []) {
  const fileContents = `export const visionLayouts = ${JSON.stringify(layouts, null, 2)};\n`;
  await fs.writeFile(outputPath, fileContents);
  await fs.writeFile(reportPath, `# Source Layout Extraction Report\n\n${report.join('\n')}\n`);
}

async function main() {
  const presetGraphs = await loadPresetGraphsForNode();
  const graphProblems = problems.filter((problem) => !problem.isGrid);
  const selectedProblems = limit > 0 ? graphProblems.slice(0, limit) : graphProblems;
  const layouts = { ...existingLayouts };
  const report = [];

  // Parse command line arguments for starting point (e.g. node script.mjs --start=10 or --start=g12)
  const startArg = process.argv.find(arg => arg.startsWith('--start='));
  let startIndex = 0;
  if (startArg) {
    const val = startArg.split('=')[1];
    if (isNaN(val)) {
      startIndex = selectedProblems.findIndex(p => p.id === val);
      if (startIndex === -1) startIndex = 0;
    } else {
      startIndex = parseInt(val, 10);
    }
  }

  console.log(`Extracting source layouts for ${selectedProblems.length} graph problems using ${modelNames.join(', ')}.`);
  if (startIndex > 0) console.log(`Starting from index ${startIndex}...`);

  for (let i = startIndex; i < selectedProblems.length; i++) {
    const problem = selectedProblems[i];
    const prefix = `[${i + 1}/${selectedProblems.length}] ${problem.id} ${problem.title}`;
    
    // Auto-skip if we already have it
    if (layouts[problem.id]) {
      console.log(`\n${prefix} - SKIP: Already extracted successfully.`);
      continue;
    }

    console.log(`\n${prefix}`);

    try {
      const expected = getExpectedGraph(problem, presetGraphs);
      if (expected.nodes.length === 0) {
        throw new Error('No expected graph nodes found');
      }

      const html = await fetchProblemHTML(problem.leetcodeUrl);
      const images = extractImagesFromHTML(html, problem.leetcodeUrl);
      if (images.length === 0) {
        throw new Error('No candidate images found on source page');
      }

      // Limit the number of images we attempt per problem to avoid excessive API usage
      let accepted = null;
      const attempts = [];
      const tryImages = images.slice(0, maxImageAttempts);
      for (const imageUrl of tryImages) {
        console.log(`  trying image: ${imageUrl}`);
        try {
          const result = await reconstructFromImage(problem, imageUrl, expected.nodes, expected.edges);
          attempts.push({ imageUrl, result });
          if (result.accepted) {
            accepted = { imageUrl, result };
            break;
          }
        } catch (error) {
          attempts.push({ imageUrl, result: { accepted: false, reason: error.message } });
        }
        
        // ARTIFICIAL THROTTLE: Free tiers (like OpenAI Tier 0) only allow 3 requests per minute!
        // Waiting 20 seconds between each image ensures we never exceed 3 RPM.
        console.log(`  (throttling 20s to respect strict free tier limits...)`);
        await sleep(20000);
      }

      if (!accepted) {
        const reasons = attempts.map((attempt) => `${attempt.imageUrl}: ${attempt.result.reason}`).join('\n');
        throw new Error(`No image produced a complete layout.\n${reasons}`);
      }

      layouts[problem.id] = {
        coordinates: accepted.result.coordinates,
        confidence: accepted.result.confidence,
        sourceImage: accepted.imageUrl,
        sourceUrl: problem.leetcodeUrl,
        capturedAt: new Date().toISOString(),
      };

      report.push(`- ${problem.id}: success (${expected.nodes.length}/${expected.nodes.length}, confidence ${accepted.result.confidence}, model ${activeModelName})`);
      console.log(`  success: confidence ${accepted.result.confidence} using ${activeModelName}`);
      await writeLayouts(layouts, report);
    } catch (error) {
      report.push(`- ${problem.id}: failed - ${error.message.replace(/\n/g, ' | ')}`);
      console.warn(`  failed: ${error.message}`);
      await writeLayouts(layouts, report);
    }

    if (i < selectedProblems.length - 1) {
      await sleep(delayMs);
    }
  }

  await writeLayouts(layouts, report);

  console.log(`\nWrote ${Object.keys(layouts).length} layouts to ${outputPath}`);
  console.log(`Wrote report to ${reportPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
