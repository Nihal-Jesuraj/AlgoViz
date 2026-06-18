import { useMemo } from 'react';
import { problems } from '../data/problems';
import presetGraphs from '../data/presetGraphs';
import { presetGrids } from '../data/presetGrids';
import { getLayoutedElements } from '../utils/LayoutManager';
import { parseLeetCodeFormat } from '../utils/graphInputParser';
import { algorithms } from '../algorithms/index';
import { SourceDiagramLayoutService } from '../services/SourceDiagramLayoutService';
import { gridProblemMap } from '../data/gridProblemMap';

function* gridExplorerGenerator(rawGrid) {
  const R = rawGrid.length, C = rawGrid[0]?.length || 0;
  if (!R || !C) return;
  const grid = rawGrid.map((row, r) =>
    row.map((val, c) => ({ value: val, status: 'default' }))
  );
  const queue = [[0, 0]];
  const visited = new Set(['0,0']);
  grid[0][0].status = 'source';
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
  yield { grid: grid.map(r => r.map(c => ({ ...c }))), description: 'Start BFS from (0, 0)', data: { queue: [[0, 0]], visited: ['0,0'] }, line: 1 };
  let step = 1;
  while (queue.length > 0 && step < 100) {
    const [r, c] = queue.shift();
    grid[r][c].status = 'visited';
    yield { grid: grid.map(r => r.map(c => ({ ...c }))), description: `Visit (${r}, ${c})`, data: { queue: [...queue], visited: [...visited] }, line: step + 2 };
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      const key = `${nr},${nc}`;
      if (nr >= 0 && nr < R && nc >= 0 && nc < C && !visited.has(key)) {
        visited.add(key);
        queue.push([nr, nc]);
        grid[nr][nc].status = 'queued';
      }
    }
    step++;
  }
  yield { grid: grid.map(r => r.map(c => ({ ...c }))), description: 'Traversal complete', data: {}, line: step + 2 };
}

export function useProblemSetup(selectedProblemId, customProblemData) {
  const selectedProblem = useMemo(
    () => problems.find((p) => p.id === selectedProblemId) || problems[0],
    [selectedProblemId]
  );

  const algorithmDef = useMemo(() => {
    if ((selectedProblemId === 'import' || selectedProblemId?.startsWith('custom-graph-import')) && customProblemData) {
      const algoKey = customProblemData.algorithmType;
      return {
        name: algoKey === 'custom' ? 'AI Custom Solution' : `AI Solution (${algoKey})`,
        category: 'custom',
        generator: (g, s) => algorithms.custom.generator(g, s, customProblemData.dryRun || [])
      };
    }
    if (selectedProblemId?.startsWith('custom-grid') && customProblemData?.gridData) {
      const title = (customProblemData.title || '').toLowerCase();
      const matched = gridProblemMap.find(entry =>
        entry.keywords.some(kw => title.includes(kw))
      );
      if (matched) {
        return {
          name: customProblemData.title || matched.algorithmKey,
          category: 'grid',
          isGrid: true,
          generator: matched.generator,
          algorithmKey: matched.algorithmKey,
          javaCode: matched.javaCode,
        };
      }
      console.warn(`[useProblemSetup] Unrecognized grid problem: "${customProblemData.title}". Using generic grid explorer.`);
      return {
        name: customProblemData.title || 'Unrecognized Grid',
        category: 'grid',
        isGrid: true,
        generator: gridExplorerGenerator,
        unrecognized: customProblemData.title || true,
      };
    }
    return algorithms[selectedProblem?.algorithmKey] || null;
  }, [selectedProblem, selectedProblemId, customProblemData]);

  const isGrid = algorithmDef?.isGrid || false;
  const isArray = customProblemData?.algorithmType === 'arrayAnalysis';

  const preset = useMemo(() => {
    if (isGrid) return null;

    if (selectedProblem?.input) {
      try {
        const data = parseLeetCodeFormat(selectedProblem.input);
        data.directed = selectedProblem.isDirected || false;
        data.weighted = selectedProblem.isWeighted || false;
        data.startNode = '0';

        if (data.nodes && data.nodes.length > 0) {
          const sourceResult = SourceDiagramLayoutService.applyLayout(selectedProblem.id, data.nodes);
          data.nodes = sourceResult.applied
            ? sourceResult.nodes
            : getLayoutedElements(data.nodes, data.edges, 'TB', data.directed);
        }
        return data;
      } catch (e) {
        console.error("Failed to parse problem input:", e);
      }
    }

    if (!selectedProblem?.presetGraphKey) return null;
    const presetData = JSON.parse(JSON.stringify(presetGraphs[selectedProblem.presetGraphKey]));

    const sourceResult = SourceDiagramLayoutService.applyLayout(selectedProblem.id, presetData.nodes || []);
    if (sourceResult.applied) {
      presetData.nodes = sourceResult.nodes;
    }

    return presetData;
  }, [selectedProblem, isGrid]);

  const presetGrid = useMemo(() => {
    if (selectedProblemId?.startsWith('custom-grid') && customProblemData?.gridData) {
      return customProblemData.gridData;
    }
    return presetGrids[selectedProblem?.presetGridKey] || null;
  }, [selectedProblem, selectedProblemId, customProblemData]);

  const presetNodes = useMemo(() => {
    if (!preset?.nodes) return [];
    return preset.nodes.map((n) => ({
      ...n,
      type: 'custom',
      data: { ...n.data, status: 'default' },
    }));
  }, [preset]);

  const presetEdges = useMemo(() => {
    if (!preset?.edges) return [];
    return preset.edges.map((e) => ({
      ...e,
      type: 'custom',
      data: { ...e.data, status: 'default' },
    }));
  }, [preset]);

  return {
    selectedProblem,
    algorithmDef,
    isGrid,
    isArray,
    preset,
    presetGrid,
    presetNodes,
    presetEdges,
  };
}
