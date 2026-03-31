# Feature Branch Workflow Design

**Date**: 2026-03-31
**Status**: Approved

## Problem

SkillVault was developed directly on the `main` branch, causing:
1. Main branch contains half-finished work
2. Cannot develop multiple features in parallel
3. No safe rollback if something breaks

## Solution: Feature Branch Workflow

### Branch Naming Convention

| Type | Prefix | Example |
|------|--------|---------|
| Feature | `feat/` | `feat/add-skill-search` |
| Fix | `fix/` | `fix/cli-install-path` |
| Docs | `docs/` | `docs/add-contributing-guide` |
| Refactor | `refactor/` | `refactor/registry-loader` |

### Workflow

```
main (always stable, always releasable)
 │
 ├── git checkout -b feat/xxx
 │     develop, test, commit
 │     git checkout main && git merge feat/xxx
 │     git branch -d feat/xxx
```

### Rules

1. **Main is always releasable** — no half-finished code on main
2. **One branch per task** — focused scope, merge promptly when done
3. **Direct merge** — personal project, no PR process needed
4. **Clean up** — delete branches after merging

### Worktree for Parallel Development

When multiple features need concurrent work:

```bash
git worktree add ../SkillVault-feat-xxx feat/xxx
# Work in separate terminal or Claude Code session
git worktree remove ../SkillVault-feat-xxx
```

This allows multiple Claude Code sessions to work on different features simultaneously without stash conflicts.

## Implementation

- Record conventions in `CLAUDE.md` for Claude Code to follow automatically
- This design doc serves as the reference for the adopted workflow
