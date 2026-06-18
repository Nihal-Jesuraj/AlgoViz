import { useState, useRef, useCallback } from 'react';

export function useResizablePanel(defaultWidth = 380, minWidth = 260, maxWidth = 600) {
  const [width, setWidth] = useState(defaultWidth);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(defaultWidth);

  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMove = (moveE) => {
      if (!isDraggingRef.current) return;
      const delta = moveE.clientX - startXRef.current;
      setWidth(Math.min(maxWidth, Math.max(minWidth, startWidthRef.current + delta)));
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
  }, [width, minWidth, maxWidth]);

  return { width, setWidth, handleResizeStart };
}
