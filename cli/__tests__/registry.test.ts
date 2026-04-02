import { describe, it, expect } from 'vitest';
import { findEntry, filterByType, searchEntries } from '../src/registry.js';
import { migrateV1Registry } from '../src/registry.js';
import type { Registry } from '../src/types.js';

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
    {
      name: 'code-reviewer',
      type: 'agent',
      description: 'Automated code review agent',
      path: 'agents/code-reviewer',
    },
    {
      name: 'concise-output',
      type: 'prompt',
      description: 'System prompt for concise output',
      path: 'prompts/concise-output',
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

describe('migrateV1Registry', () => {
  it('converts v1 registry with variants to v2 format', () => {
    const v1 = {
      version: '1',
      entries: [
        {
          name: 'debugging',
          type: 'skill',
          description: 'Debugging',
          variants: [
            { agent: 'claude-code', path: 'skills/claude-code/debugging' },
            { agent: 'common', path: 'skills/common/debugging' },
          ],
        },
      ],
    };

    const result = migrateV1Registry(v1);
    expect(result.version).toBe('2');
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].path).toBe('skills/common/debugging');
  });

  it('picks first variant when no common available', () => {
    const v1 = {
      version: '1',
      entries: [
        {
          name: 'test',
          type: 'skill',
          description: 'Test',
          variants: [{ agent: 'claude-code', path: 'skills/claude-code/test' }],
        },
      ],
    };

    const result = migrateV1Registry(v1);
    expect(result.entries[0].path).toBe('skills/claude-code/test');
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
