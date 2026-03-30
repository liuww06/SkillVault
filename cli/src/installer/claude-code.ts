import { BaseInstaller } from './base.js';
import type { InstallContext } from './types.js';
import { join } from 'path';

export class ClaudeCodeInstaller extends BaseInstaller {
  getDirectoryPath(ctx: InstallContext): string {
    const subdir = ctx.type === 'skill' ? 'skills' : 'agents';
    return join(ctx.targetDir, '.claude', subdir, ctx.name);
  }

  getPromptPath(ctx: InstallContext): string {
    return join(ctx.targetDir, '.claude', 'system-prompt.md');
  }
}
