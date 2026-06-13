export function circularLayout(count, centerX = 300, centerY = 180, radius = 160) {
  const positions = [];
  for (let i = 0; i < count; i++) {
    const angle = (i * 2 * Math.PI) / count - Math.PI / 2; // Start at top
    positions.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    });
  }
  return positions;
}

export function parseAdjacencyList(text) {
  try {
    const adj = JSON.parse(text);
    if (!Array.isArray(adj)) throw new Error('Input must be an array');
    
    const nodeCount = adj.length;
    const positions = circularLayout(nodeCount);
    
    const nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        id: String(i),
        type: 'custom',
        position: positions[i],
        data: { label: String(i), status: 'default' },
      });
    }

    const edges = [];
    let isWeighted = false;
    let isDirected = true; // Assume directed initially, we might not know

    for (let u = 0; u < adj.length; u++) {
      const neighbors = adj[u];
      if (!Array.isArray(neighbors)) continue;

      for (const v of neighbors) {
        let target = String(v);
        let weight = null;

        if (Array.isArray(v) && v.length === 2) {
          target = String(v[0]);
          weight = v[1];
          isWeighted = true;
        }

        const edgeId = `e${u}-${target}`;
        edges.push({
          id: edgeId,
          type: 'custom',
          source: String(u),
          target,
          data: weight !== null ? { weight, status: 'default' } : { status: 'default' },
        });
      }
    }

    // Detect if graph is fully undirected (every edge has a reverse edge)
    const edgeSet = new Set(edges.map(e => `${e.source}-${e.target}-${e.data?.weight ?? ''}`));
    let isUndirected = edges.length > 0;
    
    for (const e of edges) {
      const reverseKey = `${e.target}-${e.source}-${e.data?.weight ?? ''}`;
      if (!edgeSet.has(reverseKey)) {
        isUndirected = false;
        break;
      }
    }

    // If undirected, remove duplicate reverse edges
    let finalEdges = edges;
    if (isUndirected) {
      isDirected = false;
      const seen = new Set();
      finalEdges = [];
      for (const e of edges) {
        const key1 = `${e.source}-${e.target}`;
        const key2 = `${e.target}-${e.source}`;
        if (!seen.has(key1) && !seen.has(key2)) {
          finalEdges.push(e);
          seen.add(key1);
        }
      }
    }

    return { nodes, edges: finalEdges, isWeighted, isDirected };
  } catch (e) {
    throw new Error('Invalid adjacency list format: ' + e.message);
  }
}

export function parseEdgeList(text) {
  try {
    const list = JSON.parse(text);
    if (!Array.isArray(list)) throw new Error('Input must be an array of edges');

    const nodeSet = new Set();
    let isWeighted = false;

    list.forEach(edge => {
      if (!Array.isArray(edge) || edge.length < 2) return;
      nodeSet.add(String(edge[0]));
      nodeSet.add(String(edge[1]));
      if (edge.length >= 3) isWeighted = true;
    });

    const nodeArray = Array.from(nodeSet).sort((a, b) => parseInt(a) - parseInt(b));
    const positions = circularLayout(nodeArray.length);
    
    const nodes = nodeArray.map((id, index) => ({
      id,
      type: 'custom',
      position: positions[index],
      data: { label: id, status: 'default' },
    }));

    const edges = list.map(edge => {
      if (!Array.isArray(edge) || edge.length < 2) return null;
      const source = String(edge[0]);
      const target = String(edge[1]);
      const weight = edge.length >= 3 ? edge[2] : null;
      
      return {
        id: `e${source}-${target}`,
        type: 'custom',
        source,
        target,
        data: weight !== null ? { weight, status: 'default' } : { status: 'default' },
      };
    }).filter(Boolean);

    return { nodes, edges, isWeighted, isDirected: false }; // Assume undirected for edge list, users can toggle
  } catch (e) {
    throw new Error('Invalid edge list format: ' + e.message);
  }
}

