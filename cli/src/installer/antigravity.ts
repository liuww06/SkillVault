import { BaseInstaller } from './base.js';
import type { InstallContext } from './types.js';
import { join } from 'path';
import { homedir } from 'os';

export class AntigravityInstaller extends BaseInstaller {
  getDirectoryPath(ctx: InstallContext): string {
    const base = ctx.global ? join(homedir(), '.antigravity') : ctx.targetDir;
    return join(base, `${ctx.type}s`, ctx.name);
  }

  getPromptPath(ctx: InstallContext): string {
    const base = ctx.global ? join(homedir(), '.antigravity') : ctx.targetDir;
    return join(base, 'AGENTS.md');
  }

  protected transformFiles(ctx: InstallContext): Map<string, string> {
    if (ctx.type === 'skill') {
      // Rename skill.md → SKILL.md
      const content = ctx.sourceFiles.get('skill.md') ?? Array.from(ctx.sourceFiles.values())[0];
      return new Map([['SKILL.md', content]]);
    }

    if (ctx.type === 'agent') {
      // Split into AGENT.md + persona.md
      const promptContent = ctx.sourceFiles.get('prompt.md') ?? '';
      const yamlContent = ctx.sourceFiles.get('agent.yaml') ?? '';

      const personaContent = yamlContent
        ? `# Persona\n\nExtracted from agent configuration:\n\n${yamlContent}`
        : '';

      const files = new Map<string, string>();
      files.set('AGENT.md', promptContent);
      if (personaContent) {
        files.set('persona.md', personaContent);
      }
      return files;
    }

    return ctx.sourceFiles;
  }
}
