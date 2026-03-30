import type { Registry } from '../types.js';
import { filterByType } from '../registry.js';
import { formatEntry } from '../format.js';

export function listCommand(registry: Registry, type?: string): string[] {
  const entries = filterByType(registry, type);
  if (entries.length === 0) {
    return ['No entries found.'];
  }
  return entries.map(formatEntry);
}
