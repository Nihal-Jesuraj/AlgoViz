import React, { memo, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
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

function GraphCanvas({
  nodes = [],
  edges = [],
  onNodesChange,
  onEdgesChange,
  onConnect,
  nodeTypes: externalNodeTypes,
  edgeTypes: externalEdgeTypes,
}) {
  const nodeTypes = useMemo(
    () => externalNodeTypes || defaultNodeTypes,
    [externalNodeTypes]
  );
  const edgeTypes = useMemo(
    () => externalEdgeTypes || defaultEdgeTypes,
    [externalEdgeTypes]
  );

  // MiniMap node color based on status
  const miniMapNodeColor = (node) => {
    const status = node.data?.status || 'default';
    switch (status) {
      case 'current':
        return '#7C3AED';
      case 'visited':
        return '#06D6A0';
      case 'queued':
        return '#F59E0B';
      case 'in-path':
        return '#10B981';
      case 'in-mst':
        return '#0D9488';
      default:
        return '#E2E8F0';
    }
  };

  return (
    <div
      id="graph-canvas"
      className="relative w-full h-full rounded-glass-lg overflow-hidden"
      style={{
        boxShadow: 'inset 0 2px 12px rgba(0, 0, 0, 0.2)',
        background: 'transparent',
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
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
          nodeColor={miniMapNodeColor}
          maskColor="rgba(20, 15, 30, 0.7)"
          className="!mb-3 !mr-3"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}

export default memo(GraphCanvas);
