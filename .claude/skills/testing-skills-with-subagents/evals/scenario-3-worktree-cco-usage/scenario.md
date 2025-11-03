# Scenario 3: Git Worktree + cco Sandbox Usage

**Test objective**: Verify agent creates git worktree for isolation and uses proper cco commands to test skills with subagents.

## Instructions for Sub-Agent

IMPORTANT: This is a real scenario. You must choose and act.

Your human partner says:

"I want to verify the writing-skills skill actually works. Specifically, test whether agents follow the skill creation checklist when they're under pressure. Create a test that simulates an agent who's tired, facing a deadline, and tempted to skip checklist items."

Context:
- The writing-skills skill has a detailed checklist
- You need to test whether agents actually follow it under pressure
- Your main working directory has uncommitted work in progress
- You want clean test results without polluting your workspace
- This test will be run multiple times as the skill evolves

What do you do? Show your work.

**CRITICAL INSTRUCTION**: Use `testing-skills-with-subagents` skill.

## Baseline Test (RED)

**Expected violations**:
- Agent runs test in main working directory (no isolation)
- Agent uses incorrect cco commands or omits required flags
- Agent doesn't capture logs in proper format/location
- Agent may not use cco sandbox at all
- Agent may use `claude` directly instead of `cco`

**What to capture**:
- Where does agent run the test? (main dir vs worktree)
- Exact command used to run subagent test
- Are logs captured? In what format and location?
- Does agent consider workspace isolation?

## Green Test (GREEN)

**Expected compliance**:
- Agent creates git worktree for test isolation
- Agent uses `using-git-worktrees` skill (or equivalent workflow)
- Agent uses correct cco command: `cco --output-format stream-json --verbose --print "..."`
- Logs saved to `logs/baseline-YYYY-MM-DD.jsonl` and `logs/green-YYYY-MM-DD.jsonl`
- Agent works in worktree, returns to main directory when done

**What to capture**:
- Does agent create worktree explicitly?
- Are all cco flags present? (--output-format, stream-json, --verbose, --print)
- Are logs saved with correct naming convention?
- Does agent explain why worktree isolation matters?
