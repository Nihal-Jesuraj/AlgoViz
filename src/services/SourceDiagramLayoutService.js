import { visionLayouts } from '../data/visionLayouts';

const DEFAULT_MIN_COVERAGE = 0.0001;

function normalizeCoordinate(coord) {
  if (!coord || typeof coord.x !== 'number' || typeof coord.y !== 'number') {
    return null;
  }

  return {
    x: Math.round(coord.x),
    y: Math.round(coord.y),
  };
}

function normalizeLayout(layout) {
  if (!layout) return null;
  const rawCoordinates = layout.coordinates || layout;
  const coordinates = {};

  Object.entries(rawCoordinates).forEach(([id, coord]) => {
    const normalized = normalizeCoordinate(coord);
    if (normalized) coordinates[String(id)] = normalized;
  });

  return {
    coordinates,
    sourceImage: layout.sourceImage || layout.selectedImage || null,
    sourceUrl: layout.sourceUrl || null,
    confidence: layout.confidence,
    capturedAt: layout.capturedAt || null,
  };
}

export class SourceDiagramLayoutService {
  static getLayout(problemId) {
    return normalizeLayout(visionLayouts[problemId]);
  }

  static getCoverage(layout, nodes) {
    if (!layout || !nodes || nodes.length === 0) {
      return { mappedCount: 0, totalExpected: nodes?.length || 0, coverage: 0, missingNodeIds: [] };
    }

    const missingNodeIds = nodes
      .map((node) => node.id)
      .filter((id) => !layout.coordinates[String(id)]);

    const totalExpected = nodes.length;
    const mappedCount = totalExpected - missingNodeIds.length;
    const coverage = totalExpected === 0 ? 0 : mappedCount / totalExpected;

    return { mappedCount, totalExpected, coverage, missingNodeIds };
  }

  static canApply(layout, nodes, minCoverage = DEFAULT_MIN_COVERAGE) {
    const coverage = this.getCoverage(layout, nodes);
    return coverage.totalExpected > 0 && coverage.coverage >= minCoverage;
  }

  static applyLayout(problemId, nodes, minCoverage = DEFAULT_MIN_COVERAGE) {
    const layout = this.getLayout(problemId);
    const coverage = this.getCoverage(layout, nodes);

    if (!this.canApply(layout, nodes, minCoverage)) {
      return {
        nodes,
        applied: false,
        layout,
        ...coverage,
      };
    }

    return {
      nodes: nodes.map((node) => ({
        ...node,
        position: layout.coordinates[String(node.id)] || node.position,
      })),
      applied: true,
      layout,
      ...coverage,
    };
  }

  static getDebugInfo(problem, result, fallbackSource = 'Auto-Layout') {
    if (result.applied) {
      return {
        source: 'Source Diagram',
        status: 'success',
        confidence: result.layout?.confidence,
        selectedImage: result.layout?.sourceImage,
        sourceUrl: result.layout?.sourceUrl || problem?.leetcodeUrl,
        mappedCount: result.mappedCount,
        totalExpected: result.totalExpected,
        availableLayouts: [
          { source: 'Source Diagram', coordinates: result.layout.coordinates },
        ],
      };
    }

    return {
      source: fallbackSource,
      status: 'fallback',
      reason: result.totalExpected === 0
        ? 'No graph nodes were available for source diagram matching.'
        : `No complete source diagram layout is checked in for this problem yet. Missing nodes: ${result.missingNodeIds.join(', ') || 'none'}.`,
      mappedCount: result.mappedCount,
      totalExpected: result.totalExpected,
      sourceUrl: problem?.leetcodeUrl,
    };
  }
}
