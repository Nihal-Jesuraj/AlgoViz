import { memo } from 'react';
import { EdgeLabelRenderer, BaseEdge, useReactFlow } from '@xyflow/react';

const NODE_RADIUS = 28;
const PARALLEL_EDGE_OFFSET = 24;

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
  const { getEdges, getNode } = useReactFlow();
  const sourceNode = getNode(source);
  const targetNode = getNode(target);
  const allEdges = getEdges();

  // Calculate center-to-center path. Always compute from node position with fallback size;
  // only fall back to handle coords if node itself is missing. The source handle is positioned
  // off-center (calc(50%+20px)), so we must not use handle coords as center proxy.
  const NODE_SIZE = 52;
  const sX = sourceNode ? sourceNode.position.x + (sourceNode.measured?.width ?? NODE_SIZE) / 2 : sourceX;
  const sY = sourceNode ? sourceNode.position.y + (sourceNode.measured?.height ?? NODE_SIZE) / 2 : sourceY;
  const tX = targetNode ? targetNode.position.x + (targetNode.measured?.width ?? NODE_SIZE) / 2 : targetX;
  const tY = targetNode ? targetNode.position.y + (targetNode.measured?.height ?? NODE_SIZE) / 2 : targetY;

  const isSelfLoop = source === target;
  const hasReverseEdge = allEdges.some((edge) => edge.id !== id && edge.source === target && edge.target === source);
  const hasParallelEdge = allEdges.some((edge) => edge.id !== id && edge.source === source && edge.target === target);

  let edgePath;
  let labelX;
  let labelY;

  if (isSelfLoop) {
    const loopTop = sY - 88;
    const loopRight = sX + 88;
    edgePath = `M ${sX + NODE_RADIUS} ${sY - 6} C ${loopRight} ${loopTop}, ${sX - 8} ${loopTop}, ${sX - 8} ${sY - NODE_RADIUS}`;
    labelX = sX + 44;
    labelY = sY - 80;
  } else {
    const dx = tX - sX;
    const dy = tY - sY;
    const length = Math.max(Math.hypot(dx, dy), 1);
    const ux = dx / length;
    const uy = dy / length;
    const startX = sX + ux * NODE_RADIUS;
    const startY = sY + uy * NODE_RADIUS;
    const endX = tX - ux * NODE_RADIUS;
    const endY = tY - uy * NODE_RADIUS;
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    if (hasReverseEdge || hasParallelEdge) {
      const edgeKey = `${source}-${target}`;
      const reverseKey = `${target}-${source}`;
      const offsetSign = edgeKey.localeCompare(reverseKey, undefined, { numeric: true }) <= 0 ? 1 : -1;
      const nx = -uy * PARALLEL_EDGE_OFFSET * offsetSign;
      const ny = ux * PARALLEL_EDGE_OFFSET * offsetSign;
      const controlX = midX + nx;
      const controlY = midY + ny;
      edgePath = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
      labelX = controlX;
      labelY = controlY;
    } else {
      edgePath = `M ${startX} ${startY} L ${endX} ${endY}`;
      labelX = midX;
      labelY = midY;
    }
  }

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
        className={`edge-${status} transition-all duration-300`}
        style={{
          ...externalStyle,
          stroke: currentStyle.stroke,
          strokeWidth: currentStyle.strokeWidth,
          filter: currentStyle.filter,
          strokeDasharray: currentStyle.strokeDasharray,
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
