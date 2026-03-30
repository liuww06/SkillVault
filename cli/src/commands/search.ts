import type { Registry } from '../types.js';
import { searchEntries } from '../registry.js';
import { formatEntry } from '../format.js';

export function searchCommand(registry: Registry, keyword: string): string[] {
  const results = searchEntries(registry, keyword);
  if (results.length === 0) {
    return [`No entries matching "${keyword}".`];
  }
  return results.map(formatEntry);
}
