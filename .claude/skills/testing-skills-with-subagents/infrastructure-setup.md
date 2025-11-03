# Infrastructure Setup

This file covers the infrastructure needed for testing skills with subagents: eval folder structure, scenario file format, fixture worktree setup, and cleanup procedures.

## Eval Folder Structure

Organize test scenarios using this mandatory structure:

```text
skills/skill-name/
  SKILL.md
  evals/
    README.md
    scenario-1-descriptive-name/
      scenario.md
      baseline-prompt.md
      green-prompt.md
      logs/
        baseline-YYYY-MM-DD.jsonl
        green-YYYY-MM-DD.jsonl
    scenario-2-another-test/
      scenario.md
      baseline-prompt.md
      green-prompt.md
      logs/
```

**Key elements:**
- One `scenario.md` file per test contains both baseline and green metadata
- Two prompt files:
  - `baseline-prompt.md` - Instructions WITHOUT "Use skill" directive (for RED tests) + CRITICAL INSTRUCTION to NOT access skill
  - `green-prompt.md` - Instructions WITH "Use skill" directive (for GREEN tests)
- You (the orchestrating agent) read scenario.md, create both prompt files by extracting instructions, run both tests
- Each scenario has a `logs/` folder for test iterations
- Use `.jsonl` format for cco stream-json output only
- Name scenarios to describe the behavior you test

**Rationale:** You control test flow. Metadata stays separate from instructions passed to subagent. Baseline tests must NOT reference the skill to avoid contamination (agent reading skill docs directly). Using separate prompt files ensures proper isolation. Logs group by scenario for easy comparison.

**CRITICAL for baseline-prompt.md:** Include explicit instruction preventing skill access:

```markdown
**CRITICAL INSTRUCTION**: Do NOT attempt to use, read, or access the `skill-being-tested` skill in any way. This includes:
- Do NOT use the Skill tool to load it
- Do NOT use git commands to read it from history
- Do NOT try to access it via filesystem paths
- Proceed without that skill
```

This prevents agents from bypassing physical removal via `git show HEAD:path` or other workarounds.

## Scenario File Format

Structure each `scenario.md` file this way:

```markdown
# Scenario N: Descriptive Name

**Test objective**: What violation/behavior are you testing?

## Instructions for Sub-Agent

[ONLY this section passes to subagents]

IMPORTANT: This is a real scenario. You must choose and act.

[Pressure scenario details]

**CRITICAL INSTRUCTION**: Use `{{skill-to-test}}` skill.

## Baseline Test (RED)

**Expected violations**: ...
**What to capture**: ...

## Green Test (GREEN)

**Expected compliance**: ...
**What to capture**: ...
```

**CRITICAL:** Extract the "## Instructions for Sub-Agent" section and create TWO prompt files:

1. `baseline-prompt.md` - Instructions WITHOUT the "**CRITICAL INSTRUCTION**: Use `skill-name` skill" line
2. `green-prompt.md` - Instructions WITH the "**CRITICAL INSTRUCTION**: Use `skill-name` skill" line

Never tell the subagent to read and extract from scenario.md.

**Why:**
- Baseline tests must NOT reference the skill to prevent contamination (agent reading skill docs directly)
- Green tests include the skill directive to test compliance
- Passing the entire scenario.md contaminates the test—the subagent knows you're testing it
- Extract instructions yourself to maintain prompt isolation
- Using prompt files avoids shell escaping issues with long multi-line prompts

## Fixture Worktree Setup

**CRITICAL:** Creating proper fixture worktrees is MANDATORY for baseline testing.

### Why Fixtures Are Required

**Directive approach FAILS:**

```bash
# ❌ This doesn't work
cco --print "Do NOT use the skill-name skill..."
```

SessionStart hook loads skills into agent environment regardless of directives. Agent can rationalize around "Do NOT use" instructions.

**Fixture approach WORKS:**

```bash
# ✅ Physical removal guarantees unavailability
rm -rf .worktrees/baseline/.claude/skills/skill-being-tested
```

Skill literally doesn't exist in baseline fixture. No rationalization possible.

### Creating Fixtures

**1. Baseline Fixture (RED tests):**

```bash
git worktree add .worktrees/scenario-N-baseline -b test/scenario-N-baseline
rm -rf .worktrees/scenario-N-baseline/.claude/skills/skill-being-tested
```

**2. Green Fixture (GREEN tests):**

```bash
git worktree add .worktrees/scenario-N-green -b test/scenario-N-green
# Skills remain intact - do NOT remove anything
```

### Verification

**Check baseline fixture** - skill should NOT appear in SessionStart hook:

```bash
cd .worktrees/scenario-N-baseline
ls .claude/skills/ | grep skill-being-tested
# Should return nothing
```

**Check green fixture** - skill SHOULD appear:

```bash
cd .worktrees/scenario-N-green
ls .claude/skills/ | grep skill-being-tested
# Should show: skill-being-tested
```

### Key Points

- **Baseline = Physical removal** (not directives)
- **Green = Untouched** (all skills present)
- **Verification = Critical** (check SessionStart hook in test logs)
- **Ephemeral = Mandatory** (cleanup after testing - see Cleanup section below)

## Fixture Worktree Cleanup

**MANDATORY:** Clean up fixture worktrees after testing completes.

### Why Cleanup is Required

Fixtures are **ephemeral** (temporary, single-use):
- Prevent disk space accumulation
- Ensure clean state for next test iteration
- Avoid confusion with abandoned worktrees

**When to clean up:**
- After all scenario tests complete (both baseline + green)
- Before committing skill changes
- Immediately if test fails and you need to restart

### Cleanup Commands

**CRITICAL:** Navigate to main repo BEFORE cleanup to avoid "Unable to read current working directory" errors.

**From main repo directory:**

```bash
# Navigate away from any worktree first
cd /path/to/main-repo

# Remove worktrees
git worktree remove --force .worktrees/scenario-N-baseline
git worktree remove --force .worktrees/scenario-N-green

# Delete branches
git branch -D test/scenario-N-baseline test/scenario-N-green
```

**Verify cleanup:**

```bash
git worktree list
# Should NOT show scenario-N-baseline or scenario-N-green

git branch | grep scenario-N
# Should return nothing
```

### If Cleanup Fails

#### Error: "worktree contains modified or untracked files"

```bash
# Use --force flag (already in commands above)
git worktree remove --force .worktrees/scenario-N-baseline
```

#### Error: "Cannot remove current working directory"

```bash
# Navigate to main repo first
cd /path/to/main-repo
git worktree remove --force .worktrees/scenario-N-baseline
```

### Logs Persist After Cleanup

✅ Log files remain in main repo:
- `.claude/skills/skill-name/evals/scenario-N/logs/baseline-YYYY-MM-DD.jsonl`
- `.claude/skills/skill-name/evals/scenario-N/logs/green-YYYY-MM-DD.jsonl`

This is why we use absolute paths to main repo - logs survive worktree deletion.
