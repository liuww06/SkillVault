import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readFile, readdir } from 'fs/promises';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { addCommand, resolveInstaller } from '../../src/commands/add.js';
import { ClaudeCodeInstaller } from '../../src/installer/claude-code.js';
import { CopilotInstaller } from '../../src/installer/copilot.js';
import { CommonInstaller } from '../../src/installer/common.js';

describe('resolveInstaller', () => {
  it('returns ClaudeCodeInstaller for claude-code agent', () => {
    const installer = resolveInstaller('claude-code');
    expect(installer).toBeInstanceOf(ClaudeCodeInstaller);
  });

  it('returns CopilotInstaller for copilot agent', () => {
    const installer = resolveInstaller('copilot');
    expect(installer).toBeInstanceOf(CopilotInstaller);
  });

  it('returns CommonInstaller for unknown agent', () => {
    const installer = resolveInstaller('opencode');
    expect(installer).toBeInstanceOf(CommonInstaller);
  });
});

describe('addCommand', () => {
  let tempDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'sv-add-'));
    originalCwd = process.cwd();
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await rm(tempDir, { recursive: true, force: true });
  });

  it('installs a common skill end-to-end', async () => {
    const sourceDir = join(tempDir, 'skills', 'common', 'my-skill');
    await mkdir(sourceDir, { recursive: true });
    await writeFile(join(sourceDir, 'skill.md'), '# My Skill');

    await writeFile(
      join(tempDir, 'registry.json'),
      JSON.stringify({
        version: '1',
        entries: [
          {
            name: 'my-skill',
            type: 'skill',
            description: 'A test skill',
            variants: [{ agent: 'common', path: 'skills/common/my-skill' }],
          },
        ],
      }),
    );

    process.chdir(tempDir);

    const message = await addCommand('my-skill', 'opencode', {
      repo: 'test/repo',
      branch: 'main',
      local: tempDir,
    });

    expect(message).toContain('my-skill');
    expect(message).toContain('common');

    const installedDir = join(tempDir, 'skillvault', 'skills', 'my-skill');
    const files = await readdir(installedDir);
    expect(files).toContain('skill.md');
    const content = await readFile(join(installedDir, 'skill.md'), 'utf-8');
    expect(content).toBe('# My Skill');
  });

  it('throws for unknown entry name', async () => {
    await writeFile(
      join(tempDir, 'registry.json'),
      JSON.stringify({ version: '1', entries: [] }),
    );

    await expect(
      addCommand('nonexistent', 'opencode', {
        repo: 'test/repo',
        branch: 'main',
        local: tempDir,
      }),
    ).rejects.toThrow('Entry "nonexistent" not found in registry.');
  });

  it('throws when no variant available for agent', async () => {
    await writeFile(
      join(tempDir, 'registry.json'),
      JSON.stringify({
        version: '1',
        entries: [
          {
            name: 'cc-only',
            type: 'skill',
            description: 'Claude Code only skill',
            variants: [{ agent: 'claude-code', path: 'skills/claude-code/cc-only' }],
          },
        ],
      }),
    );

    await expect(
      addCommand('cc-only', 'copilot', {
        repo: 'test/repo',
        branch: 'main',
        local: tempDir,
      }),
    ).rejects.toThrow('No variant of "cc-only" available for agent "copilot"');
  });
});
