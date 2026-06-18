export default function ArrowMarkers() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <marker id="arrow-default" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" style={{ fill: 'var(--color-edge-default)' }} />
        </marker>
        <marker id="arrow-active" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" style={{ fill: 'var(--color-edge-current)' }} />
        </marker>
        <marker id="arrow-visited" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" style={{ fill: 'var(--color-edge-visited)' }} />
        </marker>
        <marker id="arrow-in-mst" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" style={{ fill: 'var(--color-teal)' }} />
        </marker>
        <marker id="arrow-in-path" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" style={{ fill: 'var(--color-edge-path)' }} />
        </marker>
      </defs>
    </svg>
  );
}
