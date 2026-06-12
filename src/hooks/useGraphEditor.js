import { useCallback } from 'react';
import { useNodesState, useEdgesState, addEdge } from '@xyflow/react';

/**
 * useGraphEditor — Custom hook for managing the React Flow graph state.
 *
 * Wraps @xyflow/react's useNodesState and useEdgesState with convenience
 * methods for adding/removing nodes/edges and converting to adjacency lists
 * for algorithm consumption.
 *
 * @param {Array} initialNodes – initial React Flow nodes array
 * @param {Array} initialEdges – initial React Flow edges array
 */
export function useGraphEditor(initialNodes = [], initialEdges = []) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Handle new connections (drag edge from one handle to another)
  const onConnect = useCallback(
    (connection) => {
      const newEdge = {
        ...connection,
        id: `e${connection.source}-${connection.target}`,
        data: {},
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Add a new node at a given position
  const addNode = useCallback(
    (position = { x: 250, y: 250 }) => {
      const newId = String(
        Math.max(0, ...nodes.map((n) => parseInt(n.id, 10) || 0)) + 1
      );
      const newNode = {
        id: newId,
        position,
        data: { label: newId },
      };
      setNodes((nds) => [...nds, newNode]);
      return newId;
    },
    [nodes, setNodes]
  );

  // Remove a node and all its connected edges
  const removeNode = useCallback(
    (nodeId) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) =>
        eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
      );
    },
    [setNodes, setEdges]
  );

  // Add an edge between two nodes with optional weight
  const addEdgeManual = useCallback(
    (source, target, weight = null) => {
      const edgeId = `e${source}-${target}`;
      const newEdge = {
        id: edgeId,
        source,
        target,
        data: weight !== null ? { weight } : {},
      };
      setEdges((eds) => [...eds, newEdge]);
    },
    [setEdges]
  );

  // Remove an edge by ID
  const removeEdge = useCallback(
    (edgeId) => {
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    },
    [setEdges]
  );

  // Reset graph to new nodes/edges
  const resetGraph = useCallback(
    (newNodes, newEdges) => {
      setNodes(
        newNodes.map((n) => ({
          ...n,
          data: { ...n.data, status: 'default', distance: undefined },
        }))
      );
      setEdges(
        newEdges.map((e) => ({
          ...e,
          data: { ...e.data, status: 'default' },
        }))
      );
    },
    [setNodes, setEdges]
  );

  /**
   * Convert React Flow nodes/edges into an adjacency list for algorithms.
   *
   * For unweighted graphs:
   *   { '0': ['1', '2'], '1': ['0', '3'], ... }
   *
   * For weighted graphs:
   *   { '0': [{node: '1', weight: 4}, ...], ... }
   *
   * Automatically detects weighted graphs by checking if any edge has data.weight.
   */
  const getAdjacencyList = useCallback(() => {
    const isWeighted = edges.some(
      (e) => e.data?.weight !== undefined && e.data?.weight !== null
    );

    const adj = {};

    // Initialize all nodes
    for (const node of nodes) {
      adj[node.id] = [];
    }

    // Check if graph is directed (check for marker on edges)
    const isDirected = edges.some(
      (e) => e.markerEnd || e.data?.directed
    );

    for (const edge of edges) {
      if (isWeighted) {
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
  }, [nodes, edges]);

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    removeNode,
    addEdge: addEdgeManual,
    removeEdge,
    resetGraph,
    getAdjacencyList,
  };
}

export default useGraphEditor;
