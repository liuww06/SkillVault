import { BaseInstaller } from './base.js';
import type { InstallContext } from './types.js';
import { join } from 'path';

export class CopilotInstaller extends BaseInstaller {
  getDirectoryPath(ctx: InstallContext): string {
    return join(ctx.targetDir, '.github', 'copilot', `${ctx.type}s`, ctx.name);
  }

  getPromptPath(ctx: InstallContext): string {
    return join(ctx.targetDir, '.github', 'copilot-instructions.md');
  }
}
