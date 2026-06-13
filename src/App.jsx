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
import GraphInputModal from './components/GraphInputModal';

import { problems } from './data/problems';
import presetGraphs from './data/presetGraphs';
import { getLayoutedElements } from './utils/LayoutManager';
import { parseLeetCodeFormat } from './utils/graphInputParser';
import { presetGrids } from './data/presetGrids';
import { algorithms } from './algorithms/index';
import { useAlgorithm } from './hooks/useAlgorithm';
import { useGridAlgorithm } from './hooks/useGridAlgorithm';
import { useGraphEditor } from './hooks/useGraphEditor';
import { useProgress } from './hooks/useProgress';
import GridCanvas from './components/GridCanvas';

function App() {
  // ---- State ----
  const [selectedProblemId, setSelectedProblemId] = useState(problems[0]?.id || '');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [statePanelExpanded, setStatePanelExpanded] = useState(true);
  const [codePanelWidth, setCodePanelWidth] = useState(380);
  const [bgThemeId, setBgThemeId] = useState('nebula');
  const [bgImage, setBgImage] = useState(null);
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);

  // Progress tracking
  const {
    completedProblems,
    toggleCompleted,
    getSectionProgress,
    getOverallProgress,
  } = useProgress();

  const handleCycleTheme = useCallback(() => {
    setBgThemeId((prev) => {
      const idx = themeIds.indexOf(prev);
      return themeIds[(idx + 1) % themeIds.length];
    });
    setBgImage(null); // Clear image when switching back to procedural themes
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

  const algorithmDef = useMemo(
    () => algorithms[selectedProblem?.algorithmKey] || null,
    [selectedProblem]
  );

  const isGrid = algorithmDef?.isGrid || false;

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
          data.nodes = getLayoutedElements(data.nodes, data.edges, 'TB', data.directed);
        }
        return data;
      } catch (e) {
        console.error("Failed to parse problem input:", e);
      }
    }
    
    if (!selectedProblem?.presetGraphKey) return null;
    return presetGraphs[selectedProblem.presetGraphKey];
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
    editorMode,
    setEditorMode,
    isEditing,
    toggleEditing,
    isDirected,
    setIsDirected,
    isWeighted,
    setIsWeighted,
    toggleDirected,
    toggleWeighted,
    addNodeAtPosition,
    onNodesDelete,
    onEdgesDelete,
    editingEdgeId,
    updateEdgeWeight,
    startEditingEdge,
    cancelEditingEdge,
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
    }
  }, [selectedProblemId, isGrid, presetNodes, presetEdges, resetGraph, setIsDirected, setIsWeighted, preset]);

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

  const activeAlgo = isGrid ? gridAlgo : graphAlgo;

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

  const activeAlgorithmState = isGrid ? gridAlgo.algorithmData : graphAlgo.algorithmState;

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
      draggable: isEditing && editorMode === 'select' && !isPlaying,
    }));
  }, [nodes, graphAlgo.nodeStates, graphAlgo.algorithmState, isEditing, editorMode, isPlaying]);

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
      if (isEditing) toggleEditing(); // Exit edit mode
    },
    [resetAlgorithm, isEditing, toggleEditing]
  );

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


  return (
    <ReactFlowProvider>
      <div className="relative w-screen h-screen flex flex-col overflow-hidden selection:bg-accent-purple/30">
        {/* WebGL Liquid Glass Background */}
        <LiquidGlassBackground themeId={bgThemeId} bgImage={bgImage} />

        {/* Navbar */}
        <Navbar
          problemTitle={selectedProblem?.title}
          algorithmName={algorithmDef?.name}
          onCycleTheme={handleCycleTheme}
          onImageUpload={handleImageUpload}
          overallProgress={getOverallProgress(problems)}
        />

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden" style={{ paddingTop: '56px' }}>
          {/* Sidebar */}
          <Sidebar
            problems={problems}
            selectedProblem={selectedProblem}
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
            style={{ width: codePanelWidth }}
          >
            <CodePanel
              code={selectedProblem?.javaCode || '// Select a problem to view code'}
              language="java"
              currentLine={currentLine}
              title={selectedProblem?.title || 'Algorithm Code'}
            />
          </div>

          {/* Resize handle */}
          <div
            className="w-1.5 flex-shrink-0 cursor-col-resize group relative hover:bg-accent-purple/10 transition-colors duration-150"
            onMouseDown={handleResizeStart}
            title="Drag to resize"
          >
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-black/[0.06] group-hover:bg-accent-purple/30 transition-colors duration-150" />
          </div>

          {/* Graph Canvas or Grid Canvas + Controls */}
          <div className="flex-1 flex flex-col relative min-w-0">
            {!isGrid && (
              <GraphEditorToolbar
                editorMode={editorMode}
                setEditorMode={setEditorMode}
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
                onOpenInputModal={() => setIsInputModalOpen(true)}
              />
            )}

            {isGrid ? (
              <GridCanvas grid={gridAlgo.currentGrid} />
            ) : (
              <GraphCanvas
                nodes={styledNodes}
                edges={styledEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                editorMode={editorMode}
                isEditing={isEditing}
                isDirected={isDirected}
                isWeighted={isWeighted}
                addNodeAtPosition={addNodeAtPosition}
                onNodesDelete={onNodesDelete}
                onEdgesDelete={onEdgesDelete}
                editingEdgeId={editingEdgeId}
                updateEdgeWeight={updateEdgeWeight}
                startEditingEdge={startEditingEdge}
                cancelEditingEdge={cancelEditingEdge}
                isPlaying={isPlaying}
              />
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
            />

            {/* State Panel */}
            <StatePanel
              algorithmState={activeAlgorithmState}
              stepDescription={activeAlgo.stepDescription}
              isExpanded={statePanelExpanded}
              onToggle={() => setStatePanelExpanded(!statePanelExpanded)}
            />
          </div>
        </div>
        
        <GraphInputModal 
          isOpen={isInputModalOpen} 
          onClose={() => setIsInputModalOpen(false)} 
          onLoadGraph={(data) => {
            loadGraph(data);
            if (!isEditing) toggleEditing(); // enter edit mode to see what was imported
          }}
          currentGraphData={getGraphData}
        />
      </div>
    </ReactFlowProvider>
  );
}

export default App;
