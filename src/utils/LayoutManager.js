import dagre from 'dagre';
import * as d3Force from 'd3-force';

const NODE_SIZE = 52;
const NODE_RADIUS = NODE_SIZE / 2;
const DEFAULT_CENTER = { x: 420, y: 300 };

function getSortedNodes(nodes) {
  return [...nodes].sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true }));
}

function buildUndirectedAdjacency(nodes, edges) {
  const adjacency = new Map(nodes.map((node) => [node.id, new Set()]));
  edges.forEach((edge) => {
    if (!adjacency.has(edge.source) || !adjacency.has(edge.target)) return;
    adjacency.get(edge.source).add(edge.target);
    adjacency.get(edge.target).add(edge.source);
  });
  return adjacency;
}

function getConnectedComponents(nodes, edges) {
  const adjacency = buildUndirectedAdjacency(nodes, edges);
  const visited = new Set();
  const components = [];

  getSortedNodes(nodes).forEach((node) => {
    if (visited.has(node.id)) return;
    const queue = [node.id];
    const ids = [];
    visited.add(node.id);

    while (queue.length > 0) {
      const id = queue.shift();
      ids.push(id);
      adjacency.get(id)?.forEach((next) => {
        if (!visited.has(next)) {
          visited.add(next);
          queue.push(next);
        }
      });
    }

    components.push(ids);
  });

  return components;
}

function isConnected(nodes, edges) {
  if (nodes.length <= 1) return true;
  return getConnectedComponents(nodes, edges).length === 1;
}

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

  const connected = isConnected(nodes, edges);
  const sortedDegrees = Object.values(degree).sort((a, b) => b - a);

  // Star graphs read best with the hub in the middle.
  if (connected && sortedDegrees[0] === nodes.length - 1 && sortedDegrees.slice(1).every(d => d === 1)) {
    return 'radial';
  }

  // Check for exact cycle (Ring)
  let isCycle = true;
  for (const id in degree) {
    if (degree[id] !== 2 && (inDegree[id] !== 1 || outDegree[id] !== 1)) {
      isCycle = false;
      break;
    }
  }
  // To be a true cycle, edges === nodes
  if (connected && isCycle && edges.length === nodes.length) {
    return 'circular';
  }

  // Check for Tree (Connected, Acyclic, Edges = Nodes - 1)
  // For directed trees, max in-degree is 1, and there is exactly one root with in-degree 0
  let isTree = false;
  if (connected && edges.length === nodes.length - 1) {
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

  if (isDirected) {
    return 'dagre';
  }

  if (!connected) {
    return 'components';
  }

  // Fallback to force simulation for complex graphs
  return 'force';
}

function applyDagreLayout(nodes, edges, direction = 'TB') {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 96,
    ranksep: 112,
    marginx: 32,
    marginy: 32,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_SIZE, height: NODE_SIZE });
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
        x: nodeWithPosition.x - NODE_RADIUS,
        y: nodeWithPosition.y - NODE_RADIUS,
      },
    };
  });
}

function applyCircularLayout(nodes, center = DEFAULT_CENTER) {
  const radius = Math.max(120, nodes.length * 24);
  const orderedNodes = getSortedNodes(nodes);

  return orderedNodes.map((node, index) => {
    const angle = (index / nodes.length) * 2 * Math.PI - Math.PI / 2; // Start at top
    return {
      ...node,
      position: {
        x: center.x + radius * Math.cos(angle) - NODE_RADIUS,
        y: center.y + radius * Math.sin(angle) - NODE_RADIUS,
      },
    };
  });
}

function applyRadialLayout(nodes, edges) {
  const degree = new Map(nodes.map((node) => [node.id, 0]));
  edges.forEach((edge) => {
    degree.set(edge.source, (degree.get(edge.source) || 0) + 1);
    degree.set(edge.target, (degree.get(edge.target) || 0) + 1);
  });

  const hub = getSortedNodes(nodes).sort((a, b) => (degree.get(b.id) || 0) - (degree.get(a.id) || 0))[0];
  const leaves = getSortedNodes(nodes).filter((node) => node.id !== hub.id);
  const radius = Math.max(145, leaves.length * 22);

  return [
    {
      ...hub,
      position: { x: DEFAULT_CENTER.x - NODE_RADIUS, y: DEFAULT_CENTER.y - NODE_RADIUS },
    },
    ...leaves.map((node, index) => {
      const angle = (index / leaves.length) * 2 * Math.PI - Math.PI / 2;
      return {
        ...node,
        position: {
          x: DEFAULT_CENTER.x + radius * Math.cos(angle) - NODE_RADIUS,
          y: DEFAULT_CENTER.y + radius * Math.sin(angle) - NODE_RADIUS,
        },
      };
    }),
  ];
}

