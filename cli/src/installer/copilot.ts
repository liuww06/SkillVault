import { BaseInstaller } from './base.js';
import type { InstallContext } from './types.js';
import { join } from 'path';
import { homedir } from 'os';

export class CopilotInstaller extends BaseInstaller {
  getDirectoryPath(ctx: InstallContext): string {
    const base = ctx.global ? join(homedir(), '.github') : join(ctx.targetDir, '.github');
    return join(base, `${ctx.type}s`, ctx.name);
  }

  getPromptPath(ctx: InstallContext): string {
    const base = ctx.global ? join(homedir(), '.github') : join(ctx.targetDir, '.github');
    return join(base, 'copilot-instructions.md');
  }

  protected transformFiles(ctx: InstallContext): Map<string, string> {
    if (ctx.type !== 'agent') {
      return ctx.sourceFiles;
    }

    // Merge agent.yaml metadata + prompt.md into single <name>.agent.md
    const promptContent = ctx.sourceFiles.get('prompt.md') ?? '';
    const yamlContent = ctx.sourceFiles.get('agent.yaml') ?? '';

    let merged = '';
    if (yamlContent) {
      merged = `---\n${yamlContent}---\n\n`;
    }
    merged += promptContent;

    return new Map([[`${ctx.name}.agent.md`, merged]]);
  }
}
