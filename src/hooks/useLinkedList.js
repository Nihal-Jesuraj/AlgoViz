import { useState } from 'react';

// Expected List shapes:
// ListNode: { id: string, value: string, next: string | null, prev: string | null }
// LinkedList: { type: string, head: string | null, tail: string | null, nodes: Map<string, ListNode> }
// ListOperation: { type: string, value?: number, timestamp: number }

let nodeIdCounter = 0;

const createNode = (value) => ({
  id: `node-${nodeIdCounter++}`,
  value: value.toString(),
  next: null,
  prev: null,
});

export function useLinkedList(type) {
  const [list, setList] = useState({
    type,
    head: null,
    tail: null,
    nodes: new Map(),
  });
  const [operations, setOperations] = useState([]);

  const addOperation = (operation) => {
    setOperations((prev) => [...prev, { ...operation, timestamp: Date.now() }]);
  };

  const cloneListState = (currentList) => {
    const newNodes = new Map();
    for (const [key, node] of currentList.nodes.entries()) {
      newNodes.set(key, { ...node });
    }
    return { ...currentList, nodes: newNodes };
  };

  function* insertFrontGenerator(value) {
    addOperation({ type: 'insert-front', value });
    
    const currentList = cloneListState(list);
    const newNode = createNode(value);
    currentList.nodes.set(newNode.id, newNode);

    if (!currentList.head) {
      yield { highlightedNodes: [newNode.id], message: 'Creating first node', listSnapshot: cloneListState(currentList) };
      
      if (type === 'CSLL' || type === 'CDLL') {
        newNode.next = newNode.id;
        if (type === 'CDLL') newNode.prev = newNode.id;
      }
      
      currentList.head = newNode.id;
      currentList.tail = newNode.id;
      yield { highlightedNodes: [], message: 'First node added', listSnapshot: cloneListState(currentList) };
      setList(currentList);
      return;
    }

    yield { highlightedNodes: [newNode.id], message: 'Creating new node', listSnapshot: cloneListState(currentList) };

    const oldHead = currentList.nodes.get(currentList.head);
    newNode.next = currentList.head;
    
    if (type === 'DLL' || type === 'CDLL') {
      oldHead.prev = newNode.id;
    }
    
    if (type === 'CSLL' || type === 'CDLL') {
      const tailNode = currentList.nodes.get(currentList.tail);
      tailNode.next = newNode.id;
      if (type === 'CDLL') newNode.prev = currentList.tail;
    }

    currentList.head = newNode.id;
    yield { highlightedNodes: [newNode.id, oldHead.id], message: 'Linking nodes', listSnapshot: cloneListState(currentList) };
    
    yield { highlightedNodes: [], message: 'Node inserted at front', listSnapshot: cloneListState(currentList) };
    setList(currentList);
  }

  function* insertBackGenerator(value) {
    addOperation({ type: 'insert-back', value });

    const currentList = cloneListState(list);
    const newNode = createNode(value);
    currentList.nodes.set(newNode.id, newNode);

    if (!currentList.tail) {
      yield { highlightedNodes: [newNode.id], message: 'Creating first node', listSnapshot: cloneListState(currentList) };
      
      if (type === 'CSLL' || type === 'CDLL') {
        newNode.next = newNode.id;
        if (type === 'CDLL') newNode.prev = newNode.id;
      }
      
      currentList.head = newNode.id;
      currentList.tail = newNode.id;
      yield { highlightedNodes: [], message: 'First node added', listSnapshot: cloneListState(currentList) };
      setList(currentList);
      return;
    }

    yield { highlightedNodes: [newNode.id], message: 'Creating new node', listSnapshot: cloneListState(currentList) };

    const oldTail = currentList.nodes.get(currentList.tail);
    oldTail.next = newNode.id;
    
    if (type === 'DLL' || type === 'CDLL') {
      newNode.prev = currentList.tail;
    }
    
    if (type === 'CSLL' || type === 'CDLL') {
      newNode.next = currentList.head;
    }

    currentList.tail = newNode.id;
    yield { highlightedNodes: [oldTail.id, newNode.id], message: 'Linking nodes', listSnapshot: cloneListState(currentList) };
    
    yield { highlightedNodes: [], message: 'Node inserted at back', listSnapshot: cloneListState(currentList) };
    setList(currentList);
  }

  function* deleteFrontGenerator() {
    if (!list.head) return;
    addOperation({ type: 'delete-front' });

    const currentList = cloneListState(list);
    const oldHead = currentList.nodes.get(currentList.head);
    
    yield { highlightedNodes: [currentList.head], message: 'Removing front node', listSnapshot: cloneListState(currentList) };

    if (currentList.head === currentList.tail) {
      currentList.head = null;
      currentList.tail = null;
      currentList.nodes.clear();
    } else {
      const newHead = oldHead.next;
      const newHeadNode = currentList.nodes.get(newHead);
      
      if (type === 'DLL' || type === 'CDLL') {
        newHeadNode.prev = type === 'CDLL' ? currentList.tail : null;
      }
      
      if (type === 'CSLL' || type === 'CDLL') {
        const tailNode = currentList.nodes.get(currentList.tail);
        tailNode.next = newHead;
      }

      currentList.nodes.delete(currentList.head);
      currentList.head = newHead;
    }

    yield { highlightedNodes: [], message: 'Front node removed', listSnapshot: cloneListState(currentList) };
    setList(currentList);
  }

  function* deleteBackGenerator() {
    if (!list.tail) return;
    addOperation({ type: 'delete-back' });

    const currentList = cloneListState(list);
    
    yield { highlightedNodes: [currentList.tail], message: 'Removing back node', listSnapshot: cloneListState(currentList) };

    if (currentList.head === currentList.tail) {
      currentList.head = null;
      currentList.tail = null;
      currentList.nodes.clear();
    } else {
      let newTail = currentList.head;
      let current = currentList.head;
      
      while (current !== null) {
        const currentNode = currentList.nodes.get(current);
        if (!currentNode) break;
        if (currentNode.next === currentList.tail) {
          newTail = current;
          break;
        }
        current = currentNode.next;
      }

      if (newTail) {
        const newTailNode = currentList.nodes.get(newTail);
        if (newTailNode) {
          newTailNode.next = type === 'CSLL' || type === 'CDLL' ? currentList.head : null;
          
          if (type === 'CDLL' && currentList.head) {
            const headNode = currentList.nodes.get(currentList.head);
            if (headNode) headNode.prev = newTail;
          }

          currentList.nodes.delete(currentList.tail);
          currentList.tail = newTail;
        }
      }
    }

    yield { highlightedNodes: [], message: 'Back node removed', listSnapshot: cloneListState(currentList) };
    setList(currentList);
  }

  function* reverseGenerator() {
    if (!list.head) return;
    addOperation({ type: 'reverse' });

    const currentList = cloneListState(list);
    let curr = currentList.head;
    let prev = null;
    let next = null;
    const reversedLinks = new Set();

    const getStep = (activeLink = null) => ({
      highlightedNodes: [curr, prev, next].filter((id) => id !== null),
      message: `Current: ${curr ? currentList.nodes.get(curr)?.value : 'null'}, Next: ${next ? currentList.nodes.get(next)?.value : 'null'}, Prev: ${prev ? currentList.nodes.get(prev)?.value : 'null'}`,
      reverseStep: { curr, prev, next, reversedLinks: new Set(reversedLinks), activeLink },
      listSnapshot: cloneListState(currentList)
    });

    yield getStep();

    while (curr) {
      const currentNode = currentList.nodes.get(curr);
      if (!currentNode) break;

      next = currentNode.next;

      if (next) yield getStep({ from: curr, to: next });

      currentNode.next = prev;
      reversedLinks.add(curr);
      
      if (type === 'DLL' || type === 'CDLL') {
        if (prev) {
          const prevNode = currentList.nodes.get(prev);
          if (prevNode) prevNode.prev = curr;
        }
        currentNode.prev = next;
      }

      if (prev) yield getStep({ from: curr, to: prev });

      prev = curr;
      curr = next;
      yield getStep();
    }

    if (type === 'CSLL' || type === 'CDLL') {
      if (currentList.head && currentList.tail) {
        const oldHead = currentList.nodes.get(currentList.head);
        const oldTail = currentList.nodes.get(currentList.tail);
        if (oldHead && oldTail) {
          oldHead.next = currentList.tail;
          if (type === 'CDLL') oldTail.prev = currentList.head;
        }
      }
    }

    currentList.head = currentList.tail;
    currentList.tail = prev;

    yield { highlightedNodes: [], message: 'List reversed', listSnapshot: cloneListState(currentList) };
    setList(currentList);
  }

  return {
    list,
    operations,
    getInsertFrontGenerator: insertFrontGenerator,
    getInsertBackGenerator: insertBackGenerator,
    getDeleteFrontGenerator: deleteFrontGenerator,
    getDeleteBackGenerator: deleteBackGenerator,
    getReverseGenerator: reverseGenerator,
  };
}