function applyForceLayout(nodes, edges) {
  // We need to map nodes and edges to d3-force's expected format
  const simNodes = getSortedNodes(nodes).map((n, index) => ({
    id: n.id,
    x: DEFAULT_CENTER.x + Math.cos(index) * 40,
    y: DEFAULT_CENTER.y + Math.sin(index) * 40,
  }));
  const simEdges = edges.map(e => ({ source: e.source, target: e.target }));

  const simulation = d3Force.forceSimulation(simNodes)
    .force('charge', d3Force.forceManyBody().strength(-650))
    .force('link', d3Force.forceLink(simEdges).id(d => d.id).distance(155).strength(0.55))
    .force('center', d3Force.forceCenter(DEFAULT_CENTER.x, DEFAULT_CENTER.y))
    .force('collide', d3Force.forceCollide().radius(68).iterations(3))
    .stop();

  // Run simulation statically for 300 ticks to reach equilibrium
  for (let i = 0; i < 300; i++) {
    simulation.tick();
  }

  // Map results back
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const layoutedNodes = simNodes.map((simNode) => {
    const node = nodeById.get(simNode.id);
    return {
      ...node,
      position: {
        x: simNode.x - NODE_RADIUS,
        y: simNode.y - NODE_RADIUS,
      },
    };
  });

  return layoutedNodes;
}

function applyComponentLayout(nodes, edges, isDirected) {
  const components = getConnectedComponents(nodes, edges);
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  let cursorX = 80;
  let cursorY = 80;
  let rowHeight = 0;

  return components.flatMap((componentIds) => {
    const componentNodes = componentIds.map((id) => nodeById.get(id)).filter(Boolean);
    const idSet = new Set(componentIds);
    const componentEdges = edges.filter((edge) => idSet.has(edge.source) && idSet.has(edge.target));
    const layoutType = determineLayout(componentNodes, componentEdges, isDirected);
    const layouted = layoutType === 'dagre'
      ? applyDagreLayout(componentNodes, componentEdges)
      : layoutType === 'circular'
        ? applyCircularLayout(componentNodes, { x: 0, y: 0 })
        : layoutType === 'radial'
          ? applyRadialLayout(componentNodes, componentEdges)
          : applyForceLayout(componentNodes, componentEdges);

    const bounds = layouted.reduce((acc, node) => ({
      minX: Math.min(acc.minX, node.position.x),
      minY: Math.min(acc.minY, node.position.y),
      maxX: Math.max(acc.maxX, node.position.x + NODE_SIZE),
      maxY: Math.max(acc.maxY, node.position.y + NODE_SIZE),
    }), { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });

    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    if (cursorX > 80 && cursorX + width > 900) {
      cursorX = 80;
      cursorY += rowHeight + 120;
      rowHeight = 0;
    }

    const positioned = layouted.map((node) => ({
      ...node,
      position: {
        x: node.position.x - bounds.minX + cursorX,
        y: node.position.y - bounds.minY + cursorY,
      },
    }));

    cursorX += width + 120;
    rowHeight = Math.max(rowHeight, height);
    return positioned;
  });
}

export function getLayoutedElements(nodes, edges, direction = 'TB', isDirected = false) {
  if (!nodes || nodes.length === 0) return nodes;

  const layoutType = determineLayout(nodes, edges, isDirected);

  switch (layoutType) {
    case 'dagre':
      return applyDagreLayout(nodes, edges, direction);
    case 'circular':
      return applyCircularLayout(nodes);
    case 'radial':
      return applyRadialLayout(nodes, edges);
    case 'components':
      return applyComponentLayout(nodes, edges, isDirected);
    case 'force':
    default:
      return applyForceLayout(nodes, edges);
  }
}
