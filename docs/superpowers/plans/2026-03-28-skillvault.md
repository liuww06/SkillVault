# SkillVault Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build SkillVault — a personal AI agent tool repository with a TypeScript CLI for installing skills, agents, and prompts across multiple AI code agents.

**Architecture:** Monorepo with content directories (skills/, agents/, prompts/) at root and a publishable CLI package under cli/. The CLI reads a registry.json from the GitHub repo and installs entries to local projects. Each AI agent has a dedicated installer that knows where to place files.

**Tech Stack:** TypeScript, Node.js (>=18), commander (CLI parsing), vitest (testing), tsup (build)

---

## File Structure

```
SkillVault/
├── registry.json
├── .gitignore
├── package.json
├── skills/
│   ├── claude-code/
│   ├── copilot/
│   ├── opencode/
│   ├── antigravity/
│   └── common/
├── agents/
│   ├── claude-code/
│   ├── copilot/
│   ├── opencode/
│   └── common/
├── prompts/
│   ├── claude-code/
│   ├── copilot/
│   ├── opencode/
│   └── common/
├── cli/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   ├── src/
│   │   ├── types.ts
│   │   ├── github.ts
│   │   ├── registry.ts
│   │   ├── index.ts
│   │   ├── commands/
│   │   │   ├── add.ts
│   │   │   ├── list.ts
│   │   │   └── search.ts
│   │   └── installer/
│   │       ├── types.ts
│   │       ├── common.ts
│   │       ├── claude-code.ts
│   │       └── copilot.ts
│   └── __tests__/
│       ├── registry.test.ts
│       ├── commands/
│       │   ├── list.test.ts
│       │   ├── search.test.ts
│       │   └── add.test.ts
│       └── installer/
│           ├── common.test.ts
│           └── claude-code.test.ts
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `cli/package.json`
- Create: `cli/tsconfig.json`
- Create: `cli/vitest.config.ts`
- Create: all content directories (empty `.gitkeep` files)

- [ ] **Step 1: Create root package.json**

```json
{
  "name": "skillvault",
  "version": "0.0.1",
  "private": true,
  "description": "Personal AI agent tool repository",
  "scripts": {
    "build": "npm run build --workspace=cli",
    "test": "npm test --workspace=cli"
  },
  "workspaces": ["cli"]
}
```

- [ ] **Step 2: Create cli/package.json**

```json
{
  "name": "skillvault-cli",
  "version": "0.0.1",
  "description": "CLI for installing skills, agents, and prompts from SkillVault",
  "type": "module",
  "bin": {
    "skillvault": "./dist/index.js"
  },
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts --outDir dist",
    "dev": "tsup src/index.ts --format esm --outDir dist --watch",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "commander": "^12.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.5.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 3: Create cli/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "__tests__"]
}
```

- [ ] **Step 4: Create cli/vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
  },
});
```

- [ ] **Step 5: Create .gitignore**

```
node_modules/
dist/
*.tsbuildinfo
.DS_Store
```

- [ ] **Step 6: Create content directories with .gitkeep**

Create the following empty `.gitkeep` files to preserve directory structure in git:

```
skills/claude-code/.gitkeep
skills/copilot/.gitkeep
skills/opencode/.gitkeep
skills/antigravity/.gitkeep
skills/common/.gitkeep
agents/claude-code/.gitkeep
agents/copilot/.gitkeep
agents/opencode/.gitkeep
agents/common/.gitkeep
prompts/claude-code/.gitkeep
prompts/copilot/.gitkeep
prompts/opencode/.gitkeep
prompts/common/.gitkeep
```

- [ ] **Step 7: Install dependencies**

Run: `cd /Users/zhaojialing/github/liuww06/SkillVault && npm install`
Expected: Dependencies installed successfully

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold project structure and CLI workspace"
```

---

### Task 2: Types and GitHub Utility

**Files:**
- Create: `cli/src/types.ts`
- Create: `cli/src/github.ts`

- [ ] **Step 1: Create cli/src/types.ts**

```typescript
export type EntryType = 'skill' | 'agent' | 'prompt';

export interface Variant {
  agent: string;
  path: string;
}

export interface RegistryEntry {
  name: string;
  type: EntryType;
  description: string;
  variants: Variant[];
}

