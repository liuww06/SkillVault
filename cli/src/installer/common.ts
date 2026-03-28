import type { Installer, InstallContext } from './types.js';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { listFiles, fetchFileContent } from '../github.js';

export class CommonInstaller implements Installer {
  async install(ctx: InstallContext): Promise<void> {
    const destDir = join(ctx.targetDir, 'skillvault', `${ctx.type}s`, ctx.name);
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
}
