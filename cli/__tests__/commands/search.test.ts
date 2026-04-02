import { describe, it, expect } from 'vitest';
import { searchCommand } from '../../src/commands/search.js';
import type { Registry } from '../../src/types.js';

const mockRegistry: Registry = {
  version: '2',
  entries: [
    {
      name: 'debugging',
      type: 'skill',
      description: 'Systematic debugging workflow',
      path: 'skills/debugging',
    },
    {
      name: 'code-review',
      type: 'skill',
      description: 'Code review skill',
      path: 'skills/code-review',
    },
  ],
};

describe('searchCommand', () => {
  it('finds matching entries', () => {
    const lines = searchCommand(mockRegistry, 'debug');
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain('debugging');
  });

  it('shows not found message', () => {
    const lines = searchCommand(mockRegistry, 'xyz123');
    expect(lines).toEqual(['No entries matching "xyz123".']);
  });
});
