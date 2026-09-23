import { describe, it, expect } from 'vitest';
import { slugify, paginate, taskSchema } from '../src/index.js';

describe('shared', () => {
  it('slugifies', () => { expect(slugify('Pulse Flow!')).toBe('pulse-flow'); });
  it('paginates', () => { expect(paginate([1, 2, 3], 2, 2).items).toEqual([3]); });
  it('validates task', () => { expect(taskSchema.safeParse({ title: 'Hi', status: 'todo' }).success).toBe(true); });
});
