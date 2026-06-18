import { useState, useCallback, useRef } from 'react';
import { useNodesState, useEdgesState, addEdge as rfAddEdge } from '@xyflow/react';

/**
 * useGraphEditor — Enhanced graph editor hook with interactive editing capabilities.
 *
 * Features:
 * - Editor modes: 'select', 'addNode', 'addEdge'
 * - Click-to-add-node on canvas
 * - Drag-to-connect nodes
 * - Edge weight editing
 * - Undo/redo history (50 snapshots max)
 * - Directed/undirected toggle
 * - Weighted/unweighted toggle
 * - Graph import/export
 */
const MAX_HISTORY = 50;

export function useGraphEditor(initialNodes = [], initialEdges = []) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Editor mode: 'select' | 'addNode' | 'addEdge' (Removed to support unified mode)

  // Graph type toggles
  const [isDirected, setIsDirected] = useState(false);
  const [isWeighted, setIsWeighted] = useState(false);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editingEdgeId, setEditingEdgeId] = useState(null);

  // Undo/redo history
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);
  const [, forceRender] = useState(0);

  // Counter for auto-incrementing node IDs
  const nextIdRef = useRef(0);

  // Initialize next ID from existing nodes
  const computeNextId = useCallback((currentNodes) => {
    const maxId = currentNodes.reduce((max, n) => {
      const num = parseInt(n.id, 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, -1);
    nextIdRef.current = maxId + 1;
  }, []);

  // ── History Management ──

  const pushHistory = useCallback(() => {
    const snapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };

    // Truncate any future history after current index
    const idx = historyIndexRef.current;
    historyRef.current = historyRef.current.slice(0, idx + 1);
    historyRef.current.push(snapshot);

    // Cap at MAX_HISTORY
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift();
    } else {
      historyIndexRef.current = historyRef.current.length - 1;
    }
  }, [nodes, edges]);

  const undo = useCallback(() => {
    const idx = historyIndexRef.current;
    if (idx <= 0) return;

    historyIndexRef.current = idx - 1;
    const snapshot = historyRef.current[historyIndexRef.current];
    if (snapshot) {
      setNodes(snapshot.nodes.map(n => ({ ...n })));
      setEdges(snapshot.edges.map(e => ({ ...e })));
      forceRender(v => v + 1);
    }
  }, [setNodes, setEdges]);

  const redo = useCallback(() => {
    const idx = historyIndexRef.current;
    if (idx >= historyRef.current.length - 1) return;

    historyIndexRef.current = idx + 1;
    const snapshot = historyRef.current[historyIndexRef.current];
    if (snapshot) {
      setNodes(snapshot.nodes.map(n => ({ ...n })));
      setEdges(snapshot.edges.map(e => ({ ...e })));
      forceRender(v => v + 1);
    }
  }, [setNodes, setEdges]);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  // ── Connection Handler ──

  const onConnect = useCallback(
    (connection) => {
      pushHistory();
      const newEdge = {
        ...connection,
        id: `e${connection.source}-${connection.target}`,
        type: 'custom',
        data: isWeighted ? { weight: 1 } : {},
      };
      setEdges((eds) => rfAddEdge(newEdge, eds));
    },
    [setEdges, isWeighted, pushHistory]
  );

  // Add a node at a specific flow position (called from GraphCanvas after coordinate conversion)
  const addNodeAtPosition = useCallback(
    (position) => {
      pushHistory();
      const newId = String(nextIdRef.current);
      nextIdRef.current += 1;

      const newNode = {
        id: newId,
        type: 'custom',
        position,
        data: { label: newId, status: 'default' },
      };

      setNodes((nds) => [...nds, newNode]);
      return newId;
    },
    [setNodes, pushHistory]
  );

  // ── Node Deletion ──

  const removeNode = useCallback(
    (nodeId) => {
      pushHistory();
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) =>
        eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
      );
    },
    [setNodes, setEdges, pushHistory]
  );

  const onNodesDelete = useCallback(
    (deletedNodes) => {
      pushHistory();
      const deletedIds = new Set(deletedNodes.map((n) => n.id));
      setEdges((eds) =>
        eds.filter((e) => !deletedIds.has(e.source) && !deletedIds.has(e.target))
      );
    },
    [setEdges, pushHistory]
  );

  // ── Edge Management ──

  const addEdgeManual = useCallback(
    (source, target, weight = null) => {
      pushHistory();
      const edgeId = `e${source}-${target}`;
      const newEdge = {
        id: edgeId,
        source,
        target,
        type: 'custom',
        data: weight !== null ? { weight } : {},
      };
      setEdges((eds) => [...eds, newEdge]);
    },
    [setEdges, pushHistory]
  );

  const removeEdge = useCallback(
    (edgeId) => {
      pushHistory();
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    },
    [setEdges, pushHistory]
  );

  const renameNode = useCallback(
    (nodeId, newLabel) => {
      pushHistory();
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, label: newLabel } } : n
        )
      );
    },
    [setNodes, pushHistory]
  );

  const onEdgesDelete = useCallback(
    () => {
      pushHistory();
    },
    [pushHistory]
  );

  // ── Edge Weight Editing ──

  const updateEdgeWeight = useCallback(
    (edgeId, newWeight) => {
      pushHistory();
      setEdges((eds) =>
        eds.map((e) =>
          e.id === edgeId
            ? { ...e, data: { ...e.data, weight: parseFloat(newWeight) || 0 } }
            : e
        )
      );
      setEditingEdgeId(null);
    },
    [setEdges, pushHistory]
  );

  const startEditingEdge = useCallback((edgeId) => {
    setEditingEdgeId(edgeId);
  }, []);

  const cancelEditingEdge = useCallback(() => {
    setEditingEdgeId(null);
  }, []);

  // ── Reset / Load ──

  const resetGraph = useCallback(
    (newNodes, newEdges) => {
      const formattedNodes = newNodes.map((n) => ({
        ...n,
        type: 'custom',
        data: { ...n.data, status: 'default', distance: undefined },
      }));
      const formattedEdges = newEdges.map((e) => ({
        ...e,
        type: 'custom',
        data: { ...e.data, status: 'default' },
      }));

      setNodes(formattedNodes);
      setEdges(formattedEdges);
      computeNextId(formattedNodes);

      // Reset history
      historyRef.current = [{
        nodes: JSON.parse(JSON.stringify(formattedNodes)),
        edges: JSON.parse(JSON.stringify(formattedEdges)),
      }];
      historyIndexRef.current = 0;
    },
    [setNodes, setEdges, computeNextId]
  );

  const loadGraph = useCallback(
    (graphData) => {
      if (!graphData) return;
      const { nodes: newNodes, edges: newEdges, directed, weighted, isDirected, isWeighted } = graphData;
      const dir = directed ?? isDirected;
      const wt = weighted ?? isWeighted;
      if (newNodes) {
        resetGraph(newNodes, newEdges || []);
        if (dir !== undefined) setIsDirected(dir);
        if (wt !== undefined) setIsWeighted(wt);
      }
    },
    [resetGraph]
  );

  const clearGraph = useCallback(() => {
    pushHistory();
    setNodes([]);
    setEdges([]);
    nextIdRef.current = 0;
  }, [setNodes, setEdges, pushHistory]);

  // ── Graph Data Export ──

  const getGraphData = useCallback(() => {
    return {
      nodes: nodes.map(({ id, position, data }) => ({
        id,
        position,
        data: { label: data?.label ?? id },
      })),
      edges: edges.map(({ id, source, target, data }) => ({
        id,
        source,
        target,
        data: data?.weight !== undefined ? { weight: data.weight } : {},
      })),
      isDirected,
      isWeighted,
    };
  }, [nodes, edges, isDirected, isWeighted]);

  // ── Adjacency List Conversion ──

  const getAdjacencyList = useCallback(() => {
    const adj = {};

    // Initialize all nodes
    for (const node of nodes) {
      adj[node.id] = [];
    }

    for (const edge of edges) {
      if (isWeighted || edges.some(e => e.data?.weight !== undefined && e.data?.weight !== null)) {
        adj[edge.source]?.push({
          node: edge.target,
          weight: edge.data?.weight ?? 1,
        });
        if (!isDirected) {
          adj[edge.target]?.push({
            node: edge.source,
            weight: edge.data?.weight ?? 1,
          });
        }
      } else {
        adj[edge.source]?.push(edge.target);
        if (!isDirected) {
          adj[edge.target]?.push(edge.source);
        }
      }
    }

    return adj;
  }, [nodes, edges, isDirected, isWeighted]);

  // ── Toggle Directed/Weighted ──

  const toggleDirected = useCallback(() => {
    setIsDirected((prev) => !prev);
  }, []);

  const toggleWeighted = useCallback(() => {
    setIsWeighted((prev) => {
      const newWeighted = !prev;
      if (newWeighted) {
        // Add default weight to edges that don't have one
        setEdges((eds) =>
          eds.map((e) => ({
            ...e,
            data: {
              ...e.data,
              weight: e.data?.weight ?? 1,
            },
          }))
        );
      }
      return newWeighted;
    });
  }, [setEdges]);

  // ── Toggle Edit Mode ──

  const toggleEditing = useCallback(() => {
    setIsEditing((prev) => {
      if (!prev) {
        // Entering edit mode — save initial snapshot
        historyRef.current = [{
          nodes: JSON.parse(JSON.stringify(nodes)),
          edges: JSON.parse(JSON.stringify(edges)),
        }];
        historyIndexRef.current = 0;
        computeNextId(nodes);
      }
      return !prev;
    });
    setEditingEdgeId(null);
  }, [nodes, edges, computeNextId]);

  // Node count for display
  const nodeCount = nodes.length;
  const edgeCount = edges.length;

  return {
    // React Flow state
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,

    // Editor mode removed, kept keys undefined or omit them
    // Graph type
    isEditing,
    toggleEditing,
    setIsEditing,

    // Graph type
    isDirected,
    setIsDirected,
    isWeighted,
    setIsWeighted,
    toggleDirected,
    toggleWeighted,

    // Node operations
    addNodeAtPosition,
    removeNode,
    renameNode,
    onNodesDelete,

    // Edge operations
    addEdge: addEdgeManual,
    removeEdge,
    onEdgesDelete,

    // Edge weight editing
    editingEdgeId,
    updateEdgeWeight,
    startEditingEdge,
    cancelEditingEdge,

    // History
    undo,
    redo,
    canUndo,
    canRedo,

    // Graph operations
    resetGraph,
    loadGraph,
    clearGraph,
    getGraphData,
    getAdjacencyList,

    // Info
    nodeCount,
    edgeCount,
  };
}

export default useGraphEditor;
