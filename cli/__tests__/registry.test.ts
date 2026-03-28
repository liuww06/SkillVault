import { describe, it, expect } from 'vitest';
import { findEntry, resolveVariant, filterByType, searchEntries } from '../src/registry.js';
import type { Registry } from '../src/types.js';

const mockRegistry: Registry = {
  version: '1',
  entries: [
    {
      name: 'debugging',
      type: 'skill',
      description: 'Systematic debugging workflow',
      variants: [
        { agent: 'claude-code', path: 'skills/claude-code/debugging' },
        { agent: 'copilot', path: 'skills/copilot/debugging' },
      ],
    },
    {
      name: 'code-review',
      type: 'skill',
      description: 'Code review skill',
      variants: [{ agent: 'common', path: 'skills/common/code-review' }],
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

describe('findEntry', () => {
  it('finds an entry by name', () => {
    const entry = findEntry(mockRegistry, 'debugging');
    expect(entry).toBeDefined();
    expect(entry!.name).toBe('debugging');
    expect(entry!.type).toBe('skill');
  });

  it('returns undefined for unknown name', () => {
    const entry = findEntry(mockRegistry, 'nonexistent');
    expect(entry).toBeUndefined();
  });
});

describe('resolveVariant', () => {
  it('returns exact agent match', () => {
    const entry = mockRegistry.entries[0]; // debugging
    const variant = resolveVariant(entry, 'copilot');
    expect(variant).toBeDefined();
    expect(variant!.agent).toBe('copilot');
    expect(variant!.path).toBe('skills/copilot/debugging');
  });

  it('falls back to common when agent not found', () => {
    const entry = mockRegistry.entries[1]; // code-review (common only)
    const variant = resolveVariant(entry, 'copilot');
    expect(variant).toBeDefined();
    expect(variant!.agent).toBe('common');
  });

  it('returns undefined when no match and no common', () => {
    const entry = mockRegistry.entries[2]; // code-reviewer (claude-code only)
    const variant = resolveVariant(entry, 'copilot');
    expect(variant).toBeUndefined();
  });
});

describe('filterByType', () => {
  it('returns all entries when no type filter', () => {
    const result = filterByType(mockRegistry);
    expect(result).toHaveLength(4);
  });

  it('filters by type', () => {
    const skills = filterByType(mockRegistry, 'skill');
    expect(skills).toHaveLength(2);
    expect(skills.every((e) => e.type === 'skill')).toBe(true);
  });

  it('returns empty for type with no entries', () => {
    const result = filterByType(mockRegistry, 'agent');
    expect(result).toHaveLength(1);
  });
});

describe('searchEntries', () => {
  it('searches by name', () => {
    const results = searchEntries(mockRegistry, 'debug');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('debugging');
  });

  it('searches by description', () => {
    const results = searchEntries(mockRegistry, 'concise');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('concise-output');
  });

  it('is case-insensitive', () => {
    const results = searchEntries(mockRegistry, 'REVIEW');
    expect(results.length).toBeGreaterThanOrEqual(2);
  });

  it('returns empty for no match', () => {
    const results = searchEntries(mockRegistry, 'xyz123');
    expect(results).toHaveLength(0);
  });
});
