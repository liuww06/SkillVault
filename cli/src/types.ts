export type EntryType = 'skill' | 'agent' | 'prompt';

export interface RegistryEntry {
  name: string;
  type: EntryType;
  description: string;
  path: string;
}

export interface Registry {
  version: string;
  entries: RegistryEntry[];
}
