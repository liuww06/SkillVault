import type { Installer, InstallContext } from './types.js';
import { mkdir, writeFile, appendFile, stat } from 'fs/promises';
import { join } from 'path';
import { listFiles, fetchFileContent } from '../github.js';

export class CopilotInstaller implements Installer {
  async install(ctx: InstallContext): Promise<void> {
    if (ctx.type === 'prompt') {
      await this.installPrompt(ctx);
    } else {
      await this.installDirectory(ctx);
    }
  }

  private async installDirectory(ctx: InstallContext): Promise<void> {
    const destDir = join(ctx.targetDir, '.github', 'copilot', `${ctx.type}s`, ctx.name);
    await mkdir(destDir, { recursive: true });

    const files = await listFiles(ctx.config, ctx.sourcePath);
    if (files.length === 0) {
      throw new Error(`No files found at ${ctx.sourcePath}`);
    }

    for (const file of files) {
      const content = await fetchFileContent(ctx.config, join(ctx.sourcePath, file));
      await writeFile(join(destDir, file), content);
    }
  }

  private async installPrompt(ctx: InstallContext): Promise<void> {
    const destFile = join(ctx.targetDir, '.github', 'copilot-instructions.md');
    await mkdir(join(ctx.targetDir, '.github'), { recursive: true });

    const files = await listFiles(ctx.config, ctx.sourcePath);
    for (const file of files) {
      const content = await fetchFileContent(ctx.config, join(ctx.sourcePath, file));
      try {
        await stat(destFile);
        await appendFile(destFile, '\n\n' + content);
      } catch {
        await writeFile(destFile, content);
      }
    }
  }
}
