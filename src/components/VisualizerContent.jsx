import GraphCanvas from './GraphCanvas';
import ControlsBar from './ControlsBar';
import StatePanel from './StatePanel';
import GraphEditorToolbar from './GraphEditorToolbar';
import DryRunView from './DryRunView';
import StateVisualizer from './StateVisualizer';
import AnalysisMetricsPanel from './AnalysisMetricsPanel';
import GridCanvas from './GridCanvas';
import ArrayCanvas from './ArrayCanvas';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import { useVisualizer } from '../contexts/VisualizerContext';

export default function VisualizerContent() {
  const {
    isSandbox, isArray, isGrid, algorithmDef,
    customProblemData, isEditing, toggleEditing,
    isPlaying, play, pause, stepForward, stepBack, handleReset,
    customProblemHtml, gridAlgo, arrayAlgo,
    getGraphData, loadGraph, navigate,
    setCustomRuns, setCustomProblemData, setSelectedProblemId,
    setCustomProblemHtml, setLayoutDebugInfo,
  } = useVisualizer();

  useKeyboardShortcuts({
    isPlaying,
    onPlay: play,
    onPause: pause,
    onStepForward: stepForward,
    onStepBack: stepBack,
    onReset: handleReset,
    disabled: (!algorithmDef && !isArray) || isEditing,
  });

  const arrayData = customProblemData?.arrayData;

  return (
    <>
      {isSandbox ? (
        <DryRunView
          onLoadGraph={(data, debugInfo) => {
            if (data?.isArrayAnalysis) {
              const newRun = {
                id: `custom-array-${Date.now()}`,
                title: data.arrayData.algorithmName || 'Custom Array Analysis',
                algorithmType: 'arrayAnalysis',
                arrayData: data.arrayData,
              };
              setCustomRuns(prev => [...prev, newRun]);
              setCustomProblemData(newRun);
              setSelectedProblemId(newRun.id);
              navigate('/visualizer/' + newRun.id);
              return;
            }

            if (data?.isGridAnalysis) {
              const newRun = {
                id: `custom-grid-${Date.now()}`,
                title: data.title || 'Imported Grid',
                algorithmType: 'grid',
                gridData: data.gridData,
                code: data.code,
                language: data.language,
              };
              setCustomRuns(prev => [...prev, newRun]);
              setCustomProblemData(newRun);
              setSelectedProblemId(newRun.id);
              navigate('/visualizer/' + newRun.id);
              return;
            }

            loadGraph(data);
            if (debugInfo) {
              setLayoutDebugInfo(debugInfo);
              if (debugInfo.problemHtml) setCustomProblemHtml(debugInfo.problemHtml);
            }
            if (!isEditing) toggleEditing();

            const newRun = {
              id: `custom-graph-import-${Date.now()}`,
              title: data.title || 'Imported Graph',
              algorithmType: 'custom',
            };
            setCustomRuns(prev => [...prev, newRun]);
            setCustomProblemData(newRun);
            setSelectedProblemId(newRun.id);
            navigate('/visualizer/' + newRun.id);
          }}
          currentGraphData={getGraphData}
        />
      ) : (
        <>
          {!isGrid && (
            <GraphEditorToolbar />
          )}

          {isArray ? (
            <div className="flex-1 overflow-y-auto flex flex-col">
              <div className="flex-1 flex flex-col min-h-[350px]">
                <ArrayCanvas step={arrayAlgo.algorithmState} />
              </div>
              <AnalysisMetricsPanel analysisData={arrayData} />
            </div>
          ) : isGrid ? (
            <>
              {algorithmDef?.unrecognized && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-yellow-500/20 border border-yellow-500/40 text-yellow-200 text-xs px-4 py-2 rounded-lg pointer-events-none">
                  Could not identify algorithm for &ldquo;{algorithmDef.unrecognized}&rdquo;. Using generic grid explorer.
                </div>
              )}
              <GridCanvas grid={gridAlgo.currentGrid} />
            </>
          ) : (
            <GraphCanvas />
          )}

          <ControlsBar />

          {!isArray && <StatePanel />}

          {!isArray && <StateVisualizer />}
        </>
      )}
    </>
  );
}
