import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readdir, readFile } from 'fs/promises';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { CommonInstaller } from '../../src/installer/common.js';
import type { InstallContext } from '../../src/installer/types.js';
import type { GitHubConfig } from '../../src/github.js';

describe('CommonInstaller', () => {
  let tempDir: string;
  let config: GitHubConfig;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'sv-test-'));
    config = { repo: 'test/repo', branch: 'main', local: tempDir };
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('installs files to skillvault/<type>s/<name>/ directory', async () => {
    const sourceDir = join(tempDir, 'skills', 'common', 'test-skill');
    await mkdir(sourceDir, { recursive: true });
    await writeFile(join(sourceDir, 'skill.md'), '# Test Skill\nHello world');

    const ctx: InstallContext = {
      name: 'test-skill',
      type: 'skill',
      sourcePath: 'skills/common/test-skill',
      targetDir: tempDir,
      config,
    };

    const installer = new CommonInstaller();
    await installer.install(ctx);

    const installedDir = join(tempDir, 'skillvault', 'skills', 'test-skill');
    const files = await readdir(installedDir);
    expect(files).toContain('skill.md');
    const content = await readFile(join(installedDir, 'skill.md'), 'utf-8');
    expect(content).toBe('# Test Skill\nHello world');
  });

  it('installs agent files correctly', async () => {
    const sourceDir = join(tempDir, 'agents', 'claude-code', 'reviewer');
    await mkdir(sourceDir, { recursive: true });
    await writeFile(join(sourceDir, 'agent.yaml'), 'name: reviewer');
    await writeFile(join(sourceDir, 'prompt.md'), 'You are a reviewer.');

    const ctx: InstallContext = {
      name: 'reviewer',
      type: 'agent',
      sourcePath: 'agents/claude-code/reviewer',
      targetDir: tempDir,
      config,
    };

    const installer = new CommonInstaller();
    await installer.install(ctx);

    const installedDir = join(tempDir, 'skillvault', 'agents', 'reviewer');
    const files = await readdir(installedDir);
    expect(files).toContain('agent.yaml');
    expect(files).toContain('prompt.md');
  });
});
