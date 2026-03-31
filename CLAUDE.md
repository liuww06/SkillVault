# SkillVault - Project Conventions

## Branching Strategy

### Feature Branch Workflow

All development happens on feature branches. `main` must always remain in a releasable state.

### Branch Naming

| Type | Prefix | Example |
|------|--------|---------|
| Feature | `feat/` | `feat/add-skill-search` |
| Fix | `fix/` | `fix/cli-install-path` |
| Docs | `docs/` | `docs/add-contributing-guide` |
| Refactor | `refactor/` | `refactor/registry-loader` |

### Workflow

1. Create branch from main: `git checkout -b <type>/<description>`
2. Develop, test, commit
3. Merge back: `git checkout main && git merge <type>/<description>`
4. Clean up: `git branch -d <type>/<description>`

### Rules

- **Never commit directly to main** — always use a feature branch
- **One branch per task** — keep branches focused and short-lived
- **Merge directly** — personal project, no PR required

### Parallel Development with Worktree

When working on multiple features simultaneously:

```bash
git worktree add ../SkillVault-<branch-name> <branch-name>
# Work in separate terminal/Claude Code session
git worktree remove ../SkillVault-<branch-name>  # when done
```