export interface Registry {
  version: string;
  entries: RegistryEntry[];
}
```

- [ ] **Step 2: Create cli/src/github.ts**

This module handles fetching files and directory listings from GitHub.

```typescript
import { readFile } from 'fs/promises';
import { join } from 'path';

const DEFAULT_REPO = 'liuww06/SkillVault';
const DEFAULT_BRANCH = 'main';

export interface GitHubConfig {
  repo: string;
  branch: string;
  local?: string; // Local path for development, bypasses GitHub
}

export function getDefaultConfig(): GitHubConfig {
  return { repo: DEFAULT_REPO, branch: DEFAULT_BRANCH };
}

export function rawUrl(config: GitHubConfig, filePath: string): string {
  return `https://raw.githubusercontent.com/${config.repo}/${config.branch}/${filePath}`;
}

export async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

export async function fetchJSON<T>(url: string): Promise<T> {
  const text = await fetchText(url);
  return JSON.parse(text) as T;
}

export async function listFiles(config: GitHubConfig, dirPath: string): Promise<string[]> {
  if (config.local) {
    return listLocalFiles(config.local, dirPath);
  }
  const url = `https://api.github.com/repos/${config.repo}/contents/${dirPath}?ref=${config.branch}`;
  const response = await fetch(url, {
    headers: { Accept: 'application/vnd.github.v3+json' },
  });
  if (!response.ok) return [];
  const data = (await response.json()) as Array<{ name: string; type: string }>;
  return data.filter((f) => f.type === 'file').map((f) => f.name);
}

async function listLocalFiles(localRoot: string, dirPath: string): Promise<string[]> {
  const { readdir } = await import('fs/promises');
  const { stat } = await import('fs/promises');
  const fullDir = join(localRoot, dirPath);
  try {
    const entries = await readdir(fullDir);
    const files: string[] = [];
    for (const entry of entries) {
      const s = await stat(join(fullDir, entry));
      if (s.isFile()) files.push(entry);
    }
    return files;
  } catch {
    return [];
  }
}

export async function fetchFileContent(config: GitHubConfig, filePath: string): Promise<string> {
  if (config.local) {
    return readFile(join(config.local, filePath), 'utf-8');
  }
  return fetchText(rawUrl(config, filePath));
}
```

- [ ] **Step 3: Commit**

```bash
git add cli/src/types.ts cli/src/github.ts
git commit -m "feat: add types and GitHub utility module"
```

---

### Task 3: Registry Module

**Files:**
- Create: `cli/src/registry.ts`
- Create: `cli/__tests__/registry.test.ts`

- [ ] **Step 1: Write the failing tests for registry**

Create `cli/__tests__/registry.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { findEntry, resolveVariant, filterByType, searchEntries } from '../src/registry.js';
import type { Registry, RegistryEntry } from '../src/types.js';

const mockRegistry: Registry = {
  version: '1',
  entries: [
    {
      name: 'debugging',
      type: 'skill',
      description: 'Systematic debugging workflow',
      variants: [
        { agent: 'claude-code', path: 'skills/claude-code/debugging' },
        { agent: 'copilot', path: 'skills/copilot/debugging' },
      ],
    },
    {
      name: 'code-review',
      type: 'skill',
      description: 'Code review skill',
      variants: [{ agent: 'common', path: 'skills/common/code-review' }],
    },
    {
      name: 'code-reviewer',
      type: 'agent',
      description: 'Automated code review agent',
      variants: [{ agent: 'claude-code', path: 'agents/claude-code/code-reviewer' }],
    },
    {
      name: 'concise-output',
      type: 'prompt',
      description: 'System prompt for concise output',
      variants: [{ agent: 'common', path: 'prompts/common/concise-output' }],
    },
  ],
};

describe('findEntry', () => {
  it('finds an entry by name', () => {
    const entry = findEntry(mockRegistry, 'debugging');
    expect(entry).toBeDefined();
    expect(entry!.name).toBe('debugging');
    expect(entry!.type).toBe('skill');
  });

  it('returns undefined for unknown name', () => {
    const entry = findEntry(mockRegistry, 'nonexistent');
    expect(entry).toBeUndefined();
  });
});

