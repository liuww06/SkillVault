# SkillVault

Personal AI agent tool repository — a marketplace for installing and distributing Skills, Agents, and Prompts across multiple AI coding assistants.

## What's Inside

SkillVault provides three types of content:

- **Skills** — Installable ability extensions for AI code agents (e.g., code review workflow, systematic debugging)
- **Agents** — Complete custom agent configurations with YAML metadata and system prompts
- **Prompts** — Standalone system-level prompt templates

All entries are indexed in [`registry.json`](registry.json) and can be installed via the CLI.

## Available Entries

| Name | Type | Description | Agents |
|------|------|-------------|--------|
| `code-review` | Skill | Code review skill for systematic review workflow | common |
| `debugging` | Skill | Systematic debugging workflow | claude-code, common |
| `code-reviewer` | Agent | Automated code review agent | claude-code |
| `concise-output` | Prompt | System prompt for concise output style | common |

## Quick Start

```bash
# List all available entries
npx skillvault list

# Filter by type
npx skillvault list --type skill
npx skillvault list --type agent
npx skillvault list --type prompt

# Search entries
npx skillvault search debug

# Install an entry
npx skillvault add debugging --agent claude-code
npx skillvault add code-review --agent common
```

## Project Structure

```
SkillVault/
├── registry.json              # Global index of all entries
├── cli/                       # CLI tool (TypeScript)
│   └── src/
│       ├── index.ts           # CLI entry point
│       ├── commands/          # add, list, search commands
│       └── installer/         # Agent-specific installers
├── skills/                    # Skill library
│   ├── claude-code/           # Claude Code specific skills
│   └── common/                # Universal skills
├── agents/                    # Agent configurations
│   └── claude-code/           # Claude Code agents
├── prompts/                   # Prompt templates
│   └── common/                # Universal prompts
└── docs/                      # Documentation
```

## Supported Agents

| Agent | Install Location | Details |
|-------|-----------------|---------|
| Claude Code | `.claude/skills/`, `.claude/agents/` | Full support for skills, agents, and prompts |
| GitHub Copilot | `.github/copilot/` | Copilot-specific instructions |
| Common | `skillvault/` | Works with any agent as fallback |

If a specific agent variant is not found, the CLI automatically falls back to the `common` variant.

## Development

```bash
# Install dependencies
npm install

# Build CLI
npm run build

# Run tests
npm test

# Local development with watch mode
npm run dev --workspace=cli

# Run CLI locally
node cli/dist/index.js --help
```

## Adding New Entries

1. Create your content directory under `skills/`, `agents/`, or `prompts/`
2. Add an entry to `registry.json` with name, type, description, and variants
3. Each variant specifies an `agent` and a `path` to the content directory

Example registry entry:

```json
{
  "name": "my-skill",
  "type": "skill",
  "description": "Description of the skill",
  "variants": [
    { "agent": "common", "path": "skills/common/my-skill" }
  ]
}
```

## License

MIT
