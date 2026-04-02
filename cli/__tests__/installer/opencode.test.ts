import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { OpenCodeInstaller } from '../../src/installer/opencode.js';
import type { InstallContext } from '../../src/installer/types.js';

function makeCtx(overrides: Partial<InstallContext> & { name: string; type: InstallContext['type'] }): InstallContext {
  return {
    targetDir: '',
    sourceFiles: new Map(),
    global: false,
    ...overrides,
  };
}

describe('OpenCodeInstaller', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'sv-opencode-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('renames skill.md to SKILL.md', async () => {
    const ctx = makeCtx({
      name: 'debugging',
      type: 'skill',
      targetDir: tempDir,
      sourceFiles: new Map([['skill.md', '# Debugging Skill']]),
    });

    const installer = new OpenCodeInstaller();
    await installer.install(ctx);

    const destDir = join(tempDir, '.opencode', 'skills', 'debugging');
    const files = await readdir(destDir);
    expect(files).toContain('SKILL.md');
    expect(files).not.toContain('skill.md');

    const content = await readFile(join(destDir, 'SKILL.md'), 'utf-8');
    expect(content).toBe('# Debugging Skill');
  });

  it('merges agent files into AGENT.md', async () => {
    const ctx = makeCtx({
      name: 'reviewer',
      type: 'agent',
      targetDir: tempDir,
      sourceFiles: new Map([
        ['agent.yaml', 'name: reviewer\ndescription: Review'],
        ['prompt.md', 'You are a reviewer.'],
      ]),
    });

    const installer = new OpenCodeInstaller();
    await installer.install(ctx);

    const destDir = join(tempDir, '.opencode', 'agents', 'reviewer');
    const files = await readdir(destDir);
    expect(files).toContain('AGENT.md');
    expect(files).toHaveLength(1);

    const content = await readFile(join(destDir, 'AGENT.md'), 'utf-8');
    expect(content).toContain('---');
    expect(content).toContain('name: reviewer');
    expect(content).toContain('You are a reviewer.');
  });

  it('appends prompt to AGENTS.md', async () => {
    const ctx = makeCtx({
      name: 'concise',
      type: 'prompt',
      targetDir: tempDir,
      sourceFiles: new Map([['concise.md', 'Be concise.']]),
    });

    const installer = new OpenCodeInstaller();
    await installer.install(ctx);

    const destFile = join(tempDir, '.opencode', 'AGENTS.md');
    const content = await readFile(destFile, 'utf-8');
    expect(content).toBe('Be concise.');
  });
});
