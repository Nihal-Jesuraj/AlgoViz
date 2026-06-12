/**
 * Grid DFS Algorithms — Islands, Surrounded Regions, Enclaves, Distinct Islands
 */

function deepCopyGrid(grid) {
  return grid.map(row => row.map(cell => ({ ...cell })));
}

const DIRS = [[0,1],[0,-1],[1,0],[-1,0]];

function makeGrid(rawGrid, valueFn) {
  return rawGrid.map((row, r) => row.map((val, c) => ({
    value: val,
    status: valueFn ? valueFn(val, r, c) : 'default',
  })));
}

// ── Number of Islands ──
export function* numberOfIslandsGenerator(rawGrid) {
  const R = rawGrid.length, C = rawGrid[0].length;
  const grid = makeGrid(rawGrid, (v) => v === 1 ? 'land' : 'water');
  const visited = new Set();
  let count = 0;

  yield { type: 'init', row: -1, col: -1, grid: deepCopyGrid(grid), description: 'Count islands using DFS.', data: { count: 0 } };

  function* dfs(r, c) {
    visited.add(`${r},${c}`);
    grid[r][c].status = 'visited';
    yield { type: 'visit', row: r, col: c, grid: deepCopyGrid(grid), description: `Visit land (${r},${c}).`, data: { count } };

    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < R && nc >= 0 && nc < C && rawGrid[nr][nc] === 1 && !visited.has(`${nr},${nc}`)) {
        yield* dfs(nr, nc);
      }
    }
  }

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (rawGrid[r][c] === 1 && !visited.has(`${r},${c}`)) {
        count++;
        grid[r][c].status = 'source';
        yield { type: 'found-island', row: r, col: c, grid: deepCopyGrid(grid), description: `New island #${count} starting at (${r},${c}).`, data: { count } };
        yield* dfs(r, c);
      }
    }
  }

  yield { type: 'complete', row: -1, col: -1, grid: deepCopyGrid(grid), description: `Total islands: ${count}.`, data: { count } };
}

// ── Surrounded Regions ──
export function* surroundedRegionsGenerator(rawGrid) {
  const R = rawGrid.length, C = rawGrid[0].length;
  // 1 = O (open), 0 = X (wall)
  const grid = makeGrid(rawGrid, (v) => v === 1 ? 'land' : 'obstacle');
  const safe = new Set();

  yield { type: 'init', row: -1, col: -1, grid: deepCopyGrid(grid), description: 'Mark boundary-connected Os as safe, capture the rest.', data: {} };

  function* markSafe(r, c) {
    safe.add(`${r},${c}`);
    grid[r][c].status = 'source';
    yield { type: 'mark-safe', row: r, col: c, grid: deepCopyGrid(grid), description: `(${r},${c}) is boundary-connected — safe.`, data: {} };

    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < R && nc >= 0 && nc < C && rawGrid[nr][nc] === 1 && !safe.has(`${nr},${nc}`)) {
        yield* markSafe(nr, nc);
      }
    }
  }

  // DFS from boundary Os
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if ((r === 0 || r === R - 1 || c === 0 || c === C - 1) && rawGrid[r][c] === 1 && !safe.has(`${r},${c}`)) {
        yield* markSafe(r, c);
      }
    }
  }

  // Capture surrounded
  let captured = 0;
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (rawGrid[r][c] === 1 && !safe.has(`${r},${c}`)) {
        grid[r][c].status = 'rotten';
        grid[r][c].value = 0;
        captured++;
        yield { type: 'capture', row: r, col: c, grid: deepCopyGrid(grid), description: `Capture (${r},${c}) — surrounded O → X.`, data: { captured } };
      }
    }
  }

  yield { type: 'complete', row: -1, col: -1, grid: deepCopyGrid(grid), description: `Captured ${captured} surrounded cells.`, data: { captured } };
}

// ── Number of Enclaves ──
export function* numberOfEnclavesGenerator(rawGrid) {
  const R = rawGrid.length, C = rawGrid[0].length;
  const grid = makeGrid(rawGrid, (v) => v === 1 ? 'land' : 'water');
  const safe = new Set();

  yield { type: 'init', row: -1, col: -1, grid: deepCopyGrid(grid), description: 'Find land cells that cannot reach boundary.', data: {} };

  function* markReachable(r, c) {
    safe.add(`${r},${c}`);
    grid[r][c].status = 'source';
    yield { type: 'mark-safe', row: r, col: c, grid: deepCopyGrid(grid), description: `(${r},${c}) can reach boundary.`, data: {} };

    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < R && nc >= 0 && nc < C && rawGrid[nr][nc] === 1 && !safe.has(`${nr},${nc}`)) {
        yield* markReachable(nr, nc);
      }
    }
  }

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if ((r === 0 || r === R - 1 || c === 0 || c === C - 1) && rawGrid[r][c] === 1 && !safe.has(`${r},${c}`)) {
        yield* markReachable(r, c);
      }
    }
  }

  let enclaves = 0;
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (rawGrid[r][c] === 1 && !safe.has(`${r},${c}`)) {
        enclaves++;
        grid[r][c].status = 'rotten';
      }
    }
  }

  yield { type: 'complete', row: -1, col: -1, grid: deepCopyGrid(grid), description: `Enclaves: ${enclaves} land cells trapped.`, data: { enclaves } };
}

// ── Distinct Islands ──
export function* distinctIslandsGenerator(rawGrid) {
  const R = rawGrid.length, C = rawGrid[0].length;
  const grid = makeGrid(rawGrid, (v) => v === 1 ? 'land' : 'water');
  const visited = new Set();
  const shapes = new Set();
  let count = 0;

  yield { type: 'init', row: -1, col: -1, grid: deepCopyGrid(grid), description: 'Find distinct island shapes using DFS.', data: { count: 0 } };

  function* dfs(r, c, baseR, baseC, shape) {
    visited.add(`${r},${c}`);
    grid[r][c].status = 'visited';
    shape.push(`${r - baseR},${c - baseC}`);
    yield { type: 'visit', row: r, col: c, grid: deepCopyGrid(grid), description: `Visit (${r},${c}), relative: (${r - baseR},${c - baseC}).`, data: { count } };

    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < R && nc >= 0 && nc < C && rawGrid[nr][nc] === 1 && !visited.has(`${nr},${nc}`)) {
        yield* dfs(nr, nc, baseR, baseC, shape);
      }
    }
  }

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (rawGrid[r][c] === 1 && !visited.has(`${r},${c}`)) {
        const shape = [];
        yield* dfs(r, c, r, c, shape);
        const key = shape.join('|');
        if (!shapes.has(key)) {
          shapes.add(key);
          count++;
          yield { type: 'found-distinct', row: r, col: c, grid: deepCopyGrid(grid), description: `Distinct island #${count} shape: [${shape.join('; ')}].`, data: { count } };
        }
      }
    }
  }

  yield { type: 'complete', row: -1, col: -1, grid: deepCopyGrid(grid), description: `Total distinct islands: ${count}.`, data: { count } };
}
