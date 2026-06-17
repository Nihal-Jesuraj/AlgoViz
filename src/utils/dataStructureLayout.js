export function calculateTreeLayout(treeNode) {
  const nodes = [];
  const edges = [];
  
  const processNode = (node, x, y, level, parentId) => {
    if (!node) return;
    const spacing = Math.max(50, 200 - level * 40);
    const verticalSpacing = 90;

    nodes.push({
      id: node.id,
      type: 'custom',
      position: { x, y },
      data: { label: node.value, status: 'default' },
    });

    if (parentId) {
      edges.push({
        id: `e-${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        type: 'custom',
        data: { status: 'default' }
      });
    }

    if (node.left) processNode(node.left, x - spacing, y + verticalSpacing, level + 1, node.id);
    if (node.right) processNode(node.right, x + spacing, y + verticalSpacing, level + 1, node.id);
  };

  processNode(treeNode, 400, 100, 0, null);
  return { nodes, edges };
}

export function calculateLinkedListLayout(listState) {
  const nodes = [];
  const edges = [];
  let currentId = listState.head;
  let x = 100;
  const visited = new Set();
  
  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const node = listState.nodes.get(currentId);
    if (!node) break;
    
    nodes.push({
      id: node.id,
      type: 'custom',
      position: { x, y: 200 },
      data: { label: node.value, status: 'default' },
    });

    if (node.next) {
      edges.push({
        id: `e-${node.id}-${node.next}`,
        source: node.id,
        target: node.next,
        type: 'custom',
        data: { status: 'default' },
        markerEnd: 'url(#arrow-default)',
      });
    }
    
    currentId = node.next;
    x += 140;
  }
  return { nodes, edges };
}
