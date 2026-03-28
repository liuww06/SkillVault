import type { Registry } from '../types.js';
import { searchEntries } from '../registry.js';

export function searchCommand(registry: Registry, keyword: string): string[] {
  const results = searchEntries(registry, keyword);
  if (results.length === 0) {
    return [`No entries matching "${keyword}".`];
  }
  return results.map((e) => {
    const agents = e.variants.map((v) => v.agent).join(', ');
    return `${e.name} [${e.type}] - ${e.description} (${agents})`;
  });
}
