import { memo, useMemo, useState, useCallback, useRef, useEffect } from 'react';
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
          refX="10"
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
          refX="10"
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
          refX="10"
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
          refX="10"
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
          refX="10"
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
      onClick={(e) => e.stopPropagation()}
    >
      <label className="text-[10px] uppercase font-heading font-semibold text-[var(--color-text-subtle)] px-1">
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

// Node Label Editor Overlay
function NodeRenamer({ nodeId, initialLabel, onSave, onCancel, position }) {
  const [label, setLabel] = useState(String(initialLabel ?? ''));
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onSave(nodeId, label);
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
      onClick={(e) => e.stopPropagation()}
    >
      <label className="text-[10px] uppercase font-heading font-semibold text-[var(--color-text-subtle)] px-1">
        Rename Node
      </label>
      <input
        ref={inputRef}
        type="text"
        className="glass-input !w-32 !text-center !py-1"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => onSave(nodeId, label)}
      />
    </div>
  );
}

// Context Menu Overlay
function ContextMenu({ position, onAction, onCancel }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    const handleClick = () => onCancel();
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClick);
    };
  }, [onCancel]);

  return (
    <div
      className="absolute z-50 glass-panel p-1 flex flex-col gap-1 rounded-lg min-w-[120px]"
      style={{
        left: position.x,
        top: position.y,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="px-3 py-1.5 text-sm text-left text-red-400 hover:bg-white/10 rounded-md transition-colors w-full"
        onClick={() => {
          onAction('delete');
          onCancel();
        }}
      >
        Delete
      </button>
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
  isEditing = false,
  isDirected = false,
  isWeighted = false,
  addNodeAtPosition,
  removeNode,
  removeEdge,
  onNodesDelete,
  onEdgesDelete,
  editingEdgeId,
  updateEdgeWeight,
  startEditingEdge,
  cancelEditingEdge,
  renameNode,
  isPlaying = false,
  onNodeDragStop,
}) {
  const reactFlowInstance = useReactFlow();
  const [weightEditorPos, setWeightEditorPos] = useState({ x: 0, y: 0 });
  const [renamingNodeId, setRenamingNodeId] = useState(null);
  const [renamerPos, setRenamerPos] = useState({ x: 0, y: 0 });
  
  const [contextMenu, setContextMenu] = useState(null); // { x, y, type: 'node' | 'edge', id }

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

  // Handle pane click for addNode
  const handlePaneClick = useCallback((event) => {
    if (!isEditing) return;
    
    if (contextMenu) setContextMenu(null);
    if (editingEdgeId) cancelEditingEdge();
    if (renamingNodeId) setRenamingNodeId(null);
    
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
  }, [isEditing, reactFlowInstance, addNodeAtPosition, contextMenu, editingEdgeId, cancelEditingEdge, renamingNodeId]);

  // Handle click on edge for weight editing
  const handleEdgeClick = useCallback((event, edge) => {
    if (!isEditing || !isWeighted) return;
    event.stopPropagation();
    
    setWeightEditorPos({
      x: event.clientX,
      y: event.clientY,
    });
    startEditingEdge(edge.id);
  }, [isEditing, isWeighted, startEditingEdge]);

  // Handle double click on node for renaming
  const handleNodeDoubleClick = useCallback((event, node) => {
    if (!isEditing) return;
    event.stopPropagation();
    
    setRenamerPos({
      x: event.clientX,
      y: event.clientY,
    });
    setRenamingNodeId(node.id);
  }, [isEditing]);

  // Context Menu Handlers
  const onNodeContextMenu = useCallback((event, node) => {
    if (!isEditing) return;
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      type: 'node',
      id: node.id,
    });
  }, [isEditing]);

  const onEdgeContextMenu = useCallback((event, edge) => {
    if (!isEditing) return;
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      type: 'edge',
      id: edge.id,
    });
  }, [isEditing]);

  const handleContextMenuAction = useCallback((action) => {
    if (action === 'delete' && contextMenu) {
      if (contextMenu.type === 'node') {
        removeNode(contextMenu.id);
      } else if (contextMenu.type === 'edge') {
        removeEdge(contextMenu.id);
      }
    }
  }, [contextMenu, removeNode, removeEdge]);

  const handleRenameSave = useCallback((nodeId, label) => {
    if (renameNode) {
      renameNode(nodeId, label);
    }
    setRenamingNodeId(null);
  }, [renameNode]);

  // Keyboard handlers (Delete, Esc)
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

  // Find currently editing elements
  const editingEdge = useMemo(
    () => edges.find((e) => e.id === editingEdgeId),
    [edges, editingEdgeId]
  );
  
  const renamingNode = useMemo(
    () => nodes.find((n) => n.id === renamingNodeId),
    [nodes, renamingNodeId]
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
          cursor: isPlaying ? 'default' : (isEditing ? 'crosshair' : 'grab'),
        }}
        onContextMenu={(e) => e.preventDefault()} // Prevent default context menu on entire canvas
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
          onNodeDragStop={onNodeDragStop}
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
          nodesDraggable={isEditing && !isPlaying}
          nodesConnectable={isEditing && !isPlaying}
          connectionRadius={40}
          elementsSelectable={isEditing && !isPlaying}
          panOnDrag={true} // Always allow panning by dragging the canvas
          selectionOnDrag={false} // Disable selection box on drag to prioritize panning
          connectionLineType="straight"
        >
          <Background
            variant="dots"
            gap={20}
            size={1.2}
            color="var(--color-bg-dots)"
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
        
        {/* Node Renamer Overlay */}
        {isEditing && renamingNode && (
          <NodeRenamer
            nodeId={renamingNode.id}
            initialLabel={renamingNode.data?.label ?? renamingNode.id}
            position={renamerPos}
            onSave={handleRenameSave}
            onCancel={() => setRenamingNodeId(null)}
          />
        )}

        {/* Context Menu */}
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

// Wrapper to provide ReactFlowProvider if not already present
export default memo(function GraphCanvas(props) {
  return <GraphCanvasInner {...props} />;
});