export function parseLeetCodeFormat(text) {
  const cleanText = text.trim();
  
  if (cleanText.includes('n =') || cleanText.includes('edges =')) {
    const edgesMatch = cleanText.match(/edges\s*=\s*(\[.*\])/s);
    if (edgesMatch) {
      return parseEdgeList(edgesMatch[1]);
    }
  }

  try {
    const parsed = JSON.parse(cleanText);
    if (Array.isArray(parsed) && parsed.length > 0) {
      if (Array.isArray(parsed[0]) && parsed[0].length >= 2 && !Array.isArray(parsed[0][0])) {
        // Looks like an edge list [[0,1], [1,2]]
        const maxVal = Math.max(...parsed.flat().filter(x => typeof x === 'number'));
        if (maxVal >= parsed.length * 2) {
             return parseEdgeList(cleanText);
        }
        // Could be adjacency list or edge list, let's try edge list first if it has 2-3 elements per sub-array consistently
        if (parsed.every(arr => arr.length === 2 || arr.length === 3)) {
            return parseEdgeList(cleanText);
        }
      }
      // Fallback to adjacency list
      return parseAdjacencyList(cleanText);
    }
  } catch (e) {
      // Ignore JSON parse error, will throw generic below
  }

  throw new Error('Could not auto-detect format. Please use a valid JSON array.');
}

export function generateRandomGraph(options = {}) {
  const { nodeCount = 5, edgeDensity = 0.5, isDirected = false, isWeighted = false, minWeight = 1, maxWeight = 10 } = options;
  
  const positions = circularLayout(nodeCount);
  const nodes = [];
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      id: String(i),
      type: 'custom',
      position: positions[i],
      data: { label: String(i), status: 'default' },
    });
  }

  const edges = [];
  const edgeSet = new Set();
  
  // Create spanning tree to ensure connectedness
  for (let i = 1; i < nodeCount; i++) {
    const target = String(i);
    const source = String(Math.floor(Math.random() * i));
    
    let weight = null;
    if (isWeighted) {
      weight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight;
    }

    edges.push({
      id: `e${source}-${target}`,
      type: 'custom',
      source,
      target,
      data: weight !== null ? { weight, status: 'default' } : { status: 'default' },
    });
    edgeSet.add(`${source}-${target}`);
    if (!isDirected) edgeSet.add(`${target}-${source}`);
  }

  // Add random edges based on density
  const maxEdges = isDirected ? nodeCount * (nodeCount - 1) : (nodeCount * (nodeCount - 1)) / 2;
  const targetEdges = Math.floor(maxEdges * edgeDensity);
  
  let attempts = 0;
  while (edges.length < targetEdges && attempts < maxEdges * 2) {
    attempts++;
    const u = Math.floor(Math.random() * nodeCount);
    const v = Math.floor(Math.random() * nodeCount);
    
    if (u === v) continue;
    
    const key = `${u}-${v}`;
    if (!edgeSet.has(key)) {
      let weight = null;
      if (isWeighted) {
        weight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight;
      }
      
      edges.push({
        id: `e${u}-${v}`,
        type: 'custom',
        source: String(u),
        target: String(v),
        data: weight !== null ? { weight, status: 'default' } : { status: 'default' },
      });
      
      edgeSet.add(key);
      if (!isDirected) edgeSet.add(`${v}-${u}`);
    }
  }

  return { nodes, edges, isDirected, isWeighted, startNode: '0' };
}

export function toAdjacencyListString(nodes, edges, isDirected = false) {
  const adj = {};
  nodes.forEach(n => adj[n.id] = []);
  
  const isWeighted = edges.some(e => e.data?.weight !== undefined && e.data?.weight !== null);
  
  edges.forEach(e => {
    if (isWeighted) {
      adj[e.source].push(`[${e.target}, ${e.data?.weight || 1}]`);
      if (!isDirected) {
        adj[e.target].push(`[${e.source}, ${e.data?.weight || 1}]`);
      }
    } else {
      adj[e.source].push(e.target);
      if (!isDirected) {
        adj[e.target].push(e.source);
      }
    }
  });

  let result = '[\n';
  nodes.forEach((n, i) => {
    result += `  [${adj[n.id].join(', ')}]${i < nodes.length - 1 ? ',' : ''} // node ${n.id}\n`;
  });
  result += ']';
  
  return result;
}
