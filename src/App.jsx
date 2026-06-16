import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CodePanel from './components/CodePanel';
import GraphCanvas from './components/GraphCanvas';
import ControlsBar from './components/ControlsBar';
import StatePanel from './components/StatePanel';
import LiquidGlassBackground, { themeIds } from './components/LiquidGlassBackground';
import GraphEditorToolbar from './components/GraphEditorToolbar';
import DryRunView from './components/DryRunView';
import AISolutionPanel from './components/AISolutionPanel';
import StateVisualizer from './components/StateVisualizer';
import { AISolverService } from './services/AISolverService';

import { problems } from './data/problems';
import presetGraphs from './data/presetGraphs';
import { presetGrids } from './data/presetGrids';
import { getLayoutedElements } from './utils/LayoutManager';
import { parseLeetCodeFormat } from './utils/graphInputParser';
import { algorithms } from './algorithms/index';
import { useAlgorithm } from './hooks/useAlgorithm';
import { useGridAlgorithm } from './hooks/useGridAlgorithm';
import { useArrayAlgorithm } from './hooks/useArrayAlgorithm';
import { useGraphEditor } from './hooks/useGraphEditor';
import { useProgress } from './hooks/useProgress';
import GridCanvas from './components/GridCanvas';
import ArrayCanvas from './components/ArrayCanvas';
import { LayoutPersistenceService } from './services/LayoutPersistenceService';
import LayoutDebugPanel from './components/LayoutDebugPanel';
import { SourceDiagramLayoutService } from './services/SourceDiagramLayoutService';

