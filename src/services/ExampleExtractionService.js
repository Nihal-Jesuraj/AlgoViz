import { parseAdjacencyList, parseEdgeList } from '../utils/graphInputParser';

/**
 * Service to extract example test cases from problem descriptions and
 * route them to specialized parsers based on detected structure types.
 */
export class ExampleExtractionService {
  /**
   * Main entry point to extract and parse graph data from HTML.
   * @param {string} htmlText - The raw HTML of the problem page.
   * @returns {Object} { nodes, edges, isDirected, isWeighted, type }
   */
  static extractAndParse(htmlText) {
    // 1. Extract raw example strings
    const rawInputs = this.extractInputs(htmlText);
    if (!rawInputs || rawInputs.length === 0) {
      throw new Error('No structural inputs found in URL.');
    }

    // 2. Detect and parse
    for (const inputStr of rawInputs) {
      const detectedType = this.detectStructureType(inputStr);
      try {
        const parsedData = this.routeToParser(inputStr, detectedType);
        if (parsedData && parsedData.nodes.length > 0) {
          return { ...parsedData, type: detectedType };
        }
      } catch (e) {
        // Continue to next extracted input if this one fails
        console.warn(`Failed to parse as ${detectedType}: ${inputStr}`, e);
      }
    }

    throw new Error('Failed to parse any valid structural data from extracted examples.');
  }

  /**
   * Extract potential JSON arrays from standard problem descriptions.
   */
  static extractInputs(htmlText) {
    const inputs = [];
    
    // LeetCode / GFG standard formats: `edges = [[0,1]]`, `root = [1,null,2]`, `grid = [[0,1]]`
    // We look for anything that looks like an assignment to an array, or just raw arrays in <pre> tags.
    
    // Match named array assignments: `word = [...]`
    const assignmentRegex = /(?:edges|adj|root|head|grid|matrix|graph)\s*=\s*(\[[\s\S]*?\])(?=<\/|\\n|[a-zA-Z]+\s*=|$)/gi;
    let match;
    while ((match = assignmentRegex.exec(htmlText)) !== null) {
      inputs.push({ prefix: match[0].split('=')[0].trim().toLowerCase(), value: match[1].trim() });
    }

    // Match raw 2D arrays (often used for graphs/matrices)
    const raw2DRegex = /\[\s*\[[\s\S]*?\]\s*\]/g;
    while ((match = raw2DRegex.exec(htmlText)) !== null) {
      // Avoid pushing duplicates
      if (!inputs.some(i => i.value === match[0].trim())) {
        inputs.push({ prefix: 'unknown', value: match[0].trim() });
      }
    }

    // Match raw 1D arrays (often used for trees/linked lists)
    const raw1DRegex = /\[[\d\s,nulla-zA-Z"'-]+\]/g;
    while ((match = raw1DRegex.exec(htmlText)) !== null) {
      if (!inputs.some(i => i.value === match[0].trim())) {
        inputs.push({ prefix: 'unknown', value: match[0].trim() });
      }
    }

    return inputs;
  }

  /**
   * Detect the structural type based on the variable name and array shape.
   */
  static detectStructureType({ prefix, value }) {
    if (prefix.includes('edge')) return 'edge_list';
    if (prefix.includes('adj') || prefix.includes('graph')) return 'adjacency_list';
    if (prefix.includes('root') || prefix.includes('tree')) return 'tree';
    if (prefix.includes('head') || prefix.includes('list')) return 'linked_list';
    if (prefix.includes('grid') || prefix.includes('matrix') || prefix.includes('board')) return 'grid';

    // If prefix is unknown, guess based on JSON structure
    try {
      // Fix LeetCode `null` without quotes if parsing fails
      const safeJson = value.replace(/null/g, 'null');
      const parsed = JSON.parse(safeJson);
      
      if (!Array.isArray(parsed)) return 'unknown';

      if (parsed.length > 0 && Array.isArray(parsed[0])) {
        // It's a 2D array
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
        return 'linked_list'; // Default 1D to linked list
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
      // Fallback for grids (just parse as edge list if it happens to be valid, otherwise throw)
      return parseAdjacencyList(value);
    }

    throw new Error(`Unsupported structure type detected: ${type}`);
  }

  /**
   * Specialized parser for LeetCode Level-Order Tree format: [1,null,2,3]
   */
  static parseLeetCodeTree(text) {
    const arr = JSON.parse(text);
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
    const arr = JSON.parse(text);
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
