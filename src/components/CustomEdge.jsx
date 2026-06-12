import React, { memo } from 'react';
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from '@xyflow/react';

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
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  style: externalStyle,
}) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const status = data?.status || 'default';
  const currentStyle = edgeStyles[status] || edgeStyles.default;

  return (
    <>
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
            className="edge-weight-label"
            id={`edge-label-${id}`}
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'none',
            }}
          >
            {data.weight}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(CustomEdge);
