/**
 * Grid BFS Algorithms — Multi-source BFS, Rotten Oranges, Shortest Path Binary Matrix, Flood Fill, etc.
 * Each generator yields: { type, row, col, grid, description, data }
 */

function deepCopyGrid(grid) {
  return grid.map(row => row.map(cell => ({ ...cell })));
}

const DIRS = [[0,1],[0,-1],[1,0],[-1,0]];
const DIRS8 = [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];

function makeGrid(rawGrid, valueFn) {
  return rawGrid.map((row, r) => row.map((val, c) => ({
    value: val,
    status: valueFn ? valueFn(val, r, c) : 'default',
    distance: undefined,
  })));
}

// ── Rotten Oranges (Multi-source BFS from all 2s) ──
export function* rottenOrangesGenerator(rawGrid) {
  const R = rawGrid.length, C = rawGrid[0].length;
  const grid = makeGrid(rawGrid, (v) => v === 2 ? 'rotten' : v === 1 ? 'fresh' : 'default');
  const queue = [];
  let freshCount = 0;

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (rawGrid[r][c] === 2) queue.push([r, c, 0]);
      if (rawGrid[r][c] === 1) freshCount++;
    }
  }

  yield { type: 'init', row: -1, col: -1, grid: deepCopyGrid(grid), description: `${queue.length} rotten, ${freshCount} fresh oranges.`, data: { time: 0 } };

  let maxTime = 0;
  while (queue.length > 0) {
    const [r, c, t] = queue.shift();
    yield { type: 'dequeue', row: r, col: c, grid: deepCopyGrid(grid), description: `Process (${r},${c}) at time ${t}.`, data: { time: t } };

    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < R && nc >= 0 && nc < C && grid[nr][nc].status === 'fresh') {
        grid[nr][nc].status = 'rotten';
        freshCount--;
        maxTime = Math.max(maxTime, t + 1);
        queue.push([nr, nc, t + 1]);
        yield { type: 'rot-orange', row: nr, col: nc, grid: deepCopyGrid(grid), description: `Rot orange at (${nr},${nc}) at time ${t + 1}.`, data: { time: t + 1, freshCount } };
      }
    }
  }

  yield { type: 'complete', row: -1, col: -1, grid: deepCopyGrid(grid), description: freshCount > 0 ? `Impossible! ${freshCount} fresh oranges remain.` : `All rotted in ${maxTime} minutes.`, data: { time: maxTime, freshCount } };
}

// ── Shortest Path in Binary Matrix (BFS 0→0 to n-1→n-1) ──
export function* shortestPathBinaryMatrixGenerator(rawGrid) {
  const R = rawGrid.length, C = rawGrid[0].length;
  const grid = makeGrid(rawGrid, (v) => v === 1 ? 'obstacle' : 'default');

  if (rawGrid[0][0] === 1 || rawGrid[R-1][C-1] === 1) {
    yield { type: 'complete', row: -1, col: -1, grid: deepCopyGrid(grid), description: 'No path (start or end blocked).', data: { distance: -1 } };
    return;
  }

  grid[0][0].status = 'source';
  const queue = [[0, 0, 1]];
  const visited = new Set(['0,0']);

  yield { type: 'init', row: 0, col: 0, grid: deepCopyGrid(grid), description: 'BFS from (0,0) to bottom-right.', data: {} };

  while (queue.length > 0) {
    const [r, c, d] = queue.shift();
    grid[r][c].status = 'current';
    yield { type: 'visit', row: r, col: c, grid: deepCopyGrid(grid), description: `Visit (${r},${c}), dist=${d}.`, data: { distance: d } };

    if (r === R - 1 && c === C - 1) {
      grid[r][c].status = 'target';
      yield { type: 'complete', row: r, col: c, grid: deepCopyGrid(grid), description: `Reached target! Shortest path = ${d}.`, data: { distance: d } };
      return;
    }
    grid[r][c].status = 'visited';

    for (const [dr, dc] of DIRS8) {
      const nr = r + dr, nc = c + dc;
      const key = `${nr},${nc}`;
      if (nr >= 0 && nr < R && nc >= 0 && nc < C && rawGrid[nr][nc] === 0 && !visited.has(key)) {
        visited.add(key);
        grid[nr][nc].status = 'queued';
        queue.push([nr, nc, d + 1]);
        yield { type: 'enqueue', row: nr, col: nc, grid: deepCopyGrid(grid), description: `Enqueue (${nr},${nc}), dist=${d + 1}.`, data: {} };
      }
    }
  }

  yield { type: 'complete', row: -1, col: -1, grid: deepCopyGrid(grid), description: 'No path exists.', data: { distance: -1 } };
}

