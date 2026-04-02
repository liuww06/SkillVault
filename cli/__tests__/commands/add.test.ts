import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readFile, readdir, mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { addCommand, resolveInstaller } from '../../src/commands/add.js';
import { ClaudeCodeInstaller } from '../../src/installer/claude-code.js';
import { CopilotInstaller } from '../../src/installer/copilot.js';
import { OpenCodeInstaller } from '../../src/installer/opencode.js';
import { AntigravityInstaller } from '../../src/installer/antigravity.js';
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

  it('returns OpenCodeInstaller for opencode agent', () => {
    const installer = resolveInstaller('opencode');
    expect(installer).toBeInstanceOf(OpenCodeInstaller);
  });

  it('returns AntigravityInstaller for antigravity agent', () => {
    const installer = resolveInstaller('antigravity');
    expect(installer).toBeInstanceOf(AntigravityInstaller);
  });

  it('returns CommonInstaller for unknown agent', () => {
    const installer = resolveInstaller('unknown-agent');
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

  it('installs a skill end-to-end with v2 registry', async () => {
    const sourceDir = join(tempDir, 'skills', 'my-skill');
    await mkdir(sourceDir, { recursive: true });
    await writeFile(join(sourceDir, 'skill.md'), '# My Skill');

    await writeFile(
      join(tempDir, 'registry.json'),
      JSON.stringify({
        version: '2',
        entries: [
          {
            name: 'my-skill',
            type: 'skill',
            description: 'A test skill',
            path: 'skills/my-skill',
          },
        ],
      }),
    );

    process.chdir(tempDir);

    const message = await addCommand('my-skill', 'common', {
      repo: 'test/repo',
      branch: 'main',
      local: tempDir,
    });

    expect(message).toContain('my-skill');

    const installedDir = join(tempDir, 'skillvault', 'skills', 'my-skill');
    const files = await readdir(installedDir);
    expect(files).toContain('skill.md');
    const content = await readFile(join(installedDir, 'skill.md'), 'utf-8');
    expect(content).toBe('# My Skill');
  });

  it('installs a skill with v1 registry (backward compat)', async () => {
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

    const message = await addCommand('my-skill', 'common', {
      repo: 'test/repo',
      branch: 'main',
      local: tempDir,
    });

    expect(message).toContain('my-skill');
  });

  it('throws for unknown entry name', async () => {
    await writeFile(
      join(tempDir, 'registry.json'),
      JSON.stringify({ version: '2', entries: [] }),
    );

    await expect(
      addCommand('nonexistent', 'common', {
        repo: 'test/repo',
        branch: 'main',
        local: tempDir,
      }),
    ).rejects.toThrow('Entry "nonexistent" not found in registry.');
  });
});
