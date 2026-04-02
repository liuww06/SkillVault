import type { EntryType } from '../types.js';

export interface InstallContext {
  name: string;
  type: EntryType;
  targetDir: string;
  sourceFiles: Map<string, string>;
  global: boolean;
}

export interface Installer {
  install(ctx: InstallContext): Promise<void>;
}
