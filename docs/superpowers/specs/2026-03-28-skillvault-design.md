# SkillVault Design

## Project Purpose

Personal AI agent tool repository for accumulating and distributing three types of content:

- **Skills** — Installable skill/ability extensions for AI code agents
- **Agents** — Complete custom agent configurations (config + prompts)
- **Prompts** — Standalone system-level prompt templates

Supports Claude Code, GitHub Copilot, OpenCode, Antigravity, and other agents. Universal content lives in `common/` and installs directly without format conversion.

## Supported Agents

- Claude Code
- GitHub Copilot
- OpenCode
- Antigravity
- Others (extensible)

## Directory Structure

```
SkillVault/
├── registry.json                # Global index of all entries
├── skills/                      # Skills library
│   ├── claude-code/
│   │   └── <skill-name>/
│   │       └── skill.md
│   ├── copilot/
│   │   └── <skill-name>/
│   │       └── instruction.md
│   ├── opencode/
│   ├── antigravity/
│   └── common/                  # Universal skills, direct install
│       └── <skill-name>/
│           └── skill.md
├── agents/                      # Custom agent configurations
│   ├── claude-code/
│   │   └── <agent-name>/
│   │       ├── agent.yaml       # Agent config/metadata
│   │       └── prompt.md        # System prompt
│   ├── copilot/
│   ├── opencode/
│   └── common/
├── prompts/                     # System-level prompt templates
│   ├── claude-code/
│   │   └── <prompt-name>.md
│   ├── copilot/
│   ├── opencode/
│   └── common/
├── cli/                         # npx CLI tool (TypeScript)
│   ├── src/
│   │   ├── index.ts
│   │   ├── commands/
│   │   │   ├── add.ts
│   │   │   ├── list.ts
│   │   │   └── search.ts
│   │   ├── registry.ts
│   │   └── installer/
│   │       ├── claude-code.ts
│   │       ├── copilot.ts
│   │       └── common.ts
│   ├── tsconfig.json
│   └── package.json
├── package.json
└── tsconfig.json
```

## Registry Index

`registry.json` is the global index recording metadata for all entries.

```json
{
  "version": "1",
  "entries": [
    {
      "name": "debugging",
      "type": "skill",
      "description": "Systematic debugging workflow",
      "variants": [
        { "agent": "claude-code", "path": "skills/claude-code/debugging" },
        { "agent": "copilot", "path": "skills/copilot/debugging" }
      ]
    },
    {
      "name": "code-review",
      "type": "skill",
      "description": "Code review skill",
      "variants": [
        { "agent": "common", "path": "skills/common/code-review" }
      ]
    },
    {
      "name": "code-reviewer",
      "type": "agent",
      "description": "Automated code review agent",
      "variants": [
        { "agent": "claude-code", "path": "agents/claude-code/code-reviewer" }
      ]
    },
    {
      "name": "concise-output",
      "type": "prompt",
      "description": "System prompt for concise output style",
      "variants": [
        { "agent": "common", "path": "prompts/common/concise-output" }
      ]
    }
  ]
}
```

Each entry contains:

| Field | Description |
|-------|-------------|
| `name` | Entry identifier, used in CLI commands |
| `type` | One of: `skill`, `agent`, `prompt` |
| `description` | Short description of the entry |
| `variants` | Array of agent-specific variants |

Each variant contains:

| Field | Description |
|-------|-------------|
| `agent` | Agent name, or `common` for universal |
| `path` | Relative path to the entry in the repository |

When installing, the CLI resolves the variant by matching `--agent` to a variant's `agent` field. If no match is found, it falls back to the `common` variant.

## CLI Tool

TypeScript implementation, invoked via `npx skillvault`.

### Commands

| Command | Description |
|---------|-------------|
| `npx skillvault add <name> --agent <agent>` | Install entry to target agent |
| `npx skillvault list [--type skill\|agent\|prompt]` | List available entries |
| `npx skillvault search <keyword>` | Search entries by keyword |

### Installation Logic

1. When `--agent claude-code` is specified:
   - First look for `skills/claude-code/<name>/`
   - If not found, fall back to `skills/common/<name>/`
   - Copy skill files to the project's `.claude/skills/` directory
2. For agents:
   - Copy the entire agent directory to the appropriate agent config location
3. For prompts:
   - Copy prompt file to the appropriate location for the target agent
4. Common content installs directly without format conversion

### CLI Architecture

```
cli/src/
├── index.ts              # Entry point, command routing
├── commands/
│   ├── add.ts            # Add/install command
│   ├── list.ts           # List command
│   └── search.ts         # Search command
├── registry.ts           # Registry loading and querying
└── installer/            # Agent-specific install logic
    ├── claude-code.ts    # Claude Code installer
    ├── copilot.ts        # Copilot installer
    └── common.ts         # Generic/common installer
```

## Claude Code Marketplace Integration

The `claude-code/` directories contain skills in Claude Code's native plugin format. This enables:

- Local installation via CLI to project `.claude/skills/` directories
- Publishing to Claude Code marketplace for community use
- Direct `npx skillvault add` usage referencing the GitHub repo

## Adding a New Agent

To add support for a new agent:

1. Create directories under `skills/<agent>/`, `agents/<agent>/`, `prompts/<agent>/`
2. Add an installer module at `cli/src/installer/<agent>.ts`
3. Register the agent in the relevant entries in `registry.json`
4. Add content following the agent's native format

## Technology Stack

- **Language**: TypeScript
- **Runtime**: Node.js
- **Distribution**: npm package, invoked via `npx skillvault`
- **Build**: tsc
