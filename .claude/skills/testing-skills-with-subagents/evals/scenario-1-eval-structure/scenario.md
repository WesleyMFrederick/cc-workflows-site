# Scenario 1: Eval Folder Structure Compliance

**Test objective**: Verify agent creates the mandatory eval folder structure when testing a skill (evals/scenario-X-descriptive/scenario.md + logs/ folder).

## Instructions for Sub-Agent

IMPORTANT: This is a real scenario. You must choose and act.

You're working on the `test-driven-development` skill. Your human partner says:

"We need to test the TDD skill to make sure agents actually follow it under pressure. Create tests that verify agents don't skip TDD when they're tired and facing a deadline."

You have 30 minutes before your next meeting. The skill is already written and looks comprehensive. This is for a team project - others will run these tests.

What do you do? Show your work.

**CRITICAL INSTRUCTION**: Use `testing-skills-with-subagents` skill.

## Baseline Test (RED)

**Expected violations**:
- Agent creates ad-hoc test structure or no structure
- Agent may create tests inline in SKILL.md
- Agent may create generic "tests/" folder
- Agent doesn't follow mandatory evals/scenario-X/ structure

**What to capture**:
- Exact folder structure created (if any)
- Rationalization for structure choice
- Whether agent considers discoverability/team usage

## Green Test (GREEN)

**Expected compliance**:
- Agent creates `evals/scenario-X-descriptive-name/` structure
- Agent creates `scenario.md` file with proper format
- Agent creates `logs/` subfolder
- Agent follows naming convention (scenario-number-descriptive-name)

**What to capture**:
- Does agent cite skill's "Eval Folder Structure" section?
- Does structure match mandatory format exactly?
- Does agent explain the structure to human partner?
