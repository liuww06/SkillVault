import type { Registry } from '../types.js';
import { filterByType } from '../registry.js';

export function listCommand(registry: Registry, type?: string): string[] {
  const entries = filterByType(registry, type);
  if (entries.length === 0) {
    return ['No entries found.'];
  }
  return entries.map((e) => {
    const agents = e.variants.map((v) => v.agent).join(', ');
    return `${e.name} [${e.type}] - ${e.description} (${agents})`;
  });
}
