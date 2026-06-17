import { useState } from "react";

// Expected BinaryTreeNode shape:
// {
//   id: string,
//   value: number,
//   left: BinaryTreeNode | null,
//   right: BinaryTreeNode | null
// }

let nodeIdCounter = 0;

export function useBinaryTree() {
  const [tree, setTree] = useState(null);

  const insert = (value) => {
    if (isNaN(value)) return;

    const newNode = {
      id: `node-${nodeIdCounter++}`,
      value,
      left: null,
      right: null,
    };

    if (!tree) {
      setTree(newNode);
      return;
    }

    const insertIntoTree = (node) => {
      if (value <= node.value) {
        if (!node.left) {
          return {
            ...node,
            left: newNode,
          };
        }
        return {
          ...node,
          left: insertIntoTree(node.left),
        };
      } else {
        if (!node.right) {
          return {
            ...node,
            right: newNode,
          };
        }
        return {
          ...node,
          right: insertIntoTree(node.right),
        };
      }
    };

    setTree(insertIntoTree(tree));
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
  };

  return {
    tree,
    insert,
    clear,
    getInorderGenerator: () => traversalGenerator(tree, "inorder"),
    getPreorderGenerator: () => traversalGenerator(tree, "preorder"),
    getPostorderGenerator: () => traversalGenerator(tree, "postorder"),
  };
}
