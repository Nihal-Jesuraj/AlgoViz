import { describe, it, expect } from 'vitest';
import { bfsGenerator } from './bfs';

describe('bfsGenerator', () => {
  const graph = {
    '0': ['1', '2'],
    '1': ['0', '3'],
    '2': ['0'],
    '3': ['1'],
  };

  it('yields steps in correct order', () => {
    const gen = bfsGenerator(graph, '0');
    const steps = [...gen];
    const types = steps.map((s) => s.type);

    expect(types[0]).toBe('init');
    expect(types).toContain('enqueue');
    expect(types).toContain('dequeue');
    expect(types).toContain('visit');
    expect(types).toContain('check-neighbor');
    expect(types).toContain('mark-visited');
    expect(types).toContain('complete');
  });

  it('visits all reachable nodes', () => {
    const gen = bfsGenerator(graph, '0');
    const steps = [...gen];
    const completeStep = steps.find((s) => s.type === 'complete');

    expect(completeStep).toBeDefined();
    expect(completeStep.data.visited).toEqual(['0', '1', '2', '3']);
    expect(completeStep.data.result).toEqual(['0', '1', '2', '3']);
  });

  it('handles isolated node', () => {
    const gen = bfsGenerator({ 'x': [] }, 'x');
    const steps = [...gen];
    const types = steps.map((s) => s.type);

    expect(types).toContain('init');
    expect(types).toContain('enqueue');
    expect(types).toContain('complete');
  });

  it('every step has required fields', () => {
    const gen = bfsGenerator(graph, '0');
    const steps = [...gen];
    for (const step of steps) {
      expect(step).toHaveProperty('type');
      expect(step).toHaveProperty('line');
      expect(step).toHaveProperty('data');
      expect(step).toHaveProperty('description');
      expect(typeof step.line).toBe('number');
      expect(typeof step.description).toBe('string');
    }
  });
});
