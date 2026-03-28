export type EntryType = 'skill' | 'agent' | 'prompt';

export interface Variant {
  agent: string;
  path: string;
}

export interface RegistryEntry {
  name: string;
  type: EntryType;
  description: string;
  variants: Variant[];
}

export interface Registry {
  version: string;
  entries: RegistryEntry[];
}
