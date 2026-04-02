import type { Registry, RegistryEntry } from './types.js';
import { fetchJSON, getDefaultConfig, rawUrl } from './github.js';
import type { GitHubConfig } from './github.js';

interface VariantV1 {
  agent: string;
  path: string;
}

interface RegistryEntryV1 {
  name: string;
  type: string;
  description: string;
  variants: VariantV1[];
}

interface RegistryV1 {
  version: string;
  entries: RegistryEntryV1[];
}

export function migrateV1Registry(v1: RegistryV1): Registry {
  return {
    version: '2',
    entries: v1.entries.map((entry) => {
      const commonVariant = entry.variants.find((v) => v.agent === 'common');
      const variant = commonVariant ?? entry.variants[0];
      return {
        name: entry.name,
        type: entry.type as 'skill' | 'agent' | 'prompt',
        description: entry.description,
        path: variant.path,
      };
    }),
  };
}

export async function loadRegistry(config?: GitHubConfig): Promise<Registry> {
  const cfg = config ?? getDefaultConfig();
  let raw: Registry | RegistryV1;

  if (cfg.local) {
    const { readFile } = await import('fs/promises');
    const { join } = await import('path');
    const text = await readFile(join(cfg.local, 'registry.json'), 'utf-8');
    raw = JSON.parse(text) as Registry | RegistryV1;
  } else {
    const url = rawUrl(cfg, 'registry.json');
    raw = await fetchJSON<Registry | RegistryV1>(url);
  }

  if (raw.version === '1') {
    return migrateV1Registry(raw as RegistryV1);
  }
  return raw as Registry;
}

export function findEntry(registry: Registry, name: string): RegistryEntry | undefined {
  return registry.entries.find((e) => e.name === name);
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