describe('resolveVariant', () => {
  it('returns exact agent match', () => {
    const entry = mockRegistry.entries[0]; // debugging
    const variant = resolveVariant(entry, 'copilot');
    expect(variant).toBeDefined();
    expect(variant!.agent).toBe('copilot');
    expect(variant!.path).toBe('skills/copilot/debugging');
  });

  it('falls back to common when agent not found', () => {
    const entry = mockRegistry.entries[1]; // code-review (common only)
    const variant = resolveVariant(entry, 'copilot');
    expect(variant).toBeDefined();
    expect(variant!.agent).toBe('common');
  });

  it('returns undefined when no match and no common', () => {
    const entry = mockRegistry.entries[2]; // code-reviewer (claude-code only)
    const variant = resolveVariant(entry, 'copilot');
    expect(variant).toBeUndefined();
  });
});

describe('filterByType', () => {
  it('returns all entries when no type filter', () => {
    const result = filterByType(mockRegistry);
    expect(result).toHaveLength(4);
  });

  it('filters by type', () => {
    const skills = filterByType(mockRegistry, 'skill');
    expect(skills).toHaveLength(2);
    expect(skills.every((e) => e.type === 'skill')).toBe(true);
  });

  it('returns empty for type with no entries', () => {
    const result = filterByType(mockRegistry, 'agent');
    expect(result).toHaveLength(1);
  });
});

