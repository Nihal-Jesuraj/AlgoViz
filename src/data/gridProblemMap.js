import { numberOfIslandsGenerator, surroundedRegionsGenerator, numberOfEnclavesGenerator, distinctIslandsGenerator } from '../algorithms/gridDFS';
import { rottenOrangesGenerator, shortestPathBinaryMatrixGenerator, floodFillGenerator, nearestCellGenerator, distanceFromGuardGenerator } from '../algorithms/gridBFS';
import { strToNum } from '../utils/gridHelpers';

export const gridProblemMap = [
  {
    keywords: ['number of islands', 'numislands', 'num_islands', 'island'],
    algorithmKey: 'numberOfIslands',
    generator: (rawGrid) => numberOfIslandsGenerator(strToNum(rawGrid)),
    javaCode: `// Number of Islands — DFS Solution
class Solution {
    public int numIslands(char[][] grid) {
        if (grid == null || grid.length == 0) return 0;
        int m = grid.length, n = grid[0].length;
        int count = 0;
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (grid[i][j] == '1') {
                    count++;
                    dfs(grid, i, j);
                }
            }
        }
        return count;
    }
    void dfs(char[][] grid, int i, int j) {
        if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length || grid[i][j] == '0') return;
        grid[i][j] = '0';
        dfs(grid, i - 1, j);
        dfs(grid, i + 1, j);
        dfs(grid, i, j - 1);
        dfs(grid, i, j + 1);
    }
}`,
  },
  {
    keywords: ['rotting', 'oranges', 'rotten'],
    algorithmKey: 'rottenOranges',
    generator: (rawGrid) => rottenOrangesGenerator(strToNum(rawGrid)),
    javaCode: `// Rotting Oranges — BFS Solution
class Solution {
    public int orangesRotting(int[][] grid) {
        if (grid == null || grid.length == 0) return -1;
        int m = grid.length, n = grid[0].length;
        Queue<int[]> q = new LinkedList<>();
        int fresh = 0;
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (grid[i][j] == 2) q.offer(new int[]{i, j});
                else if (grid[i][j] == 1) fresh++;
            }
        }
        if (fresh == 0) return 0;
        int[][] dirs = {{-1,0},{1,0},{0,-1},{0,1}};
        int time = 0;
        while (!q.isEmpty()) {
            int size = q.size();
            boolean rotted = false;
            for (int k = 0; k < size; k++) {
                int[] cell = q.poll();
                for (int[] d : dirs) {
                    int r = cell[0] + d[0], c = cell[1] + d[1];
                    if (r >= 0 && r < m && c >= 0 && c < n && grid[r][c] == 1) {
                        grid[r][c] = 2;
                        q.offer(new int[]{r, c});
                        fresh--;
                        rotted = true;
                    }
                }
            }
            if (rotted) time++;
        }
        return fresh == 0 ? time : -1;
    }
}`,
  },
  {
    keywords: ['shortest path', 'binary matrix', 'shortestpath', '01 matrix'],
    algorithmKey: 'shortestPathBinaryMatrix',
    generator: (rawGrid) => shortestPathBinaryMatrixGenerator(strToNum(rawGrid)),
    javaCode: `// Shortest Path in Binary Matrix — BFS Solution
class Solution {
    public int shortestPathBinaryMatrix(int[][] grid) {
        if (grid[0][0] == 1 || grid[grid.length-1][grid[0].length-1] == 1) return -1;
        int n = grid.length;
        int[][] dirs = {{-1,-1},{-1,0},{-1,1},{0,-1},{0,1},{1,-1},{1,0},{1,1}};
        Queue<int[]> q = new LinkedList<>();
        q.offer(new int[]{0, 0, 1});
        grid[0][0] = 1;
        while (!q.isEmpty()) {
            int[] cur = q.poll();
            int r = cur[0], c = cur[1], d = cur[2];
            if (r == n-1 && c == n-1) return d;
            for (int[] dir : dirs) {
                int nr = r + dir[0], nc = c + dir[1];
                if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc] == 0) {
                    grid[nr][nc] = 1;
                    q.offer(new int[]{nr, nc, d + 1});
                }
            }
        }
        return -1;
    }
}`,
  },
  {
    keywords: ['flood fill'],
    algorithmKey: 'floodFill',
    generator: (rawGrid) => floodFillGenerator(strToNum(rawGrid)),
    javaCode: `// Flood Fill — DFS Solution
class Solution {
    public int[][] floodFill(int[][] image, int sr, int sc, int color) {
        if (image[sr][sc] == color) return image;
        dfs(image, sr, sc, image[sr][sc], color);
        return image;
    }
    void dfs(int[][] image, int r, int c, int orig, int color) {
        if (r < 0 || r >= image.length || c < 0 || c >= image[0].length || image[r][c] != orig) return;
        image[r][c] = color;
        dfs(image, r - 1, c, orig, color);
        dfs(image, r + 1, c, orig, color);
        dfs(image, r, c - 1, orig, color);
        dfs(image, r, c + 1, orig, color);
    }
}`,
  },
  {
    keywords: ['surrounded regions', 'surrounded', 'capture'],
    algorithmKey: 'surroundedRegions',
    generator: (rawGrid) => surroundedRegionsGenerator(strToNum(rawGrid)),
    javaCode: `// Surrounded Regions — DFS Solution
class Solution {
    public void solve(char[][] board) {
        int m = board.length, n = board[0].length;
        for (int i = 0; i < m; i++) {
            if (board[i][0] == 'O') dfs(board, i, 0);
            if (board[i][n-1] == 'O') dfs(board, i, n-1);
        }
        for (int j = 0; j < n; j++) {
            if (board[0][j] == 'O') dfs(board, 0, j);
            if (board[m-1][j] == 'O') dfs(board, m-1, j);
        }
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++)
                if (board[i][j] == 'O') board[i][j] = 'X';
                else if (board[i][j] == 'S') board[i][j] = 'O';
    }
    void dfs(char[][] board, int i, int j) {
        if (i < 0 || i >= board.length || j < 0 || j >= board[0].length || board[i][j] != 'O') return;
        board[i][j] = 'S';
        dfs(board, i - 1, j);
        dfs(board, i + 1, j);
        dfs(board, i, j - 1);
        dfs(board, i, j + 1);
    }
}`,
  },
  {
    keywords: ['enclaves', 'number of enclaves'],
    algorithmKey: 'numberOfEnclaves',
    generator: (rawGrid) => numberOfEnclavesGenerator(strToNum(rawGrid)),
    javaCode: `// Number of Enclaves — DFS Solution
class Solution {
    public int numEnclaves(int[][] grid) {
        int m = grid.length, n = grid[0].length;
        for (int i = 0; i < m; i++) {
            if (grid[i][0] == 1) dfs(grid, i, 0);
            if (grid[i][n-1] == 1) dfs(grid, i, n-1);
        }
        for (int j = 0; j < n; j++) {
            if (grid[0][j] == 1) dfs(grid, 0, j);
            if (grid[m-1][j] == 1) dfs(grid, m-1, j);
        }
        int count = 0;
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++)
                if (grid[i][j] == 1) count++;
        return count;
    }
    void dfs(int[][] grid, int i, int j) {
        if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length || grid[i][j] != 1) return;
        grid[i][j] = 0;
        dfs(grid, i - 1, j);
        dfs(grid, i + 1, j);
        dfs(grid, i, j - 1);
        dfs(grid, i, j + 1);
    }
}`,
  },
  {
    keywords: ['distinct islands', 'unique islands'],
    algorithmKey: 'distinctIslands',
    generator: (rawGrid) => distinctIslandsGenerator(strToNum(rawGrid)),
    javaCode: `// Distinct Islands — DFS Solution
class Solution {
    public int numDistinctIslands(int[][] grid) {
        Set<String> shapes = new HashSet<>();
        for (int i = 0; i < grid.length; i++)
            for (int j = 0; j < grid[0].length; j++)
                if (grid[i][j] == 1) {
                    StringBuilder sb = new StringBuilder();
                    dfs(grid, i, j, i, j, sb);
                    shapes.add(sb.toString());
                }
        return shapes.size();
    }
    void dfs(int[][] grid, int i, int j, int baseR, int baseC, StringBuilder sb) {
        if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length || grid[i][j] != 1) return;
        grid[i][j] = 0;
        sb.append((i - baseR) + "," + (j - baseC) + "|");
        dfs(grid, i - 1, j, baseR, baseC, sb);
        dfs(grid, i + 1, j, baseR, baseC, sb);
        dfs(grid, i, j - 1, baseR, baseC, sb);
        dfs(grid, i, j + 1, baseR, baseC, sb);
    }
}`,
  },
  {
    keywords: ['nearest cell', 'distance to', '01 matrix'],
    algorithmKey: 'nearestCell',
    generator: (rawGrid) => nearestCellGenerator(strToNum(rawGrid)),
    javaCode: `// Nearest Cell Having 1 — BFS Solution
class Solution {
    public int[][] updateMatrix(int[][] mat) {
        int m = mat.length, n = mat[0].length;
        Queue<int[]> q = new LinkedList<>();
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++)
                if (mat[i][j] == 0) q.offer(new int[]{i, j});
                else mat[i][j] = -1;
        int[][] dirs = {{-1,0},{1,0},{0,-1},{0,1}};
        while (!q.isEmpty()) {
            int[] cur = q.poll();
            for (int[] d : dirs) {
                int r = cur[0] + d[0], c = cur[1] + d[1];
                if (r >= 0 && r < m && c >= 0 && c < n && mat[r][c] == -1) {
                    mat[r][c] = mat[cur[0]][cur[1]] + 1;
                    q.offer(new int[]{r, c});
                }
            }
        }
        return mat;
    }
}`,
  },
  {
    keywords: ['distance from guard', 'guard', 'walls'],
    algorithmKey: 'distanceFromGuard',
    generator: (rawGrid) => distanceFromGuardGenerator(strToNum(rawGrid)),
    javaCode: `// Distance from Guard — BFS Solution
class Solution {
    public int[][] wallsAndGates(int[][] rooms) {
        int m = rooms.length, n = rooms[0].length;
        Queue<int[]> q = new LinkedList<>();
        int INF = Integer.MAX_VALUE;
        int[][] dirs = {{-1,0},{1,0},{0,-1},{0,1}};
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++)
                if (rooms[i][j] == 0) q.offer(new int[]{i, j});
        while (!q.isEmpty()) {
            int[] cur = q.poll();
            for (int[] d : dirs) {
                int r = cur[0] + d[0], c = cur[1] + d[1];
                if (r >= 0 && r < m && c >= 0 && c < n && rooms[r][c] == INF) {
                    rooms[r][c] = rooms[cur[0]][cur[1]] + 1;
                    q.offer(new int[]{r, c});
                }
            }
        }
        return rooms;
    }
}`,
  },
];
