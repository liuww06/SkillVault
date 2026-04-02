import type { Installer, InstallContext } from './types.js';
import { mkdir, writeFile, appendFile, stat } from 'fs/promises';
import { dirname, join } from 'path';

export abstract class BaseInstaller implements Installer {
  abstract getDirectoryPath(ctx: InstallContext): string;
  abstract getPromptPath(ctx: InstallContext): string;

  protected transformFiles(_ctx: InstallContext): Map<string, string> {
    return _ctx.sourceFiles;
  }

  async install(ctx: InstallContext): Promise<void> {
    if (ctx.type === 'prompt') {
      await this.installPrompt(ctx);
    } else {
      await this.installDirectory(ctx);
    }
  }

  protected async installDirectory(ctx: InstallContext): Promise<void> {
    const destDir = this.getDirectoryPath(ctx);
    await mkdir(destDir, { recursive: true });

    const files = this.transformFiles(ctx);
    if (files.size === 0) {
      throw new Error(`No files to install for "${ctx.name}"`);
    }

    for (const [filename, content] of files) {
      await writeFile(join(destDir, filename), content);
    }
  }

  protected async installPrompt(ctx: InstallContext): Promise<void> {
    const destFile = this.getPromptPath(ctx);
    await mkdir(dirname(destFile), { recursive: true });

    const files = this.transformFiles(ctx);
    const parts = Array.from(files.values());
    const content = parts.join('\n\n');

    try {
      await stat(destFile);
      await appendFile(destFile, '\n\n' + content);
    } catch {
      await writeFile(destFile, content);
    }
  }
}
