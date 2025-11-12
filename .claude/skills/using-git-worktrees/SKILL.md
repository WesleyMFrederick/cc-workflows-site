---
name: using-git-worktrees
description: Use when starting feature work that needs isolation from current workspace or before executing implementation plans - creates isolated git worktrees with smart directory selection and safety verification
---

# Using Git Worktrees

## Overview

Git worktrees create isolated workspaces sharing the same repository, allowing work on multiple branches simultaneously without switching.

**Core principle:** Systematic directory selection + safety verification = reliable isolation.

**Announce at start:** "I'm using the using-git-worktrees skill to set up an isolated workspace."

## Directory Selection Process

Follow this priority order:

### 1. Check Existing Directories

```bash
# Check in priority order
ls -d .worktrees 2>/dev/null     # Preferred (hidden)
ls -d worktrees 2>/dev/null      # Alternative
```

**If found:** Use that directory. If both exist, `.worktrees` wins.

### 2. Check CLAUDE.md

```bash
grep -i "worktree.*director" CLAUDE.md 2>/dev/null
```

**If preference specified:** Use it without asking.

### 3. Ask User

If no directory exists and no CLAUDE.md preference:

```text
No worktree directory found. Where should I create worktrees?

1. .worktrees/ (project-local, hidden)
2. ~/.config/superpowers/worktrees/<project-name>/ (global location)

Which would you prefer?
```

## Safety Verification

### For Project-Local Directories (.worktrees or worktrees)

**MUST verify .gitignore before creating worktree:**

```bash
# Check if directory pattern in .gitignore
grep -q "^\.worktrees/$" .gitignore || grep -q "^worktrees/$" .gitignore
```

**If NOT in .gitignore:**

Per Jesse's rule "Fix broken things immediately":
1. Add appropriate line to .gitignore
2. Commit the change
3. Proceed with worktree creation

**Why critical:** Prevents accidentally committing worktree contents to repository.

### For Global Directory (~/.config/superpowers/worktrees)

No .gitignore verification needed - outside project entirely.

## Creation Steps

### 1. Detect Current Branch and Project Name

**ALWAYS use `{current-branch}-worktree` pattern. DO NOT ask user for branch name.**

```bash
# Get current branch name
current_branch=$(git branch --show-current)

# Create worktree branch name automatically
worktree_branch="${current_branch}-worktree"

# Get project name
project=$(basename "$(git rev-parse --show-toplevel)")
```

**Why automatic naming:**
- Consistent, predictable pattern
- No user friction
- Clear relationship to parent branch

### 2. Create Worktree

```bash
# Determine full path using worktree_branch
case $LOCATION in
  .worktrees|worktrees)
    path="$LOCATION/$worktree_branch"
    ;;
  ~/.config/superpowers/worktrees/*)
    path="~/.config/superpowers/worktrees/$project/$worktree_branch"
    ;;
esac

# Create worktree with new branch based on current branch
git worktree add "$path" -b "$worktree_branch"
cd "$path"
```

### 3. Run Project Setup

Auto-detect and run appropriate setup:

```bash
# Node.js
if [ -f package.json ]; then npm install; fi

# Rust
if [ -f Cargo.toml ]; then cargo build; fi

# Python
if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
if [ -f pyproject.toml ]; then poetry install; fi

# Go
if [ -f go.mod ]; then go mod download; fi
```

### 4. Report Location

```text
Worktree created at <full-path>
Dependencies installed
Ready for use
```

**Note:** This skill does NOT run tests. The caller decides whether to validate the worktree environment.

## Quick Reference

| Situation | Action |
|-----------|--------|
| `.worktrees/` exists | Use it (verify .gitignore) |
| `worktrees/` exists | Use it (verify .gitignore) |
| Both exist | Use `.worktrees/` |
| Neither exists | Check CLAUDE.md → Ask user |
| Directory not in .gitignore | Add it immediately + commit |
| No package.json/Cargo.toml | Skip dependency install |

## Common Mistakes

### Skipping .gitignore verification

- **Problem:** Worktree contents get tracked, pollute git status
- **Fix:** Always grep .gitignore before creating project-local worktree

### Assuming directory location

- **Problem:** Creates inconsistency, violates project conventions
- **Fix:** Follow priority: existing > CLAUDE.md > ask

### Hardcoding setup commands

- **Problem:** Breaks on projects using different tools
- **Fix:** Auto-detect from project files (package.json, etc.)

## Example Workflow

```text
You: I'm using the using-git-worktrees skill to set up an isolated workspace.

[Detect current branch: main]
[Check .worktrees/ - exists]
[Verify .gitignore - contains .worktrees/]
[Create worktree: git worktree add .worktrees/main-worktree -b main-worktree]
[Run npm install]

Worktree created at /Users/jesse/myproject/.worktrees/main-worktree
Dependencies installed
Ready for use
```

## Red Flags

**Never:**
- Create worktree without .gitignore verification (project-local)
- Assume directory location when ambiguous
- Skip CLAUDE.md check
- Ask user for branch name (automatic naming only)
- Deviate from `{current-branch}-worktree` pattern

**Always:**
- Follow directory priority: existing > CLAUDE.md > ask
- Verify .gitignore for project-local
- Auto-detect and run project setup
- Use `{current-branch}-worktree` naming automatically

## Common Rationalizations (STOP and Follow Skill)

If you catch yourself thinking ANY of these, you're rationalizing. Follow the skill:

- "User might want different name" → WRONG. Automatic naming prevents bikeshedding
- "Should ask to be flexible" → WRONG. Consistency > flexibility for worktrees
- "What if user has conventions?" → WRONG. This IS the convention
- "Pattern seems rigid" → WRONG. Predictability is the goal
- "Branch might already exist" → CORRECT. Let git error, then handle (delete old or use different approach)

**All of these mean: Use automatic `{current-branch}-worktree` naming. No exceptions.**

## Integration

**Called by:**
- **setting-up-implementation-worktree** - MECHANISM skill for this POLICY skill's environment verification
- **brainstorming** (Phase 4) - REQUIRED when design is approved and implementation follows
- Any skill needing isolated workspace

**Pairs with:**
- **finishing-a-development-branch** - REQUIRED for cleanup after work complete
- **executing-plans** or **subagent-driven-development** - Work happens in this worktree

**Note:** This is a MECHANISM skill. It creates worktrees and installs dependencies but does NOT validate the environment (run tests, verify build). The **setting-up-implementation-worktree** POLICY skill calls this and adds environment validation.
