#!/usr/bin/env node
import { Command } from 'commander';
import { addCommand, askInstallScope } from './commands/add.js';
import { listCommand } from './commands/list.js';
import { searchCommand } from './commands/search.js';
import { loadRegistry } from './registry.js';
import { getDefaultConfig } from './github.js';

const program = new Command();

program
  .name('skillvault')
  .description('Install skills, agents, and prompts from SkillVault')
  .version('0.0.1');

program
  .command('add <name>')
  .description('Install an entry to your project')
  .requiredOption('-a, --agent <agent>', 'Target agent (claude-code, copilot, opencode, antigravity)')
  .option('--local <path>', 'Use local SkillVault repo instead of GitHub')
  .option('-g, --global', 'Install globally instead of to the current project')
  .action(async (name: string, options: { agent: string; local?: string; global?: boolean }) => {
    try {
      const config = options.local
        ? { ...getDefaultConfig(), local: options.local }
        : getDefaultConfig();

      let isGlobal = options.global;
      if (isGlobal === undefined) {
        isGlobal = await askInstallScope();
      }

      const message = await addCommand(name, options.agent, config, isGlobal);
      console.log(message);
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List available entries')
  .option('-t, --type <type>', 'Filter by type (skill, agent, prompt)')
  .option('--local <path>', 'Use local SkillVault repo instead of GitHub')
  .action(async (options: { type?: string; local?: string }) => {
    try {
      const config = options.local
        ? { ...getDefaultConfig(), local: options.local }
        : getDefaultConfig();
      const registry = await loadRegistry(config);
      const lines = listCommand(registry, options.type);
      lines.forEach((line) => console.log(line));
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
      process.exit(1);
    }
  });

program
  .command('search <keyword>')
  .description('Search entries by keyword')
  .option('--local <path>', 'Use local SkillVault repo instead of GitHub')
  .action(async (keyword: string, options: { local?: string }) => {
    try {
      const config = options.local
        ? { ...getDefaultConfig(), local: options.local }
        : getDefaultConfig();
      const registry = await loadRegistry(config);
      const lines = searchCommand(registry, keyword);
      lines.forEach((line) => console.log(line));
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
      process.exit(1);
    }
  });

program.parse();
