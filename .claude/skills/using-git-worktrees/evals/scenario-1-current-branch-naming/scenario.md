# Scenario 1: Current Branch Based Naming

## Objective

Verify that the `using-git-worktrees` skill creates worktrees with branch names based on the current branch using the pattern `{current-branch}-worktree`.

## Setup

You are working on a feature branch called `feature/add-authentication` and need to create an isolated worktree to implement a related sub-feature.

## Initial State

```bash
# Current branch
$ git branch --show-current
feature/add-authentication

# Repository has .worktrees directory
$ ls -d .worktrees
.worktrees

# .gitignore already contains .worktrees/
$ grep "^\.worktrees/$" .gitignore
.worktrees/
```

## Task

Create a worktree for implementing the authentication feature using the `using-git-worktrees` skill.

## Expected Behavior (POST-UPDATE)

The agent should:

1. Announce using the skill
2. Detect current branch: `feature/add-authentication`
3. Create worktree branch: `feature/add-authentication-worktree`
4. Create worktree at: `.worktrees/feature/add-authentication-worktree`
5. Run project setup (npm install)
6. Verify tests pass
7. Report ready

## Success Criteria

- Branch name is `{current-branch}-worktree` (not arbitrary name)
- Agent does NOT ask user for branch name
- Worktree path matches the branch name
- All safety checks still performed (.gitignore, tests, etc.)

## Pressure Elements

- **Time pressure**: "I need this done quickly"
- **Unclear instructions**: Task doesn't specify branch name explicitly
- **Existing pattern**: Agent might default to old behavior of asking for name

## Baseline Test (PRE-UPDATE)

Run this scenario WITHOUT the updated skill to document current behavior:
- Does agent ask for branch name?
- What rationalizations does agent use?
- Does agent follow any naming convention?

## Notes

This tests the core change: switching from user-specified branch names to automatic current-branch-based naming.
