import { circularLayout } from '../utils/graphInputParser';

export function binaryTree(depth = 3) {
  const nodeCount = Math.pow(2, depth) - 1;
  const nodes = [];
  const edges = [];
  
  const width = 600;
  const startY = 50;
  const levelHeight = 80;

  for (let i = 0; i < nodeCount; i++) {
    const level = Math.floor(Math.log2(i + 1));
    const levelNodes = Math.pow(2, level);
    const posInLevel = i - (levelNodes - 1);
    
    const spacing = width / levelNodes;
    const x = (spacing / 2) + (posInLevel * spacing) - (width / 2) + 300;
    const y = startY + (level * levelHeight);

    nodes.push({
      id: String(i),
      type: 'custom',
      position: { x, y },
      data: { label: String(i), status: 'default' },
    });

    if (i > 0) {
      const parentId = Math.floor((i - 1) / 2);
      edges.push({
        id: `e${parentId}-${i}`,
        type: 'custom',
        source: String(parentId),
        target: String(i),
        data: { status: 'default' },
      });
    }
  }

  return { nodes, edges, directed: false, weighted: false, startNode: '0' };
}

export function completeGraph(n = 5) {
  const positions = circularLayout(n);
  const nodes = [];
  const edges = [];

  for (let i = 0; i < n; i++) {
    nodes.push({
      id: String(i),
      type: 'custom',
      position: positions[i],
      data: { label: String(i), status: 'default' },
    });

    for (let j = i + 1; j < n; j++) {
      edges.push({
        id: `e${i}-${j}`,
        type: 'custom',
        source: String(i),
        target: String(j),
        data: { status: 'default' },
      });
    }
  }

  return { nodes, edges, directed: false, weighted: false, startNode: '0' };
}

export function gridGraph(rows = 3, cols = 3) {
  const nodes = [];
  const edges = [];
  
  const cellWidth = 100;
  const cellHeight = 100;
  const startX = 300 - ((cols - 1) * cellWidth) / 2;
  const startY = 50;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = String(r * cols + c);
      nodes.push({
        id,
        type: 'custom',
        position: { x: startX + c * cellWidth, y: startY + r * cellHeight },
        data: { label: id, status: 'default' },
      });

      // Right neighbor
      if (c < cols - 1) {
        edges.push({
          id: `e${id}-${r * cols + c + 1}`,
          type: 'custom',
          source: id,
          target: String(r * cols + c + 1),
          data: { status: 'default' },
        });
      }
      // Bottom neighbor
      if (r < rows - 1) {
        edges.push({
          id: `e${id}-${(r + 1) * cols + c}`,
          type: 'custom',
          source: id,
          target: String((r + 1) * cols + c),
          data: { status: 'default' },
        });
      }
    }
  }

  return { nodes, edges, directed: false, weighted: false, startNode: '0' };
}

export function dagGraph(n = 6) {
  const positions = circularLayout(n);
  const nodes = [];
  const edges = [];

  for (let i = 0; i < n; i++) {
    nodes.push({
      id: String(i),
      type: 'custom',
      position: positions[i],
      data: { label: String(i), status: 'default' },
    });
  }

  // To ensure DAG, only add edges from lower id to higher id
  for (let i = 0; i < n; i++) {
    const numEdges = Math.floor(Math.random() * 2) + 1; // 1-2 edges per node
    for (let e = 0; e < numEdges; e++) {
      if (i < n - 1) {
        const j = i + 1 + Math.floor(Math.random() * (n - 1 - i));
        if (!edges.some(edge => edge.source === String(i) && edge.target === String(j))) {
           edges.push({
             id: `e${i}-${j}`,
             type: 'custom',
             source: String(i),
             target: String(j),
             data: { status: 'default' },
           });
        }
      }
    }
  }

  // Ensure connectivity
  for (let i = 1; i < n; i++) {
     if (!edges.some(edge => edge.target === String(i))) {
         const parent = String(Math.floor(Math.random() * i));
         edges.push({
             id: `e${parent}-${i}`,
             type: 'custom',
             source: parent,
             target: String(i),
             data: { status: 'default' },
         });
     }
  }

  return { nodes, edges, directed: true, weighted: false, startNode: '0' };
}

export function cycleGraph(n = 6) {
  const positions = circularLayout(n);
  const nodes = [];
  const edges = [];

  for (let i = 0; i < n; i++) {
    nodes.push({
      id: String(i),
      type: 'custom',
      position: positions[i],
      data: { label: String(i), status: 'default' },
    });

    const next = (i + 1) % n;
    edges.push({
      id: `e${i}-${next}`,
      type: 'custom',
      source: String(i),
      target: String(next),
      data: { status: 'default' },
    });
  }

  return { nodes, edges, directed: false, weighted: false, startNode: '0' };
}

export function starGraph(n = 7) {
  const nodes = [];
  const edges = [];

  // Center node
  nodes.push({
    id: '0',
    type: 'custom',
    position: { x: 300, y: 180 },
    data: { label: '0', status: 'default' },
  });

  const positions = circularLayout(n - 1, 300, 180, 120);

  for (let i = 1; i < n; i++) {
    nodes.push({
      id: String(i),
      type: 'custom',
      position: positions[i - 1],
      data: { label: String(i), status: 'default' },
    });

    edges.push({
      id: `e0-${i}`,
      type: 'custom',
      source: '0',
      target: String(i),
      data: { status: 'default' },
    });
  }

  return { nodes, edges, directed: false, weighted: false, startNode: '0' };
}
