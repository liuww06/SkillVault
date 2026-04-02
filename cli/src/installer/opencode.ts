import { BaseInstaller } from './base.js';
import type { InstallContext } from './types.js';
import { join } from 'path';
import { homedir } from 'os';

export class OpenCodeInstaller extends BaseInstaller {
  getDirectoryPath(ctx: InstallContext): string {
    const base = ctx.global ? join(homedir(), '.opencode') : join(ctx.targetDir, '.opencode');
    return join(base, `${ctx.type}s`, ctx.name);
  }

  getPromptPath(ctx: InstallContext): string {
    const base = ctx.global ? join(homedir(), '.opencode') : join(ctx.targetDir, '.opencode');
    return join(base, 'AGENTS.md');
  }

  protected transformFiles(ctx: InstallContext): Map<string, string> {
    if (ctx.type === 'skill') {
      // Rename skill.md → SKILL.md
      const content = ctx.sourceFiles.get('skill.md') ?? Array.from(ctx.sourceFiles.values())[0];
      return new Map([['SKILL.md', content]]);
    }

    if (ctx.type === 'agent') {
      // Merge into single AGENT.md with YAML frontmatter
      const promptContent = ctx.sourceFiles.get('prompt.md') ?? '';
      const yamlContent = ctx.sourceFiles.get('agent.yaml') ?? '';

      let merged = '';
      if (yamlContent) {
        merged = `---\n${yamlContent}---\n\n`;
      }
      merged += promptContent;

      return new Map([['AGENT.md', merged]]);
    }

    return ctx.sourceFiles;
  }
}
