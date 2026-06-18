import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GraphCanvas from './GraphCanvas';
import { useAvlTree } from '../hooks/useAvlTree';
import { useBinaryTree } from '../hooks/useBinaryTree';
import { useLinkedList } from '../hooks/useLinkedList';
import { useArray } from '../hooks/useArray';
import { calculateTreeLayout, calculateLinkedListLayout } from '../utils/dataStructureLayout';
import ArrayCanvas from './ArrayCanvas';
import useGeneratorDriver from '../hooks/useGeneratorDriver';

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
        <h2 className="font-heading text-xl font-bold uppercase tracking-wider mr-4" style={{ fontFamily: "'Bebas Neue', sans-serif", color: 'var(--color-text)' }}>
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
          <span className="ml-auto font-mono text-sm px-3 py-1 rounded" style={{ color: 'var(--color-text)', border: '1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)', background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)' }}>
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
