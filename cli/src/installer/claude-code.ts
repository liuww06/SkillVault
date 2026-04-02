import { BaseInstaller } from './base.js';
import type { InstallContext } from './types.js';
import { join } from 'path';
import { homedir } from 'os';

export class ClaudeCodeInstaller extends BaseInstaller {
  getDirectoryPath(ctx: InstallContext): string {
    const base = ctx.global ? join(homedir(), '.claude') : join(ctx.targetDir, '.claude');
    const subdir = ctx.type === 'skill' ? 'skills' : 'agents';
    return join(base, subdir, ctx.name);
  }

  getPromptPath(ctx: InstallContext): string {
    const base = ctx.global ? join(homedir(), '.claude') : join(ctx.targetDir, '.claude');
    return join(base, 'system-prompt.md');
  }
}
