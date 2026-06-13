import dagre from 'dagre';
import * as d3Force from 'd3-force';

export function determineLayout(nodes, edges, isDirected = false) {
  if (!nodes || nodes.length === 0) return 'force';
  if (nodes.length <= 2) return 'force';

  // Calculate degrees
  const inDegree = {};
  const outDegree = {};
  const degree = {};
  
  nodes.forEach(n => {
    inDegree[n.id] = 0;
    outDegree[n.id] = 0;
    degree[n.id] = 0;
  });

  edges.forEach(e => {
    outDegree[e.source] = (outDegree[e.source] || 0) + 1;
    inDegree[e.target] = (inDegree[e.target] || 0) + 1;
    degree[e.source] = (degree[e.source] || 0) + 1;
    degree[e.target] = (degree[e.target] || 0) + 1;
  });

  // Check for exact cycle (Ring)
  let isCycle = true;
  for (const id in degree) {
    if (degree[id] !== 2 && (inDegree[id] !== 1 || outDegree[id] !== 1)) {
      isCycle = false;
      break;
    }
  }
  // To be a true cycle, edges === nodes
  if (isCycle && edges.length === nodes.length) {
    return 'circular';
  }

  // Check for Tree (Connected, Acyclic, Edges = Nodes - 1)
  // For directed trees, max in-degree is 1, and there is exactly one root with in-degree 0
  let isTree = false;
  if (edges.length === nodes.length - 1) {
    if (isDirected) {
      let rootCount = 0;
      let maxInDegree = 0;
      for (const id in inDegree) {
        if (inDegree[id] === 0) rootCount++;
        if (inDegree[id] > maxInDegree) maxInDegree = inDegree[id];
      }
      if (rootCount === 1 && maxInDegree <= 1) isTree = true;
    } else {
      // Undirected trees are just connected acyclic graphs (E = V - 1). 
      // Assuming connected if E=V-1.
      isTree = true;
    }
  }

  if (isTree) {
    return 'dagre';
  }

  // Fallback to force simulation for complex graphs
  return 'force';
}

function applyDagreLayout(nodes, edges, direction = 'TB') {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 100,
    ranksep: 120,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 52, height: 52 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 26,
        y: nodeWithPosition.y - 26,
      },
    };
  });
}

function applyCircularLayout(nodes, edges) {
  const radius = Math.max(100, nodes.length * 20);
  const centerX = 300;
  const centerY = 300;

  return nodes.map((node, index) => {
    const angle = (index / nodes.length) * 2 * Math.PI - Math.PI / 2; // Start at top
    return {
      ...node,
      position: {
        x: centerX + radius * Math.cos(angle) - 26,
        y: centerY + radius * Math.sin(angle) - 26,
      },
    };
  });
}

function applyForceLayout(nodes, edges) {
  // We need to map nodes and edges to d3-force's expected format
  const simNodes = nodes.map(n => ({ id: n.id, x: 0, y: 0 }));
  const simEdges = edges.map(e => ({ source: e.source, target: e.target }));

  const simulation = d3Force.forceSimulation(simNodes)
    .force('charge', d3Force.forceManyBody().strength(-800)) // Repel each other strongly
    .force('link', d3Force.forceLink(simEdges).id(d => d.id).distance(150)) // Keep edges uniform
    .force('center', d3Force.forceCenter(400, 300)) // Center the graph
    .force('collide', d3Force.forceCollide().radius(60).iterations(2)) // Prevent overlap, nodes are ~52px wide
    .stop();

  // Run simulation statically for 300 ticks to reach equilibrium
  for (let i = 0; i < 300; i++) {
    simulation.tick();
  }

  // Map results back
  const layoutedNodes = nodes.map((node, i) => {
    return {
      ...node,
      position: {
        x: simNodes[i].x - 26,
        y: simNodes[i].y - 26,
      },
    };
  });

  return layoutedNodes;
}

export function getLayoutedElements(nodes, edges, direction = 'TB', isDirected = false) {
  if (!nodes || nodes.length === 0) return nodes;

  const layoutType = determineLayout(nodes, edges, isDirected);

  switch (layoutType) {
    case 'dagre':
      return applyDagreLayout(nodes, edges, direction);
    case 'circular':
      return applyCircularLayout(nodes, edges);
    case 'force':
    default:
      return applyForceLayout(nodes, edges);
  }
}