function App() {
  // ---- State ----
  const [selectedProblemId, setSelectedProblemId] = useState(problems[0]?.id || '');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [statePanelExpanded, setStatePanelExpanded] = useState(true);
  const [codePanelWidth, setCodePanelWidth] = useState(380);
  const [bgThemeId, setBgThemeId] = useState(() => localStorage.getItem('algo_theme') || 'glass');
  const [bgImage, setBgImage] = useState(null);
  const [viewMode, setViewMode] = useState('graph'); // 'graph' | 'import'
  const [layoutDebugInfo, setLayoutDebugInfo] = useState(null);
  
  // AI Solver & Custom Runs
  const [customRuns, setCustomRuns] = useState([]);
  const [customProblemData, setCustomProblemData] = useState(null);
  const [customProblemHtml, setCustomProblemHtml] = useState('');
  const [isAISolving, setIsAISolving] = useState(false);

  // Sync theme to document element
  useEffect(() => {
    localStorage.setItem('algo_theme', bgThemeId);
    if (['light', 'dark', 'blueprint'].includes(bgThemeId)) {
      document.documentElement.setAttribute('data-theme', bgThemeId);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [bgThemeId]);

  // Progress tracking
  const {
    completedProblems,
    toggleCompleted,
    getSectionProgress,
    getOverallProgress,
  } = useProgress();

  const handleChangeTheme = useCallback((newThemeId) => {
    setBgThemeId(newThemeId);
    setBgImage(null); // Clear image when switching themes
  }, []);

  const handleImageUpload = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setBgImage(e.target.result);
    };
    reader.readAsDataURL(file);
  }, []);

  // Resize drag state
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(380);

  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = codePanelWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMove = (moveE) => {
      if (!isDraggingRef.current) return;
      const delta = moveE.clientX - startXRef.current;
      const newWidth = Math.min(600, Math.max(260, startWidthRef.current + delta));
      setCodePanelWidth(newWidth);
    };

    const handleUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, [codePanelWidth]);

  // Derive selected problem & its data
  const selectedProblem = useMemo(
    () => problems.find((p) => p.id === selectedProblemId) || problems[0],
    [selectedProblemId]
  );

  const algorithmDef = useMemo(() => {
    if (selectedProblemId === 'import' && customProblemData) {
      const algoKey = customProblemData.algorithmType;
      // ALWAYS use the custom generator for AI solutions so the dry run matches the AI's Java code exactly
      return {
        name: algoKey === 'custom' ? 'AI Custom Solution' : `AI Solution (${algoKey})`,
        category: 'custom',
        generator: (g, s) => algorithms.custom.generator(g, s, customProblemData.dryRun || [])
      };
    }
    return algorithms[selectedProblem?.algorithmKey] || null;
  }, [selectedProblem, selectedProblemId, customProblemData]);

  const isGrid = algorithmDef?.isGrid || false;
  const isArray = customProblemData?.algorithmType === 'arrayAnalysis';

  const preset = useMemo(() => {
    if (isGrid) return null;
    
    // If problem has its own scraped testcase input, generate it dynamically!
    if (selectedProblem?.input) {
      try {
        const data = parseLeetCodeFormat(selectedProblem.input);
        // Default to undirected unless specified otherwise
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
    // Deep copy preset graph so we don't mutate original objects
    const presetData = JSON.parse(JSON.stringify(presetGraphs[selectedProblem.presetGraphKey]));
    
    const sourceResult = SourceDiagramLayoutService.applyLayout(selectedProblem.id, presetData.nodes || []);
    if (sourceResult.applied) {
      presetData.nodes = sourceResult.nodes;
    }
    
    return presetData;
  }, [selectedProblem, isGrid]);

  const presetGrid = useMemo(
    () => presetGrids[selectedProblem?.presetGridKey] || null,
    [selectedProblem]
  );

  // Ensure nodes/edges have `type: 'custom'`
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

  // ---- Graph Editor ----
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    // Mode state removed
    isEditing,
    toggleEditing,
    isDirected,
    setIsDirected,
    isWeighted,
    setIsWeighted,
    toggleDirected,
    toggleWeighted,
    addNodeAtPosition,
    removeNode,
    removeEdge,
    onNodesDelete,
    onEdgesDelete,
    editingEdgeId,
    updateEdgeWeight,
    startEditingEdge,
    cancelEditingEdge,
    renameNode,
    undo,
    redo,
    canUndo,
    canRedo,
    resetGraph,
    loadGraph,
    getGraphData,
    clearGraph,
    getAdjacencyList,
    nodeCount,
    edgeCount,
    setNodes,
  } = useGraphEditor(!isGrid ? presetNodes : [], !isGrid ? presetEdges : []);

  const handleAutoLayout = useCallback(() => {
    import('./utils/LayoutManager').then(({ getLayoutedElements }) => {
      const layoutedNodes = getLayoutedElements(nodes, edges, 'TB', isDirected);
      setNodes(layoutedNodes);
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
    isDirected,
    isWeighted
  );

  const gridAlgo = useGridAlgorithm(
    isGrid ? algorithmDef?.generator : null,
    presetGrid
  );

  const arrayAlgo = useArrayAlgorithm(isArray ? customProblemData?.arrayData?.steps : []);

  const activeAlgo = isArray ? arrayAlgo : (isGrid ? gridAlgo : graphAlgo);

  const {
    play,
    pause,
    stepForward,
    stepBack,
    reset: resetAlgorithm,
    isPlaying,
    currentStep,
    totalSteps,
    speed,
    setSpeed,
    currentLine,
  } = activeAlgo;

  const activeAlgorithmState = isArray ? arrayAlgo.algorithmState : (isGrid ? gridAlgo.algorithmData : graphAlgo.algorithmState);

  // Stop algorithm and reset it if entering edit mode or changing graph structure
  useEffect(() => {
    if (isEditing) {
      resetAlgorithm();
    }
  }, [isEditing, resetAlgorithm]);

  // Reset algorithm when graph changes
  const prevNodesRef = useRef(nodes);
  const prevEdgesRef = useRef(edges);
  useEffect(() => {
    if (nodes !== prevNodesRef.current || edges !== prevEdgesRef.current) {
      if (currentStep > 0 && !isPlaying) {
         resetAlgorithm();
      }
      prevNodesRef.current = nodes;
      prevEdgesRef.current = edges;
    }
  }, [nodes, edges, resetAlgorithm, currentStep, isPlaying]);


  // Apply algorithm states and editing states to React Flow
  const styledNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      type: 'custom',
      data: {
        ...node.data,
        status: graphAlgo.nodeStates?.get(node.id) || 'default',
        distance: graphAlgo.algorithmState?.distances?.[node.id],
        isEditing,
      },
      draggable: isEditing && !isPlaying,
    }));
  }, [nodes, graphAlgo.nodeStates, graphAlgo.algorithmState, isEditing, isPlaying]);

  const styledEdges = useMemo(() => {
    return edges.map((edge) => ({
      ...edge,
      type: 'custom',
      data: {
        ...edge.data,
        status: graphAlgo.edgeStates?.get(edge.id) || 'default',
        isEditing,
      },
    }));
  }, [edges, graphAlgo.edgeStates, isEditing]);

  // ---- Handlers ----
  const handleSelectProblem = useCallback(
    (problemOrId) => {
      const id = typeof problemOrId === 'object' ? problemOrId.id : problemOrId;
      resetAlgorithm();
      setSelectedProblemId(id);
      
      if (id === 'import') {
        setViewMode('import');
      } else if (id.startsWith('custom-')) {
        setCustomProblemData(prev => {
          // Because customRuns might not be in deps, we can just find it
          // Or we can rely on customRuns being in deps below
          return null; // temporary
        });
        // We'll set customProblemData immediately from customRuns
        const run = customRuns.find(r => r.id === id);
        if (run) {
          setCustomProblemData(run);
          setViewMode('graph');
        }
      } else {
        setCustomProblemData(null);
        setCustomProblemHtml('');
        setViewMode('graph');
        if (isEditing) toggleEditing(); // Exit edit mode
      }
    },
    [resetAlgorithm, isEditing, toggleEditing, customRuns]
  );

  const handleAISolve = useCallback(async () => {
    if (!customProblemHtml) return;
    setIsAISolving(true);
    const res = await AISolverService.solveProblem(customProblemHtml, nodes, edges, isDirected);
    if (res.success) {
      const aiGraph = res.data.graphStructure;
      
      const newRun = {
        id: `custom-graph-${Date.now()}`,
        title: res.data.algorithmName || 'Custom Graph Solution',
        algorithmType: res.data.algorithmType || 'custom',
        ...res.data
      };
      
      setCustomRuns(prev => [...prev, newRun]);
      setCustomProblemData(newRun);
      setSelectedProblemId(newRun.id);

      // Auto-update the canvas with the testcase graph if the AI successfully extracted one!
      if (aiGraph && aiGraph.nodes && aiGraph.nodes.length > 0) {
        const formattedNodes = aiGraph.nodes.map(n => ({
          id: n.id,
          type: 'custom',
          position: n.position || { x: 0, y: 0 },
          data: { label: n.label || n.id, status: 'default' }
        }));
        const formattedEdges = (aiGraph.edges || []).map((e, i) => ({
          id: `e${e.source}-${e.target}-${i}`,
          type: 'custom',
          source: String(e.source),
          target: String(e.target),
          data: { status: 'default', weight: e.weight }
        }));
        
        // Use Auto-layout module to position the AI nodes so they aren't stacked at 0,0
        import('./utils/LayoutManager').then(({ getLayoutedElements }) => {
           const layouted = getLayoutedElements(formattedNodes, formattedEdges, 'TB', aiGraph.isDirected);
           loadGraph({ nodes: layouted, edges: formattedEdges, directed: aiGraph.isDirected, weighted: formattedEdges.some(e => e.data.weight !== undefined) });
        });
      }
    } else {
      console.error(res.error);
      setCustomProblemData(res.data); // will show fallback
    }
    setIsAISolving(false);
  }, [customProblemHtml, nodes, edges, isDirected, loadGraph]);

  const handleReset = useCallback(() => {
    resetAlgorithm();
    if (!isGrid && presetNodes.length > 0 && !isEditing) {
      resetGraph(presetNodes, presetEdges);
    }
  }, [resetAlgorithm, isGrid, resetGraph, presetNodes, presetEdges, isEditing]);

  const handleResetToPreset = useCallback(() => {
    resetAlgorithm();
    if (!isGrid && presetNodes.length > 0) {
      resetGraph(presetNodes, presetEdges);
    }
  }, [resetAlgorithm, isGrid, resetGraph, presetNodes, presetEdges]);

  const handleNodeDragStop = useCallback((event, node, updatedNodes) => {
    if (!isPlaying) {
      LayoutPersistenceService.saveUserLayout(selectedProblemId, updatedNodes);
      
      // Update debug panel to reflect user layout if it's open
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

  const handleSwitchLayout = useCallback((layout) => {
    setNodes(nds => nds.map(n => ({
      ...n,
      position: layout.coordinates[n.id] || n.position
    })));
    setLayoutDebugInfo(prev => ({ ...prev, source: layout.source }));
  }, [setNodes]);


  return (
    <ReactFlowProvider>
      <div className="relative w-screen h-screen flex flex-col overflow-hidden selection:bg-[var(--glass-border)]">
        {/* WebGL Liquid Glass Background */}
        <LiquidGlassBackground themeId={bgThemeId} bgImage={bgImage} />

        {/* Navbar */}
        <Navbar
          problemTitle={selectedProblem?.title}
          algorithmName={algorithmDef?.name}
          currentTheme={bgThemeId}
          onChangeTheme={handleChangeTheme}
          onImageUpload={handleImageUpload}
          overallProgress={getOverallProgress(problems)}
        />

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden" style={{ paddingTop: '56px' }}>
          {/* Sidebar */}
          <Sidebar
            problems={problems}
            customRuns={customRuns}
            selectedProblem={selectedProblem}
            selectedProblemId={selectedProblemId}
            onSelectProblem={handleSelectProblem}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            completedProblems={completedProblems}
            toggleCompleted={toggleCompleted}
            getSectionProgress={getSectionProgress}
          />

          {/* Code Panel — resizable, glass-tracked */}
          <div
            className="flex-shrink-0 flex flex-col min-h-0"
            data-glass-panel="code"
            style={{ 
              width: codePanelWidth, 
              display: (selectedProblemId === 'import' && !customProblemData && viewMode === 'import') ? 'none' : 'flex' 
            }}
          >
            {selectedProblemId === 'import' ? (
              <AISolutionPanel customProblemData={customProblemData} themeId={bgThemeId} />
            ) : (
              <CodePanel
                code={isArray ? (customProblemData.arrayData?.correctedCode || customProblemData.arrayData?.javaCode || '// Code') : (selectedProblem?.javaCode || '// Select a problem to view code')}
                language={isArray ? (customProblemData.arrayData?.language?.toLowerCase() || 'java') : 'java'}
                currentLine={currentLine}
                currentStepDescription={activeAlgo.stepDescription}
                lineExplanations={isArray ? (customProblemData.arrayData?.codeLines?.map(l => l.explain) || []) : []}
                title={isArray ? (customProblemData.arrayData?.algorithmName || 'Analyzed Code') : (selectedProblem?.title || 'Algorithm Code')}
                themeId={bgThemeId}
              />
            )}
          </div>

          {/* Resize handle */}
          {!(selectedProblemId === 'import' && !customProblemData && viewMode === 'import') && (
            <div
              className="w-1.5 flex-shrink-0 cursor-col-resize group relative hover:bg-[var(--glass-fill)] transition-colors duration-150"
              onMouseDown={handleResizeStart}
              title="Drag to resize"
            >
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-black/[0.06] group-hover:bg-[var(--color-accent)] transition-colors duration-150" />
            </div>
          )}

          {/* Graph Canvas or Import View or Grid Canvas */}
          <div className="flex-1 flex flex-col relative min-w-0">
            {viewMode === 'import' ? (
              <DryRunView 
                onLoadGraph={(data, debugInfo) => {
                  if (data?.isArrayAnalysis) {
                    const newRun = {
                      id: `custom-array-${Date.now()}`,
                      title: data.arrayData.algorithmName || 'Custom Array Analysis',
                      algorithmType: 'arrayAnalysis',
                      arrayData: data.arrayData
                    };
                    setCustomRuns(prev => [...prev, newRun]);
                    setCustomProblemData(newRun);
                    setSelectedProblemId(newRun.id);
                    setViewMode('graph');
                    return;
                  }
                  
                  loadGraph(data);
                  if (debugInfo) {
                    setLayoutDebugInfo(debugInfo);
                    if (debugInfo.problemHtml) setCustomProblemHtml(debugInfo.problemHtml);
                  }
                  setViewMode('graph');
                  if (!isEditing) toggleEditing(); // enter edit mode to see what was imported
                }}
                currentGraphData={getGraphData}
              />
            ) : (
              <>
                {!isGrid && (
                  <GraphEditorToolbar
                    isEditing={isEditing}
                    toggleEditing={toggleEditing}
                    isDirected={isDirected}
                    toggleDirected={toggleDirected}
                    isWeighted={isWeighted}
                    toggleWeighted={toggleWeighted}
                    undo={undo}
                    redo={redo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    clearGraph={clearGraph}
                    resetToPreset={handleResetToPreset}
                    autoLayout={handleAutoLayout}
                    nodeCount={nodeCount}
                    edgeCount={edgeCount}
                  />
                )}

                {isArray ? (
                  <ArrayCanvas step={arrayAlgo.algorithmState} />
                ) : isGrid ? (
                  <GridCanvas grid={gridAlgo.currentGrid} />
                ) : (
                  <GraphCanvas
                    nodes={styledNodes}
                    edges={styledEdges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    isEditing={isEditing}
                    isDirected={isDirected}
                    isWeighted={isWeighted}
                    addNodeAtPosition={addNodeAtPosition}
                    removeNode={removeNode}
                    removeEdge={removeEdge}
                    onNodesDelete={onNodesDelete}
                    onEdgesDelete={onEdgesDelete}
                    editingEdgeId={editingEdgeId}
                    updateEdgeWeight={updateEdgeWeight}
                    startEditingEdge={startEditingEdge}
                    cancelEditingEdge={cancelEditingEdge}
                    renameNode={renameNode}
                    isPlaying={isPlaying}
                    onNodeDragStop={handleNodeDragStop}
                  />
                )}

                {/* Layout Debug Panel Floating over canvas */}
                {!isGrid && layoutDebugInfo && (
                  <div className="absolute top-4 left-4 z-10 w-80">
                    <LayoutDebugPanel 
                      debugInfo={layoutDebugInfo} 
                      onSwitchLayout={handleSwitchLayout}
                    />
                  </div>
                )}

                {/* Controls Bar */}
                <ControlsBar
                  isPlaying={isPlaying}
                  onPlay={play}
                  onPause={pause}
                  onStepForward={stepForward}
                  onStepBack={stepBack}
                  onReset={handleReset}
                  speed={speed}
                  onSpeedChange={setSpeed}
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  disabled={!algorithmDef || isEditing}
                  onAISolve={selectedProblemId === 'import' && !customProblemData && customProblemHtml ? handleAISolve : null}
                  isSolving={isAISolving}
                />

                {/* State Panel */}
                {!isArray && (
                  <StatePanel
                    algorithmState={activeAlgorithmState}
                    stepDescription={activeAlgo.stepDescription}
                    isExpanded={statePanelExpanded}
                    onToggle={() => setStatePanelExpanded(!statePanelExpanded)}
                  />
                )}

                {/* Dynamic State Visualizer */}
                {!isArray && (
                  <StateVisualizer 
                    algorithmState={activeAlgorithmState} 
                    stateVariables={customProblemData?.stateVariables} 
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </ReactFlowProvider>
  );
}

export default App;
