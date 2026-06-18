import { describe, it, expect } from 'vitest';
import { dijkstraGenerator } from './dijkstra';

describe('dijkstraGenerator', () => {
  const graph = {
    '0': [{ node: '1', weight: 4 }, { node: '2', weight: 1 }],
    '1': [{ node: '3', weight: 1 }],
    '2': [{ node: '1', weight: 2 }, { node: '3', weight: 5 }],
    '3': [],
  };

  it('yields steps in correct order', () => {
    const gen = dijkstraGenerator(graph, '0');
    const steps = [...gen];
    const types = steps.map((s) => s.type);

    expect(types[0]).toBe('init');
    expect(types).toContain('extract-min');
    expect(types).toContain('relax');
    expect(types).toContain('update');
    expect(types).toContain('visit');
    expect(types).toContain('complete');
  });

  it('computes correct shortest distances', () => {
    const gen = dijkstraGenerator(graph, '0');
    const steps = [...gen];

    const completeStep = steps.find((s) => s.type === 'complete');
    expect(completeStep).toBeDefined();

    const dist = completeStep.data.distances;
    expect(dist['0']).toBe(0);
    expect(dist['1']).toBe(3);
    expect(dist['2']).toBe(1);
    expect(dist['3']).toBe(4);
  });

  it('visits start node first', () => {
    const gen = dijkstraGenerator(graph, '0');
    const steps = [...gen];

    const extractMinSteps = steps.filter((s) => s.type === 'extract-min');
    expect(extractMinSteps[0]?.node).toBe('0');
  });

  it('every step has required fields', () => {
    const gen = dijkstraGenerator(graph, '0');
    const steps = [...gen];
    for (const step of steps) {
      expect(step).toHaveProperty('type');
      expect(step).toHaveProperty('line');
      expect(step).toHaveProperty('data');
      expect(step).toHaveProperty('description');
      expect(typeof step.line).toBe('number');
    }
  });
});
