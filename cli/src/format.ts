import type { RegistryEntry } from './types.js';

export function formatEntry(e: RegistryEntry): string {
  return `${e.name} [${e.type}] - ${e.description}`;
}
