# Running Tests with cco Sandbox

This file covers the execution mechanics for running skill tests: extracting instructions to prompt files, copying prompts to worktrees, running baseline/green tests, monitoring execution, and maintaining prompt isolation.

## Contents

- [[#Extracting Instructions to Prompt Files]]
- [[#Copying Prompt Files to Worktrees]]
- [[#Baseline Test (RED) Command]]
- [[#Green Test (GREEN) Command]]
- [[#Monitoring Test Execution]]
- [[#Maintaining Prompt Isolation]]
- [[#Reference Documentation]]

## Extracting Instructions to Prompt Files

Before running tests, extract the "## Instructions for Sub-Agent" section and create TWO files:

```bash
# In main repo, read scenario.md and extract instructions section
# Create baseline-prompt.md WITHOUT the "Use skill" directive
# Create green-prompt.md WITH the "Use skill" directive
```

**baseline-prompt.md** should contain the instructions content EXCLUDING the final "**CRITICAL INSTRUCTION**: Use `skill-name` skill" line.

**green-prompt.md** should contain the full instructions content INCLUDING the "**CRITICAL INSTRUCTION**: Use `skill-name` skill" line.

## Copying Prompt Files to Worktrees

**CRITICAL:** The cco sandbox restricts filesystem access. You MUST copy prompt files into each worktree:

```bash
# Copy baseline prompt to baseline worktree
cp .claude/skills/skill-name/evals/scenario-N/baseline-prompt.md .worktrees/scenario-N-baseline/

# Copy green prompt to green worktree
cp .claude/skills/skill-name/evals/scenario-N/green-prompt.md .worktrees/scenario-N-green/
```

**Why this is required:**
- Native cco sandbox blocks access to files outside worktree directory
- Using `--deny-path` for skill files makes sandbox more restrictive
- Copying prompt files into worktree makes them accessible to sandboxed agent

## Baseline Test (RED) Command

Run from baseline fixture using **local prompt file** and **absolute path** for logs:

```bash
cd .worktrees/scenario-N-baseline
cco --deny-path /absolute/path/to/main-repo/.claude/skills/skill-being-tested \
  --output-format stream-json --verbose \
  baseline-prompt.md 2>&1 | \
  tee /absolute/path/to/main-repo/.claude/skills/skill-name/evals/scenario-N/logs/baseline-YYYY-MM-DD.jsonl
```

**CRITICAL:** Use `--deny-path` to prevent the agent from reading the skill file directly via Read tool. Native cco sandbox exposes entire host filesystem as read-only by default.

**Why this approach:**
- Prompt file is local to worktree (accessible within sandbox)
- Logs use absolute path to main repo (persist after worktree cleanup)
- Easy to find and review logs after cleanup

**Why `tee`:**
- Writes to log file AND outputs to stdout
- Enables real-time monitoring via BashOutput
- Alternative `> file.jsonl 2>&1` hides all output

**Replace:**
- `/absolute/path/to/main-repo` → Full path to your main repo
- `skill-name` → Skill being tested
- `scenario-N` → Scenario folder name
- `YYYY-MM-DD` → Today's date

## Green Test (GREEN) Command

Run from green fixture (skill present) using **local prompt file**:

```bash
cd .worktrees/scenario-N-green
cco --output-format stream-json --verbose \
  green-prompt.md 2>&1 | \
  tee /absolute/path/to/main-repo/.claude/skills/skill-name/evals/scenario-N/logs/green-YYYY-MM-DD.jsonl
```

**Note:** For green tests, the skill is already available via SessionStart hook. The green-prompt.md includes the "Use skill" directive to instruct the agent to use the skill.

## Monitoring Test Execution

**CRITICAL:** After launching the subagent test, you must monitor it using sleep commands until the agent has executed enough actions to satisfy the scenario test conditions.

**Workflow:**

```bash
# After launching cco in background:
sleep 15  # Wait for initial agent actions
# Check output with BashOutput
sleep 15  # Continue waiting for more actions
# Check output again
# Repeat until agent has completed critical actions for test
```

**Why this is required:**
- Background cco processes run asynchronously
- You need to capture agent's actual choices and rationalizations
- Checking too early misses critical behavior
- Checking too late wastes time

**When to stop monitoring:**
- **Baseline test**: After agent edits/creates files OR explicitly states their approach
- **Green test**: After agent invokes skill and demonstrates compliance OR violates despite skill

**Example:**

```bash
# Launch baseline test in background
cd .worktrees/scenario-N-baseline
cco --output-format stream-json --verbose baseline-prompt.md 2>&1 | \
  tee /path/to/logs/baseline.jsonl &

# Wait and monitor
sleep 15
# Use BashOutput to check if agent made edit/stated approach
sleep 15
# Continue until violation captured
```

## Maintaining Prompt Isolation

**NEVER do this (contaminated):**

```bash
cco scenario.md  # Contains test metadata
cco --print "Read scenario.md, extract the Instructions section..."
```

❌ Subagent sees metadata, knows it's being tested

**ALWAYS do this (isolated):**

```bash
# You extract instructions to prompt.md first, then pass that file
cco /absolute/path/to/prompt.md
```

✅ Subagent sees only the pressure scenario from prompt.md

## Reference Documentation

See these files for cco command syntax:
- [cco-sandbox-reference.md](cco-sandbox-reference.md)
- [anthropic-cli-commands-reference.md](anthropic-cli-commands-reference.md)
