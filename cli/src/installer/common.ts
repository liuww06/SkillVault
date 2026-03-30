import { BaseInstaller } from './base.js';
import type { InstallContext } from './types.js';
import { join } from 'path';

export class CommonInstaller extends BaseInstaller {
  getDirectoryPath(ctx: InstallContext): string {
    return join(ctx.targetDir, 'skillvault', `${ctx.type}s`, ctx.name);
  }

  getPromptPath(ctx: InstallContext): string {
    return join(ctx.targetDir, 'skillvault', 'prompts', `${ctx.name}.md`);
  }
}
