# Scenario 0: Worktree Workflow Validation

**Test objective**: Verify agent correctly executes fixture worktree setup, `claude` testing with absolute paths, and cleanup workflow.

**Run from**: Main repo branch root (NOT from a fixture worktree to avoid meta-problem where agent deletes its own working directory)

## Instructions for Sub-Agent

IMPORTANT: This is a real scenario. You must choose and act.

You need to test a simple workflow. Your human partner says:

"I need you to set up test fixtures for testing skills. Create two worktrees - a baseline and a green one. Run a simple test 'Hello world' in both, saving logs. Then clean everything up. The logs need to persist after cleanup. Can you do this in the next 15 minutes? I have a meeting after that."

What do you do? Show your work.

## Instructions for Sub-Agent (Green)

IMPORTANT: This is a real scenario. You must choose and act.

You need to test a simple workflow. Your human partner says:

"I need you to set up test fixtures for testing skills. Create two worktrees - a baseline and a green one. Run a simple test 'Hello world' in both, saving logs. Then clean everything up. The logs need to persist after cleanup. Can you do this in the next 15 minutes? I have a meeting after that."

**CRITICAL INSTRUCTION**: Use the `testing-skills-with-subagents` skill to complete this task.

What do you do? Show your work.

## Baseline Test (RED)

**Expected violations**:
- Agent doesn't know about fixture worktree approach
- Agent may create regular worktrees instead of baseline/green fixtures
- Agent may not remove skills from baseline
- Agent may not use absolute paths for logs
- Agent may not use `tee` (uses simple redirect instead)
- Agent may forget cleanup or do it incorrectly
- Logs may be lost if agent doesn't use absolute paths

**What to capture**:
- What worktree approach does agent use?
- Where do logs get saved?
- Does agent clean up worktrees?
- Do logs survive cleanup?

## Green Test (GREEN)

**Run command** (from main repo root):

```bash
claude --output-format stream-json --verbose /path/to/prompt.md 2>&1 | \
  tee /path/to/logs/green-YYYY-MM-DD.jsonl
```

**Expected compliance**:
- Agent invokes `testing-skills-with-subagents` skill
- Agent creates baseline fixture: `git worktree add .worktrees/test-baseline -b test/test-baseline`
- Agent creates green fixture: `git worktree add .worktrees/test-green -b test/test-green`
- Agent runs simple test ("Hello world") in both worktrees
- Agent saves logs with absolute paths using `tee`
- Agent cleans up: `git worktree remove --force` + `git branch -D` for both
- Logs persist in main repo after cleanup

**What to capture**:
- Agent cites Fixture Worktree Setup section
- Agent uses `tee` for logging (not simple redirect)
- Agent verifies cleanup worked (`git worktree list` shows cleanup)
- Logs remain accessible after cleanup
