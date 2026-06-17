import { useState } from "react";

// Expected AVLTreeNode shape:
// {
//   id: string,
//   value: number,
//   height: number,
//   left: AVLTreeNode | null,
//   right: AVLTreeNode | null
// }

let nodeIdCounter = 0;

export function useAvlTree() {
  const [tree, setTree] = useState(null);
  const [rotationHistory, setRotationHistory] = useState([]);

  const getHeight = (node) => {
    return node ? node.height : 0;
  };

  const getBalance = (node) => {
    return node ? getHeight(node.left) - getHeight(node.right) : 0;
  };

  const updateHeight = (node) => {
    return Math.max(getHeight(node.left), getHeight(node.right)) + 1;
  };

  const rightRotate = (y) => {
    const x = y.left;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    y.height = updateHeight(y);
    x.height = updateHeight(x);

    setRotationHistory((prev) => [...prev, `Right rotation at ${y.value}`]);
    return x;
  };

  const leftRotate = (x) => {
    const y = x.right;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    x.height = updateHeight(x);
    y.height = updateHeight(y);

    setRotationHistory((prev) => [...prev, `Left rotation at ${x.value}`]);
    return y;
  };

  const insert = (value) => {
    if (isNaN(value)) return;

    const insertNode = (node) => {
      if (!node) {
        return {
          id: `node-${nodeIdCounter++}`,
          value,
          height: 1,
          left: null,
          right: null,
        };
      }

      const newNode = { ...node };

      if (value < newNode.value) {
        newNode.left = insertNode(newNode.left);
      } else {
        newNode.right = insertNode(newNode.right);
      }

      newNode.height = 1 + Math.max(getHeight(newNode.left), getHeight(newNode.right));

      const balance = getBalance(newNode);

      if (balance > 1 && value < newNode.left.value) {
        return rightRotate(newNode);
      }

      if (balance < -1 && value >= newNode.right.value) {
        return leftRotate(newNode);
      }

      if (balance > 1 && value >= newNode.left.value) {
        newNode.left = leftRotate(newNode.left);
        return rightRotate(newNode);
      }

      if (balance < -1 && value < newNode.right.value) {
        newNode.right = rightRotate(newNode.right);
        return leftRotate(newNode);
      }

      return newNode;
    };

    setTree((prevTree) => insertNode(prevTree));
  };

  function* traversalGenerator(node, order) {
    if (!node) return;

    if (order === "preorder") {
      yield { type: "visit", nodeId: node.id, value: node.value, description: `Visiting ${node.value}` };
      if (node.left) yield* traversalGenerator(node.left, order);
      if (node.right) yield* traversalGenerator(node.right, order);
    } else if (order === "inorder") {
      if (node.left) yield* traversalGenerator(node.left, order);
      yield { type: "visit", nodeId: node.id, value: node.value, description: `Visiting ${node.value}` };
      if (node.right) yield* traversalGenerator(node.right, order);
    } else if (order === "postorder") {
      if (node.left) yield* traversalGenerator(node.left, order);
      if (node.right) yield* traversalGenerator(node.right, order);
      yield { type: "visit", nodeId: node.id, value: node.value, description: `Visiting ${node.value}` };
    }
  }

  const clear = () => {
    setTree(null);
    setRotationHistory([]);
  };

  return {
    tree,
    rotationHistory,
    insert,
    clear,
    getInorderGenerator: () => traversalGenerator(tree, "inorder"),
    getPreorderGenerator: () => traversalGenerator(tree, "preorder"),
    getPostorderGenerator: () => traversalGenerator(tree, "postorder"),
  };
}
