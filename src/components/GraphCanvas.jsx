import { memo, useMemo, useState, useCallback, useEffect, useContext } from 'react';
import { ReactFlow, Background, Controls, MiniMap, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';
import ArrowMarkers from './canvas/ArrowMarkers';
import WeightEditor from './canvas/WeightEditor';
import NodeRenamer from './canvas/NodeRenamer';
import ContextMenu from './canvas/ContextMenu';
import { VisualizerContext } from '../contexts/VisualizerContext';

const defaultNodeTypes = { custom: CustomNode };
const defaultEdgeTypes = { custom: CustomEdge };
const noop = () => {};

function GraphCanvasInner({ nodes: propNodes, edges: propEdges, isEditing: propIsEditing, isPlaying: propIsPlaying, isDirected: propIsDirected, ...rest }) {
  const ctx = useContext(VisualizerContext);
  const hasCtx = !!ctx;
  const {
    styledNodes: ctxNodes, styledEdges: ctxEdges,
    onNodesChange: ctxOnNodesChange, onEdgesChange: ctxOnEdgesChange, onConnect: ctxOnConnect,
    isEditing: ctxIsEditing, isDirected: ctxIsDirected, isWeighted: ctxIsWeighted,
    addNodeAtPosition: ctxAddNodeAtPosition, removeNode: ctxRemoveNode, removeEdge: ctxRemoveEdge,
    onNodesDelete: ctxOnNodesDelete, onEdgesDelete: ctxOnEdgesDelete,
    editingEdgeId: ctxEditingEdgeId, updateEdgeWeight: ctxUpdateEdgeWeight,
    startEditingEdge: ctxStartEditingEdge, cancelEditingEdge: ctxCancelEditingEdge,
    renameNode: ctxRenameNode, isPlaying: ctxIsPlaying, handleNodeDragStop: ctxHandleNodeDragStop,
  } = hasCtx ? ctx : {};

  const nodes = hasCtx ? ctxNodes : (propNodes || []);
  const edges = hasCtx ? ctxEdges : (propEdges || []);
  const isEditing = hasCtx ? ctxIsEditing : (propIsEditing ?? false);
  const isPlaying = hasCtx ? ctxIsPlaying : (propIsPlaying ?? false);
  const isDirected = hasCtx ? ctxIsDirected : (propIsDirected ?? false);
  const isWeighted = hasCtx ? ctxIsWeighted : false;
  const editingEdgeId = hasCtx ? ctxEditingEdgeId : null;
  const addNodeAtPosition = hasCtx ? ctxAddNodeAtPosition : noop;
  const removeNode = hasCtx ? ctxRemoveNode : noop;
  const removeEdge = hasCtx ? ctxRemoveEdge : noop;
  const onNodesChange = hasCtx ? ctxOnNodesChange : noop;
  const onEdgesChange = hasCtx ? ctxOnEdgesChange : noop;
  const onConnect = hasCtx ? ctxOnConnect : noop;
  const onNodesDelete = hasCtx ? ctxOnNodesDelete : noop;
  const onEdgesDelete = hasCtx ? ctxOnEdgesDelete : noop;
  const startEditingEdge = hasCtx ? ctxStartEditingEdge : noop;
  const cancelEditingEdge = hasCtx ? ctxCancelEditingEdge : noop;
  const updateEdgeWeight = hasCtx ? ctxUpdateEdgeWeight : noop;
  const renameNode = hasCtx ? ctxRenameNode : noop;
  const handleNodeDragStop = hasCtx ? ctxHandleNodeDragStop : noop;

  const reactFlowInstance = useReactFlow();
  const [weightEditorPos, setWeightEditorPos] = useState({ x: 0, y: 0 });
  const [renamingNodeId, setRenamingNodeId] = useState(null);
  const [renamerPos, setRenamerPos] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState(null);

  const mappedEdges = useMemo(() => edges.map((e) => {
    const status = e.data?.status || 'default';
    return { ...e, markerEnd: isDirected ? `url(#arrow-${status})` : undefined };
  }), [edges, isDirected]);

  useEffect(() => {
    if (nodes.length > 0) {
      requestAnimationFrame(() => reactFlowInstance.fitView({ padding: 0.3 }));
    }
  }, [nodes, reactFlowInstance]);

  const handlePaneClick = useCallback((event) => {
    if (!isEditing) return;
    if (contextMenu) setContextMenu(null);
    if (editingEdgeId) cancelEditingEdge();
    if (renamingNodeId) setRenamingNodeId(null);
    if (event.target.classList.contains('react-flow__pane')) {
      const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
      addNodeAtPosition(position);
    }
  }, [isEditing, reactFlowInstance, addNodeAtPosition, contextMenu, editingEdgeId, cancelEditingEdge, renamingNodeId]);

  const handleEdgeClick = useCallback((event, edge) => {
    if (!isEditing || !isWeighted) return;
    event.stopPropagation();
    setWeightEditorPos({ x: event.clientX, y: event.clientY });
    startEditingEdge(edge.id);
  }, [isEditing, isWeighted, startEditingEdge]);

  const handleNodeDoubleClick = useCallback((event, node) => {
    if (!isEditing) return;
    event.stopPropagation();
    setRenamerPos({ x: event.clientX, y: event.clientY });
    setRenamingNodeId(node.id);
  }, [isEditing]);

  const onNodeContextMenu = useCallback((event, node) => {
    if (!isEditing) return;
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, type: 'node', id: node.id });
  }, [isEditing]);

  const onEdgeContextMenu = useCallback((event, edge) => {
    if (!isEditing) return;
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, type: 'edge', id: edge.id });
  }, [isEditing]);

  const handleContextMenuAction = useCallback((action) => {
    if (action === 'delete' && contextMenu) {
      if (contextMenu.type === 'node') removeNode(contextMenu.id);
      else if (contextMenu.type === 'edge') removeEdge(contextMenu.id);
    }
  }, [contextMenu, removeNode, removeEdge]);

  const handleRenameSave = useCallback((nodeId, label) => {
    if (renameNode) renameNode(nodeId, label);
    setRenamingNodeId(null);
  }, [renameNode]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isEditing) return;
      if (e.key === 'Escape') {
        if (editingEdgeId) cancelEditingEdge();
        if (renamingNodeId) setRenamingNodeId(null);
        if (contextMenu) setContextMenu(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, editingEdgeId, cancelEditingEdge, renamingNodeId, contextMenu]);

  const editingEdge = useMemo(() => edges.find((e) => e.id === editingEdgeId), [edges, editingEdgeId]);
  const renamingNode = useMemo(() => nodes.find((n) => n.id === renamingNodeId), [nodes, renamingNodeId]);

  return (
    <>
      <ArrowMarkers />
      <div
        id="graph-canvas"
        className="relative w-full h-full rounded-glass-lg overflow-hidden"
        style={{
          boxShadow: 'inset 0 2px 12px rgba(0, 0, 0, 0.2)',
          background: 'transparent',
          cursor: isPlaying ? 'default' : (isEditing ? 'crosshair' : 'grab'),
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <ReactFlow
          nodes={nodes}
          edges={mappedEdges}
          onNodesChange={isPlaying ? undefined : onNodesChange}
          onEdgesChange={isPlaying ? undefined : onEdgesChange}
          onConnect={isPlaying ? undefined : onConnect}
          onPaneClick={handlePaneClick}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          onEdgeClick={handleEdgeClick}
          onNodeDoubleClick={handleNodeDoubleClick}
          onNodeContextMenu={onNodeContextMenu}
          onEdgeContextMenu={onEdgeContextMenu}
          onNodeDragStop={handleNodeDragStop}
          nodeTypes={defaultNodeTypes}
          edgeTypes={defaultEdgeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          proOptions={{ hideAttribution: true }}
          minZoom={0.3}
          maxZoom={2}
          defaultEdgeOptions={{ type: 'custom', animated: false }}
          nodesDraggable={isEditing && !isPlaying}
          nodesConnectable={isEditing && !isPlaying}
          connectionRadius={40}
          elementsSelectable={isEditing && !isPlaying}
          panOnDrag={true}
          selectionOnDrag={false}
          connectionLineType="straight"
        >
          <Background variant="dots" gap={20} size={1.2} color="var(--color-bg-dots)" />
          <Controls position="bottom-left" showInteractive={false} className="!mb-16 !ml-3" />
          <MiniMap
            position="bottom-right"
            nodeColor={(node) => {
              const s = getComputedStyle(document.documentElement);
              const status = node.data?.status || 'default';
              switch (status) {
                case 'current': return s.getPropertyValue('--color-purple').trim() || '#7C3AED';
                case 'visited': return s.getPropertyValue('--color-teal').trim() || '#06D6A0';
                case 'queued': return s.getPropertyValue('--color-amber').trim() || '#F59E0B';
                case 'in-path': return s.getPropertyValue('--color-teal-light').trim() || '#10B981';
                case 'in-mst': return s.getPropertyValue('--color-teal').trim() || '#0D9488';
                default: return s.getPropertyValue('--color-node-stroke').trim() || '#E2E8F0';
              }
            }}
            maskColor="var(--mini-mask, rgba(20, 15, 30, 0.7))"
            className="!mb-3 !mr-3"
            pannable
            zoomable
          />
        </ReactFlow>

        {isEditing && editingEdge && (
          <WeightEditor
            edgeId={editingEdge.id}
            initialWeight={editingEdge.data?.weight}
            position={weightEditorPos}
            onSave={updateEdgeWeight}
            onCancel={cancelEditingEdge}
          />
        )}

        {isEditing && renamingNode && (
          <NodeRenamer
            nodeId={renamingNode.id}
            initialLabel={renamingNode.data?.label ?? renamingNode.id}
            position={renamerPos}
            onSave={handleRenameSave}
            onCancel={() => setRenamingNodeId(null)}
          />
        )}

        {isEditing && contextMenu && (
          <ContextMenu
            position={{ x: contextMenu.x, y: contextMenu.y }}
            onAction={handleContextMenuAction}
            onCancel={() => setContextMenu(null)}
          />
        )}
      </div>
    </>
  );
}

export default memo(GraphCanvasInner);
