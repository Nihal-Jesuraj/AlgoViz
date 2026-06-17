import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GraphCanvas from './GraphCanvas';
import { useAvlTree } from '../hooks/useAvlTree';
import { useBinaryTree } from '../hooks/useBinaryTree';
import { useLinkedList } from '../hooks/useLinkedList';
import { useArray } from '../hooks/useArray';
import { calculateTreeLayout, calculateLinkedListLayout } from '../utils/dataStructureLayout';
import ArrayCanvas from './ArrayCanvas';

function useGeneratorDriver() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentStepInfo, setCurrentStepInfo] = useState(null);
  
  const generatorRef = useRef(null);
  const timeoutRef = useRef(null);

  const playGenerator = (generatorFn) => {
    generatorRef.current = generatorFn();
    setIsPlaying(true);
    setCurrentStepInfo(null);
  };

  const stop = () => {
    setIsPlaying(false);
    generatorRef.current = null;
    clearTimeout(timeoutRef.current);
    setCurrentStepInfo(null);
  };

  useEffect(() => {
    if (isPlaying && generatorRef.current) {
      const runStep = () => {
        const { value, done } = generatorRef.current.next();
        if (done) {
          setIsPlaying(false);
          generatorRef.current = null;
          setCurrentStepInfo(null); // Clear message when done
        } else {
          setCurrentStepInfo(value);
          timeoutRef.current = setTimeout(runStep, 1000 / speed);
        }
      };
      timeoutRef.current = setTimeout(runStep, 1000 / speed);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [isPlaying, speed]);

  return { isPlaying, speed, setSpeed, currentStepInfo, playGenerator, stop };
}

export default function DataStructureView({ id: propId }) {
  const params = useParams();
  const navigate = useNavigate();
  const id = propId || params.id;
  
  const [inputValue, setInputValue] = useState('');
  
  const avl = useAvlTree();
  const bst = useBinaryTree();
  const ll = useLinkedList('SLL'); 
  const arrHook = useArray();

  const driver = useGeneratorDriver();

  const { nodes, edges } = useMemo(() => {
    let rawNodes = [];
    let rawEdges = [];

    const highlightedNodes = driver.currentStepInfo?.highlightedNodes || 
      (driver.currentStepInfo?.type === 'visit' ? [driver.currentStepInfo.nodeId] : []);

    if (id === 'avl') {
      const layout = calculateTreeLayout(avl.tree);
      rawNodes = layout.nodes;
      rawEdges = layout.edges;
    } else if (id === 'bst') {
      const layout = calculateTreeLayout(bst.tree);
      rawNodes = layout.nodes;
      rawEdges = layout.edges;
    } else if (id === 'linked-list') {
      const stateToUse = driver.currentStepInfo?.listSnapshot || ll.list;
      const layout = calculateLinkedListLayout(stateToUse);
      rawNodes = layout.nodes;
      rawEdges = layout.edges;
    }

    if (highlightedNodes.length > 0) {
      rawNodes = rawNodes.map(n => ({
        ...n,
        data: { ...n.data, status: highlightedNodes.includes(n.id) ? 'current' : 'default' }
      }));
    }

    return { nodes: rawNodes, edges: rawEdges };
  }, [id, avl.tree, bst.tree, ll.list, driver.currentStepInfo]);

  const handleInsert = () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    
    if (id === 'avl') avl.insert(val);
    if (id === 'bst') bst.insert(val);
    if (id === 'linked-list') driver.playGenerator(() => ll.getInsertBackGenerator(val));
    if (id === 'array') driver.playGenerator(() => arrHook.getInsertGenerator(val));
    
    setInputValue('');
  };

  return (
    <div className="flex flex-col h-full w-full relative z-10 pt-14">
      <div className="glass-panel mx-4 mt-4 mb-2 p-4 flex flex-wrap gap-4 items-center z-20 shrink-0">
        <h2 className="text-xl font-bold text-white uppercase tracking-wider mr-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          {id.replace('-', ' ')}
        </h2>
        
        <input 
          type="number"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Enter value..."
          className="glass-input w-32"
          onKeyDown={e => e.key === 'Enter' && handleInsert()}
        />
        <button onClick={handleInsert} className="glass-button" disabled={driver.isPlaying}>
          Insert
        </button>

        {(id === 'avl' || id === 'bst') && (
          <>
            <button onClick={() => driver.playGenerator(id === 'avl' ? avl.getInorderGenerator : bst.getInorderGenerator)} className="glass-button text-sm" disabled={driver.isPlaying}>In-Order</button>
            <button onClick={() => driver.playGenerator(id === 'avl' ? avl.getPreorderGenerator : bst.getPreorderGenerator)} className="glass-button text-sm" disabled={driver.isPlaying}>Pre-Order</button>
            <button onClick={() => driver.playGenerator(id === 'avl' ? avl.getPostorderGenerator : bst.getPostorderGenerator)} className="glass-button text-sm" disabled={driver.isPlaying}>Post-Order</button>
            <button onClick={id === 'avl' ? avl.clear : bst.clear} className="glass-button text-sm text-red-400" disabled={driver.isPlaying}>Clear</button>
          </>
        )}

        {id === 'linked-list' && (
          <>
             <button onClick={() => {
                const val = parseInt(inputValue);
                if (!isNaN(val)) {
                  driver.playGenerator(() => ll.getInsertFrontGenerator(val));
                  setInputValue('');
                }
             }} className="glass-button text-sm" disabled={driver.isPlaying}>Insert Front</button>
             <button onClick={() => driver.playGenerator(ll.getDeleteFrontGenerator)} className="glass-button text-sm text-red-400" disabled={driver.isPlaying}>Delete Front</button>
             <button onClick={() => driver.playGenerator(ll.getDeleteBackGenerator)} className="glass-button text-sm text-red-400" disabled={driver.isPlaying}>Delete Back</button>
             <button onClick={() => driver.playGenerator(ll.getReverseGenerator)} className="glass-button text-sm" disabled={driver.isPlaying}>Reverse</button>
          </>
        )}

        {id === 'array' && (
          <>
             <button onClick={() => driver.playGenerator(arrHook.getDeleteGenerator)} className="glass-button text-sm text-red-400" disabled={driver.isPlaying}>Delete Last</button>
             <button onClick={() => {
                const val = parseInt(inputValue);
                if (!isNaN(val)) {
                  // Hardcode index 0 update for demonstration if they don't provide two inputs
                  driver.playGenerator(() => arrHook.getUpdateGenerator(0, val));
                  setInputValue('');
                }
             }} className="glass-button text-sm" disabled={driver.isPlaying}>Update Arr[0]</button>
             
             {/* Link to Sandbox for Custom Array Algorithms */}
             <button onClick={() => navigate('/sandbox')} className="glass-button text-sm primary ml-4" disabled={driver.isPlaying}>
               Add Custom Algorithm
             </button>
          </>
        )}
        
        {(driver.currentStepInfo?.message || driver.currentStepInfo?.description) && (
          <span className="ml-auto text-[#a3e635] font-mono text-sm border border-[#a3e635]/30 bg-[#a3e635]/10 px-3 py-1 rounded">
            {driver.currentStepInfo.message || driver.currentStepInfo.description}
          </span>
        )}
      </div>

      <div className="flex-1 relative flex">
        {id === 'array' ? (
          <ArrayCanvas step={{
            arr: driver.currentStepInfo?.arraySnapshot || arrHook.array,
            highlight: driver.currentStepInfo?.highlight || [],
            eliminated: driver.currentStepInfo?.eliminated || [],
            done: driver.currentStepInfo?.done || [],
            pointers: driver.currentStepInfo?.pointers || {}
          }} />
        ) : (
          <GraphCanvas 
            nodes={nodes} 
            edges={edges} 
            isEditing={false} 
            isPlaying={driver.isPlaying}
            isDirected={id === 'linked-list'} 
          />
        )}
      </div>
    </div>
  );
}
