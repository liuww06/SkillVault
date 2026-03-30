import type { GitHubConfig } from '../github.js';
import { getDefaultConfig } from '../github.js';
import { findEntry, resolveVariant, loadRegistry } from '../registry.js';
import type { Installer, InstallContext } from '../installer/types.js';
import { CommonInstaller } from '../installer/common.js';
import { ClaudeCodeInstaller } from '../installer/claude-code.js';
import { CopilotInstaller } from '../installer/copilot.js';

export function resolveInstaller(agent: string): Installer {
  switch (agent) {
    case 'claude-code':
      return new ClaudeCodeInstaller();
    case 'copilot':
      return new CopilotInstaller();
    default:
      return new CommonInstaller();
  }
}

export async function addCommand(
  name: string,
  agent: string,
  config?: GitHubConfig,
): Promise<string> {
  const registry = await loadRegistry(config);

  const entry = findEntry(registry, name);
  if (!entry) {
    throw new Error(`Entry "${name}" not found in registry.`);
  }

  const variant = resolveVariant(entry, agent);
  if (!variant) {
    throw new Error(
      `No variant of "${name}" available for agent "${agent}". Available agents: ${entry.variants.map((v) => v.agent).join(', ')}`,
    );
  }

  const installer = resolveInstaller(agent);
  const ctx: InstallContext = {
    name: entry.name,
    type: entry.type,
    sourcePath: variant.path,
    targetDir: process.cwd(),
    config: config ?? getDefaultConfig(),
  };

  await installer.install(ctx);

  return `Installed ${entry.type} "${entry.name}" (variant: ${variant.agent}) for ${agent}.`;
}
