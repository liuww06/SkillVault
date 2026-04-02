import type { GitHubConfig } from '../github.js';
import { getDefaultConfig, listFiles, fetchFileContent } from '../github.js';
import { findEntry, loadRegistry } from '../registry.js';
import type { Installer, InstallContext } from '../installer/types.js';
import { CommonInstaller } from '../installer/common.js';
import { ClaudeCodeInstaller } from '../installer/claude-code.js';
import { CopilotInstaller } from '../installer/copilot.js';
import { OpenCodeInstaller } from '../installer/opencode.js';
import { AntigravityInstaller } from '../installer/antigravity.js';
import * as readline from 'readline';

export function resolveInstaller(agent: string): Installer {
  switch (agent) {
    case 'claude-code':
      return new ClaudeCodeInstaller();
    case 'copilot':
      return new CopilotInstaller();
    case 'opencode':
      return new OpenCodeInstaller();
    case 'antigravity':
      return new AntigravityInstaller();
    default:
      return new CommonInstaller();
  }
}

export async function addCommand(
  name: string,
  agent: string,
  config?: GitHubConfig,
  global?: boolean,
): Promise<string> {
  const cfg = config ?? getDefaultConfig();
  const registry = await loadRegistry(cfg);

  const entry = findEntry(registry, name);
  if (!entry) {
    throw new Error(`Entry "${name}" not found in registry.`);
  }

  // Pre-fetch all source files
  const sourceFiles = new Map<string, string>();
  const files = await listFiles(cfg, entry.path);
  if (files.length === 0) {
    throw new Error(`No files found at ${entry.path}`);
  }
  for (const file of files) {
    const content = await fetchFileContent(cfg, `${entry.path}/${file}`);
    sourceFiles.set(file, content);
  }

  const installer = resolveInstaller(agent);
  const ctx: InstallContext = {
    name: entry.name,
    type: entry.type,
    targetDir: process.cwd(),
    sourceFiles,
    global: global ?? false,
  };

  await installer.install(ctx);

  return `Installed ${entry.type} "${entry.name}" for ${agent}.`;
}

export async function askInstallScope(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<boolean>((resolve) => {
    rl.question('Install scope? (p)roject / (g)lobal [p]: ', (answer) => {
      rl.close();
      const trimmed = answer.trim().toLowerCase();
      resolve(trimmed === 'g' || trimmed === 'global');
    });
  });
}
