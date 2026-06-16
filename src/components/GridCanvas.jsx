import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

const statusClassMap = {
  default: 'cell-default',
  current: 'cell-current',
  visited: 'cell-visited',
  queued: 'cell-queued',
  obstacle: 'cell-obstacle',
  source: 'cell-source',
  target: 'cell-target',
  rotten: 'cell-rotten',
  fresh: 'cell-fresh',
  water: 'cell-water',
  land: 'cell-land',
};

function GridCanvas({ grid = [], cellSize = 48 }) {
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;

  if (rows === 0) {
    return (
      <div id="grid-canvas" className="flex items-center justify-center h-full text-[var(--color-text-muted)] text-sm">
        No grid loaded
      </div>
    );
  }

  return (
    <div
      id="grid-canvas"
      className="relative w-full h-full flex items-center justify-center overflow-auto"
      style={{
        background: 'transparent',
        backgroundImage: 'radial-gradient(circle, var(--color-bg-dots) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      <div
        className="grid gap-1.5 p-6"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const status = cell?.status || 'default';
            const cls = statusClassMap[status] || 'cell-default';

            return (
              <motion.div
                key={`${r}-${c}`}
                id={`cell-${r}-${c}`}
                className={`grid-cell ${cls}`}
                style={{ width: cellSize, height: cellSize }}
                layout
                initial={false}
                animate={{
                  scale: status === 'current' ? 1.1 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <span className="font-mono text-xs font-semibold leading-none">
                  {cell?.distance !== undefined && cell.distance !== -1
                    ? cell.distance === Infinity ? '∞' : cell.distance
                    : cell?.value ?? ''
                  }
                </span>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default memo(GridCanvas);
