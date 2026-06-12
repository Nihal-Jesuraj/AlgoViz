# dsa_algo: Interactive Data Structures & Algorithms Visualizer

dsa_algo is a breathtaking, interactive visualizer designed to help you master Data Structures and Algorithms intuitively. Featuring a stunning **Liquid Glassmorphism** dark theme, procedural WebGL background rendering, and step-by-step interactive animations.

## Features

- **Stunning UI**: Procedural WebGL nebulas (Dark, Cyberpunk, Ocean, Light) with premium glassmorphism refracting panels.
- **Algorithm Coverage**: Interactive implementations for classic DSA problems including:
  - Graph Traversals (BFS, DFS)
  - Topological Sort (Kahn's Algorithm)
  - Cycle Detection
  - Shortest Path (Dijkstra)
  - Minimum Spanning Trees (Kruskal, Prim)
  - Grid Traversals (Rotten Oranges, Flood Fill, etc.)
- **Step-by-Step Visualization**: Fully interactive playback controls (Play, Pause, Step Forward) letting you explore at your own pace.
- **Live State Inspection**: Expandable side panels to view live states, queues, stacks, visited arrays, distance matrices, and Java code execution lines matching the exact step.
- **Customization**: Cycle through beautiful background themes or even upload your own custom wallpaper to be refracted by the liquid glass!

## Getting Started

First, install the dependencies and start the local development server:

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser to see the visualizer in action.

## Built With
- **React.js & Vite** for ultra-fast compilation and HMR
- **Tailwind CSS** for robust styling and glassmorphism utilities
- **Framer Motion** for silky smooth micro-animations
- **React Flow** for interactive graph rendering
- **WebGL** for the procedural fluid background textures
