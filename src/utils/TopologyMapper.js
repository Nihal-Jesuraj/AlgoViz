/**
 * Topology Mapper utility.
 * Maps raw visual labels to internal Node IDs by comparing graph degrees and spatial relationships.
 */

function getDegreeMap(nodes, edges) {
  const degrees = {};
  nodes.forEach(n => degrees[n] = 0);
  edges.forEach(([u, v]) => {
    // some visual edges might reference nodes that weren't fully captured
    if (degrees[u] !== undefined) degrees[u]++;
    if (degrees[v] !== undefined) degrees[v]++;
  });
  return degrees;
}

function normalizeLabel(label) {
  return String(label)
    .trim()
    .toLowerCase()
    .replace(/^node\s+/i, '')
    .replace(/[^a-z0-9-]/g, '');
}

export function mapNodesByTopology(rawCoordinates, visualEdges, expectedNodeIds, expectedEdges) {
  const mappedCoordinates = {};
  const labelMap = {};
  const rawLabels = Object.keys(rawCoordinates);
  const usedExpected = new Set();
  const usedVisual = new Set();

  // 1. Calculate degrees
  // Normalize expectedEdges from array of objects {source, target} or arrays [u,v]
  const normalizedExpectedEdges = expectedEdges.map(e => Array.isArray(e) ? e : [e.source, e.target]);

  // 1a. First map labels that visibly match the internal node id. This prevents
  // symmetric graphs from swapping numbers just because their degrees match.
  const expectedByNormalizedLabel = new Map();
  expectedNodeIds.forEach((id) => {
    const key = normalizeLabel(id);
    if (!expectedByNormalizedLabel.has(key)) expectedByNormalizedLabel.set(key, []);
    expectedByNormalizedLabel.get(key).push(id);
  });

  let mappedCount = 0;
  rawLabels.forEach((rawLabel) => {
    const candidates = expectedByNormalizedLabel.get(normalizeLabel(rawLabel)) || [];
    const unusedCandidates = candidates.filter((id) => !usedExpected.has(id));
    if (unusedCandidates.length !== 1) return;

    const expectedId = unusedCandidates[0];
    mappedCoordinates[expectedId] = rawCoordinates[rawLabel];
    labelMap[expectedId] = String(rawLabel);
    usedExpected.add(expectedId);
    usedVisual.add(rawLabel);
    mappedCount++;
  });
  
  const expectedDegrees = getDegreeMap(expectedNodeIds, normalizedExpectedEdges);
  const visualDegrees = getDegreeMap(rawLabels, visualEdges);

  // 2. Group nodes by degree
  const expectedByDegree = {};
  const visualByDegree = {};

  for (const id of expectedNodeIds) {
    if (usedExpected.has(id)) continue;
    const d = expectedDegrees[id];
    if (!expectedByDegree[d]) expectedByDegree[d] = [];
    expectedByDegree[d].push(id);
  }

  for (const label of rawLabels) {
    if (usedVisual.has(label)) continue;
    const d = visualDegrees[label];
    if (!visualByDegree[d]) visualByDegree[d] = [];
    visualByDegree[d].push(label);
  }

  // 3. Map within degree groups, using Y-coordinate (top to bottom) as a tie-breaker
  for (const degreeStr of Object.keys(visualByDegree)) {
    const d = Number(degreeStr);
    const visNodes = visualByDegree[d];
    
    // Fallback: If the expected graph doesn't have this exact degree, find the closest available
    let expNodes = expectedByDegree[d];
    if (!expNodes || expNodes.length === 0) {
      // Find closest degree
      const availableDegrees = Object.keys(expectedByDegree).map(Number).filter(deg => expectedByDegree[deg].length > 0);
      if (availableDegrees.length === 0) continue;
      
      const closestDegree = availableDegrees.reduce((prev, curr) => 
        Math.abs(curr - d) < Math.abs(prev - d) ? curr : prev
      );
      expNodes = expectedByDegree[closestDegree];
    }

    // Sort visual nodes by Y coordinate (top to bottom), then X (left to right)
    visNodes.sort((a, b) => {
      const posA = rawCoordinates[a];
      const posB = rawCoordinates[b];
      if (Math.abs(posA.y - posB.y) > 20) return posA.y - posB.y; // 20px tolerance for "same row"
      return posA.x - posB.x;
    });

    // We don't have absolute spatial coords for expected nodes, but if they are sequential (0,1,2), 
    // lower IDs are typically roots or parents (top-down).
    expNodes.sort();

    // Assign matches
    for (let i = 0; i < Math.min(visNodes.length, expNodes.length); i++) {
      const vLabel = visNodes[i];
      const eId = expNodes[i];
      mappedCoordinates[eId] = rawCoordinates[vLabel];
      labelMap[eId] = String(vLabel);
      mappedCount++;
    }
    
    // Remove used expected nodes so they aren't double mapped
    expNodes.splice(0, Math.min(visNodes.length, expNodes.length));
  }

  return {
    mappedCoordinates,
    labelMap,
    mappedCount,
    totalExpected: expectedNodeIds.length
  };
}
