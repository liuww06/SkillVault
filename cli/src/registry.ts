import type { Registry, RegistryEntry, Variant } from './types.js';
import { fetchJSON, getDefaultConfig, rawUrl } from './github.js';
import type { GitHubConfig } from './github.js';

export async function loadRegistry(config?: GitHubConfig): Promise<Registry> {
  const cfg = config ?? getDefaultConfig();
  if (cfg.local) {
    const { readFile } = await import('fs/promises');
    const { join } = await import('path');
    const text = await readFile(join(cfg.local, 'registry.json'), 'utf-8');
    return JSON.parse(text) as Registry;
  }
  const url = rawUrl(cfg, 'registry.json');
  return fetchJSON<Registry>(url);
}

export function findEntry(registry: Registry, name: string): RegistryEntry | undefined {
  return registry.entries.find((e) => e.name === name);
}

export function resolveVariant(entry: RegistryEntry, agent: string): Variant | undefined {
  const exact = entry.variants.find((v) => v.agent === agent);
  if (exact) return exact;
  return entry.variants.find((v) => v.agent === 'common');
}

export function filterByType(registry: Registry, type?: string): RegistryEntry[] {
  if (!type) return registry.entries;
  return registry.entries.filter((e) => e.type === type);
}

export function searchEntries(registry: Registry, keyword: string): RegistryEntry[] {
  const lower = keyword.toLowerCase();
  return registry.entries.filter(
    (e) =>
      e.name.toLowerCase().includes(lower) ||
      e.description.toLowerCase().includes(lower),
  );
}
