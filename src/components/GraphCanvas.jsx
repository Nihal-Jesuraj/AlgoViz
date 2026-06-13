import React, { memo, useMemo, useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';

const defaultNodeTypes = {
  custom: CustomNode,
};

const defaultEdgeTypes = {
  custom: CustomEdge,
};

// SVG Arrow Markers for directed graphs
function ArrowMarkers() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        {/* Default marker */}
        <marker
          id="arrow-default"
          viewBox="0 0 10 10"
          refX="30" // push back by node radius (26) + padding (4)
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255, 255, 255, 0.4)" />
        </marker>
        {/* Active marker */}
        <marker
          id="arrow-active"
          viewBox="0 0 10 10"
          refX="30"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#DDD6FE" />
        </marker>
        {/* Visited marker */}
        <marker
          id="arrow-visited"
          viewBox="0 0 10 10"
          refX="30"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#6EE7B7" />
        </marker>
        {/* In-MST marker */}
        <marker
          id="arrow-in-mst"
          viewBox="0 0 10 10"
          refX="30"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#34D399" />
        </marker>
        {/* In-Path marker */}
        <marker
          id="arrow-in-path"
          viewBox="0 0 10 10"
          refX="30"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#A7F3D0" />
        </marker>
      </defs>
    </svg>
  );
}

// Weight Editor Overlay
function WeightEditor({ edgeId, initialWeight, onSave, onCancel, position }) {
  const [weight, setWeight] = useState(String(initialWeight ?? 1));
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onSave(edgeId, weight);
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div
      className="absolute z-50 glass-panel p-2 flex flex-col gap-2 rounded-lg"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <label className="text-[10px] uppercase font-heading font-semibold text-white/60 px-1">
        Edge Weight
      </label>
      <input
        ref={inputRef}
        type="number"
        className="glass-input !w-24 !text-center !py-1"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => onSave(edgeId, weight)}
      />
    </div>
  );
}

// Inner component to access useReactFlow
function GraphCanvasInner({
  nodes = [],
  edges = [],
  onNodesChange,
  onEdgesChange,
  onConnect,
  nodeTypes: externalNodeTypes,
  edgeTypes: externalEdgeTypes,
  editorMode = 'select',
  isEditing = false,
  isDirected = false,
  isWeighted = false,
  onPaneClick,
  addNodeAtPosition,
  removeNode,
  removeEdge,
  onNodesDelete,
  onEdgesDelete,
  editingEdgeId,
  updateEdgeWeight,
  startEditingEdge,
  cancelEditingEdge,
  isPlaying = false,
}) {
  const reactFlowInstance = useReactFlow();
  const [weightEditorPos, setWeightEditorPos] = useState({ x: 0, y: 0 });

  const nodeTypes = useMemo(
    () => externalNodeTypes || defaultNodeTypes,
    [externalNodeTypes]
  );
  
  // Inject directed marker context into edges
  const mappedEdges = useMemo(() => {
    return edges.map((e) => {
      const status = e.data?.status || 'default';
      return {
        ...e,
        markerEnd: isDirected ? `url(#arrow-${status})` : undefined,
      };
    });
  }, [edges, isDirected]);

  const edgeTypes = useMemo(
    () => externalEdgeTypes || defaultEdgeTypes,
    [externalEdgeTypes]
  );

  // Handle pane click for addNode mode
  const handlePaneClick = useCallback((event) => {
    if (!isEditing || editorMode !== 'addNode') return;
    
    // Check if we're clicking directly on the pane, not on a node/edge
    if (event.target.classList.contains('react-flow__pane')) {
      const { clientX, clientY } = event;
      // Convert screen coordinates to flow coordinates
      const position = reactFlowInstance.screenToFlowPosition({
        x: clientX,
        y: clientY,
      });
      addNodeAtPosition(position);
    }
  }, [isEditing, editorMode, reactFlowInstance, addNodeAtPosition]);

  // Handle double click on edge for weight editing
  const handleEdgeDoubleClick = useCallback((event, edge) => {
    if (!isEditing || !isWeighted) return;
    event.stopPropagation();
    
    // Convert click position to flow position for the editor overlay
    const bounds = event.target.getBoundingClientRect();
    setWeightEditorPos({
      x: event.clientX, // We'll use absolute screen coordinates for the overlay
      y: event.clientY,
    });
    startEditingEdge(edge.id);
  }, [isEditing, isWeighted, startEditingEdge]);

  // Keyboard handlers (Delete, Esc)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isEditing) return;
      if (e.key === 'Escape' && editingEdgeId) {
        cancelEditingEdge();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, editingEdgeId, cancelEditingEdge]);

  // Cursor style based on mode
  const getCursor = () => {
    if (isPlaying) return 'default';
    if (!isEditing) return 'grab';
    if (editorMode === 'addNode') return 'crosshair';
    if (editorMode === 'addEdge') return 'crosshair';
    return 'default';
  };

  // Find currently editing edge
  const editingEdge = useMemo(
    () => edges.find((e) => e.id === editingEdgeId),
    [edges, editingEdgeId]
  );

  return (
    <>
      <ArrowMarkers />
      <div
        id="graph-canvas"
        className="relative w-full h-full rounded-glass-lg overflow-hidden"
        style={{
          boxShadow: 'inset 0 2px 12px rgba(0, 0, 0, 0.2)',
          background: 'transparent',
          cursor: getCursor(),
        }}
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
          onEdgeDoubleClick={handleEdgeDoubleClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          proOptions={{ hideAttribution: true }}
          minZoom={0.3}
          maxZoom={2}
          defaultEdgeOptions={{
            type: 'custom',
            animated: false,
          }}
          nodesDraggable={isEditing && editorMode === 'select' && !isPlaying}
          nodesConnectable={isEditing && (editorMode === 'addEdge' || editorMode === 'select') && !isPlaying}
          connectionRadius={40}
          elementsSelectable={isEditing && editorMode === 'select' && !isPlaying}
          panOnDrag={!isEditing || editorMode === 'select' || editorMode === 'addNode'}
          selectionOnDrag={isEditing && editorMode === 'select' && !isPlaying}
        >
          <Background
            variant="dots"
            gap={20}
            size={1.2}
            color="rgba(255, 255, 255, 0.15)"
          />
          <Controls
            position="bottom-left"
            showInteractive={false}
            className="!mb-16 !ml-3"
          />
          <MiniMap
            position="bottom-right"
            nodeColor={(node) => {
              const status = node.data?.status || 'default';
              switch (status) {
                case 'current': return '#7C3AED';
                case 'visited': return '#06D6A0';
                case 'queued': return '#F59E0B';
                case 'in-path': return '#10B981';
                case 'in-mst': return '#0D9488';
                default: return '#E2E8F0';
              }
            }}
            maskColor="rgba(20, 15, 30, 0.7)"
            className="!mb-3 !mr-3"
            pannable
            zoomable
          />
        </ReactFlow>

        {/* Weight Editor Overlay */}
        {isEditing && editingEdge && (
          <WeightEditor
            edgeId={editingEdge.id}
            initialWeight={editingEdge.data?.weight}
            position={weightEditorPos}
            onSave={updateEdgeWeight}
            onCancel={cancelEditingEdge}
          />
        )}
      </div>
    </>
  );
}

// Wrapper to provide ReactFlowProvider if not already present
export default memo(function GraphCanvas(props) {
  return <GraphCanvasInner {...props} />;
});
