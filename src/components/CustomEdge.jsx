import React, { memo } from 'react';
import { getBezierPath, EdgeLabelRenderer, BaseEdge, useReactFlow, Position } from '@xyflow/react';

const edgeStyles = {
  default: {
    stroke: 'rgba(255, 255, 255, 0.2)',
    strokeWidth: 2,
    filter: 'none',
    strokeDasharray: 'none',
  },
  active: {
    stroke: '#DDD6FE',
    strokeWidth: 4,
    filter: 'drop-shadow(0 0 8px rgba(167, 139, 250, 0.8)) drop-shadow(0 0 16px rgba(139, 92, 246, 0.6))',
    strokeDasharray: 'none',
  },
  visited: {
    stroke: '#6EE7B7',
    strokeWidth: 3,
    filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.5))',
    strokeDasharray: 'none',
  },
  'in-mst': {
    stroke: '#34D399',
    strokeWidth: 3.5,
    filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.5))',
    strokeDasharray: '6 3',
  },
  'in-path': {
    stroke: '#A7F3D0',
    strokeWidth: 4,
    filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.8))',
    strokeDasharray: 'none',
  },
};

function CustomEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  markerEnd,
  style: externalStyle,
}) {
  const { getNode } = useReactFlow();
  const sourceNode = getNode(source);
  const targetNode = getNode(target);

  // Calculate center-to-center path. Fallback to handle coords if nodes somehow not found.
  // The nodes are 52px wide/tall, so center offset is +26.
  const sX = sourceNode && sourceNode.measured ? sourceNode.position.x + (sourceNode.measured.width / 2 || 26) : sourceX;
  const sY = sourceNode && sourceNode.measured ? sourceNode.position.y + (sourceNode.measured.height / 2 || 26) : sourceY;
  const tX = targetNode && targetNode.measured ? targetNode.position.x + (targetNode.measured.width / 2 || 26) : targetX;
  const tY = targetNode && targetNode.measured ? targetNode.position.y + (targetNode.measured.height / 2 || 26) : targetY;

  const dx = tX - sX;
  const dy = tY - sY;
  // Calculate dynamic handles based on relative position to ensure smooth curves
  const sourcePosition = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? Position.Right : Position.Left) : (dy > 0 ? Position.Bottom : Position.Top);
  const targetPosition = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? Position.Left : Position.Right) : (dy > 0 ? Position.Top : Position.Bottom);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: sX,
    sourceY: sY,
    sourcePosition,
    targetX: tX,
    targetY: tY,
    targetPosition,
    curvature: 0.25, // smooth subtle curve
  });

  const status = data?.status || 'default';
  const currentStyle = edgeStyles[status] || edgeStyles.default;
  const isEditing = data?.isEditing || false;

  return (
    <g className={isEditing ? 'cursor-pointer hover:opacity-80' : ''}>
      {/* Invisible wider path for easier clicking/hovering */}
      {isEditing && (
        <BaseEdge
          id={`${id}-interaction`}
          path={edgePath}
          style={{ strokeWidth: 20, stroke: 'transparent', cursor: 'pointer' }}
        />
      )}
      
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...externalStyle,
          stroke: currentStyle.stroke,
          strokeWidth: currentStyle.strokeWidth,
          filter: currentStyle.filter,
          strokeDasharray: currentStyle.strokeDasharray,
          transition: 'stroke 0.3s ease, stroke-width 0.3s ease, filter 0.3s ease',
        }}
      />

      {/* Weight label */}
      {data?.weight !== undefined && data.weight !== null && (
        <EdgeLabelRenderer>
          <div
            className={`edge-weight-label ${isEditing ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            id={`edge-label-${id}`}
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: isEditing ? 'auto' : 'none',
              background: 'rgba(20, 15, 30, 0.85)',
              padding: '4px 10px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              fontSize: '11px',
              fontWeight: '600',
              color: '#F8FAFC',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}
          >
            {data.weight}
          </div>
        </EdgeLabelRenderer>
      )}
    </g>
  );
}

export default memo(CustomEdge);
