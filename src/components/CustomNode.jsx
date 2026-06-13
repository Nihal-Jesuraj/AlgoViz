import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const statusClassMap = {
  default: 'node-default',
  queued: 'node-queued',
  current: 'node-current',
  visited: 'node-visited',
  'in-path': 'node-in-path',
  'in-mst': 'node-in-mst',
};

function CustomNode({ data, id }) {
  const status = data?.status || 'default';
  const statusClass = statusClassMap[status] || 'node-default';
  const isMst = status === 'in-mst';
  const isEditing = data?.isEditing || false;
  const isAddEdgeMode = isEditing && data?.editorMode === 'addEdge';

  return (
    <div className="relative flex flex-col items-center group" id={`node-${id}`}>
      {/* Target handle - placed in center for edges to route to center */}
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className="!w-2 !h-2 !top-1/2 !left-1/2 !-translate-x-1/2 !-translate-y-1/2 !opacity-0 !border-none"
      />

      {/* Node circle */}
      <div
        className={`graph-node ${statusClass} ${
          isMst ? '!border-[3px] !border-accent-teal-dark' : ''
        } ${isEditing ? 'hover:shadow-glass-elevated' : ''} relative z-10`}
      >
        <span className="font-heading font-semibold text-[15px] leading-none">
          {data?.label ?? id}
        </span>
      </div>

      {/* Source handle - small center dot for dragging out */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="source"
        className={`!w-4 !h-4 !bg-accent-purple !border-2 !border-white !top-[calc(50%+20px)] !left-1/2 !-translate-x-1/2 transition-all duration-200 ${isAddEdgeMode ? '!opacity-100 hover:!scale-125 z-20' : '!opacity-0 !pointer-events-none'}`}
      />

      {/* Distance / weight label */}
      {data?.distance !== undefined && data.distance !== null && (
        <div className="node-distance">
          d={data.distance === Infinity ? '∞' : data.distance}
        </div>
      )}
    </div>
  );
}

export default memo(CustomNode);
