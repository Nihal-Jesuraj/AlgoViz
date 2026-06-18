import { describe, it, expect } from 'vitest';
import { getLayoutedElements } from './LayoutManager';

describe('LayoutManager', () => {
  describe('getLayoutedElements', () => {
    it('returns empty array for empty input', () => {
      const result = getLayoutedElements([], [], 'TB', false);
      expect(Array.isArray(result)).toBe(true);
    });

    it('positions a single node', () => {
      const nodes = [{ id: 'a' }];
      const result = getLayoutedElements(nodes, [], 'TB', false);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('a');
      expect(typeof result[0].position?.x).toBe('number');
      expect(typeof result[0].position?.y).toBe('number');
    });

    it('returns correct count for a tree graph', () => {
      const nodes = [
        { id: '0' }, { id: '1' }, { id: '2' },
      ];
      const edges = [
        { source: '0', target: '1' },
        { source: '0', target: '2' },
      ];
      const result = getLayoutedElements(nodes, edges, 'TB', false);
      expect(result).toHaveLength(3);
    });

    it('handles directed layout without error', () => {
      const nodes = [
        { id: 'a' }, { id: 'b' }, { id: 'c' },
      ];
      const edges = [
        { source: 'a', target: 'b' },
        { source: 'b', target: 'c' },
      ];
      const result = getLayoutedElements(nodes, edges, 'LR', true);
      expect(result).toHaveLength(3);
    });

    it('assigns unique positions to all nodes', () => {
      const nodes = Array.from({ length: 10 }, (_, i) => ({ id: String(i) }));
      const edges = nodes.slice(1).map((n) => ({ source: '0', target: n.id }));
      const result = getLayoutedElements(nodes, edges, 'TB', false);
      const positions = result.map((n) => `${n.position.x},${n.position.y}`);
      expect(new Set(positions).size).toBe(positions.length);
    });
  });
});
