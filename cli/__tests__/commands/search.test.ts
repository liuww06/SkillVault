import { describe, it, expect } from 'vitest';
import { searchCommand } from '../../src/commands/search.js';
import type { Registry } from '../../src/types.js';

const mockRegistry: Registry = {
  version: '1',
  entries: [
    {
      name: 'debugging',
      type: 'skill',
      description: 'Systematic debugging workflow',
      variants: [{ agent: 'claude-code', path: 'skills/claude-code/debugging' }],
    },
    {
      name: 'code-review',
      type: 'skill',
      description: 'Code review skill',
      variants: [{ agent: 'common', path: 'skills/common/code-review' }],
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
