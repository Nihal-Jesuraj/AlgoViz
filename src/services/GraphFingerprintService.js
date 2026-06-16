/**
 * Analyzes graph structure to generate deterministic fingerprints for caching.
 * NOTE: This service is intentionally kept simple. Graph fingerprinting is NP-Hard
 * in general, and the current implementation is sufficient for basic caching.
 * For production use with high collision sensitivity, consider using spectral
 * graph theory (eigenvalues of adjacency matrix) or external libraries.
 */
export class GraphFingerprintService {
  /**
   * Main entrypoint to compute a fingerprint hash for a graph.
   * IMPORTANT: This uses a simple heuristic and WILL have false positives.
   * Non-isomorphic graphs can have identical fingerprints.
   * Use only for heuristic caching with fallback to expensive recomputation.
   * 
   * @param {Array} nodes
   * @param {Array} edges
   * @param {boolean} isDirected
   * @returns {string} Deterministic fingerprint string (or null if invalid)
   */
  static generateFingerprint(nodes, edges, isDirected) {
    if (!nodes || nodes.length === 0) return null;

    const nodeCount = nodes.length;
    const edgeCount = edges.length;
    
    // Compute degree sequence (sorted descending)
    const degrees = new Array(nodeCount).fill(0);
    nodes.forEach((n, idx) => {
      const id = n.id;
      edges.forEach(e => {
        if (e.source === id || e.target === id) {
          degrees[idx]++;
          if (!isDirected && e.source === id && e.target === id) {
            // Self-loop: counts twice for undirected
            degrees[idx]++;
          }
        }
      });
    });
    
    const degreeSequence = degrees.sort((a, b) => b - a);

    const fingerprintObj = {
      nodeCount,
      edgeCount,
      isDirected,
      degreeSequence
    };

    // Deterministic stringification
    return JSON.stringify(fingerprintObj);
  }
  // Removed: computeDegreeSequence, computeConnectedComponents, computeCycleHeuristic
  // These were unused in the simplified approach above.
}
