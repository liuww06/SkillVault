import type { EntryType } from '../types.js';

export interface InstallContext {
  name: string;
  type: EntryType;
  sourcePath: string;
  targetDir: string; // absolute path to the project root where files are installed
  config: import('../github.js').GitHubConfig;
}

export interface Installer {
  install(ctx: InstallContext): Promise<void>;
}
