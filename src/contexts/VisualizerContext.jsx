import { createContext, useContext } from 'react';

export const VisualizerContext = createContext(null);

export function useVisualizer() {
  const ctx = useContext(VisualizerContext);
  if (!ctx) {
    throw new Error('useVisualizer must be used within VisualizerProvider');
  }
  return ctx;
}

export function VisualizerProvider({ children, value }) {
  return (
    <VisualizerContext.Provider value={value}>
      {children}
    </VisualizerContext.Provider>
  );
}
