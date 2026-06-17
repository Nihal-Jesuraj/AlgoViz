export const problems = [
  { id: 'bfs', title: 'Breadth-First Search', section: 1, sectionName: 'Algorithm Library', difficulty: 'Easy', algorithmKey: 'bfs', presetGraphKey: 'bfs-basic', isGrid: false,
    description: 'Explore a graph level by level starting from the source node.',
    javaCode: `// Breadth-First Search (BFS)
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

  { id: 'dfs', title: 'Depth-First Search', section: 1, sectionName: 'Algorithm Library', difficulty: 'Easy', algorithmKey: 'dfs', presetGraphKey: 'dfs-basic', isGrid: false,
    description: 'Explore a graph by going as deep as possible before backtracking.',
    javaCode: `// Depth-First Search (DFS)
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

  { id: 'cycle', title: 'Cycle Detection (BFS)', section: 1, sectionName: 'Algorithm Library', difficulty: 'Medium', algorithmKey: 'cycleDetectionUndirectedDFS', presetGraphKey: 'cycle-undirected', isGrid: false, input: '[[1,2],[0,2],[0,1,3],[2]]', isDirected: false, isWeighted: false,
    description: 'Detect if an undirected graph contains a cycle using Breadth-First Search.',
    javaCode: `// Cycle Detection (BFS)
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

  { id: 'topo', title: "Topological Sort (Kahn's)", section: 1, sectionName: 'Algorithm Library', difficulty: 'Medium', algorithmKey: 'kahnsTopoSort', presetGraphKey: 'topo-sort', isGrid: false,
    description: "Linear ordering of vertices in a Directed Acyclic Graph (DAG) based on in-degrees.",
    javaCode: `// Kahn's Algorithm (Topological Sort)
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

  { id: 'dijkstra', title: "Dijkstra's Algorithm", section: 1, sectionName: 'Algorithm Library', difficulty: 'Medium', algorithmKey: 'dijkstra', presetGraphKey: 'dijkstra-weighted', isGrid: false,
    description: "Find the shortest path from a source node to all other nodes in a weighted graph.",
    javaCode: `// Dijkstra's Shortest Path
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
];