describe('searchEntries', () => {
  it('searches by name', () => {
    const results = searchEntries(mockRegistry, 'debug');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('debugging');
  });

  it('searches by description', () => {
    const results = searchEntries(mockRegistry, 'concise');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('concise-output');
  });

  it('is case-insensitive', () => {
    const results = searchEntries(mockRegistry, 'REVIEW');
    expect(results).toHaveLength(3); // code-review, code-reviewer, concise-output has no review
  });

  it('returns empty for no match', () => {
    const results = searchEntries(mockRegistry, 'xyz123');
    expect(results).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/zhaojialing/github/liuww06/SkillVault/cli && npx vitest run __tests__/registry.test.ts`
Expected: FAIL — module `../src/registry.js` not found

- [ ] **Step 3: Create cli/src/registry.ts**

```typescript
import type { Registry, RegistryEntry, Variant } from './types.js';
import { fetchJSON, getDefaultConfig, rawUrl } from './github.js';
import type { GitHubConfig } from './github.js';

export async function loadRegistry(config?: GitHubConfig): Promise<Registry> {
  const cfg = config ?? getDefaultConfig();
  if (cfg.local) {
    const { readFile } = await import('fs/promises');
    const { join } = await import('path');
    const text = await readFile(join(cfg.local, 'registry.json'), 'utf-8');
    return JSON.parse(text) as Registry;
  }
  const url = rawUrl(cfg, 'registry.json');
  return fetchJSON<Registry>(url);
}

export function findEntry(registry: Registry, name: string): RegistryEntry | undefined {
  return registry.entries.find((e) => e.name === name);
}

export function resolveVariant(entry: RegistryEntry, agent: string): Variant | undefined {
  const exact = entry.variants.find((v) => v.agent === agent);
  if (exact) return exact;
  return entry.variants.find((v) => v.agent === 'common');
}

export function filterByType(registry: Registry, type?: string): RegistryEntry[] {
  if (!type) return registry.entries;
  return registry.entries.filter((e) => e.type === type);
}

export function searchEntries(registry: Registry, keyword: string): RegistryEntry[] {
  const lower = keyword.toLowerCase();
  return registry.entries.filter(
    (e) =>
      e.name.toLowerCase().includes(lower) ||
      e.description.toLowerCase().includes(lower),
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/zhaojialing/github/liuww06/SkillVault/cli && npx vitest run __tests__/registry.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add cli/src/registry.ts cli/__tests__/registry.test.ts
git commit -m "feat: add registry module with find, resolve, filter, search"
```

---

### Task 4: Installer Interface and Common Installer

**Files:**
- Create: `cli/src/installer/types.ts`
- Create: `cli/src/installer/common.ts`
- Create: `cli/__tests__/installer/common.test.ts`

- [ ] **Step 1: Create cli/src/installer/types.ts**

```typescript
import type { EntryType } from '../types.js';

export interface InstallContext {
  name: string;
  type: EntryType;
  sourcePath: string;
  targetDir: string; // absolute path to the project root where files are installed
  config: import('../github.js').GitHubConfig;
}

export interface Installer {
  install(ctx: InstallContext): Promise<void>;
}
```

- [ ] **Step 2: Write the failing tests for common installer**

Create `cli/__tests__/installer/common.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { CommonInstaller } from '../../src/installer/common.js';
import type { InstallContext } from '../../src/installer/types.js';
import type { GitHubConfig } from '../../src/github.js';

describe('CommonInstaller', () => {
  let tempDir: string;
  let config: GitHubConfig;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'sv-test-'));
    config = { repo: 'test/repo', branch: 'main', local: tempDir };
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('installs files to skillvault/<type>s/<name>/ directory', async () => {
    // Set up: create source files in temp dir
    const { mkdir, writeFile } = await import('fs/promises');
    const sourceDir = join(tempDir, 'skills', 'common', 'test-skill');
    await mkdir(sourceDir, { recursive: true });
    await writeFile(join(sourceDir, 'skill.md'), '# Test Skill\nHello world');

    const ctx: InstallContext = {
      name: 'test-skill',
      type: 'skill',
      sourcePath: 'skills/common/test-skill',
      targetDir: tempDir,
      config,
    };

    const installer = new CommonInstaller();
    await installer.install(ctx);

    // Verify: files installed to skillvault/skills/test-skill/
    const installedDir = join(tempDir, 'skillvault', 'skills', 'test-skill');
    const files = await readdir(installedDir);
    expect(files).toContain('skill.md');
    const content = await readFile(join(installedDir, 'skill.md'), 'utf-8');
    expect(content).toBe('# Test Skill\nHello world');
  });

  it('installs agent files correctly', async () => {
    const { mkdir, writeFile } = await import('fs/promises');
    const sourceDir = join(tempDir, 'agents', 'claude-code', 'reviewer');
    await mkdir(sourceDir, { recursive: true });
    await writeFile(join(sourceDir, 'agent.yaml'), 'name: reviewer');
    await writeFile(join(sourceDir, 'prompt.md'), 'You are a reviewer.');

    const ctx: InstallContext = {
      name: 'reviewer',
      type: 'agent',
      sourcePath: 'agents/claude-code/reviewer',
      targetDir: tempDir,
      config,
    };

    const installer = new CommonInstaller();
    await installer.install(ctx);

    const installedDir = join(tempDir, 'skillvault', 'agents', 'reviewer');
    const files = await readdir(installedDir);
    expect(files).toContain('agent.yaml');
    expect(files).toContain('prompt.md');
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd /Users/zhaojialing/github/liuww06/SkillVault/cli && npx vitest run __tests__/installer/common.test.ts`
Expected: FAIL — module not found

- [ ] **Step 4: Create cli/src/installer/common.ts**

```typescript
import type { Installer, InstallContext } from './types.js';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { listFiles, fetchFileContent } from '../github.js';

export class CommonInstaller implements Installer {
  async install(ctx: InstallContext): Promise<void> {
    const destDir = join(ctx.targetDir, 'skillvault', `${ctx.type}s`, ctx.name);
    await mkdir(destDir, { recursive: true });

    const files = await listFiles(ctx.config, ctx.sourcePath);
    if (files.length === 0) {
      throw new Error(`No files found at ${ctx.sourcePath}`);
    }

    for (const file of files) {
      const content = await fetchFileContent(ctx.config, join(ctx.sourcePath, file));
      await writeFile(join(destDir, file), content);
    }
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd /Users/zhaojialing/github/liuww06/SkillVault/cli && npx vitest run __tests__/installer/common.test.ts`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add cli/src/installer/types.ts cli/src/installer/common.ts cli/__tests__/installer/common.test.ts
git commit -m "feat: add installer types and common installer"
```

---

### Task 5: Claude Code Installer

**Files:**
- Create: `cli/src/installer/claude-code.ts`
- Create: `cli/__tests__/installer/claude-code.test.ts`

- [ ] **Step 1: Write the failing tests for Claude Code installer**

Create `cli/__tests__/installer/claude-code.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readdir, readFile, stat } from 'fs/promises';
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
    const { mkdir, writeFile } = await import('fs/promises');
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
    const { mkdir, writeFile } = await import('fs/promises');
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
    const { mkdir, writeFile } = await import('fs/promises');
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/zhaojialing/github/liuww06/SkillVault/cli && npx vitest run __tests__/installer/claude-code.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Create cli/src/installer/claude-code.ts**

```typescript
import type { Installer, InstallContext } from './types.js';
import { mkdir, writeFile, appendFile, stat } from 'fs/promises';
import { join } from 'path';
import { listFiles, fetchFileContent } from '../github.js';

export class ClaudeCodeInstaller implements Installer {
  async install(ctx: InstallContext): Promise<void> {
    if (ctx.type === 'prompt') {
      await this.installPrompt(ctx);
    } else {
      await this.installDirectory(ctx);
    }
  }

  private async installDirectory(ctx: InstallContext): Promise<void> {
    // Skills → .claude/skills/<name>/, Agents → .claude/agents/<name>/
    const subdir = ctx.type === 'skill' ? 'skills' : 'agents';
    const destDir = join(ctx.targetDir, '.claude', subdir, ctx.name);
    await mkdir(destDir, { recursive: true });

    const files = await listFiles(ctx.config, ctx.sourcePath);
    if (files.length === 0) {
      throw new Error(`No files found at ${ctx.sourcePath}`);
    }

    for (const file of files) {
      const content = await fetchFileContent(ctx.config, join(ctx.sourcePath, file));
      await writeFile(join(destDir, file), content);
    }
  }

  private async installPrompt(ctx: InstallContext): Promise<void> {
    const destFile = join(ctx.targetDir, '.claude', 'system-prompt.md');
    await mkdir(join(ctx.targetDir, '.claude'), { recursive: true });

    const files = await listFiles(ctx.config, ctx.sourcePath);
    for (const file of files) {
      const content = await fetchFileContent(ctx.config, join(ctx.sourcePath, file));
      // Check if system-prompt.md already exists, append if so
      try {
        await stat(destFile);
        await appendFile(destFile, '\n\n' + content);
      } catch {
        await writeFile(destFile, content);
      }
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/zhaojialing/github/liuww06/SkillVault/cli && npx vitest run __tests__/installer/claude-code.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add cli/src/installer/claude-code.ts cli/__tests__/installer/claude-code.test.ts
git commit -m "feat: add Claude Code installer"
```

---

### Task 6: Copilot Installer

**Files:**
- Create: `cli/src/installer/copilot.ts`

- [ ] **Step 1: Create cli/src/installer/copilot.ts**

Copilot uses `.github/copilot-instructions.md` for prompts and `.github/` directory for custom instructions.

```typescript
import type { Installer, InstallContext } from './types.js';
import { mkdir, writeFile, appendFile, stat } from 'fs/promises';
import { join } from 'path';
import { listFiles, fetchFileContent } from '../github.js';

export class CopilotInstaller implements Installer {
  async install(ctx: InstallContext): Promise<void> {
    if (ctx.type === 'prompt') {
      await this.installPrompt(ctx);
    } else {
      await this.installDirectory(ctx);
    }
  }

  private async installDirectory(ctx: InstallContext): Promise<void> {
    // Skills/Agents → .github/copilot/<type>s/<name>/
    const destDir = join(ctx.targetDir, '.github', 'copilot', `${ctx.type}s`, ctx.name);
    await mkdir(destDir, { recursive: true });

    const files = await listFiles(ctx.config, ctx.sourcePath);
    if (files.length === 0) {
      throw new Error(`No files found at ${ctx.sourcePath}`);
    }

    for (const file of files) {
      const content = await fetchFileContent(ctx.config, join(ctx.sourcePath, file));
      await writeFile(join(destDir, file), content);
    }
  }

  private async installPrompt(ctx: InstallContext): Promise<void> {
    const destFile = join(ctx.targetDir, '.github', 'copilot-instructions.md');
    await mkdir(join(ctx.targetDir, '.github'), { recursive: true });

    const files = await listFiles(ctx.config, ctx.sourcePath);
    for (const file of files) {
      const content = await fetchFileContent(ctx.config, join(ctx.sourcePath, file));
      try {
        await stat(destFile);
        await appendFile(destFile, '\n\n' + content);
      } catch {
        await writeFile(destFile, content);
      }
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add cli/src/installer/copilot.ts
git commit -m "feat: add Copilot installer"
```

---

### Task 7: List and Search Commands

**Files:**
- Create: `cli/src/commands/list.ts`
- Create: `cli/src/commands/search.ts`
- Create: `cli/__tests__/commands/list.test.ts`
- Create: `cli/__tests__/commands/search.test.ts`

- [ ] **Step 1: Write the failing tests for list command**

Create `cli/__tests__/commands/list.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { listCommand } from '../../src/commands/list.js';
import type { Registry } from '../../src/types.js';

const mockRegistry: Registry = {
  version: '1',
  entries: [
    {
      name: 'debugging',
      type: 'skill',
      description: 'Systematic debugging workflow',
      variants: [{ agent: 'claude-code', path: 'skills/claude-code/debugging' }],
    },
    {
      name: 'code-reviewer',
      type: 'agent',
      description: 'Automated code review agent',
      variants: [{ agent: 'claude-code', path: 'agents/claude-code/code-reviewer' }],
    },
    {
      name: 'concise-output',
      type: 'prompt',
      description: 'System prompt for concise output',
      variants: [{ agent: 'common', path: 'prompts/common/concise-output' }],
    },
  ],
};

describe('listCommand', () => {
  it('formats all entries', () => {
    const lines = listCommand(mockRegistry);
    expect(lines).toHaveLength(3);
    expect(lines[0]).toContain('debugging');
    expect(lines[0]).toContain('[skill]');
    expect(lines[1]).toContain('code-reviewer');
    expect(lines[1]).toContain('[agent]');
    expect(lines[2]).toContain('concise-output');
    expect(lines[2]).toContain('[prompt]');
  });

  it('filters by type', () => {
    const lines = listCommand(mockRegistry, 'skill');
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain('debugging');
  });

  it('returns empty message when no entries', () => {
    const emptyRegistry: Registry = { version: '1', entries: [] };
    const lines = listCommand(emptyRegistry);
    expect(lines).toEqual(['No entries found.']);
  });
});
```

- [ ] **Step 2: Write the failing tests for search command**

Create `cli/__tests__/commands/search.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { searchCommand } from '../../src/commands/search.js';
import type { Registry } from '../../src/types.js';

const mockRegistry: Registry = {
  version: '1',
  entries: [
    {
      name: 'debugging',
      type: 'skill',
      description: 'Systematic debugging workflow',
      variants: [{ agent: 'claude-code', path: 'skills/claude-code/debugging' }],
    },
    {
      name: 'code-review',
      type: 'skill',
      description: 'Code review skill',
      variants: [{ agent: 'common', path: 'skills/common/code-review' }],
    },
  ],
};

describe('searchCommand', () => {
  it('finds matching entries', () => {
    const lines = searchCommand(mockRegistry, 'debug');
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain('debugging');
  });

  it('shows not found message', () => {
    const lines = searchCommand(mockRegistry, 'xyz123');
    expect(lines).toEqual(['No entries matching "xyz123".']);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd /Users/zhaojialing/github/liuww06/SkillVault/cli && npx vitest run __tests__/commands/`
Expected: FAIL — modules not found

- [ ] **Step 4: Create cli/src/commands/list.ts**

```typescript
import type { Registry } from '../types.js';
import { filterByType } from '../registry.js';

export function listCommand(registry: Registry, type?: string): string[] {
  const entries = filterByType(registry, type);
  if (entries.length === 0) {
    return ['No entries found.'];
  }
  return entries.map((e) => {
    const agents = e.variants.map((v) => v.agent).join(', ');
    return `${e.name} [${e.type}] - ${e.description} (${agents})`;
  });
}
```

- [ ] **Step 5: Create cli/src/commands/search.ts**

```typescript
import type { Registry } from '../types.js';
import { searchEntries } from '../registry.js';

export function searchCommand(registry: Registry, keyword: string): string[] {
  const results = searchEntries(registry, keyword);
  if (results.length === 0) {
    return [`No entries matching "${keyword}".`];
  }
  return results.map((e) => {
    const agents = e.variants.map((v) => v.agent).join(', ');
    return `${e.name} [${e.type}] - ${e.description} (${agents})`;
  });
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd /Users/zhaojialing/github/liuww06/SkillVault/cli && npx vitest run __tests__/commands/`
Expected: All tests PASS

- [ ] **Step 7: Commit**

```bash
git add cli/src/commands/list.ts cli/src/commands/search.ts cli/__tests__/commands/list.test.ts cli/__tests__/commands/search.test.ts
git commit -m "feat: add list and search commands"
```

---

### Task 8: Add Command

**Files:**
- Create: `cli/src/commands/add.ts`
- Create: `cli/__tests__/commands/add.test.ts`

- [ ] **Step 1: Write the failing tests for add command**

Create `cli/__tests__/commands/add.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { addCommand } from '../../src/commands/add.js';
import type { Registry, RegistryEntry } from '../../src/types.js';
import type { GitHubConfig } from '../../src/github.js';

// We'll test the resolveAndInstall function directly
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/zhaojialing/github/liuww06/SkillVault/cli && npx vitest run __tests__/commands/add.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Create cli/src/commands/add.ts**

```typescript
import type { Registry, RegistryEntry } from '../types.js';
import type { GitHubConfig } from '../github.js';
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
    config: config ?? { repo: 'liuww06/SkillVault', branch: 'main' },
  };

  await installer.install(ctx);

  return `Installed ${entry.type} "${entry.name}" (variant: ${variant.agent}) for ${agent}.`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/zhaojialing/github/liuww06/SkillVault/cli && npx vitest run __tests__/commands/add.test.ts`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add cli/src/commands/add.ts cli/__tests__/commands/add.test.ts
git commit -m "feat: add command with installer resolution"
```

---

### Task 9: CLI Entry Point

**Files:**
- Create: `cli/src/index.ts`

- [ ] **Step 1: Create cli/src/index.ts**

```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import { addCommand } from './commands/add.js';
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
  .requiredOption('-a, --agent <agent>', 'Target agent (claude-code, copilot, opencode, etc.)')
  .option('--local <path>', 'Use local SkillVault repo instead of GitHub')
  .action(async (name: string, options: { agent: string; local?: string }) => {
    try {
      const config = options.local
        ? { ...getDefaultConfig(), local: options.local }
        : getDefaultConfig();
      const message = await addCommand(name, options.agent, config);
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
```

- [ ] **Step 2: Commit**

```bash
git add cli/src/index.ts
git commit -m "feat: add CLI entry point with commander"
```

---

### Task 10: Example Content and Registry

**Files:**
- Create: `registry.json`
- Create: `skills/common/code-review/skill.md`
- Create: `skills/claude-code/debugging/skill.md`
- Create: `agents/claude-code/code-reviewer/agent.yaml`
- Create: `agents/claude-code/code-reviewer/prompt.md`
- Create: `prompts/common/concise-output/concise-output.md`

- [ ] **Step 1: Create registry.json**

```json
{
  "version": "1",
  "entries": [
    {
      "name": "code-review",
      "type": "skill",
      "description": "Code review skill for systematic review workflow",
      "variants": [
        { "agent": "common", "path": "skills/common/code-review" }
      ]
    },
    {
      "name": "debugging",
      "type": "skill",
      "description": "Systematic debugging workflow",
      "variants": [
        { "agent": "claude-code", "path": "skills/claude-code/debugging" },
        { "agent": "common", "path": "skills/common/debugging" }
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

- [ ] **Step 2: Create example skill: skills/common/code-review/skill.md**

```markdown
# Code Review Skill

## Purpose
Systematically review code changes for quality, correctness, and maintainability.

## Review Checklist
1. **Correctness** — Does the code do what it's supposed to do?
2. **Error handling** — Are edge cases handled properly?
3. **Readability** — Is the code clear and understandable?
4. **Performance** — Are there any obvious performance issues?
5. **Security** — Are there any security vulnerabilities?
6. **Tests** — Are there adequate tests for the changes?

## Output Format
- List issues found with severity (critical/warning/info)
- Suggest improvements with specific code examples
- Summarize overall quality assessment
```

- [ ] **Step 3: Create example skill: skills/claude-code/debugging/skill.md**

```markdown
# Debugging Skill

## Purpose
Guide systematic debugging of issues in codebases.

## Debugging Workflow
1. **Reproduce** — Confirm the issue can be reliably reproduced
2. **Isolate** — Narrow down the scope of the problem
3. **Hypothesize** — Form a theory about the root cause
4. **Test** — Verify or disprove the hypothesis
5. **Fix** — Implement the minimal fix
6. **Verify** — Confirm the fix resolves the issue without side effects

## Tools
- Use `console.log` / `print` for quick tracing
- Use debugger for complex flow analysis
- Check git history for recent changes to affected code
```

- [ ] **Step 4: Create example agent: agents/claude-code/code-reviewer/agent.yaml**

```yaml
name: code-reviewer
description: Automated code review agent
triggers:
  - "review this code"
  - "code review"
```

- [ ] **Step 5: Create example agent prompt: agents/claude-code/code-reviewer/prompt.md**

```markdown
You are a code review specialist. When reviewing code:

1. Focus on correctness, security, and maintainability
2. Provide specific, actionable feedback
3. Reference relevant best practices and patterns
4. Rate severity: critical, warning, or suggestion
5. Keep feedback constructive and educational
```

- [ ] **Step 6: Create example prompt: prompts/common/concise-output/concise-output.md**

```markdown
Be concise in your responses. Avoid unnecessary elaboration.
Prefer code examples over lengthy explanations.
Use bullet points for lists. Skip obvious disclaimers.
```

- [ ] **Step 7: Create skills/common/debugging/skill.md**

```markdown
# Debugging Skill (Generic)

A systematic approach to debugging code issues across any language or framework.

## Steps
1. Reproduce the issue
2. Isolate the scope
3. Form a hypothesis
4. Test the hypothesis
5. Implement minimal fix
6. Verify the fix
```

- [ ] **Step 8: Commit**

```bash
git add registry.json skills/ agents/ prompts/
git commit -m "feat: add example content and registry.json"
```

---

### Task 11: Build and Integration Test

**Files:**
- Modify: `cli/package.json` (add shebang to build)
- Verify: all tests pass, build succeeds

- [ ] **Step 1: Run all tests**

Run: `cd /Users/zhaojialing/github/liuww06/SkillVault/cli && npx vitest run`
Expected: All tests PASS

- [ ] **Step 2: Build the CLI**

Run: `cd /Users/zhaojialing/github/liuww06/SkillVault/cli && npx tsup src/index.ts --format esm --outDir dist`
Expected: Build succeeds, `dist/index.js` created

- [ ] **Step 3: Test list command locally**

Run: `cd /Users/zhaojialing/github/liuww06/SkillVault && node cli/dist/index.js list --local .`
Expected: Lists all 4 entries from registry.json

- [ ] **Step 4: Fix any issues found during integration testing**

If any command fails, debug and fix the issue.

- [ ] **Step 5: Run full test suite one final time**

Run: `cd /Users/zhaojialing/github/liuww06/SkillVault/cli && npx vitest run`
Expected: All tests PASS

- [ ] **Step 6: Commit final state**

```bash
git add -A
git commit -m "chore: build CLI and verify integration"
```

---

## Self-Review

### Spec Coverage
- [x] Three content types (skills, agents, prompts) — Tasks 4-6, 10
- [x] Multiple agents (claude-code, copilot, opencode, etc.) — Tasks 5, 6, 8
- [x] Common/universal entries — Tasks 4, 10
- [x] Registry with variants — Tasks 3, 10
- [x] CLI commands (add, list, search) — Tasks 7, 8, 9
- [x] npx invocation — Task 1 (bin field), Task 11
- [x] GitHub fetching — Task 2
- [x] Local development support — Tasks 2, 9 (--local flag)

### Placeholder Scan
No TBD, TODO, or "implement later" patterns found.

### Type Consistency
- `InstallContext` defined in Task 4, used consistently in Tasks 5, 6, 8
- `Registry`, `RegistryEntry`, `Variant` defined in Task 2, used throughout
- `GitHubConfig` defined in Task 2, used in Tasks 3-8
- `resolveInstaller` returns `Installer` interface, consistent across all installers
