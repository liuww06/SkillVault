import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readdir, readFile, stat } from 'fs/promises';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { ClaudeCodeInstaller } from '../../src/installer/claude-code.js';
import type { InstallContext } from '../../src/installer/types.js';
import type { GitHubConfig } from '../../src/github.js';

describe('ClaudeCodeInstaller', () => {
  let tempDir: string;
  let config: GitHubConfig;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'sv-cc-'));
    config = { repo: 'test/repo', branch: 'main', local: tempDir };
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('installs skill to .claude/skills/<name>/', async () => {
    const sourceDir = join(tempDir, 'skills', 'claude-code', 'debugging');
    await mkdir(sourceDir, { recursive: true });
    await writeFile(join(sourceDir, 'skill.md'), '# Debugging Skill');

    const ctx: InstallContext = {
      name: 'debugging',
      type: 'skill',
      sourcePath: 'skills/claude-code/debugging',
      targetDir: tempDir,
      config,
    };

    const installer = new ClaudeCodeInstaller();
    await installer.install(ctx);

    const destDir = join(tempDir, '.claude', 'skills', 'debugging');
    const files = await readdir(destDir);
    expect(files).toContain('skill.md');
    const content = await readFile(join(destDir, 'skill.md'), 'utf-8');
    expect(content).toBe('# Debugging Skill');
  });

  it('installs agent to .claude/agents/<name>/', async () => {
    const sourceDir = join(tempDir, 'agents', 'claude-code', 'code-reviewer');
    await mkdir(sourceDir, { recursive: true });
    await writeFile(join(sourceDir, 'agent.yaml'), 'name: code-reviewer');
    await writeFile(join(sourceDir, 'prompt.md'), 'Review code.');

    const ctx: InstallContext = {
      name: 'code-reviewer',
      type: 'agent',
      sourcePath: 'agents/claude-code/code-reviewer',
      targetDir: tempDir,
      config,
    };

    const installer = new ClaudeCodeInstaller();
    await installer.install(ctx);

    const destDir = join(tempDir, '.claude', 'agents', 'code-reviewer');
    const files = await readdir(destDir);
    expect(files).toContain('agent.yaml');
    expect(files).toContain('prompt.md');
  });

  it('installs prompt to .claude/system-prompt.md', async () => {
    const sourceDir = join(tempDir, 'prompts', 'claude-code');
    await mkdir(sourceDir, { recursive: true });
    await writeFile(join(sourceDir, 'concise.md'), 'Be concise.');

    const ctx: InstallContext = {
      name: 'concise',
      type: 'prompt',
      sourcePath: 'prompts/claude-code',
      targetDir: tempDir,
      config,
    };

    const installer = new ClaudeCodeInstaller();
    await installer.install(ctx);

    const destFile = join(tempDir, '.claude', 'system-prompt.md');
    const content = await readFile(destFile, 'utf-8');
    expect(content).toBe('Be concise.');
  });
});
