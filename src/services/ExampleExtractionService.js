import { parseAdjacencyList, parseEdgeList } from '../utils/graphInputParser';

function decodeHtmlEntities(str) {
  return str.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

function safeJsonParse(raw) {
  let cleaned = decodeHtmlEntities(raw);
  cleaned = cleaned.replace(/\bnull\b/gi, 'null').replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false');
  // Remove any trailing commas before ] or }
  cleaned = cleaned.replace(/,(\s*[\]}])/g, '$1');
  // Handle unquoted keys if any
  cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
  return JSON.parse(cleaned);
}

/**
 * Service to extract example test cases from problem descriptions and
 * route them to specialized parsers based on detected structure types.
 */
export class ExampleExtractionService {
  /**
   * Extract Java (or Python) code template from LeetCode problem HTML.
   * @param {string} htmlText - Raw HTML of the problem page.
   * @returns {{ code: string, language: string } | null}
   */
  static extractCodeTemplate(htmlText) {
    // Pattern 1: "codeDefinition":[{"text":"Java","defaultCode":"...",...}]
    const codeDefMatch = htmlText.match(/"codeDefinition"\s*:\s*\[([\s\S]*?)\](?:\s*,|\s*\}|\s*;)/);
    if (codeDefMatch) {
      try {
        const cleaned = decodeHtmlEntities(codeDefMatch[1]);
        // Try parsing as JSON array by wrapping in brackets
        const defs = JSON.parse(`[${cleaned}]`);
        const javaDef = defs.find(d => (d.text || '').toLowerCase() === 'java' || d.value === 'java');
        if (javaDef && javaDef.defaultCode) {
          return { code: javaDef.defaultCode, language: 'java' };
        }
      } catch (e) { /* fall through */ }
    }

    // Pattern 2: "defaultCode":"class Solution {..." embedded anywhere
    const defaultCodeMatch = htmlText.match(/"defaultCode"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (defaultCodeMatch) {
      let code = defaultCodeMatch[1].replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"');
      return { code, language: 'java' };
    }

    return null;
  }

  /**
   * Main entry point to extract and parse graph data from HTML.
   * @param {string} htmlText - The raw HTML of the problem page.
   * @param {string} [pageUrl] - Optional URL used to derive a fallback title.
   * @returns {Object} { nodes, edges, isDirected, isWeighted, type } or { isGridAnalysis, gridData, title, code?, language? }
   */
  static extractAndParse(htmlText, pageUrl) {
    // 0. Extract page title from HTML
    let title = this.extractTitle(htmlText);
    if (!title && pageUrl) title = this.titleFromUrl(pageUrl);

    // 0a. Extract code template from HTML
    const codeTemplate = this.extractCodeTemplate(htmlText);

    // 1. Extract raw example strings
    const rawInputs = this.extractInputs(htmlText);
    if (!rawInputs || rawInputs.length === 0) {
      throw new Error('No structural inputs found in URL.');
    }

    // 2. Detect and parse
    for (const inputStr of rawInputs) {
      const detectedType = this.detectStructureType(inputStr);
      try {
        if (detectedType === 'grid') {
          const grid = safeJsonParse(inputStr.value);
          if (!Array.isArray(grid) || grid.length === 0) throw new Error('Invalid grid data');
          return { isGridAnalysis: true, gridData: grid, title: title || 'Grid Problem', type: 'grid', ...(codeTemplate || {}) };
        }
        if (detectedType === 'array') {
          const arr = safeJsonParse(inputStr.value);
          if (!Array.isArray(arr) || arr.length === 0) throw new Error('Invalid array data');
          return {
            isArrayAnalysis: true,
            arrayData: {
              steps: [{ arr, msg: title || 'Array Problem' }],
              algorithmName: title || 'Array Problem',
              language: (codeTemplate?.language || 'java').toLowerCase(),
              javaCode: codeTemplate?.code || '',
              correctedCode: codeTemplate?.code || '',
            },
            title: title || 'Array Problem',
            ...(codeTemplate || {}),
          };
        }
        const parsedData = this.routeToParser(inputStr, detectedType);
        if (parsedData && parsedData.nodes.length > 0) {
          return { ...parsedData, title: title || 'Imported Graph', type: detectedType, ...(codeTemplate || {}) };
        }
      } catch (e) {
        // Continue to next extracted input if this one fails
        console.warn(`Failed to parse as ${detectedType}: ${inputStr.value?.substring(0, 80)}`, e.message);
      }
    }

    throw new Error('Failed to parse any valid structural data from extracted examples.');
  }

