import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Navbar from './components/Navbar';
import CodePanel from './components/CodePanel';
import AISolutionPanel from './components/AISolutionPanel';
import LiquidGlassBackground from './components/LiquidGlassBackground';
import MainSidebar from './components/MainSidebar';
import HomeView from './components/HomeView';
import DashboardView from './components/DashboardView';
import DataStructureView from './components/DataStructureView';
import VisualizerContent from './components/VisualizerContent';
import { AISolverService } from './services/AISolverService';
import { problems } from './data/problems';
import { LayoutPersistenceService } from './services/LayoutPersistenceService';
import { SourceDiagramLayoutService } from './services/SourceDiagramLayoutService';
import { useAlgorithm } from './hooks/useAlgorithm';
import { useGridAlgorithm } from './hooks/useGridAlgorithm';
import { useArrayAlgorithm } from './hooks/useArrayAlgorithm';
import { useGraphEditor } from './hooks/useGraphEditor';
import { useProgress } from './hooks/useProgress';
import { useResizablePanel } from './hooks/useResizablePanel';
import { useProblemSetup } from './hooks/useProblemSetup';
import { VisualizerProvider } from './contexts/VisualizerContext';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const isSandbox = location.pathname.startsWith('/sandbox');
  const match = location.pathname.match(/\/visualizer\/([^/]+)/);
  const routeProblemId = match ? match[1] : '';

  // ---- State ----
  const [selectedProblemId, setSelectedProblemId] = useState(routeProblemId || problems[0]?.id || '');
  const [statePanelExpanded, setStatePanelExpanded] = useState(true);
  const [bgThemeId, setBgThemeId] = useState(() => localStorage.getItem('algo_theme') || 'glass');
  const [bgImage, setBgImage] = useState(null);
  const [, setLayoutDebugInfo] = useState(null);
  const [, setCustomRuns] = useState([]);
  const [customProblemData, setCustomProblemData] = useState(null);
  const [customProblemHtml, setCustomProblemHtml] = useState('');
  const [isAISolving, setIsAISolving] = useState(false);
  const [mainSidebarCollapsed, setMainSidebarCollapsed] = useState(false);

  const { width: codePanelWidth, handleResizeStart } = useResizablePanel();

  // Sync route param to state
  useEffect(() => {
    if (routeProblemId && routeProblemId !== selectedProblemId && !routeProblemId.startsWith('custom-')) {
      setSelectedProblemId(routeProblemId);
      setCustomProblemData(null);
    }
  }, [routeProblemId, selectedProblemId]);

  // Sync theme to document element
  useEffect(() => {
    const raw = bgThemeId;
    localStorage.setItem('algo_theme', raw);
    if (['light', 'dark', 'blueprint', 'brutalist'].includes(raw)) {
      document.documentElement.setAttribute('data-theme', raw);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [bgThemeId]);

  // Progress tracking
  const { getOverallProgress } = useProgress();

  const handleChangeTheme = useCallback((newThemeId) => {
    setBgThemeId(newThemeId);
    setBgImage(null);
    localStorage.setItem('dsa-bg-theme', newThemeId);
  }, []);

  // Problem derivation
  const { selectedProblem, algorithmDef, isGrid, isArray, preset, presetGrid, presetNodes, presetEdges } =
    useProblemSetup(selectedProblemId, customProblemData);

  // ---- Graph Editor ----
  const {
    nodes, edges, onNodesChange, onEdgesChange, onConnect,
    isEditing, toggleEditing, isDirected, setIsDirected,
    isWeighted, setIsWeighted, toggleDirected, toggleWeighted,
    addNodeAtPosition, removeNode, removeEdge,
    onNodesDelete, onEdgesDelete,
    editingEdgeId, updateEdgeWeight, startEditingEdge, cancelEditingEdge,
    renameNode, undo, redo, canUndo, canRedo,
    resetGraph, loadGraph, getGraphData, clearGraph,
    getAdjacencyList, nodeCount, edgeCount, setNodes,
  } = useGraphEditor(!isGrid ? presetNodes : [], !isGrid ? presetEdges : []);

  const handleAutoLayout = useCallback(() => {
    import('./utils/LayoutManager').then(({ getLayoutedElements }) => {
      setNodes(getLayoutedElements(nodes, edges, 'TB', isDirected));
    });
  }, [nodes, edges, isDirected, setNodes]);

  // Reset graph when problem changes
  useEffect(() => {
    if (!isGrid && presetNodes.length > 0) {
      resetGraph(presetNodes, presetEdges);
      setIsDirected(preset?.directed || false);
      setIsWeighted(preset?.weighted || false);
      const sourceResult = SourceDiagramLayoutService.applyLayout(selectedProblemId, presetNodes);
      setLayoutDebugInfo(SourceDiagramLayoutService.getDebugInfo(selectedProblem, sourceResult));
    } else {
      setLayoutDebugInfo(null);
    }
  }, [selectedProblemId, selectedProblem, isGrid, presetNodes, presetEdges, resetGraph, setIsDirected, setIsWeighted, preset]);

  // ---- Algorithm Controllers ----
  const graphAlgo = useAlgorithm(
    !isGrid ? algorithmDef?.generator : null,
    getAdjacencyList,
    preset?.startNode || '0',
    isDirected, isWeighted
  );

  const gridAlgo = useGridAlgorithm(
    isGrid ? algorithmDef?.generator : null,
    presetGrid
  );

  const arrayAlgo = useArrayAlgorithm(isArray ? customProblemData?.arrayData?.steps : []);
  const activeAlgo = isArray ? arrayAlgo : (isGrid ? gridAlgo : graphAlgo);

  const { play, pause, stepForward, stepBack, reset: resetAlgorithm, isPlaying, currentStep, totalSteps, speed, setSpeed, currentLine, stepDescription } = activeAlgo;
  const activeAlgorithmState = isArray ? arrayAlgo.algorithmState : (isGrid ? gridAlgo.algorithmData : graphAlgo.algorithmState);

  // Stop algorithm in edit mode
  useEffect(() => { if (isEditing) resetAlgorithm(); }, [isEditing, resetAlgorithm]);

  // Reset algorithm when graph changes
  const prevNodesRef = useRef(nodes);
  const prevEdgesRef = useRef(edges);
  useEffect(() => {
    if (nodes !== prevNodesRef.current || edges !== prevEdgesRef.current) {
      if (currentStep > 0 && !isPlaying) resetAlgorithm();
      prevNodesRef.current = nodes;
      prevEdgesRef.current = edges;
    }
  }, [nodes, edges, resetAlgorithm, currentStep, isPlaying]);

  // Apply algorithm states to React Flow
  const styledNodes = useMemo(() => nodes.map((node) => ({
    ...node, type: 'custom',
    data: { ...node.data, status: graphAlgo.nodeStates?.get(node.id) || 'default', distance: graphAlgo.algorithmState?.distances?.[node.id], isEditing },
    draggable: isEditing && !isPlaying,
  })), [nodes, graphAlgo.nodeStates, graphAlgo.algorithmState, isEditing, isPlaying]);

  const styledEdges = useMemo(() => edges.map((edge) => ({
    ...edge, type: 'custom',
    data: { ...edge.data, status: graphAlgo.edgeStates?.get(edge.id) || 'default', isEditing },
  })), [edges, graphAlgo.edgeStates, isEditing]);

  // ---- Handlers ----
  const handleAISolve = useCallback(async () => {
    if (!customProblemHtml) return;
    setIsAISolving(true);
    try {
      const res = await AISolverService.solveProblem(customProblemHtml, nodes, edges, isDirected);
      if (res.success) {
        const aiGraph = res.data.graphStructure;
        const newRun = { id: `custom-graph-${Date.now()}`, title: res.data.algorithmName || 'Custom Graph Solution', algorithmType: res.data.algorithmType || 'custom', ...res.data };
        setCustomRuns(prev => [...prev, newRun]);
        setCustomProblemData(newRun);
        setSelectedProblemId(newRun.id);
        if (aiGraph && aiGraph.nodes && aiGraph.nodes.length > 0) {
          const formattedNodes = aiGraph.nodes.map(n => ({ id: n.id, type: 'custom', position: n.position || { x: 0, y: 0 }, data: { label: n.label || n.id, status: 'default' } }));
          const formattedEdges = (aiGraph.edges || []).map((e, i) => ({ id: `e${e.source}-${e.target}-${i}`, type: 'custom', source: String(e.source), target: String(e.target), data: { status: 'default', weight: e.weight } }));
          import('./utils/LayoutManager').then(({ getLayoutedElements }) => {
            const layouted = getLayoutedElements(formattedNodes, formattedEdges, 'TB', aiGraph.isDirected);
            loadGraph({ nodes: layouted, edges: formattedEdges, directed: aiGraph.isDirected, weighted: formattedEdges.some(e => e.data.weight !== undefined) });
          });
        }
      } else {
        console.error(res.error);
        setCustomProblemData(res.data);
      }
    } catch (error) { console.error('AI Solve failed:', error); }
    setIsAISolving(false);
  }, [customProblemHtml, nodes, edges, isDirected, loadGraph]);

  const handleReset = useCallback(() => {
    resetAlgorithm();
    if (!isGrid && presetNodes.length > 0 && !isEditing) resetGraph(presetNodes, presetEdges);
  }, [resetAlgorithm, isGrid, resetGraph, presetNodes, presetEdges, isEditing]);

  const handleResetToPreset = useCallback(() => {
    resetAlgorithm();
    if (!isGrid && presetNodes.length > 0) resetGraph(presetNodes, presetEdges);
  }, [resetAlgorithm, isGrid, resetGraph, presetNodes, presetEdges]);

  const handleNodeDragStop = useCallback((event, node, updatedNodes) => {
    if (!isPlaying) {
      LayoutPersistenceService.saveUserLayout(selectedProblemId, updatedNodes);
      setLayoutDebugInfo(prev => {
        if (!prev) return prev;
        const newAvailable = [...(prev.availableLayouts || [])];
        if (!newAvailable.find(l => l.source === 'User Saved')) {
          newAvailable.push({ source: 'User Saved', coordinates: {} });
        }
        return { ...prev, source: 'User Saved', availableLayouts: newAvailable };
      });
    }
  }, [selectedProblemId, isPlaying]);

  const handleSaveCurrentProblem = useCallback(() => {
    if (!customProblemData) return null;
    if (customProblemData.algorithmType === 'grid' && customProblemData.gridData) {
      return {
        isGridAnalysis: true,
        gridData: customProblemData.gridData,
        title: customProblemData.title || 'Imported Grid',
        code: customProblemData.code,
        language: customProblemData.language,
      };
    }
    if (customProblemData.algorithmType === 'arrayAnalysis' && customProblemData.arrayData) {
      return {
        isArrayAnalysis: true,
        arrayData: customProblemData.arrayData,
        title: customProblemData.title || 'Imported Array',
      };
    }
    if (customProblemData.algorithmType === 'custom') {
      return null; // graph saving from sidebar not supported yet
    }
    return null;
  }, [customProblemData]);

  const handleLoadSavedProblem = useCallback((savedData) => {
    if (savedData?.isGridAnalysis) {
      const newRun = {
        id: `custom-grid-${Date.now()}`,
        title: savedData.title || 'Imported Grid',
        algorithmType: 'grid',
        gridData: savedData.gridData,
        code: savedData.code,
        language: savedData.language,
      };
      setCustomRuns(prev => [...prev, newRun]);
      setCustomProblemData(newRun);
      setSelectedProblemId(newRun.id);
      navigate('/visualizer/' + newRun.id);
    } else if (savedData?.isArrayAnalysis) {
      const newRun = {
        id: `custom-array-${Date.now()}`,
        title: savedData.title || 'Imported Array',
        algorithmType: 'arrayAnalysis',
        arrayData: savedData.arrayData,
      };
      setCustomRuns(prev => [...prev, newRun]);
      setCustomProblemData(newRun);
      setSelectedProblemId(newRun.id);
      navigate('/visualizer/' + newRun.id);
    } else if (savedData?.nodes) {
      loadGraph({ nodes: savedData.nodes, edges: savedData.edges, directed: savedData.isDirected, weighted: savedData.isWeighted });
      const newRun = {
        id: `custom-graph-import-${Date.now()}`,
        title: savedData.title || 'Imported Graph',
        algorithmType: 'custom',
      };
      setCustomRuns(prev => [...prev, newRun]);
      setCustomProblemData(newRun);
      setSelectedProblemId(newRun.id);
      navigate('/visualizer/' + newRun.id);
    }
  }, [navigate, loadGraph, setCustomRuns, setCustomProblemData, setSelectedProblemId]);

  const isHome = location.pathname === '/';

  const handleToggleStatePanel = useCallback(() => {
    setStatePanelExpanded(prev => !prev);
  }, []);

  const visualizerContextValue = useMemo(() => ({
    isSandbox, selectedProblemId, isArray, isGrid, activeAlgo,
    customProblemData, styledNodes, styledEdges,
    onNodesChange, onEdgesChange, onConnect,
    isEditing, toggleEditing, isDirected, toggleDirected,
    isWeighted, toggleWeighted, addNodeAtPosition,
    removeNode, removeEdge, onNodesDelete, onEdgesDelete,
    editingEdgeId, updateEdgeWeight, startEditingEdge,
    cancelEditingEdge, renameNode, isPlaying, handleNodeDragStop,
    undo, redo, canUndo, canRedo, clearGraph,
    handleResetToPreset, handleAutoLayout, nodeCount, edgeCount,
    play, pause, stepForward, stepBack, handleReset,
    speed, setSpeed, currentStep, totalSteps, algorithmDef,
    handleAISolve, isAISolving, activeAlgorithmState, stepDescription,
    statePanelExpanded, onToggleStatePanel: handleToggleStatePanel,
    customProblemHtml, gridAlgo, arrayAlgo,
    getGraphData, loadGraph, navigate,
    setCustomRuns, setCustomProblemData, setSelectedProblemId,
    setCustomProblemHtml, setLayoutDebugInfo,
  }), [
    isSandbox, selectedProblemId, isArray, isGrid, activeAlgo,
    customProblemData, styledNodes, styledEdges,
    onNodesChange, onEdgesChange, onConnect,
    isEditing, toggleEditing, isDirected, toggleDirected,
    isWeighted, toggleWeighted, addNodeAtPosition,
    removeNode, removeEdge, onNodesDelete, onEdgesDelete,
    editingEdgeId, updateEdgeWeight, startEditingEdge,
    cancelEditingEdge, renameNode, isPlaying,
    undo, redo, canUndo, canRedo, clearGraph,
    handleResetToPreset, handleAutoLayout, nodeCount, edgeCount,
    play, pause, stepForward, stepBack, handleReset,
    speed, setSpeed, currentStep, totalSteps, algorithmDef,
    handleAISolve, isAISolving, activeAlgorithmState, stepDescription,
    statePanelExpanded, handleToggleStatePanel,
    customProblemHtml, gridAlgo, arrayAlgo,
    getGraphData, loadGraph, navigate,
    setCustomRuns, setCustomProblemData, setSelectedProblemId,
    setCustomProblemHtml, setLayoutDebugInfo,
  ]);

  return (
    <ReactFlowProvider>
      <div className="relative w-screen h-screen flex overflow-hidden selection:bg-[var(--glass-border)]">
        {!['light', 'dark', 'blueprint', 'brutalist'].includes(bgThemeId) && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <LiquidGlassBackground themeId={bgThemeId} bgImage={bgImage} />
          </div>
        )}

        {!isHome && (
          <MainSidebar isCollapsed={mainSidebarCollapsed} onToggleCollapse={() => setMainSidebarCollapsed(!mainSidebarCollapsed)} customProblemData={customProblemData} onSaveCurrentProblem={handleSaveCurrentProblem} onLoadSavedProblem={handleLoadSavedProblem} />
        )}

        <Navbar
          problemTitle={isSandbox ? 'Sandbox' : customProblemData?.title || ({ avl: 'AVL Tree', bst: 'Binary Search Tree', 'linked-list': 'Linked List', array: 'Array' })[routeProblemId] || selectedProblem?.title}
          showTitle={location.pathname.startsWith('/visualizer') || location.pathname.startsWith('/sandbox')}
          sidebarWidth={mainSidebarCollapsed ? 60 : 280}
          algorithmName={algorithmDef?.name}
          currentTheme={bgThemeId}
          onChangeTheme={handleChangeTheme}
          overallProgress={getOverallProgress(problems)}
        />

        <div className="relative flex-1 flex flex-col overflow-hidden z-10 pt-14">
          <Routes>
            <Route path="/" element={<HomeView currentTheme={bgThemeId} />} />
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/visualizer/avl" element={<DataStructureView id="avl" />} />
            <Route path="/visualizer/bst" element={<DataStructureView id="bst" />} />
            <Route path="/visualizer/linked-list" element={<DataStructureView id="linked-list" />} />
            <Route path="/visualizer/array" element={<DataStructureView id="array" />} />
            <Route path="*" element={
              <div className="flex flex-1 overflow-hidden">
                {(() => {
                  const hideCode = (isSandbox && !customProblemData) || customProblemData?.algorithmType === 'custom';
                  return <>
                    <div
                      className="flex-shrink-0 flex flex-col min-h-0"
                      data-glass-panel="code"
                      style={{ width: codePanelWidth, display: hideCode ? 'none' : 'flex' }}
                    >
                      {isSandbox ? (
                        <AISolutionPanel customProblemData={customProblemData} themeId={bgThemeId} />
                      ) : (
                        (() => {
                          let panelCode, panelLang, panelTitle;
                          if (isArray) {
                            const arrData = customProblemData.arrayData;
                            panelCode = arrData?.correctedCode || arrData?.javaCode;
                            if (!panelCode && arrData?.steps?.[0]?.arr) {
                              const a = arrData.steps[0].arr;
                              const firstVal = a[0];
                              const typeName = typeof firstVal === 'number' ? 'int' : typeof firstVal === 'string' ? 'String' : 'int';
                              const fmt = v => typeof v === 'string' ? `"${v}"` : String(v);
                              panelCode = `// ${arrData.algorithmName || 'Array Problem'}\n${typeName}[] nums = {${a.map(fmt).join(', ')}};`;
                            }
                            panelCode = panelCode || '// Code';
                            panelLang = arrData?.language?.toLowerCase() || 'java';
                            panelTitle = arrData?.algorithmName || 'Analyzed Code';
                          } else if (isGrid && customProblemData?.gridData) {
                            if (algorithmDef?.javaCode) {
                              panelCode = algorithmDef.javaCode;
                              panelLang = 'java';
                              panelTitle = customProblemData.title || 'Problem Code';
                            } else if (customProblemData.code) {
                              panelCode = customProblemData.code;
                              panelLang = customProblemData.language || 'java';
                              panelTitle = customProblemData.title || 'Problem Code';
                            } else {
                              const gd = customProblemData.gridData;
                              const firstCell = gd[0]?.[0];
                              const typeName = typeof firstCell === 'number' ? 'int' : 'char';
                              const fmt = v => typeof v === 'number' ? String(v) : `'${v}'`;
                              const rows = gd.map(r => '    {' + r.map(fmt).join(', ') + '}');
                              panelCode = `// ${customProblemData.title || 'Grid Problem'}\n${typeName}[][] grid = {\n${rows.join(',\n')}\n};`;
                              panelLang = 'java';
                              panelTitle = customProblemData.title || 'Problem Grid Data';
                            }
                          } else {
                            panelCode = selectedProblem?.javaCode || '// Select a problem to view code';
                            panelLang = 'java';
                            panelTitle = selectedProblem?.title || 'Algorithm Code';
                          }
                          return <CodePanel code={panelCode} language={panelLang} currentLine={currentLine} title={panelTitle} themeId={bgThemeId} />;
                        })()
                      )}
                    </div>

                    {!hideCode && (
                      <div
                        className="w-1.5 flex-shrink-0 cursor-col-resize group relative hover:bg-[var(--glass-fill)] transition-colors duration-150"
                        onMouseDown={handleResizeStart}
                        title="Drag to resize"
                      >
                        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-black/[0.06] group-hover:bg-[var(--color-accent)] transition-colors duration-150" />
                      </div>
                    )}

                    <div className="flex-1 flex flex-col relative min-w-0">
                      <VisualizerProvider value={visualizerContextValue}>
                        <VisualizerContent />
                      </VisualizerProvider>
                    </div>
                  </>;
                })()}
              </div>
            } />
          </Routes>
        </div>
      </div>
    </ReactFlowProvider>
  );
}
