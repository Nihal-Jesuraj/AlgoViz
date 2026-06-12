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

  return (
    <div className="relative flex flex-col items-center" id={`node-${id}`}>
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        id={`${id}-target-top`}
        className="!opacity-0 hover:!opacity-100"
      />
      <Handle
        type="target"
        position={Position.Left}
        id={`${id}-target-left`}
        className="!opacity-0 hover:!opacity-100"
      />

      {/* Node circle */}
      <div
        className={`graph-node ${statusClass} ${
          isMst ? '!border-[3px] !border-accent-teal-dark' : ''
        }`}
      >
        <span className="font-heading font-semibold text-[15px] leading-none">
          {data?.label ?? id}
        </span>
      </div>

      {/* Distance / weight label */}
      {data?.distance !== undefined && data.distance !== null && (
        <div className="node-distance">
          d={data.distance === Infinity ? '∞' : data.distance}
        </div>
      )}

      {/* Source handles */}
      <Handle
        type="source"
        position={Position.Bottom}
        id={`${id}-source-bottom`}
        className="!opacity-0 hover:!opacity-100"
      />
      <Handle
        type="source"
        position={Position.Right}
        id={`${id}-source-right`}
        className="!opacity-0 hover:!opacity-100"
      />
    </div>
  );
}

export default memo(CustomNode);
