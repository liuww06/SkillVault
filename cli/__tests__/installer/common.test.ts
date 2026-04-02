import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { CommonInstaller } from '../../src/installer/common.js';
import type { InstallContext } from '../../src/installer/types.js';

function makeCtx(overrides: Partial<InstallContext> & { name: string; type: InstallContext['type'] }): InstallContext {
  return {
    targetDir: '',
    sourceFiles: new Map(),
    global: false,
    ...overrides,
  };
}

describe('CommonInstaller', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'sv-test-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('installs files to skillvault/<type>s/<name>/ directory', async () => {
    const ctx = makeCtx({
      name: 'test-skill',
      type: 'skill',
      targetDir: tempDir,
      sourceFiles: new Map([['skill.md', '# Test Skill\nHello world']]),
    });

    const installer = new CommonInstaller();
    await installer.install(ctx);

    const installedDir = join(tempDir, 'skillvault', 'skills', 'test-skill');
    const files = await readdir(installedDir);
    expect(files).toContain('skill.md');
    const content = await readFile(join(installedDir, 'skill.md'), 'utf-8');
    expect(content).toBe('# Test Skill\nHello world');
  });

  it('installs agent files correctly', async () => {
    const ctx = makeCtx({
      name: 'reviewer',
      type: 'agent',
      targetDir: tempDir,
      sourceFiles: new Map([
        ['agent.yaml', 'name: reviewer'],
        ['prompt.md', 'You are a reviewer.'],
      ]),
    });

    const installer = new CommonInstaller();
    await installer.install(ctx);

    const installedDir = join(tempDir, 'skillvault', 'agents', 'reviewer');
    const files = await readdir(installedDir);
    expect(files).toContain('agent.yaml');
    expect(files).toContain('prompt.md');
  });
});
