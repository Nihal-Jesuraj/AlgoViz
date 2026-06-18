export function strToNum(grid) {
  if (!grid || !grid.length) return grid;
  if (typeof grid[0][0] === 'number') return grid;
  return grid.map(r => r.map(v => {
    const n = Number(v);
    return isNaN(n) ? v : n;
  }));
}
