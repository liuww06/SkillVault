import type { RegistryEntry } from './types.js';

export function formatEntry(e: RegistryEntry): string {
  const agents = e.variants.map((v) => v.agent).join(', ');
  return `${e.name} [${e.type}] - ${e.description} (${agents})`;
}
