import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readdir, readFile } from 'fs/promises';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { CopilotInstaller } from '../../src/installer/copilot.js';
import type { InstallContext } from '../../src/installer/types.js';
import type { GitHubConfig } from '../../src/github.js';

describe('CopilotInstaller', () => {
  let tempDir: string;
  let config: GitHubConfig;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'sv-copilot-'));
    config = { repo: 'test/repo', branch: 'main', local: tempDir };
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('installs skill to .github/copilot/skills/<name>/', async () => {
    const sourceDir = join(tempDir, 'skills', 'copilot', 'my-skill');
    await mkdir(sourceDir, { recursive: true });
    await writeFile(join(sourceDir, 'instruction.md'), '# My Copilot Skill');

    const ctx: InstallContext = {
      name: 'my-skill',
      type: 'skill',
      sourcePath: 'skills/copilot/my-skill',
      targetDir: tempDir,
      config,
    };

    const installer = new CopilotInstaller();
    await installer.install(ctx);

    const destDir = join(tempDir, '.github', 'copilot', 'skills', 'my-skill');
    const files = await readdir(destDir);
    expect(files).toContain('instruction.md');
    const content = await readFile(join(destDir, 'instruction.md'), 'utf-8');
    expect(content).toBe('# My Copilot Skill');
  });

  it('installs prompt to .github/copilot-instructions.md', async () => {
    const sourceDir = join(tempDir, 'prompts', 'copilot');
    await mkdir(sourceDir, { recursive: true });
    await writeFile(join(sourceDir, 'style.md'), 'Be helpful.');

    const ctx: InstallContext = {
      name: 'style',
      type: 'prompt',
      sourcePath: 'prompts/copilot',
      targetDir: tempDir,
      config,
    };

    const installer = new CopilotInstaller();
    await installer.install(ctx);

    const destFile = join(tempDir, '.github', 'copilot-instructions.md');
    const content = await readFile(destFile, 'utf-8');
    expect(content).toBe('Be helpful.');
  });
});
