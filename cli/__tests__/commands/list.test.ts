import { describe, it, expect } from 'vitest';
import { listCommand } from '../../src/commands/list.js';
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
      name: 'code-reviewer',
      type: 'agent',
      description: 'Automated code review agent',
      variants: [{ agent: 'claude-code', path: 'agents/claude-code/code-reviewer' }],
    },
    {
      name: 'concise-output',
      type: 'prompt',
      description: 'System prompt for concise output',
      variants: [{ agent: 'common', path: 'prompts/common/concise-output' }],
    },
  ],
};

describe('listCommand', () => {
  it('formats all entries', () => {
    const lines = listCommand(mockRegistry);
    expect(lines).toHaveLength(3);
    expect(lines[0]).toContain('debugging');
    expect(lines[0]).toContain('[skill]');
    expect(lines[1]).toContain('code-reviewer');
    expect(lines[1]).toContain('[agent]');
    expect(lines[2]).toContain('concise-output');
    expect(lines[2]).toContain('[prompt]');
  });

  it('filters by type', () => {
    const lines = listCommand(mockRegistry, 'skill');
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain('debugging');
  });

  it('returns empty message when no entries', () => {
    const emptyRegistry: Registry = { version: '1', entries: [] };
    const lines = listCommand(emptyRegistry);
    expect(lines).toEqual(['No entries found.']);
  });
});
