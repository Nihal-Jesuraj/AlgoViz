// All 53 Striver Graph Problems — Complete Problem Data
// Each problem has: id, title, section, sectionName, difficulty, algorithmKey, presetGraphKey/presetGridKey, isGrid, leetcodeUrl, description, javaCode

export const problems = [
  // ═══════════════════════════════ SECTION 1: FUNDAMENTALS ═══════════════════════════════
  { id: 'g2', title: 'G2 - BFS of Graph', section: 1, sectionName: 'Graph Fundamentals', difficulty: 'Easy', algorithmKey: 'bfs', presetGraphKey: 'bfs-basic', isGrid: false,
    leetcodeUrl: 'https://www.geeksforgeeks.org/problems/bfs-traversal-of-graph/1',
    description: 'Perform BFS traversal of a graph starting from node 0.',
    javaCode: `// BFS of Graph
import java.util.*;
class Solution {
    public ArrayList<Integer> bfsOfGraph(int V, ArrayList<ArrayList<Integer>> adj) {
        ArrayList<Integer> bfs = new ArrayList<>();
        boolean[] visited = new boolean[V];
        Queue<Integer> queue = new LinkedList<>();
        visited[0] = true;
        queue.add(0);
        while (!queue.isEmpty()) {
            int node = queue.poll();
            bfs.add(node);
            for (int neighbor : adj.get(node)) {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    queue.add(neighbor);
                }
            }
        }
        return bfs;
    }
}` },

  { id: 'g3', title: 'G3 - DFS of Graph', section: 1, sectionName: 'Graph Fundamentals', difficulty: 'Easy', algorithmKey: 'dfs', presetGraphKey: 'dfs-basic', isGrid: false,
    leetcodeUrl: 'https://www.geeksforgeeks.org/problems/depth-first-traversal-for-a-graph/1',
    description: 'Perform DFS traversal of a graph starting from node 0.',
    javaCode: `// DFS of Graph
import java.util.*;
class Solution {
    public ArrayList<Integer> dfsOfGraph(int V, ArrayList<ArrayList<Integer>> adj) {
        ArrayList<Integer> dfs = new ArrayList<>();
        boolean[] visited = new boolean[V];
        dfsHelper(0, adj, visited, dfs);
        return dfs;
    }
    void dfsHelper(int node, ArrayList<ArrayList<Integer>> adj, boolean[] vis, ArrayList<Integer> dfs) {
        vis[node] = true;
        dfs.add(node);
        for (int neighbor : adj.get(node)) {
            if (!vis[neighbor]) {
                dfsHelper(neighbor, adj, vis, dfs);
            }
        }
    }
}` },

  { id: 'g4', title: 'G4 - Cycle Detection (Undirected BFS)', section: 1, sectionName: 'Graph Fundamentals', difficulty: 'Medium', algorithmKey: 'cycleDetectionUndirectedDFS', presetGraphKey: 'cycle-undirected', isGrid: false,
    leetcodeUrl: 'https://www.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1',
    description: 'Detect if an undirected graph contains a cycle using BFS.',
    javaCode: `// Cycle Detection - Undirected Graph (BFS)
import java.util.*;
class Solution {
    public boolean isCycle(int V, ArrayList<ArrayList<Integer>> adj) {
        boolean[] visited = new boolean[V];
        for (int i = 0; i < V; i++) {
            if (!visited[i]) {
                if (bfs(i, adj, visited)) return true;
            }
        }
        return false;
    }
    boolean bfs(int src, ArrayList<ArrayList<Integer>> adj, boolean[] vis) {
        vis[src] = true;
        Queue<int[]> q = new LinkedList<>();
        q.add(new int[]{src, -1});
        while (!q.isEmpty()) {
            int[] pair = q.poll();
            int node = pair[0], parent = pair[1];
            for (int neighbor : adj.get(node)) {
                if (!vis[neighbor]) {
                    vis[neighbor] = true;
                    q.add(new int[]{neighbor, node});
                } else if (neighbor != parent) {
                    return true;
                }
            }
        }
        return false;
    }
}` },

  { id: 'g5', title: 'G5 - Cycle Detection (Undirected DFS)', section: 1, sectionName: 'Graph Fundamentals', difficulty: 'Medium', algorithmKey: 'cycleDetectionUndirectedDFS', presetGraphKey: 'cycle-undirected', isGrid: false,
    leetcodeUrl: 'https://www.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1',
    description: 'Detect if an undirected graph contains a cycle using DFS.',
    javaCode: `// Cycle Detection - Undirected Graph (DFS)
import java.util.*;
class Solution {
    public boolean isCycle(int V, ArrayList<ArrayList<Integer>> adj) {
        boolean[] visited = new boolean[V];
        for (int i = 0; i < V; i++) {
            if (!visited[i]) {
                if (dfs(i, -1, adj, visited)) return true;
            }
        }
        return false;
    }
    boolean dfs(int node, int parent, ArrayList<ArrayList<Integer>> adj, boolean[] vis) {
        vis[node] = true;
        for (int neighbor : adj.get(node)) {
            if (!vis[neighbor]) {
                if (dfs(neighbor, node, adj, vis)) return true;
            } else if (neighbor != parent) {
                return true;
            }
        }
        return false;
    }
}` },

  { id: 'g6', title: 'G6 - Bipartite Graph (BFS)', section: 1, sectionName: 'Graph Fundamentals', difficulty: 'Medium', algorithmKey: 'bipartiteCheckBFS', presetGraphKey: 'bipartite', isGrid: false,
    leetcodeUrl: 'https://leetcode.com/problems/is-graph-bipartite/',
    description: 'Check if a graph is bipartite using BFS 2-coloring.',
    javaCode: `// Bipartite Check (BFS)
import java.util.*;
class Solution {
    public boolean isBipartite(int[][] graph) {
        int n = graph.length;
        int[] color = new int[n];
        Arrays.fill(color, -1);
        for (int i = 0; i < n; i++) {
            if (color[i] == -1) {
                Queue<Integer> q = new LinkedList<>();
                q.add(i);
                color[i] = 0;
                while (!q.isEmpty()) {
                    int node = q.poll();
                    for (int neighbor : graph[node]) {
                        if (color[neighbor] == -1) {
                            color[neighbor] = 1 - color[node];
                            q.add(neighbor);
                        } else if (color[neighbor] == color[node]) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }
}` },

  // ═══════════════════════════════ SECTION 2: BFS/DFS PROBLEMS ═══════════════════════════════
  { id: 'g7', title: 'G7 - Cycle Detection (Directed DFS)', section: 2, sectionName: 'BFS/DFS Problems', difficulty: 'Medium', algorithmKey: 'cycleDetectionDirectedDFS', presetGraphKey: 'cycle-directed', isGrid: false,
    leetcodeUrl: 'https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1',
    description: 'Detect cycle in a directed graph using DFS 3-coloring.',
    javaCode: `// Cycle Detection - Directed Graph (DFS)
import java.util.*;
class Solution {
    public boolean isCyclic(int V, ArrayList<ArrayList<Integer>> adj) {
        int[] color = new int[V]; // 0=white, 1=gray, 2=black
        for (int i = 0; i < V; i++) {
            if (color[i] == 0) {
                if (dfs(i, adj, color)) return true;
            }
        }
        return false;
    }
    boolean dfs(int node, ArrayList<ArrayList<Integer>> adj, int[] color) {
        color[node] = 1;
        for (int neighbor : adj.get(node)) {
            if (color[neighbor] == 1) return true;
            if (color[neighbor] == 0 && dfs(neighbor, adj, color)) return true;
        }
        color[node] = 2;
        return false;
    }
}` },

  { id: 'g8', title: 'G8 - Eventual Safe States', section: 2, sectionName: 'BFS/DFS Problems', difficulty: 'Medium', algorithmKey: 'eventualSafeStates', presetGraphKey: 'safe-states', isGrid: false,
    leetcodeUrl: 'https://leetcode.com/problems/find-eventual-safe-states/',
    description: 'Find all nodes that are eventually safe (all paths lead to terminal nodes).',
    javaCode: `// Eventual Safe States (DFS)
import java.util.*;
class Solution {
    public List<Integer> eventualSafeNodes(int[][] graph) {
        int n = graph.length;
        int[] color = new int[n]; // 0=white, 1=gray, 2=black
        List<Integer> result = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            if (dfs(i, graph, color)) result.add(i);
        }
        return result;
    }
    boolean dfs(int node, int[][] graph, int[] color) {
        if (color[node] != 0) return color[node] == 2;
        color[node] = 1;
        for (int neighbor : graph[node]) {
            if (!dfs(neighbor, graph, color)) return false;
        }
        color[node] = 2;
        return true;
    }
}` },

  { id: 'g9', title: 'G9 - Topological Sort (DFS)', section: 2, sectionName: 'BFS/DFS Problems', difficulty: 'Medium', algorithmKey: 'topologicalSort', presetGraphKey: 'topo-sort', isGrid: false,
    leetcodeUrl: 'https://www.geeksforgeeks.org/problems/topological-sort/1',
    description: 'Topological ordering of a DAG using DFS.',
    javaCode: `// Topological Sort (DFS)
import java.util.*;
class Solution {
    static int[] topoSort(int V, ArrayList<ArrayList<Integer>> adj) {
        boolean[] visited = new boolean[V];
        Stack<Integer> stack = new Stack<>();
        for (int i = 0; i < V; i++) {
            if (!visited[i]) dfs(i, adj, visited, stack);
        }
        int[] result = new int[V];
        for (int i = 0; i < V; i++) result[i] = stack.pop();
        return result;
    }
    static void dfs(int node, ArrayList<ArrayList<Integer>> adj, boolean[] vis, Stack<Integer> st) {
        vis[node] = true;
        for (int neighbor : adj.get(node)) {
            if (!vis[neighbor]) dfs(neighbor, adj, vis, st);
        }
        st.push(node);
    }
}` },

  { id: 'g10', title: "G10 - Kahn's Algorithm (BFS Topo Sort)", section: 2, sectionName: 'BFS/DFS Problems', difficulty: 'Medium', algorithmKey: 'kahnsTopoSort', presetGraphKey: 'topo-sort', isGrid: false,
    leetcodeUrl: 'https://www.geeksforgeeks.org/problems/topological-sort/1',
    description: "Topological sort using Kahn's BFS algorithm with in-degree counting.",
    javaCode: `// Kahn's Algorithm (BFS Topological Sort)
import java.util.*;
class Solution {
    static int[] topoSort(int V, ArrayList<ArrayList<Integer>> adj) {
        int[] inDegree = new int[V];
        for (int i = 0; i < V; i++)
            for (int neighbor : adj.get(i)) inDegree[neighbor]++;
        Queue<Integer> q = new LinkedList<>();
        for (int i = 0; i < V; i++)
            if (inDegree[i] == 0) q.add(i);
        int[] result = new int[V];
        int idx = 0;
        while (!q.isEmpty()) {
            int node = q.poll();
            result[idx++] = node;
            for (int neighbor : adj.get(node)) {
                inDegree[neighbor]--;
                if (inDegree[neighbor] == 0) q.add(neighbor);
            }
        }
        return result;
    }
}` },

  { id: 'g11', title: 'G11 - Cycle Detection (Directed BFS)', section: 2, sectionName: 'BFS/DFS Problems', difficulty: 'Medium', algorithmKey: 'kahnsTopoSort', presetGraphKey: 'cycle-directed', isGrid: false,
    leetcodeUrl: 'https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1',
    description: "Detect cycle in directed graph using Kahn's algorithm (if topo sort doesn't include all nodes, there's a cycle).",
    javaCode: `// Cycle Detection Directed (Kahn's / BFS)
import java.util.*;
class Solution {
    public boolean isCyclic(int V, ArrayList<ArrayList<Integer>> adj) {
        int[] inDegree = new int[V];
        for (int i = 0; i < V; i++)
            for (int neighbor : adj.get(i)) inDegree[neighbor]++;
        Queue<Integer> q = new LinkedList<>();
        for (int i = 0; i < V; i++)
            if (inDegree[i] == 0) q.add(i);
        int count = 0;
        while (!q.isEmpty()) {
            int node = q.poll();
            count++;
            for (int neighbor : adj.get(node)) {
                inDegree[neighbor]--;
                if (inDegree[neighbor] == 0) q.add(neighbor);
            }
        }
        return count != V; // cycle exists if not all nodes processed
    }
}` },

  { id: 'g12', title: 'G12 - Surrounded Regions', section: 2, sectionName: 'BFS/DFS Problems', difficulty: 'Medium', algorithmKey: 'surroundedRegions', presetGridKey: 'surrounded-regions', isGrid: true,
    leetcodeUrl: 'https://leetcode.com/problems/surrounded-regions/',
    description: 'Capture surrounded regions (O→X) that are not connected to the boundary.',
    javaCode: `// Surrounded Regions
class Solution {
    public void solve(char[][] board) {
        int m = board.length, n = board[0].length;
        // DFS from boundary O's to mark safe
        for (int i = 0; i < m; i++) {
            if (board[i][0] == 'O') dfs(board, i, 0);
            if (board[i][n-1] == 'O') dfs(board, i, n-1);
        }
        for (int j = 0; j < n; j++) {
            if (board[0][j] == 'O') dfs(board, 0, j);
            if (board[m-1][j] == 'O') dfs(board, m-1, j);
        }
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++) {
                if (board[i][j] == 'O') board[i][j] = 'X';
                if (board[i][j] == '#') board[i][j] = 'O';
            }
    }
    void dfs(char[][] board, int i, int j) {
        if (i < 0 || i >= board.length || j < 0 || j >= board[0].length) return;
        if (board[i][j] != 'O') return;
        board[i][j] = '#';
        dfs(board, i+1, j); dfs(board, i-1, j);
        dfs(board, i, j+1); dfs(board, i, j-1);
    }
}` },

  { id: 'g13', title: 'G13 - Number of Enclaves', section: 2, sectionName: 'BFS/DFS Problems', difficulty: 'Medium', algorithmKey: 'numberOfEnclaves', presetGridKey: 'number-of-enclaves', isGrid: true,
    leetcodeUrl: 'https://leetcode.com/problems/number-of-enclaves/',
    description: 'Count land cells that cannot walk off the boundary.',
    javaCode: `// Number of Enclaves
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
        dfs(grid, i+1, j); dfs(grid, i-1, j);
        dfs(grid, i, j+1); dfs(grid, i, j-1);
    }
}` },

  { id: 'g14', title: 'G14 - Number of Distinct Islands', section: 2, sectionName: 'BFS/DFS Problems', difficulty: 'Medium', algorithmKey: 'distinctIslands', presetGridKey: 'distinct-islands', isGrid: true,
    leetcodeUrl: 'https://leetcode.com/problems/number-of-distinct-islands/',
    description: 'Count distinct island shapes.',
    javaCode: `// Number of Distinct Islands
import java.util.*;
class Solution {
    int countDistinctIslands(int[][] grid) {
        int m = grid.length, n = grid[0].length;
        boolean[][] visited = new boolean[m][n];
        Set<String> shapes = new HashSet<>();
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++)
                if (grid[i][j] == 1 && !visited[i][j]) {
                    List<String> shape = new ArrayList<>();
                    dfs(grid, visited, i, j, i, j, shape);
                    shapes.add(String.join(",", shape));
                }
        return shapes.size();
    }
    void dfs(int[][] grid, boolean[][] vis, int r, int c, int br, int bc, List<String> shape) {
        if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) return;
        if (vis[r][c] || grid[r][c] != 1) return;
        vis[r][c] = true;
        shape.add((r-br) + "," + (c-bc));
        dfs(grid, vis, r+1, c, br, bc, shape);
        dfs(grid, vis, r-1, c, br, bc, shape);
        dfs(grid, vis, r, c+1, br, bc, shape);
        dfs(grid, vis, r, c-1, br, bc, shape);
    }
}` },

  { id: 'g15', title: 'G15 - Bipartite Graph (DFS)', section: 2, sectionName: 'BFS/DFS Problems', difficulty: 'Medium', algorithmKey: 'bipartiteCheckBFS', presetGraphKey: 'bipartite', isGrid: false,
    leetcodeUrl: 'https://leetcode.com/problems/is-graph-bipartite/',
    description: 'Check if a graph is bipartite using DFS 2-coloring.',
    javaCode: `// Bipartite Check (DFS)
class Solution {
    public boolean isBipartite(int[][] graph) {
        int n = graph.length;
        int[] color = new int[n];
        java.util.Arrays.fill(color, -1);
        for (int i = 0; i < n; i++)
            if (color[i] == -1)
                if (!dfs(i, 0, graph, color)) return false;
        return true;
    }
    boolean dfs(int node, int c, int[][] graph, int[] color) {
        color[node] = c;
        for (int neighbor : graph[node]) {
            if (color[neighbor] == -1) {
                if (!dfs(neighbor, 1 - c, graph, color)) return false;
            } else if (color[neighbor] == c) return false;
        }
        return true;
    }
}` },

  { id: 'g16', title: 'G16 - Flood Fill', section: 2, sectionName: 'BFS/DFS Problems', difficulty: 'Easy', algorithmKey: 'floodFill', presetGridKey: 'flood-fill', isGrid: true,
    leetcodeUrl: 'https://leetcode.com/problems/flood-fill/',
    description: 'Flood fill from a starting pixel with a new color.',
    javaCode: `// Flood Fill
class Solution {
    public int[][] floodFill(int[][] image, int sr, int sc, int color) {
        int origColor = image[sr][sc];
        if (origColor == color) return image;
        dfs(image, sr, sc, origColor, color);
        return image;
    }
    void dfs(int[][] image, int r, int c, int orig, int newColor) {
        if (r < 0 || r >= image.length || c < 0 || c >= image[0].length) return;
        if (image[r][c] != orig) return;
        image[r][c] = newColor;
        dfs(image, r+1, c, orig, newColor);
        dfs(image, r-1, c, orig, newColor);
        dfs(image, r, c+1, orig, newColor);
        dfs(image, r, c-1, orig, newColor);
    }
}` },

  { id: 'g17', title: 'G17 - Rotten Oranges', section: 2, sectionName: 'BFS/DFS Problems', difficulty: 'Medium', algorithmKey: 'rottenOranges', presetGridKey: 'rotten-oranges', isGrid: true,
    leetcodeUrl: 'https://leetcode.com/problems/rotting-oranges/',
    description: 'Multi-source BFS: find minimum time for all oranges to rot.',
    javaCode: `// Rotten Oranges (Multi-source BFS)
import java.util.*;
class Solution {
    public int orangesRotting(int[][] grid) {
        int m = grid.length, n = grid[0].length;
        Queue<int[]> q = new LinkedList<>();
        int fresh = 0;
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++) {
                if (grid[i][j] == 2) q.add(new int[]{i, j, 0});
                if (grid[i][j] == 1) fresh++;
            }
        int time = 0;
        int[][] dirs = {{0,1},{0,-1},{1,0},{-1,0}};
        while (!q.isEmpty()) {
            int[] cell = q.poll();
            for (int[] d : dirs) {
                int nr = cell[0]+d[0], nc = cell[1]+d[1];
                if (nr>=0 && nr<m && nc>=0 && nc<n && grid[nr][nc]==1) {
                    grid[nr][nc] = 2;
                    fresh--;
                    time = Math.max(time, cell[2]+1);
                    q.add(new int[]{nr, nc, cell[2]+1});
                }
            }
        }
        return fresh == 0 ? time : -1;
    }
}` },

  { id: 'g18', title: 'G18 - Number of Islands', section: 2, sectionName: 'BFS/DFS Problems', difficulty: 'Medium', algorithmKey: 'numberOfIslands', presetGridKey: 'number-of-islands', isGrid: true,
    leetcodeUrl: 'https://leetcode.com/problems/number-of-islands/',
    description: 'Count number of islands (connected components of 1s) in a grid.',
    javaCode: `// Number of Islands
class Solution {
    public int numIslands(char[][] grid) {
        int m = grid.length, n = grid[0].length;
        int count = 0;
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++)
                if (grid[i][j] == '1') {
                    count++;
                    dfs(grid, i, j);
                }
        return count;
    }
    void dfs(char[][] grid, int i, int j) {
        if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length) return;
        if (grid[i][j] != '1') return;
        grid[i][j] = '0';
        dfs(grid, i+1, j); dfs(grid, i-1, j);
        dfs(grid, i, j+1); dfs(grid, i, j-1);
    }
}` },

  { id: 'g19', title: 'G19 - Nearest Cell Having 1', section: 2, sectionName: 'BFS/DFS Problems', difficulty: 'Medium', algorithmKey: 'nearestCell', presetGridKey: 'nearest-cell', isGrid: true,
    leetcodeUrl: 'https://www.geeksforgeeks.org/problems/distance-of-nearest-cell-having-1/1',
    description: 'For each cell, find distance to nearest cell containing 1.',
    javaCode: `// Distance of Nearest Cell Having 1
import java.util.*;
class Solution {
    public int[][] nearest(int[][] grid) {
        int m = grid.length, n = grid[0].length;
        int[][] dist = new int[m][n];
        Queue<int[]> q = new LinkedList<>();
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++) {
                if (grid[i][j] == 1) { dist[i][j] = 0; q.add(new int[]{i, j}); }
                else dist[i][j] = Integer.MAX_VALUE;
            }
        int[][] dirs = {{0,1},{0,-1},{1,0},{-1,0}};
        while (!q.isEmpty()) {
            int[] cell = q.poll();
            for (int[] d : dirs) {
                int nr = cell[0]+d[0], nc = cell[1]+d[1];
                if (nr>=0 && nr<m && nc>=0 && nc<n && dist[nr][nc] > dist[cell[0]][cell[1]]+1) {
                    dist[nr][nc] = dist[cell[0]][cell[1]] + 1;
                    q.add(new int[]{nr, nc});
                }
            }
        }
        return dist;
    }
}` },

  { id: 'g20', title: 'G20 - Word Ladder I', section: 2, sectionName: 'BFS/DFS Problems', difficulty: 'Hard', algorithmKey: 'bfsShortestPath', presetGraphKey: 'word-ladder', isGrid: false,
    leetcodeUrl: 'https://leetcode.com/problems/word-ladder/',
    description: 'Find shortest transformation from beginWord to endWord, changing one letter at a time.',
    javaCode: `// Word Ladder I (BFS)
import java.util.*;
class Solution {
    public int ladderLength(String beginWord, String endWord, List<String> wordList) {
        Set<String> wordSet = new HashSet<>(wordList);
        if (!wordSet.contains(endWord)) return 0;
        Queue<String> q = new LinkedList<>();
        q.add(beginWord);
        int level = 1;
        while (!q.isEmpty()) {
            int size = q.size();
            for (int i = 0; i < size; i++) {
                String word = q.poll();
                for (int j = 0; j < word.length(); j++) {
                    char[] arr = word.toCharArray();
                    for (char c = 'a'; c <= 'z'; c++) {
                        arr[j] = c;
                        String newWord = new String(arr);
                        if (newWord.equals(endWord)) return level + 1;
                        if (wordSet.contains(newWord)) {
                            wordSet.remove(newWord);
                            q.add(newWord);
                        }
                    }
                }
            }
            level++;
        }
        return 0;
    }
}` },

  // ═══════════════════════════════ SECTION 3: SHORTEST PATH ═══════════════════════════════
  { id: 'g21', title: 'G21 - Word Ladder II', section: 3, sectionName: 'Shortest Path', difficulty: 'Hard', algorithmKey: 'bfsShortestPath', presetGraphKey: 'word-ladder', isGrid: false,
    leetcodeUrl: 'https://leetcode.com/problems/word-ladder-ii/',
    description: 'Find all shortest transformations from beginWord to endWord.',
    javaCode: `// Word Ladder II (BFS + Backtrack)
import java.util.*;
class Solution {
    public List<List<String>> findLadders(String beginWord, String endWord, List<String> wordList) {
        Set<String> wordSet = new HashSet<>(wordList);
        List<List<String>> result = new ArrayList<>();
        Map<String, List<String>> parent = new HashMap<>();
        // BFS to build parent map
        Set<String> current = new HashSet<>(Arrays.asList(beginWord));
        boolean found = false;
        while (!current.isEmpty() && !found) {
            wordSet.removeAll(current);
            Set<String> next = new HashSet<>();
            for (String word : current) {
                char[] arr = word.toCharArray();
                for (int i = 0; i < arr.length; i++) {
                    char orig = arr[i];
                    for (char c = 'a'; c <= 'z'; c++) {
                        arr[i] = c;
                        String newWord = new String(arr);
                        if (wordSet.contains(newWord)) {
                            next.add(newWord);
                            parent.computeIfAbsent(newWord, k -> new ArrayList<>()).add(word);
                            if (newWord.equals(endWord)) found = true;
                        }
                    }
                    arr[i] = orig;
                }
            }
            current = next;
        }
        if (found) backtrack(endWord, beginWord, parent, new LinkedList<>(Arrays.asList(endWord)), result);
        return result;
    }
    void backtrack(String word, String begin, Map<String, List<String>> parent, LinkedList<String> path, List<List<String>> result) {
        if (word.equals(begin)) { result.add(new ArrayList<>(path)); return; }
        for (String p : parent.getOrDefault(word, Collections.emptyList())) {
            path.addFirst(p);
            backtrack(p, begin, parent, path, result);
            path.removeFirst();
        }
    }
}` },

  { id: 'g22', title: 'G22 - Alien Dictionary', section: 3, sectionName: 'Shortest Path', difficulty: 'Hard', algorithmKey: 'kahnsTopoSort', presetGraphKey: 'alien-dict', isGrid: false,
    leetcodeUrl: 'https://www.geeksforgeeks.org/problems/alien-dictionary/1',
    description: 'Given sorted alien words, find character order using topological sort.',
    javaCode: `// Alien Dictionary (Topological Sort)
import java.util.*;
class Solution {
    public String findOrder(String[] dict, int N, int K) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < K; i++) adj.add(new ArrayList<>());
        for (int i = 0; i < N - 1; i++) {
            String s1 = dict[i], s2 = dict[i + 1];
            int len = Math.min(s1.length(), s2.length());
            for (int j = 0; j < len; j++) {
                if (s1.charAt(j) != s2.charAt(j)) {
                    adj.get(s1.charAt(j) - 'a').add(s2.charAt(j) - 'a');
                    break;
                }
            }
        }
        // Kahn's algorithm
        int[] inDegree = new int[K];
        for (int i = 0; i < K; i++)
            for (int v : adj.get(i)) inDegree[v]++;
        Queue<Integer> q = new LinkedList<>();
        for (int i = 0; i < K; i++)
            if (inDegree[i] == 0) q.add(i);
        StringBuilder sb = new StringBuilder();
        while (!q.isEmpty()) {
            int node = q.poll();
            sb.append((char)('a' + node));
            for (int v : adj.get(node))
                if (--inDegree[v] == 0) q.add(v);
        }
        return sb.toString();
    }
}` },

  { id: 'g23', title: 'G23 - Shortest Path in DAG', section: 3, sectionName: 'Shortest Path', difficulty: 'Medium', algorithmKey: 'dagShortestPath', presetGraphKey: 'dag-shortest', isGrid: false,
    leetcodeUrl: 'https://www.geeksforgeeks.org/problems/shortest-path-in-undirected-graph/1',
    description: 'Find shortest distances from source in a weighted DAG using topo sort.',
    javaCode: `// Shortest Path in DAG
import java.util.*;
class Solution {
    public int[] shortestPath(int N, int M, int[][] edges) {
        List<List<int[]>> adj = new ArrayList<>();
        for (int i = 0; i < N; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) adj.get(e[0]).add(new int[]{e[1], e[2]});
        // Topo sort
        boolean[] vis = new boolean[N];
        Stack<Integer> st = new Stack<>();
        for (int i = 0; i < N; i++)
            if (!vis[i]) topoSort(i, adj, vis, st);
        // Relax
        int[] dist = new int[N];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[0] = 0;
        while (!st.isEmpty()) {
            int u = st.pop();
            if (dist[u] != Integer.MAX_VALUE)
                for (int[] edge : adj.get(u))
                    if (dist[u] + edge[1] < dist[edge[0]])
                        dist[edge[0]] = dist[u] + edge[1];
        }
        return dist;
    }
    void topoSort(int node, List<List<int[]>> adj, boolean[] vis, Stack<Integer> st) {
        vis[node] = true;
        for (int[] e : adj.get(node))
            if (!vis[e[0]]) topoSort(e[0], adj, vis, st);
        st.push(node);
    }
}` },

  { id: 'g24', title: 'G24 - Shortest Path (Unit Weights)', section: 3, sectionName: 'Shortest Path', difficulty: 'Medium', algorithmKey: 'bfsShortestPath', presetGraphKey: 'bfs-basic', isGrid: false,
    leetcodeUrl: 'https://www.geeksforgeeks.org/problems/shortest-path-in-undirected-graph-having-unit-distance/1',
    description: 'BFS-based shortest path in unweighted graph.',
    javaCode: `// Shortest Path (Unit Weights) - BFS
import java.util.*;
class Solution {
    public int[] shortestPath(int[][] edges, int N, int M, int src) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < N; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); }
        int[] dist = new int[N];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[src] = 0;
        Queue<Integer> q = new LinkedList<>();
        q.add(src);
        while (!q.isEmpty()) {
            int node = q.poll();
            for (int neighbor : adj.get(node)) {
                if (dist[node] + 1 < dist[neighbor]) {
                    dist[neighbor] = dist[node] + 1;
                    q.add(neighbor);
                }
            }
        }
        for (int i = 0; i < N; i++)
            if (dist[i] == Integer.MAX_VALUE) dist[i] = -1;
        return dist;
    }
}` },

  { id: 'g25', title: 'G25 - Path with Minimum Effort', section: 3, sectionName: 'Shortest Path', difficulty: 'Medium', algorithmKey: 'dijkstra', presetGraphKey: 'dijkstra-weighted', isGrid: false,
    leetcodeUrl: 'https://leetcode.com/problems/path-with-minimum-effort/',
    description: 'Find path from top-left to bottom-right minimizing max absolute height difference.',
    javaCode: `// Path with Minimum Effort (Modified Dijkstra)
import java.util.*;
class Solution {
    public int minimumEffortPath(int[][] heights) {
        int m = heights.length, n = heights[0].length;
        int[][] effort = new int[m][n];
        for (int[] row : effort) Arrays.fill(row, Integer.MAX_VALUE);
        effort[0][0] = 0;
        PriorityQueue<int[]> pq = new PriorityQueue<>((a,b) -> a[2] - b[2]);
        pq.add(new int[]{0, 0, 0});
        int[][] dirs = {{0,1},{0,-1},{1,0},{-1,0}};
        while (!pq.isEmpty()) {
            int[] cur = pq.poll();
            int r = cur[0], c = cur[1], e = cur[2];
            if (r == m-1 && c == n-1) return e;
            for (int[] d : dirs) {
                int nr = r+d[0], nc = c+d[1];
                if (nr >= 0 && nr < m && nc >= 0 && nc < n) {
                    int newEffort = Math.max(e, Math.abs(heights[nr][nc] - heights[r][c]));
                    if (newEffort < effort[nr][nc]) {
                        effort[nr][nc] = newEffort;
                        pq.add(new int[]{nr, nc, newEffort});
                    }
                }
            }
        }
        return 0;
    }
}` },

  { id: 'g26', title: 'G26 - Cheapest Flights Within K Stops', section: 3, sectionName: 'Shortest Path', difficulty: 'Medium', algorithmKey: 'bellmanFord', presetGraphKey: 'bellman-ford-weighted', isGrid: false,
    leetcodeUrl: 'https://leetcode.com/problems/cheapest-flights-within-k-stops/',
    description: 'Find cheapest flight from src to dst with at most K stops.',
    javaCode: `// Cheapest Flights Within K Stops
import java.util.*;
class Solution {
    public int findCheapestPrice(int n, int[][] flights, int src, int dst, int k) {
        int[] dist = new int[n];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[src] = 0;
        for (int i = 0; i <= k; i++) {
            int[] temp = dist.clone();
            for (int[] f : flights) {
                int u = f[0], v = f[1], w = f[2];
                if (dist[u] != Integer.MAX_VALUE && dist[u] + w < temp[v]) {
                    temp[v] = dist[u] + w;
                }
            }
            dist = temp;
        }
        return dist[dst] == Integer.MAX_VALUE ? -1 : dist[dst];
    }
}` },

  { id: 'g27', title: 'G27 - Network Delay Time', section: 3, sectionName: 'Shortest Path', difficulty: 'Medium', algorithmKey: 'dijkstra', presetGraphKey: 'dijkstra-weighted', isGrid: false,
    leetcodeUrl: 'https://leetcode.com/problems/network-delay-time/',
    description: "Dijkstra's to find minimum time for signal to reach all nodes.",
    javaCode: `// Network Delay Time (Dijkstra)
import java.util.*;
class Solution {
    public int networkDelayTime(int[][] times, int n, int k) {
        List<List<int[]>> adj = new ArrayList<>();
        for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
        for (int[] t : times) adj.get(t[0]).add(new int[]{t[1], t[2]});
        int[] dist = new int[n + 1];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[k] = 0;
        PriorityQueue<int[]> pq = new PriorityQueue<>((a,b) -> a[1] - b[1]);
        pq.add(new int[]{k, 0});
        while (!pq.isEmpty()) {
            int[] cur = pq.poll();
            int u = cur[0], d = cur[1];
            if (d > dist[u]) continue;
            for (int[] edge : adj.get(u)) {
                if (dist[u] + edge[1] < dist[edge[0]]) {
                    dist[edge[0]] = dist[u] + edge[1];
                    pq.add(new int[]{edge[0], dist[edge[0]]});
                }
            }
        }
        int maxTime = 0;
        for (int i = 1; i <= n; i++) maxTime = Math.max(maxTime, dist[i]);
        return maxTime == Integer.MAX_VALUE ? -1 : maxTime;
    }
}` },

  // ═══════════════════════════════ SECTION 4: SHORTEST PATH (cont.) ═══════════════════════════════
  { id: 'g28', title: 'G28 - Number of Ways to Arrive', section: 4, sectionName: 'Shortest Path (Advanced)', difficulty: 'Medium', algorithmKey: 'dijkstra', presetGraphKey: 'dijkstra-weighted', isGrid: false,
    leetcodeUrl: 'https://leetcode.com/problems/number-of-ways-to-arrive-at-destination/',
    description: 'Count number of shortest paths from 0 to n-1.',
    javaCode: `// Number of Ways to Arrive at Destination
import java.util.*;
class Solution {
    public int countPaths(int n, int[][] roads) {
        List<List<long[]>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] r : roads) {
            adj.get(r[0]).add(new long[]{r[1], r[2]});
            adj.get(r[1]).add(new long[]{r[0], r[2]});
        }
        long[] dist = new long[n];
        long[] ways = new long[n];
        Arrays.fill(dist, Long.MAX_VALUE);
        dist[0] = 0; ways[0] = 1;
        int MOD = 1_000_000_007;
        PriorityQueue<long[]> pq = new PriorityQueue<>((a,b) -> Long.compare(a[1], b[1]));
        pq.add(new long[]{0, 0});
        while (!pq.isEmpty()) {
            long[] cur = pq.poll();
            int u = (int) cur[0]; long d = cur[1];
            if (d > dist[u]) continue;
            for (long[] edge : adj.get(u)) {
                int v = (int) edge[0]; long w = edge[1];
                if (dist[u] + w < dist[v]) {
                    dist[v] = dist[u] + w;
                    ways[v] = ways[u];
                    pq.add(new long[]{v, dist[v]});
                } else if (dist[u] + w == dist[v]) {
                    ways[v] = (ways[v] + ways[u]) % MOD;
                }
            }
        }
        return (int) ways[n - 1];
    }
}` },

  { id: 'g29', title: 'G29 - Min Multiplications to Reach End', section: 4, sectionName: 'Shortest Path (Advanced)', difficulty: 'Medium', algorithmKey: 'bfsShortestPath', presetGraphKey: 'bfs-basic', isGrid: false,
    leetcodeUrl: 'https://www.geeksforgeeks.org/problems/minimum-multiplications-to-reach-end/1',
    description: 'BFS to find minimum multiplications from start to end (mod 100000).',
    javaCode: `// Minimum Multiplications to Reach End
import java.util.*;
class Solution {
    int minimumMultiplications(int[] arr, int start, int end) {
        int MOD = 100000;
        int[] dist = new int[MOD];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[start] = 0;
        Queue<int[]> q = new LinkedList<>();
        q.add(new int[]{start, 0});
        while (!q.isEmpty()) {
            int[] cur = q.poll();
            int node = cur[0], steps = cur[1];
            for (int x : arr) {
                int next = (node * x) % MOD;
                if (steps + 1 < dist[next]) {
                    dist[next] = steps + 1;
                    if (next == end) return steps + 1;
                    q.add(new int[]{next, steps + 1});
                }
            }
        }
        return -1;
    }
}` },

  { id: 'g30', title: 'G30 - Bellman-Ford Algorithm', section: 4, sectionName: 'Shortest Path (Advanced)', difficulty: 'Medium', algorithmKey: 'bellmanFord', presetGraphKey: 'bellman-ford-weighted', isGrid: false,
    leetcodeUrl: 'https://www.geeksforgeeks.org/problems/distance-from-the-source-bellman-ford-algorithm/1',
    description: 'Bellman-Ford single-source shortest path (handles negative weights).',
    javaCode: `// Bellman-Ford Algorithm
import java.util.*;
class Solution {
    static int[] bellman_ford(int V, ArrayList<ArrayList<Integer>> edges, int S) {
        int[] dist = new int[V];
        Arrays.fill(dist, (int) 1e8);
        dist[S] = 0;
        for (int i = 0; i < V - 1; i++) {
            for (ArrayList<Integer> edge : edges) {
                int u = edge.get(0), v = edge.get(1), w = edge.get(2);
                if (dist[u] != (int) 1e8 && dist[u] + w < dist[v]) {
                    dist[v] = dist[u] + w;
                }
            }
        }
        // Negative cycle check
        for (ArrayList<Integer> edge : edges) {
            int u = edge.get(0), v = edge.get(1), w = edge.get(2);
            if (dist[u] != (int) 1e8 && dist[u] + w < dist[v])
                return new int[]{-1};
        }
        return dist;
    }
}` },

  { id: 'g31', title: 'G31 - Floyd-Warshall Algorithm', section: 4, sectionName: 'Shortest Path (Advanced)', difficulty: 'Medium', algorithmKey: 'floydWarshall', presetGraphKey: 'floyd-warshall', isGrid: false,
    leetcodeUrl: 'https://www.geeksforgeeks.org/problems/implementing-floyd-warshall/1',
    description: 'All-pairs shortest path using Floyd-Warshall.',
    javaCode: `// Floyd-Warshall Algorithm
class Solution {
    public void shortest_distance(int[][] matrix) {
        int n = matrix.length;
        // Replace -1 with large value
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                if (matrix[i][j] == -1) matrix[i][j] = (int) 1e9;
        // DP: try each node as intermediate
        for (int k = 0; k < n; k++)
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++)
                    matrix[i][j] = Math.min(matrix[i][j], matrix[i][k] + matrix[k][j]);
        // Restore -1
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                if (matrix[i][j] >= (int) 1e9) matrix[i][j] = -1;
    }
}` },

  { id: 'g32', title: 'G32 - City With Fewest Reachable', section: 4, sectionName: 'Shortest Path (Advanced)', difficulty: 'Medium', algorithmKey: 'floydWarshall', presetGraphKey: 'floyd-warshall', isGrid: false,
    leetcodeUrl: 'https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/',
    description: 'Find city with smallest number of reachable cities within threshold.',
    javaCode: `// City With Smallest Number of Neighbors
class Solution {
    public int findTheCity(int n, int[][] edges, int distThreshold) {
        int[][] dist = new int[n][n];
        for (int[] row : dist) java.util.Arrays.fill(row, (int) 1e9);
        for (int i = 0; i < n; i++) dist[i][i] = 0;
        for (int[] e : edges) { dist[e[0]][e[1]] = e[2]; dist[e[1]][e[0]] = e[2]; }
        for (int k = 0; k < n; k++)
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++)
                    dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j]);
        int minCount = n, result = -1;
        for (int i = 0; i < n; i++) {
            int count = 0;
            for (int j = 0; j < n; j++)
                if (i != j && dist[i][j] <= distThreshold) count++;
            if (count <= minCount) { minCount = count; result = i; }
        }
        return result;
    }
}` },

  { id: 'g33', title: "G33 - Dijkstra's (Set)", section: 4, sectionName: 'Shortest Path (Advanced)', difficulty: 'Medium', algorithmKey: 'dijkstra', presetGraphKey: 'dijkstra-weighted', isGrid: false,
    leetcodeUrl: 'https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1',
    description: "Dijkstra's shortest path using TreeSet.",
    javaCode: `// Dijkstra's Algorithm (Using Set/TreeSet)
import java.util.*;
class Solution {
    static int[] dijkstra(int V, ArrayList<ArrayList<int[]>> adj, int S) {
        int[] dist = new int[V];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[S] = 0;
        TreeSet<int[]> set = new TreeSet<>((a, b) -> a[0] != b[0] ? a[0] - b[0] : a[1] - b[1]);
        set.add(new int[]{0, S});
        while (!set.isEmpty()) {
            int[] top = set.pollFirst();
            int d = top[0], u = top[1];
            for (int[] edge : adj.get(u)) {
                int v = edge[0], w = edge[1];
                if (dist[u] + w < dist[v]) {
                    set.remove(new int[]{dist[v], v});
                    dist[v] = dist[u] + w;
                    set.add(new int[]{dist[v], v});
                }
            }
        }
        return dist;
    }
}` },

  { id: 'g34', title: "G34 - Dijkstra's (PQ)", section: 4, sectionName: 'Shortest Path (Advanced)', difficulty: 'Medium', algorithmKey: 'dijkstra', presetGraphKey: 'dijkstra-weighted', isGrid: false,
    leetcodeUrl: 'https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1',
    description: "Dijkstra's shortest path using Priority Queue.",
    javaCode: `// Dijkstra's Algorithm (Using PQ)
import java.util.*;
class Solution {
    static int[] dijkstra(int V, ArrayList<ArrayList<int[]>> adj, int S) {
        int[] dist = new int[V];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[S] = 0;
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);
        pq.add(new int[]{0, S});
        while (!pq.isEmpty()) {
            int[] top = pq.poll();
            int d = top[0], u = top[1];
            if (d > dist[u]) continue;
            for (int[] edge : adj.get(u)) {
                int v = edge[0], w = edge[1];
                if (dist[u] + w < dist[v]) {
                    dist[v] = dist[u] + w;
                    pq.add(new int[]{dist[v], v});
                }
            }
        }
        return dist;
    }
}` },

  { id: 'g35', title: 'G35 - Print Shortest Path', section: 4, sectionName: 'Shortest Path (Advanced)', difficulty: 'Medium', algorithmKey: 'dijkstra', presetGraphKey: 'dijkstra-weighted', isGrid: false,
    leetcodeUrl: 'https://www.geeksforgeeks.org/problems/shortest-path-in-weighted-undirected-graph/1',
    description: "Print the actual shortest path using Dijkstra's with parent tracking.",
    javaCode: `// Print Shortest Path (Dijkstra + Parent)
import java.util.*;
class Solution {
    public List<Integer> shortestPath(int n, int m, int[][] edges) {
        List<List<int[]>> adj = new ArrayList<>();
        for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) {
            adj.get(e[0]).add(new int[]{e[1], e[2]});
            adj.get(e[1]).add(new int[]{e[0], e[2]});
        }
        int[] dist = new int[n + 1], parent = new int[n + 1];
        Arrays.fill(dist, Integer.MAX_VALUE);
        for (int i = 0; i <= n; i++) parent[i] = i;
        dist[1] = 0;
        PriorityQueue<int[]> pq = new PriorityQueue<>((a,b) -> a[0] - b[0]);
        pq.add(new int[]{0, 1});
        while (!pq.isEmpty()) {
            int[] cur = pq.poll();
            int d = cur[0], u = cur[1];
            if (d > dist[u]) continue;
            for (int[] edge : adj.get(u)) {
                if (dist[u] + edge[1] < dist[edge[0]]) {
                    dist[edge[0]] = dist[u] + edge[1];
                    parent[edge[0]] = u;
                    pq.add(new int[]{dist[edge[0]], edge[0]});
                }
            }
        }
        if (dist[n] == Integer.MAX_VALUE) return Arrays.asList(-1);
        List<Integer> path = new ArrayList<>();
        int node = n;
        while (node != parent[node]) { path.add(node); node = parent[node]; }
        path.add(1);
        Collections.reverse(path);
        return path;
    }
}` },

  { id: 'g36', title: 'G36 - Shortest Path Binary Matrix', section: 4, sectionName: 'Shortest Path (Advanced)', difficulty: 'Medium', algorithmKey: 'shortestPathBinaryMatrix', presetGridKey: 'binary-matrix', isGrid: true,
    leetcodeUrl: 'https://leetcode.com/problems/shortest-path-in-binary-matrix/',
    description: 'BFS to find shortest path from top-left to bottom-right in binary matrix.',
    javaCode: `// Shortest Path in Binary Matrix
import java.util.*;
class Solution {
    public int shortestPathBinaryMatrix(int[][] grid) {
        int n = grid.length;
        if (grid[0][0] == 1 || grid[n-1][n-1] == 1) return -1;
        int[][] dirs = {{0,1},{0,-1},{1,0},{-1,0},{1,1},{1,-1},{-1,1},{-1,-1}};
        Queue<int[]> q = new LinkedList<>();
        q.add(new int[]{0, 0, 1});
        grid[0][0] = 1;
        while (!q.isEmpty()) {
            int[] cur = q.poll();
            if (cur[0] == n-1 && cur[1] == n-1) return cur[2];
            for (int[] d : dirs) {
                int nr = cur[0]+d[0], nc = cur[1]+d[1];
                if (nr>=0 && nr<n && nc>=0 && nc<n && grid[nr][nc]==0) {
                    grid[nr][nc] = 1;
                    q.add(new int[]{nr, nc, cur[2]+1});
                }
            }
        }
        return -1;
    }
}` },

  { id: 'g37', title: 'G37 - Path with Max Probability', section: 4, sectionName: 'Shortest Path (Advanced)', difficulty: 'Medium', algorithmKey: 'dijkstra', presetGraphKey: 'dijkstra-weighted', isGrid: false,
    leetcodeUrl: 'https://leetcode.com/problems/path-with-maximum-probability/',
    description: 'Modified Dijkstra to find path with maximum probability.',
    javaCode: `// Path with Maximum Probability
import java.util.*;
class Solution {
    public double maxProbability(int n, int[][] edges, double[] succProb, int start, int end) {
        List<List<double[]>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int i = 0; i < edges.length; i++) {
            adj.get(edges[i][0]).add(new double[]{edges[i][1], succProb[i]});
            adj.get(edges[i][1]).add(new double[]{edges[i][0], succProb[i]});
        }
        double[] prob = new double[n];
        prob[start] = 1.0;
        PriorityQueue<double[]> pq = new PriorityQueue<>((a,b) -> Double.compare(b[1], a[1]));
        pq.add(new double[]{start, 1.0});
        while (!pq.isEmpty()) {
            double[] cur = pq.poll();
            int u = (int) cur[0]; double p = cur[1];
            if (u == end) return p;
            if (p < prob[u]) continue;
            for (double[] edge : adj.get(u)) {
                int v = (int) edge[0]; double np = p * edge[1];
                if (np > prob[v]) { prob[v] = np; pq.add(new double[]{v, np}); }
            }
        }
        return 0.0;
    }
}` },

  { id: 'g38', title: 'G38 - Distance from Guard', section: 4, sectionName: 'Shortest Path (Advanced)', difficulty: 'Medium', algorithmKey: 'distanceFromGuard', presetGridKey: 'distance-from-guard', isGrid: true,
    leetcodeUrl: 'https://www.geeksforgeeks.org/problems/bfs-traversal-of-graph/1',
    description: 'Multi-source BFS from guards to find distance for each cell.',
    javaCode: `// Distance from Guard (Multi-source BFS)
import java.util.*;
class Solution {
    public int[][] nearest(char[][] grid) {
        int m = grid.length, n = grid[0].length;
        int[][] dist = new int[m][n];
        for (int[] row : dist) Arrays.fill(row, -1);
        Queue<int[]> q = new LinkedList<>();
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++)
                if (grid[i][j] == 'G') { dist[i][j] = 0; q.add(new int[]{i, j}); }
        int[][] dirs = {{0,1},{0,-1},{1,0},{-1,0}};
        while (!q.isEmpty()) {
            int[] cell = q.poll();
            for (int[] d : dirs) {
                int nr = cell[0]+d[0], nc = cell[1]+d[1];
                if (nr>=0 && nr<m && nc>=0 && nc<n && dist[nr][nc]==-1 && grid[nr][nc]!='W') {
                    dist[nr][nc] = dist[cell[0]][cell[1]] + 1;
                    q.add(new int[]{nr, nc});
                }
            }
        }
        return dist;
    }
}` },

  { id: 'g39', title: 'G39 - Swim in Rising Water', section: 4, sectionName: 'Shortest Path (Advanced)', difficulty: 'Hard', algorithmKey: 'dijkstra', presetGraphKey: 'dijkstra-weighted', isGrid: false,
    leetcodeUrl: 'https://leetcode.com/problems/swim-in-rising-water/',
    description: 'Modified Dijkstra: find minimum time to swim from top-left to bottom-right.',
    javaCode: `// Swim in Rising Water (Modified Dijkstra)
import java.util.*;
class Solution {
    public int swimInWater(int[][] grid) {
        int n = grid.length;
        int[][] dist = new int[n][n];
        for (int[] row : dist) Arrays.fill(row, Integer.MAX_VALUE);
        dist[0][0] = grid[0][0];
        PriorityQueue<int[]> pq = new PriorityQueue<>((a,b) -> a[2]-b[2]);
        pq.add(new int[]{0, 0, grid[0][0]});
        int[][] dirs = {{0,1},{0,-1},{1,0},{-1,0}};
        while (!pq.isEmpty()) {
            int[] cur = pq.poll();
            int r=cur[0], c=cur[1], t=cur[2];
            if (r==n-1 && c==n-1) return t;
            for (int[] d : dirs) {
                int nr=r+d[0], nc=c+d[1];
                if (nr>=0 && nr<n && nc>=0 && nc<n) {
                    int nt = Math.max(t, grid[nr][nc]);
                    if (nt < dist[nr][nc]) { dist[nr][nc]=nt; pq.add(new int[]{nr,nc,nt}); }
                }
            }
        }
        return -1;
    }
}` },

  { id: 'g40', title: 'G40 - Shortest Bridge', section: 4, sectionName: 'Shortest Path (Advanced)', difficulty: 'Medium', algorithmKey: 'numberOfIslands', presetGridKey: 'shortest-bridge', isGrid: true,
    leetcodeUrl: 'https://leetcode.com/problems/shortest-bridge/',
    description: 'DFS to mark first island, then BFS to find shortest path to second island.',
    javaCode: `// Shortest Bridge (DFS + BFS)
import java.util.*;
class Solution {
    public int shortestBridge(int[][] grid) {
        int n = grid.length;
        Queue<int[]> q = new LinkedList<>();
        boolean found = false;
        // DFS to find and mark first island
        for (int i = 0; i < n && !found; i++)
            for (int j = 0; j < n && !found; j++)
                if (grid[i][j] == 1) { dfs(grid, i, j, q); found = true; }
        // BFS to find shortest bridge
        int[][] dirs = {{0,1},{0,-1},{1,0},{-1,0}};
        int steps = 0;
        while (!q.isEmpty()) {
            int size = q.size();
            for (int i = 0; i < size; i++) {
                int[] cell = q.poll();
                for (int[] d : dirs) {
                    int nr = cell[0]+d[0], nc = cell[1]+d[1];
                    if (nr>=0 && nr<n && nc>=0 && nc<n) {
                        if (grid[nr][nc] == 1) return steps;
                        if (grid[nr][nc] == 0) { grid[nr][nc] = 2; q.add(new int[]{nr, nc}); }
                    }
                }
            }
            steps++;
        }
        return -1;
    }
    void dfs(int[][] grid, int i, int j, Queue<int[]> q) {
        if (i<0||i>=grid.length||j<0||j>=grid[0].length||grid[i][j]!=1) return;
        grid[i][j] = 2; q.add(new int[]{i, j});
        dfs(grid,i+1,j,q); dfs(grid,i-1,j,q);
        dfs(grid,i,j+1,q); dfs(grid,i,j-1,q);
    }
}` },

  // ═══════════════════════════════ SECTION 5: MST / DSU ═══════════════════════════════
  { id: 'g41', title: "G41 - Prim's Algorithm", section: 5, sectionName: 'MST / DSU', difficulty: 'Medium', algorithmKey: 'prims', presetGraphKey: 'mst-weighted', isGrid: false,
    leetcodeUrl: 'https://www.geeksforgeeks.org/problems/minimum-spanning-tree/1',
    description: "Prim's algorithm to find Minimum Spanning Tree.",
    javaCode: `// Prim's Algorithm (MST)
import java.util.*;
class Solution {
    static int spanningTree(int V, int E, List<List<int[]>> adj) {
        boolean[] inMST = new boolean[V];
        PriorityQueue<int[]> pq = new PriorityQueue<>((a,b) -> a[1]-b[1]);
        pq.add(new int[]{0, 0}); // {node, weight}
        int totalWeight = 0;
        while (!pq.isEmpty()) {
            int[] cur = pq.poll();
            int u = cur[0], w = cur[1];
            if (inMST[u]) continue;
            inMST[u] = true;
            totalWeight += w;
            for (int[] edge : adj.get(u)) {
                if (!inMST[edge[0]])
                    pq.add(new int[]{edge[0], edge[1]});
            }
        }
        return totalWeight;
    }
}` },

  { id: 'g42', title: "G42 - Kruskal's Algorithm", section: 5, sectionName: 'MST / DSU', difficulty: 'Medium', algorithmKey: 'kruskals', presetGraphKey: 'mst-weighted', isGrid: false,
    leetcodeUrl: 'https://www.geeksforgeeks.org/problems/minimum-spanning-tree/1',
    description: "Kruskal's MST using DSU (Disjoint Set Union).",
    javaCode: `// Kruskal's Algorithm (MST)
import java.util.*;
class Solution {
    int[] parent, rank;
    int find(int x) { if (parent[x] != x) parent[x] = find(parent[x]); return parent[x]; }
    void union(int x, int y) {
        int px = find(x), py = find(y);
        if (rank[px] < rank[py]) parent[px] = py;
        else if (rank[px] > rank[py]) parent[py] = px;
        else { parent[py] = px; rank[px]++; }
    }
    static int spanningTree(int V, int E, List<List<int[]>> adj) {
        List<int[]> edges = new ArrayList<>();
        for (int u = 0; u < V; u++)
            for (int[] e : adj.get(u))
                if (u < e[0]) edges.add(new int[]{e[1], u, e[0]});
        edges.sort((a,b) -> a[0]-b[0]);
        Solution s = new Solution();
        s.parent = new int[V]; s.rank = new int[V];
        for (int i = 0; i < V; i++) s.parent[i] = i;
        int mstWeight = 0, edgesUsed = 0;
        for (int[] edge : edges) {
            if (edgesUsed == V - 1) break;
            int w = edge[0], u = edge[1], v = edge[2];
            if (s.find(u) != s.find(v)) {
                s.union(u, v); mstWeight += w; edgesUsed++;
            }
        }
        return mstWeight;
    }
}` },

  { id: 'g43', title: 'G43 - DSU Basics', section: 5, sectionName: 'MST / DSU', difficulty: 'Medium', algorithmKey: 'dsuVisualization', presetGraphKey: 'dsu-basic', isGrid: false,
    leetcodeUrl: 'https://www.geeksforgeeks.org/problems/disjoint-set-union-find/1',
    description: 'Disjoint Set Union (Union-Find) with path compression and union by rank.',
    javaCode: `// Disjoint Set Union (DSU)
class DisjointSet {
    int[] parent, rank;
    DisjointSet(int n) {
        parent = new int[n]; rank = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
    }
    int find(int x) {
        if (parent[x] != x)
            parent[x] = find(parent[x]); // path compression
        return parent[x];
    }
    void union(int x, int y) {
        int px = find(x), py = find(y);
        if (px == py) return;
        if (rank[px] < rank[py]) parent[px] = py;
        else if (rank[px] > rank[py]) parent[py] = px;
        else { parent[py] = px; rank[px]++; }
    }
}` },

  { id: 'g44', title: 'G44 - Redundant Connection', section: 5, sectionName: 'MST / DSU', difficulty: 'Medium', algorithmKey: 'dsuRedundantConnection', presetGraphKey: 'dsu-basic', isGrid: false,
    leetcodeUrl: 'https://leetcode.com/problems/redundant-connection/',
    description: 'Find the edge that creates a cycle in an undirected graph.',
    javaCode: `// Redundant Connection (DSU)
class Solution {
    int[] parent, rank;
    int find(int x) { if (parent[x] != x) parent[x] = find(parent[x]); return parent[x]; }
    public int[] findRedundantConnection(int[][] edges) {
        int n = edges.length;
        parent = new int[n + 1]; rank = new int[n + 1];
        for (int i = 0; i <= n; i++) parent[i] = i;
        for (int[] edge : edges) {
            int u = edge[0], v = edge[1];
            int pu = find(u), pv = find(v);
            if (pu == pv) return edge; // cycle!
            if (rank[pu] < rank[pv]) parent[pu] = pv;
            else if (rank[pu] > rank[pv]) parent[pv] = pu;
            else { parent[pv] = pu; rank[pu]++; }
        }
        return new int[]{};
    }
}` },

  { id: 'g45', title: 'G45 - Accounts Merge', section: 5, sectionName: 'MST / DSU', difficulty: 'Hard', algorithmKey: 'dsuVisualization', presetGraphKey: 'dsu-basic', isGrid: false,
    leetcodeUrl: 'https://leetcode.com/problems/accounts-merge/',
    description: 'Merge accounts with common emails using DSU.',
    javaCode: `// Accounts Merge (DSU)
import java.util.*;
class Solution {
    int[] parent, rank;
    int find(int x) { if (parent[x] != x) parent[x] = find(parent[x]); return parent[x]; }
    void union(int x, int y) {
        int px = find(x), py = find(y);
        if (px == py) return;
        if (rank[px] < rank[py]) parent[px] = py;
        else if (rank[px] > rank[py]) parent[py] = px;
        else { parent[py] = px; rank[px]++; }
    }
    public List<List<String>> accountsMerge(List<List<String>> accounts) {
        int n = accounts.size();
        parent = new int[n]; rank = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;
        Map<String, Integer> emailToId = new HashMap<>();
        for (int i = 0; i < n; i++)
            for (int j = 1; j < accounts.get(i).size(); j++) {
                String email = accounts.get(i).get(j);
                if (emailToId.containsKey(email)) union(i, emailToId.get(email));
                else emailToId.put(email, i);
            }
        Map<Integer, TreeSet<String>> merged = new HashMap<>();
        for (var entry : emailToId.entrySet()) {
            int root = find(entry.getValue());
            merged.computeIfAbsent(root, k -> new TreeSet<>()).add(entry.getKey());
        }
        List<List<String>> result = new ArrayList<>();
        for (var entry : merged.entrySet()) {
            List<String> list = new ArrayList<>();
            list.add(accounts.get(entry.getKey()).get(0));
            list.addAll(entry.getValue());
            result.add(list);
        }
        return result;
    }
}` },

  { id: 'g46', title: 'G46 - Number of Islands II', section: 5, sectionName: 'MST / DSU', difficulty: 'Hard', algorithmKey: 'dsuVisualization', presetGraphKey: 'dsu-basic', isGrid: false,
    leetcodeUrl: 'https://leetcode.com/problems/number-of-islands-ii/',
    description: 'Online connected components: add land cells one by one and count islands.',
    javaCode: `// Number of Islands II (DSU)
import java.util.*;
class Solution {
    int[] parent, rank;
    int find(int x) { if (parent[x] != x) parent[x] = find(parent[x]); return parent[x]; }
    boolean union(int x, int y) {
        int px = find(x), py = find(y);
        if (px == py) return false;
        if (rank[px] < rank[py]) parent[px] = py;
        else if (rank[px] > rank[py]) parent[py] = px;
        else { parent[py] = px; rank[px]++; }
        return true;
    }
    public List<Integer> numIslands2(int m, int n, int[][] positions) {
        parent = new int[m * n]; rank = new int[m * n];
        Arrays.fill(parent, -1);
        int count = 0;
        List<Integer> result = new ArrayList<>();
        int[][] dirs = {{0,1},{0,-1},{1,0},{-1,0}};
        for (int[] pos : positions) {
            int r = pos[0], c = pos[1], id = r * n + c;
            if (parent[id] != -1) { result.add(count); continue; }
            parent[id] = id; count++;
            for (int[] d : dirs) {
                int nr = r+d[0], nc = c+d[1], nid = nr*n+nc;
                if (nr>=0 && nr<m && nc>=0 && nc<n && parent[nid] != -1)
                    if (union(id, nid)) count--;
            }
            result.add(count);
        }
        return result;
    }
}` },

  { id: 'g47', title: 'G47 - Making a Large Island', section: 5, sectionName: 'MST / DSU', difficulty: 'Hard', algorithmKey: 'numberOfIslands', presetGridKey: 'making-large-island', isGrid: true,
    leetcodeUrl: 'https://leetcode.com/problems/making-a-large-island/',
    description: 'Change at most one 0 to 1 to maximize island size.',
    javaCode: `// Making a Large Island
import java.util.*;
class Solution {
    int[][] dirs = {{0,1},{0,-1},{1,0},{-1,0}};
    public int largestIsland(int[][] grid) {
        int n = grid.length;
        int[][] id = new int[n][n];
        Map<Integer, Integer> sizeMap = new HashMap<>();
        int islandId = 2, maxSize = 0;
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                if (grid[i][j] == 1 && id[i][j] == 0) {
                    int size = dfs(grid, id, i, j, islandId);
                    sizeMap.put(islandId, size);
                    maxSize = Math.max(maxSize, size);
                    islandId++;
                }
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                if (grid[i][j] == 0) {
                    Set<Integer> seen = new HashSet<>();
                    int total = 1;
                    for (int[] d : dirs) {
                        int ni = i+d[0], nj = j+d[1];
                        if (ni>=0 && ni<n && nj>=0 && nj<n && id[ni][nj]>0 && seen.add(id[ni][nj]))
                            total += sizeMap.get(id[ni][nj]);
                    }
                    maxSize = Math.max(maxSize, total);
                }
        return maxSize;
    }
    int dfs(int[][] grid, int[][] id, int r, int c, int islandId) {
        if (r<0||r>=grid.length||c<0||c>=grid[0].length||grid[r][c]!=1||id[r][c]!=0) return 0;
        id[r][c] = islandId;
        return 1+dfs(grid,id,r+1,c,islandId)+dfs(grid,id,r-1,c,islandId)+dfs(grid,id,r,c+1,islandId)+dfs(grid,id,r,c-1,islandId);
    }
}` },

  { id: 'g48', title: 'G48 - Swim in Rising Water (DSU)', section: 5, sectionName: 'MST / DSU', difficulty: 'Hard', algorithmKey: 'dsuVisualization', presetGraphKey: 'dsu-basic', isGrid: false,
    leetcodeUrl: 'https://leetcode.com/problems/swim-in-rising-water/',
    description: 'DSU approach: process cells in elevation order, union neighbors.',
    javaCode: `// Swim in Rising Water (DSU approach)
import java.util.*;
class Solution {
    int[] parent, rank;
    int find(int x) { if (parent[x] != x) parent[x] = find(parent[x]); return parent[x]; }
    void union(int x, int y) {
        int px = find(x), py = find(y);
        if (px == py) return;
        if (rank[px] < rank[py]) parent[px] = py;
        else if (rank[px] > rank[py]) parent[py] = px;
        else { parent[py] = px; rank[px]++; }
    }
    public int swimInWater(int[][] grid) {
        int n = grid.length;
        parent = new int[n*n]; rank = new int[n*n];
        for (int i = 0; i < n*n; i++) parent[i] = i;
        int[][] pos = new int[n*n][2];
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++) pos[grid[i][j]] = new int[]{i, j};
        int[][] dirs = {{0,1},{0,-1},{1,0},{-1,0}};
        boolean[][] visited = new boolean[n][n];
        for (int t = 0; t < n*n; t++) {
            int r = pos[t][0], c = pos[t][1];
            visited[r][c] = true;
            for (int[] d : dirs) {
                int nr = r+d[0], nc = c+d[1];
                if (nr>=0 && nr<n && nc>=0 && nc<n && visited[nr][nc])
                    union(r*n+c, nr*n+nc);
            }
            if (find(0) == find(n*n-1)) return t;
        }
        return n*n-1;
    }
}` },

  { id: 'g49', title: 'G49 - Most Stones Removed', section: 5, sectionName: 'MST / DSU', difficulty: 'Medium', algorithmKey: 'dsuVisualization', presetGraphKey: 'dsu-basic', isGrid: false,
    leetcodeUrl: 'https://leetcode.com/problems/most-stones-removed-with-same-row-or-column/',
    description: 'DSU: stones in same row/column are in same component. Answer = n - components.',
    javaCode: `// Most Stones Removed (DSU)
import java.util.*;
class Solution {
    Map<Integer, Integer> parent = new HashMap<>();
    int find(int x) {
        parent.putIfAbsent(x, x);
        if (parent.get(x) != x) parent.put(x, find(parent.get(x)));
        return parent.get(x);
    }
    void union(int x, int y) {
        int px = find(x), py = find(y);
        if (px != py) parent.put(px, py);
    }
    public int removeStones(int[][] stones) {
        for (int[] s : stones) union(s[0], ~s[1]);
        Set<Integer> roots = new HashSet<>();
        for (int[] s : stones) roots.add(find(s[0]));
        return stones.length - roots.size();
    }
}` },

  { id: 'g50', title: "G50 - Kosaraju's SCC", section: 5, sectionName: 'MST / DSU', difficulty: 'Medium', algorithmKey: 'kosarajuSCC', presetGraphKey: 'scc-graph', isGrid: false,
    leetcodeUrl: 'https://www.geeksforgeeks.org/problems/strongly-connected-components-kosarajus-algo/1',
    description: 'Find Strongly Connected Components using Kosaraju\'s two-pass DFS.',
    javaCode: `// Kosaraju's Algorithm (SCC)
import java.util.*;
class Solution {
    public int kosaraju(int V, List<List<Integer>> adj) {
        boolean[] visited = new boolean[V];
        Stack<Integer> stack = new Stack<>();
        // Pass 1: Fill stack by finish time
        for (int i = 0; i < V; i++)
            if (!visited[i]) dfs1(i, adj, visited, stack);
        // Build transpose
        List<List<Integer>> transpose = new ArrayList<>();
        for (int i = 0; i < V; i++) transpose.add(new ArrayList<>());
        for (int u = 0; u < V; u++)
            for (int v : adj.get(u)) transpose.get(v).add(u);
        // Pass 2: Process in stack order
        Arrays.fill(visited, false);
        int sccCount = 0;
        while (!stack.isEmpty()) {
            int node = stack.pop();
            if (!visited[node]) { dfs2(node, transpose, visited); sccCount++; }
        }
        return sccCount;
    }
    void dfs1(int node, List<List<Integer>> adj, boolean[] vis, Stack<Integer> st) {
        vis[node] = true;
        for (int v : adj.get(node)) if (!vis[v]) dfs1(v, adj, vis, st);
        st.push(node);
    }
    void dfs2(int node, List<List<Integer>> adj, boolean[] vis) {
        vis[node] = true;
        for (int v : adj.get(node)) if (!vis[v]) dfs2(v, adj, vis);
    }
}` },

  // ═══════════════════════════════ SECTION 6: ADVANCED ═══════════════════════════════
  { id: 'g51', title: "G51 - Bridges (Tarjan's)", section: 6, sectionName: 'Advanced Graph', difficulty: 'Hard', algorithmKey: 'tarjanBridges', presetGraphKey: 'bridges-graph', isGrid: false,
    leetcodeUrl: 'https://leetcode.com/problems/critical-connections-in-a-network/',
    description: "Find all bridges (critical connections) using Tarjan's algorithm.",
    javaCode: `// Critical Connections (Tarjan's Bridges)
import java.util.*;
class Solution {
    int timer = 0;
    public List<List<Integer>> criticalConnections(int n, List<List<Integer>> connections) {
        List<List<Integer>> adj = new ArrayList<>(), result = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (List<Integer> e : connections) { adj.get(e.get(0)).add(e.get(1)); adj.get(e.get(1)).add(e.get(0)); }
        int[] disc = new int[n], low = new int[n];
        boolean[] visited = new boolean[n];
        dfs(0, -1, adj, disc, low, visited, result);
        return result;
    }
    void dfs(int u, int parent, List<List<Integer>> adj, int[] disc, int[] low, boolean[] vis, List<List<Integer>> res) {
        vis[u] = true;
        disc[u] = low[u] = timer++;
        for (int v : adj.get(u)) {
            if (!vis[v]) {
                dfs(v, u, adj, disc, low, vis, res);
                low[u] = Math.min(low[u], low[v]);
                if (low[v] > disc[u]) res.add(Arrays.asList(u, v));
            } else if (v != parent) {
                low[u] = Math.min(low[u], disc[v]);
            }
        }
    }
}` },

  { id: 'g52', title: 'G52 - Articulation Points', section: 6, sectionName: 'Advanced Graph', difficulty: 'Hard', algorithmKey: 'articulationPoints', presetGraphKey: 'bridges-graph', isGrid: false,
    leetcodeUrl: 'https://www.geeksforgeeks.org/problems/articulation-point-1/1',
    description: 'Find all articulation points (cut vertices) in an undirected graph.',
    javaCode: `// Articulation Points
import java.util.*;
class Solution {
    int timer = 0;
    public ArrayList<Integer> articulationPoints(int V, ArrayList<ArrayList<Integer>> adj) {
        int[] disc = new int[V], low = new int[V], parent = new int[V];
        boolean[] visited = new boolean[V], isAP = new boolean[V];
        Arrays.fill(parent, -1);
        for (int i = 0; i < V; i++)
            if (!visited[i]) dfs(i, adj, disc, low, parent, visited, isAP);
        ArrayList<Integer> result = new ArrayList<>();
        for (int i = 0; i < V; i++) if (isAP[i]) result.add(i);
        if (result.isEmpty()) result.add(-1);
        return result;
    }
    void dfs(int u, ArrayList<ArrayList<Integer>> adj, int[] disc, int[] low, int[] parent, boolean[] vis, boolean[] isAP) {
        vis[u] = true; disc[u] = low[u] = timer++; int children = 0;
        for (int v : adj.get(u)) {
            if (!vis[v]) {
                children++; parent[v] = u;
                dfs(v, adj, disc, low, parent, vis, isAP);
                low[u] = Math.min(low[u], low[v]);
                if (parent[u] == -1 && children > 1) isAP[u] = true;
                if (parent[u] != -1 && low[v] >= disc[u]) isAP[u] = true;
            } else if (v != parent[u]) low[u] = Math.min(low[u], disc[v]);
        }
    }
}` },

  { id: 'g53', title: 'G53 - Euler Circuit / Path', section: 6, sectionName: 'Advanced Graph', difficulty: 'Hard', algorithmKey: 'eulerPath', presetGraphKey: 'euler-graph', isGrid: false,
    leetcodeUrl: 'https://www.geeksforgeeks.org/problems/euler-circuit-and-path/1',
    description: "Find Euler path/circuit using Hierholzer's algorithm.",
    javaCode: `// Euler Circuit / Path (Hierholzer's)
import java.util.*;
class Solution {
    public int isEulerCircuit(int V, List<List<Integer>> adj) {
        // Check connectivity
        boolean[] visited = new boolean[V];
        int start = -1;
        for (int i = 0; i < V; i++) if (!adj.get(i).isEmpty()) { start = i; break; }
        if (start == -1) return 2;
        dfs(start, adj, visited);
        for (int i = 0; i < V; i++)
            if (!visited[i] && !adj.get(i).isEmpty()) return 0;
        int oddDegree = 0;
        for (int i = 0; i < V; i++)
            if (adj.get(i).size() % 2 != 0) oddDegree++;
        if (oddDegree == 0) return 2; // Euler Circuit
        if (oddDegree == 2) return 1; // Euler Path
        return 0; // Neither
    }
    void dfs(int node, List<List<Integer>> adj, boolean[] vis) {
        vis[node] = true;
        for (int v : adj.get(node)) if (!vis[v]) dfs(v, adj, vis);
    }
}` },
];

export default problems;