// ── Flood Fill (BFS) ──
export function* floodFillGenerator(rawGrid, startRow = 0, startCol = 0) {
  const R = rawGrid.length, C = rawGrid[0].length;
  const grid = makeGrid(rawGrid, () => 'default');
  const origColor = rawGrid[startRow][startCol];
  const newColor = origColor === 1 ? 2 : 1;

  grid[startRow][startCol].status = 'source';
  const queue = [[startRow, startCol]];
  const visited = new Set([`${startRow},${startCol}`]);

  yield { type: 'init', row: startRow, col: startCol, grid: deepCopyGrid(grid), description: `Flood fill from (${startRow},${startCol}). Color ${origColor} → ${newColor}.`, data: { origColor, newColor } };

  while (queue.length > 0) {
    const [r, c] = queue.shift();
    grid[r][c].value = newColor;
    grid[r][c].status = 'visited';
    yield { type: 'fill', row: r, col: c, grid: deepCopyGrid(grid), description: `Fill (${r},${c}).`, data: {} };

    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      const key = `${nr},${nc}`;
      if (nr >= 0 && nr < R && nc >= 0 && nc < C && rawGrid[nr][nc] === origColor && !visited.has(key)) {
        visited.add(key);
        grid[nr][nc].status = 'queued';
        queue.push([nr, nc]);
      }
    }
  }

  yield { type: 'complete', row: -1, col: -1, grid: deepCopyGrid(grid), description: 'Flood fill complete.', data: {} };
}

// ── Nearest Cell Having 1 (Multi-source BFS from all 1s) ──
export function* nearestCellGenerator(rawGrid) {
  const R = rawGrid.length, C = rawGrid[0].length;
  const grid = makeGrid(rawGrid, (v) => v === 1 ? 'source' : 'default');
  const queue = [];

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (rawGrid[r][c] === 1) { queue.push([r, c, 0]); grid[r][c].distance = 0; }
      else grid[r][c].distance = -1;
    }
  }

  yield { type: 'init', row: -1, col: -1, grid: deepCopyGrid(grid), description: 'Multi-source BFS from all 1s.', data: {} };

  const visited = new Set(queue.map(([r,c]) => `${r},${c}`));

  while (queue.length > 0) {
    const [r, c, d] = queue.shift();
    yield { type: 'visit', row: r, col: c, grid: deepCopyGrid(grid), description: `Process (${r},${c}), dist=${d}.`, data: {} };

    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      const key = `${nr},${nc}`;
      if (nr >= 0 && nr < R && nc >= 0 && nc < C && !visited.has(key)) {
        visited.add(key);
        grid[nr][nc].distance = d + 1;
        grid[nr][nc].status = 'visited';
        queue.push([nr, nc, d + 1]);
        yield { type: 'update-distance', row: nr, col: nc, grid: deepCopyGrid(grid), description: `dist(${nr},${nc}) = ${d + 1}.`, data: {} };
      }
    }
  }

  yield { type: 'complete', row: -1, col: -1, grid: deepCopyGrid(grid), description: 'Nearest cell distances computed.', data: {} };
}

// ── Distance From Guard (Multi-source BFS) ──
export function* distanceFromGuardGenerator(rawGrid) {
  // 0=guard, 1=open, -1=wall
  const R = rawGrid.length, C = rawGrid[0].length;
  const grid = makeGrid(rawGrid, (v) => v === 0 ? 'source' : v === -1 ? 'obstacle' : 'default');
  const queue = [];

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (rawGrid[r][c] === 0) { queue.push([r, c, 0]); grid[r][c].distance = 0; }
      else grid[r][c].distance = rawGrid[r][c] === -1 ? -1 : Infinity;
    }
  }

  const visited = new Set(queue.map(([r,c]) => `${r},${c}`));
  yield { type: 'init', row: -1, col: -1, grid: deepCopyGrid(grid), description: 'Multi-source BFS from guards.', data: {} };

  while (queue.length > 0) {
    const [r, c, d] = queue.shift();
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      const key = `${nr},${nc}`;
      if (nr >= 0 && nr < R && nc >= 0 && nc < C && rawGrid[nr][nc] === 1 && !visited.has(key)) {
        visited.add(key);
        grid[nr][nc].distance = d + 1;
        grid[nr][nc].status = 'visited';
        queue.push([nr, nc, d + 1]);
        yield { type: 'update-distance', row: nr, col: nc, grid: deepCopyGrid(grid), description: `dist(${nr},${nc}) = ${d + 1}.`, data: {} };
      }
    }
  }

  yield { type: 'complete', row: -1, col: -1, grid: deepCopyGrid(grid), description: 'Guard distances computed.', data: {} };
}
