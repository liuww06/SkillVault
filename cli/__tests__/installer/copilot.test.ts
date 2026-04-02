import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { CopilotInstaller } from '../../src/installer/copilot.js';
import type { InstallContext } from '../../src/installer/types.js';

function makeCtx(overrides: Partial<InstallContext> & { name: string; type: InstallContext['type'] }): InstallContext {
  return {
    targetDir: '',
    sourceFiles: new Map(),
    global: false,
    ...overrides,
  };
}

describe('CopilotInstaller', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'sv-copilot-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('installs skill to .github/copilot/skills/<name>/', async () => {
    const ctx = makeCtx({
      name: 'my-skill',
      type: 'skill',
      targetDir: tempDir,
      sourceFiles: new Map([['instruction.md', '# My Copilot Skill']]),
    });

    const installer = new CopilotInstaller();
    await installer.install(ctx);

    const destDir = join(tempDir, '.github', 'skills', 'my-skill');
    const files = await readdir(destDir);
    expect(files).toContain('instruction.md');
    const content = await readFile(join(destDir, 'instruction.md'), 'utf-8');
    expect(content).toBe('# My Copilot Skill');
  });

  it('installs prompt to .github/copilot-instructions.md', async () => {
    const ctx = makeCtx({
      name: 'style',
      type: 'prompt',
      targetDir: tempDir,
      sourceFiles: new Map([['style.md', 'Be helpful.']]),
    });

    const installer = new CopilotInstaller();
    await installer.install(ctx);

    const destFile = join(tempDir, '.github', 'copilot-instructions.md');
    const content = await readFile(destFile, 'utf-8');
    expect(content).toBe('Be helpful.');
  });

  it('merges agent files into single .agent.md', async () => {
    const ctx = makeCtx({
      name: 'reviewer',
      type: 'agent',
      targetDir: tempDir,
      sourceFiles: new Map([
        ['agent.yaml', 'name: reviewer\ndescription: Review agent'],
        ['prompt.md', 'You are a reviewer.'],
      ]),
    });

    const installer = new CopilotInstaller();
    await installer.install(ctx);

    const destDir = join(tempDir, '.github', 'agents', 'reviewer');
    const files = await readdir(destDir);
    expect(files).toContain('reviewer.agent.md');
    expect(files).toHaveLength(1);

    const content = await readFile(join(destDir, 'reviewer.agent.md'), 'utf-8');
    expect(content).toContain('---');
    expect(content).toContain('name: reviewer');
    expect(content).toContain('You are a reviewer.');
  });
});
