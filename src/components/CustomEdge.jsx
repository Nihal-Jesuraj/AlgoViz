import { memo } from 'react';
import { EdgeLabelRenderer, BaseEdge, useReactFlow } from '@xyflow/react';

const NODE_RADIUS = 28;
const PARALLEL_EDGE_OFFSET = 24;

const edgeStyles = {
  default: {
    strokeWidth: 2,
    strokeDasharray: 'none',
  },
  active: {
    strokeWidth: 3,
    strokeDasharray: 'none',
  },
  visited: {
    strokeWidth: 3,
    strokeDasharray: 'none',
  },
  'in-mst': {
    strokeWidth: 3.5,
    strokeDasharray: '6 3',
  },
  'in-path': {
    strokeWidth: 4,
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
          strokeWidth: currentStyle.strokeWidth,
          strokeDasharray: currentStyle.strokeDasharray,
        }}
      />

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