  /**
   * Extract problem title from HTML tags.
   */
  static extractTitle(htmlText) {
    // Try <title> tag (with or without attributes)
    const titleMatch = htmlText.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (titleMatch) return titleMatch[1].trim().replace(/ - LeetCode.*$/i, '').replace(/ \|.*$/i, '');
    // Try og:title meta tag (handle any attribute order)
    const ogTagMatch = htmlText.match(/<meta[^>]*property=["']og:title["'][^>]*>/i);
    if (ogTagMatch) {
      const contentMatch = ogTagMatch[0].match(/content=["']([^"']*)["']/i);
      if (contentMatch) return contentMatch[1].trim().replace(/ - LeetCode.*$/i, '').replace(/ \|.*$/i, '');
    }
    // Try h1 tag
    const h1Match = htmlText.match(/<h1[^>]*>([^<]*)<\/h1>/i);
    if (h1Match) return h1Match[1].trim();
    return null;
  }

  /**
   * Derive a human-readable title from a LeetCode/GFG URL.
   * e.g. "https://leetcode.com/problems/number-of-islands/" → "Number of Islands"
   */
  static titleFromUrl(url) {
    try {
      const path = new URL(url).pathname;
      const match = path.match(/\/problems\/([^/]+)/);
      if (!match) return null;
      return match[1]
        .replace(/-/g, ' ')
        .replace(/\//g, '')
        .replace(/\b\w/g, c => c.toUpperCase());
    } catch {
      return null;
    }
  }

  /**
   * Extract potential JSON arrays from standard problem descriptions.
   */
  static extractInputs(htmlText) {
    const inputs = [];
    const cleaned = decodeHtmlEntities(htmlText);
    
    // LeetCode / GFG standard formats: `edges = [[0,1]]`, `root = [1,null,2]`, `grid = [[0,1]]`
    // We look for anything that looks like an assignment to an array, or just raw arrays in <pre> tags.
    
    // Match named array assignments: `word = [...]`
    const assignmentRegex = /(?:adjList|adjacencyList|prerequisites|edges|adj|root|head|grid|matrix|graph|nums|arr|numbers|array|values|list|result|output)\s*=\s*(\[[\s\S]*?\])(?=<\/|\n(?!\s*\])|[a-zA-Z]+\s*=|$)/gi;
    let match;
    while ((match = assignmentRegex.exec(cleaned)) !== null) {
      const val = match[1].trim();
      if (val.startsWith('[[')) continue; // Skip 2D arrays — balanced bracket parser handles these
      inputs.push({ prefix: match[0].split('=')[0].trim().toLowerCase(), value: val });
    }

    // Extract raw 2D arrays (balanced bracket pairs starting with `[[`)
    let depth = 0, startIdx = -1;
    for (let i = 0; i < cleaned.length; i++) {
      const ch = cleaned[i];
      if (ch === '[') {
        if (depth === 0) startIdx = i;
        depth++;
      } else if (ch === ']') {
        if (depth > 0) depth--;
        if (depth === 0 && startIdx !== -1) {
          const val = cleaned.slice(startIdx, i + 1).trim();
          if (val.startsWith('[[') && !inputs.some(x => x.value === val)) {
            inputs.push({ prefix: 'unknown', value: val });
          }
          startIdx = -1;
        }
      }
    }

    // Match raw 1D arrays (often used for trees/linked lists)
    // Skip 1D arrays that are nested inside an already-captured 2D array (e.g. grid rows)
    const raw1DRegex = /\[[^\[\]]+\]/g;
    while ((match = raw1DRegex.exec(cleaned)) !== null) {
      const matchVal = match[0].trim();
      // Skip obvious false positives: single-letter content like [i], [j], [0] (unless followed by more content)
      if (/^\[[a-z\d]\]$/i.test(matchVal) || matchVal.length < 4) continue;
      const isDuplicate = inputs.some(i => i.value === matchVal);
      const isNestedIn2D = inputs.some(i => i.value.includes(matchVal) && i.value.startsWith('['));
      if (!isDuplicate && !isNestedIn2D) {
        inputs.push({ prefix: 'unknown', value: matchVal });
      }
    }

    return inputs;
  }

  /**
   * Detect the structural type based on the variable name and array shape.
   */
  static detectStructureType({ prefix, value }) {
    if (prefix.includes('prerequisites')) return 'edge_list';
    if (prefix.includes('edge')) return 'edge_list';
    if (prefix.includes('adj') || prefix.includes('graph')) return 'adjacency_list';
    if (prefix.includes('root') || prefix.includes('tree')) return 'tree';
    if (prefix.includes('head') || prefix.includes('list')) return 'linked_list';
    if (prefix.includes('grid') || prefix.includes('matrix') || prefix.includes('board')) return 'grid';
    if (prefix.includes('nums') || prefix.includes('arr') || prefix.includes('numbers') || prefix.includes('array') || prefix.includes('values') || prefix.includes('list') || prefix.includes('result') || prefix.includes('output')) return 'array';

    // If prefix is unknown, guess based on JSON structure
    try {
      const parsed = safeJsonParse(value);
      
      if (!Array.isArray(parsed)) return 'unknown';

      if (parsed.length > 0 && Array.isArray(parsed[0])) {
        // It's a 2D array
        // Check for grid-like shape first: rectangular + small non-negative values
        if (parsed.every(arr => arr.length === parsed[0].length) &&
            parsed.flat().every(v => typeof v === 'number' && v >= 0 && v <= 2)) {
          return 'grid';
        }
        if (parsed.every(arr => arr.length === 2 || arr.length === 3)) {
          // If every sub-array has length 2 or 3, heavily implies edge list
          // Unless max value is very small, but edge list is safer default.
          const maxVal = Math.max(...parsed.flat().filter(x => typeof x === 'number'));
          if (maxVal >= parsed.length * 2) return 'edge_list';
          // Fallback guess
          return 'adjacency_list';
        }
        return 'grid'; // Irregular 2D array or all rows same length > 3
      } else {
        // 1D array
        if (value.includes('null')) return 'tree'; // LeetCode uses null in trees
        // Numeric or string 1D arrays are likely algorithm test cases, not linked lists
        if (parsed.every(v => typeof v === 'number' || typeof v === 'string')) return 'array';
        return 'linked_list';
      }
    } catch (e) {
      return 'unknown';
    }
  }

  /**
   * Route the raw string to the appropriate parser.
   */
  static routeToParser({ value }, type) {
    // For now, we reuse existing parsers for graph types.
    // In a complete implementation, we would add parseTree, parseGrid, parseLinkedList.
    
    if (type === 'edge_list') {
      return parseEdgeList(value);
    }
    
    if (type === 'adjacency_list') {
      return parseAdjacencyList(value);
    }

    if (type === 'tree') {
      return this.parseLeetCodeTree(value);
    }

    if (type === 'linked_list') {
      return this.parseLinkedList(value);
    }

    if (type === 'grid') {
      throw new Error('Grid type is handled in extractAndParse');
    }

    throw new Error(`Unsupported structure type detected: ${type}`);
  }

  /**
   * Specialized parser for LeetCode Level-Order Tree format: [1,null,2,3]
   */
  static parseLeetCodeTree(text) {
    const arr = safeJsonParse(text);
    if (!Array.isArray(arr) || arr.length === 0) throw new Error("Invalid tree array");

    const nodes = [];
    const edges = [];
    
    if (arr[0] === null) return { nodes, edges, isDirected: true, isWeighted: false };

    // Create root node
    nodes.push({
      id: '0',
      type: 'custom',
      position: { x: 0, y: 0 },
      data: { label: String(arr[0]), status: 'default' }
    });

    const queue = [0]; // stores indices of the nodes array (and logical ID)
    let i = 1; // pointer in the input array

    while (queue.length > 0 && i < arr.length) {
      const currId = queue.shift();

      // Left child
      if (i < arr.length && arr[i] !== null) {
        const leftId = String(i);
        nodes.push({
          id: leftId,
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { label: String(arr[i]), status: 'default' }
        });
        edges.push({
          id: `e${currId}-${leftId}`,
          type: 'custom',
          source: String(currId),
          target: leftId,
          data: { status: 'default' }
        });
        queue.push(i);
      }
      i++;

      // Right child
      if (i < arr.length && arr[i] !== null) {
        const rightId = String(i);
        nodes.push({
          id: rightId,
          type: 'custom',
          position: { x: 0, y: 0 },
          data: { label: String(arr[i]), status: 'default' }
        });
        edges.push({
          id: `e${currId}-${rightId}`,
          type: 'custom',
          source: String(currId),
          target: rightId,
          data: { status: 'default' }
        });
        queue.push(i);
      }
      i++;
    }

    return { nodes, edges, isDirected: true, isWeighted: false };
  }

  /**
   * Specialized parser for Linked Lists: [1,2,3,4]
   */
  static parseLinkedList(text) {
    const arr = safeJsonParse(text);
    if (!Array.isArray(arr) || arr.length === 0) throw new Error("Invalid list array");

    const nodes = arr.map((val, i) => ({
      id: String(i),
      type: 'custom',
      position: { x: i * 100, y: 0 },
      data: { label: String(val), status: 'default' }
    }));

    const edges = [];
    for (let i = 0; i < arr.length - 1; i++) {
      edges.push({
        id: `e${i}-${i+1}`,
        type: 'custom',
        source: String(i),
        target: String(i + 1),
        data: { status: 'default' }
      });
    }

    return { nodes, edges, isDirected: true, isWeighted: false };
  }
}
