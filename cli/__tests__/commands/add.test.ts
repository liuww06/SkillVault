import { describe, it, expect } from 'vitest';

describe('addCommand', () => {
  describe('resolveInstaller', () => {
    it('returns ClaudeCodeInstaller for claude-code agent', async () => {
      const { resolveInstaller } = await import('../../src/commands/add.js');
      const installer = resolveInstaller('claude-code');
      expect(installer.constructor.name).toBe('ClaudeCodeInstaller');
    });

    it('returns CopilotInstaller for copilot agent', async () => {
      const { resolveInstaller } = await import('../../src/commands/add.js');
      const installer = resolveInstaller('copilot');
      expect(installer.constructor.name).toBe('CopilotInstaller');
    });

    it('returns CommonInstaller for unknown agent', async () => {
      const { resolveInstaller } = await import('../../src/commands/add.js');
      const installer = resolveInstaller('opencode');
      expect(installer.constructor.name).toBe('CommonInstaller');
    });
  });
});
