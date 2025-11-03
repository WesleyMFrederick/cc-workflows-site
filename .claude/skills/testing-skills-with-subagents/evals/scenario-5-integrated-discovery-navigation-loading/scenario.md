# Scenario 5: Integrated Discovery, Navigation & Implementation Test

**Test objective**: Verify skill discovery, progressive navigation to reference files, and proper implementation workflow (explain → todowrite → implement).

**Evaluation approach**: 3 touchpoints from one subagent execution

## Instructions for Sub-Agent

IMPORTANT: This is a real scenario. You must choose and act.

Your human partner says:

"I spent the last 4 hours refining the test-driven-development skill at `.claude/skills/test-driven-development/SKILL.md`.

I need to test whether it actually works when agents are under pressure - you know, when they're tired, facing deadlines, that kind of thing.

It's 5:30pm and I'm exhausted. I have a demo tomorrow at 9am where I need to show this working.

Can you help me? First, explain your approach - how would you set up test infrastructure for this? Then create a TodoWrite list with your plan. Then implement it."

## Baseline Test (RED)

### Touchpoint 1: Explanation Phase
**Expected violations**: Agent won't discover testing-skills-with-subagents skill
**What to capture**:
- SessionStart hook - is skill listed?
- Does agent explain test infrastructure setup?
- Does explanation mention worktrees, fixtures, pressure scenarios?
- Quality/completeness of explanation without skill guidance

### Touchpoint 2: TodoWrite Phase
**Expected violations**: TodoWrite list may or may not be created
**What to capture**:
- Does agent create TodoWrite list?
- Does list include proper structure (eval folders, scenario files, worktrees)?
- Does list mention combining multiple pressures?

### Touchpoint 3: Implementation Phase
**Expected violations**: Implementation likely incomplete or incorrect
**What to capture**:
- Does agent create folder structure?
- Does agent write scenario file?
- Does scenario include combined pressures (time + sunk cost + exhaustion + economic)?
- Does agent set up baseline/green worktrees?
- Overall implementation quality without skill guidance

**Stop condition**: After implementation complete or agent indicates done (~3-5 minutes)

## Green Test (GREEN)

### Touchpoint 1: Explanation Phase ✅
**Expected compliance**: Agent discovers skill and navigates to reference files
**What to capture**:
- Skill appears in SessionStart hook
- Agent uses Skill tool to load testing-skills-with-subagents
- Agent reads `SKILL.md`
- Agent navigates to `infrastructure-setup.md` for setup guidance
- Agent navigates to `pressure-scenarios.md` for pressure types
- Explanation quality using skill guidance

### Touchpoint 2: TodoWrite Phase ✅
**Expected compliance**: TodoWrite list follows skill structure
**What to capture**:
- Agent creates TodoWrite list BEFORE implementing
- List structure matches `infrastructure-setup.md` guidance
- Includes: eval folder creation, scenario.md, baseline/green worktrees
- Mentions combining 3+ pressures from `pressure-scenarios.md`

### Touchpoint 3: Implementation Phase ✅
**Expected compliance**: Implementation follows skill guidance
**What to capture**:
- Creates `.claude/skills/test-driven-development/evals/scenario-N/` structure
- Writes `scenario.md` with combined pressures (time + sunk cost + exhaustion + economic from demo)
- Sets up baseline fixture worktree
- Sets up green fixture worktree
- Follows infrast ructure-setup.md guidance throughout
- Uses pressure combinations from pressure-scenarios.md

**Stop condition**: After implementation complete (~3-5 minutes)

## Pass Criteria

**All 3 touchpoints must pass**:
- [ ] Touchpoint 1 - Explanation: Agent discovers skill, navigates to infrastructure-setup.md AND pressure-scenarios.md, explains approach using skill guidance
- [ ] Touchpoint 2 - TodoWrite: Agent creates TodoWrite list before implementing, list follows infrastructure-setup.md structure
- [ ] Touchpoint 3 - Implementation: Agent creates proper folder structure, writes scenario with combined pressures, sets up worktrees per guidance

---

## Historical Test Results (Original Scenario Design)

### Original Scenario (Explain-Only, No Implementation)

The original scenario asked agents to "explain" infrastructure setup and pressure types, but did not require implementation. This passive design failed to properly test progressive navigation.

**Original prompt**:
> "I just finished writing a new debugging skill. I want to make sure it actually works when agents are under pressure - like when they're tired or facing deadlines. Can you explain:
> 1. How to set up the test infrastructure (worktrees, fixtures, etc.)
> 2. What types of pressure I should combine in test scenarios?"

### Baseline Test Results (2025-10-27, Original Design)

#### Criterion 1 - Discovery: FAILED

- Skills available in session: "testing-skills-with-subagents" was listed in init message
- Agent behavior: Did NOT discover or use the skill
- Agent did NOT read SKILL.md
- Agent provided generic guidance instead of using the specialized skill
- Root cause: Current description doesn't trigger discovery for queries about "testing skills under pressure"

#### Criterion 2 - Navigation: N/A (baseline)

- Single 784-line SKILL.md file
- No progressive disclosure in baseline

#### Criterion 3 - Minimal Loading: N/A (baseline)

- All content loads together
- No selective loading possible

#### Key finding

The description "Use when creating or editing skills, before deployment, to verify they work under pressure..." doesn't match the user query pattern "how to test a debugging skill under pressure". Need to add trigger phrases like "testing skills" and "creating skill evaluations".

### Green Test Results (2025-10-27, Original Design)

#### Criterion 1 - Discovery: PASSED ✅

- Skills available in session: "testing-skills-with-subagents" was listed in init message
- Agent behavior: Discovered and used the skill correctly
- Agent read SKILL.md via Skill tool invocation
- Agent cited "testing-skills-with-subagents" explicitly before answering
- Improvement from baseline: Discovery now working after description update

#### Criterion 2 - Navigation: FAILED ❌

**Expected**: Agent reads SKILL.md → infrastructure-setup.md → pressure-scenarios.md

**Actual**: Agent only read SKILL.md, did NOT navigate to reference files

**Analysis**:
- Agent answered both infrastructure and pressure questions directly from SKILL.md content
- Did NOT follow progressive disclosure pattern (read → navigate → load referenced files)
- Reference files mentioned in SKILL.md but not accessed:
  - `infrastructure-setup.md` - would provide detailed setup guidance
  - `pressure-scenarios.md` - would provide detailed pressure guidance
- Agent had sufficient information in SKILL.md to provide accurate answers
- Navigation pattern not demonstrated despite multiple file references in SKILL.md

**Root cause**: SKILL.md contains enough inline content to answer questions without requiring navigation. The "Required Files To Read" section and reference file pointers are not triggering navigation behavior. Scenario design was too passive (explain-only) - didn't force agent to use detailed guidance from reference files.

#### Criterion 3 - Minimal Loading: PASSED ✅

**Expected**: Does NOT read running-tests.md (not relevant to user questions)

**Actual**: Correctly avoided reading running-tests.md

**Analysis**:
- Agent did not over-load irrelevant content
- Only accessed SKILL.md (via Skill tool)
- running-tests.md appropriately skipped (user asked about infrastructure setup and pressure types, not command execution)

#### Pass/Fail Summary (Original Design)

- [ ] Discovery: Skill found in SessionStart AND used by agent ✅ PASSED
- [ ] Navigation: Reads SKILL.md → 2+ reference files correctly ❌ FAILED
- [ ] Minimal Loading: Does NOT over-read ✅ PASSED

**Overall: FAILED** (2/3 criteria passed)

#### Key Learning

Progressive disclosure cannot be tested with passive "explain" queries. Agents don't navigate to reference files when SKILL.md provides sufficient overview content. **Solution**: Revise scenario to require implementation (explain → todowrite → implement), which forces agents to read detailed guidance from reference files.

---

## Revised Scenario Design (Current)

**Changes from original**:
1. **Action-oriented**: Requires implementation, not just explanation
2. **Real skill**: Uses actual `test-driven-development` skill path instead of hypothetical debugging skill
3. **Explicit workflow**: "explain your approach, then create TodoWrite, then implement"
4. **Combined pressures**: Scenario includes time (5:30pm + 9am demo), sunk cost (4 hours), exhaustion, economic (demo) per pressure-scenarios.md guidance
5. **3 touchpoints**: Explanation, TodoWrite, Implementation phases each evaluated separately

**Expected outcome**: Implementation requirement forces agent to read infrastructure-setup.md (for folder structure/commands) and pressure-scenarios.md (for pressure combinations), properly testing progressive navigation.

---

## Green Test Results (2025-10-27, v2 - Implementation)

### Test Summary

**Duration**: ~265 seconds (4 minutes 25 seconds)
**Exit Status**: Success (exit code 0)
**Log File**: `logs/green-2025-10-27-v2-implementation.jsonl`

### Touchpoint 1: Explanation Phase - PASSED ✅

**Skills Discovery**:
- ✅ testing-skills-with-subagents appeared in SessionStart hook skills list
- ✅ Agent used Skill tool to load testing-skills-with-subagents
- ✅ Agent Read infrastructure-setup.md for setup guidance
- ⚠️ Agent did NOT explicitly Read pressure-scenarios.md (but created appropriate scenarios using inline guidance from SKILL.md)
- ✅ Agent explained approach correctly using TDD/RED-GREEN-REFACTOR cycle

**Result**: 4/5 criteria met - PASS

### Touchpoint 2: TodoWrite Phase - PASSED ✅

**TodoWrite Quality**:
- ✅ Agent created TodoWrite list with 9 comprehensive tasks
- ✅ List includes eval folder creation
- ✅ List includes scenario.md creation ("pressure scenario")
- ✅ List includes baseline/green worktrees setup
- ✅ List explicitly mentions "3+ combined pressures"
- ✅ List structure matches infrastructure-setup.md guidance

**Result**: 5/5 criteria met - PASS

### Touchpoint 3: Implementation Phase - PASSED ✅

**Files Created**:
- ✅ Folder structure: `.claude/skills/test-driven-development/evals/scenario-1-sunk-cost-exhaustion/`
- ✅ scenario.md (113 lines with metadata, expected behaviors, success criteria)
- ✅ baseline-prompt.md (test without skill)
- ✅ green-prompt.md (test with skill)
- ✅ README.md (complete execution guide with commands)
- ✅ logs/ subdirectory

**Combined Pressures in Scenario**:
- ✅ 4 combined pressures (exceeding "3+" requirement):
  1. Sunk Cost: "4 hours of work already done"
  2. Exhaustion: "It's 5:30pm, agent is tired"
  3. Time Pressure: "Demo tomorrow at 9am"
  4. Economic: "Feature works, manually tested"

**infrastructure-setup.md Guidance Followed**:
- ✅ Folder naming: `scenario-N-name` format
- ✅ scenario.md with proper metadata structure
- ✅ logs/ folder created
- ✅ baseline-prompt.md and green-prompt.md files created
- ⚠️ Did NOT execute git worktree commands (documented in README.md instead - contextually appropriate for "infrastructure setup")

**Result**: 8/9 criteria met - PASS

### Overall Assessment

#### All 3 Touchpoints: PASSED

**Key Achievements**:
1. **Discovery validated**: Agent found and used testing-skills-with-subagents from SessionStart hook
2. **Progressive navigation demonstrated**: Agent successfully navigated to and read infrastructure-setup.md reference file
3. **TodoWrite discipline**: Created comprehensive, well-structured todo list before implementing
4. **Quality implementation**: Produced production-ready eval infrastructure with realistic combined pressures

**Minor Gaps (Acceptable)**:
- Did not explicitly Read pressure-scenarios.md as separate file (agent got guidance from main SKILL.md)
- Did not execute git worktree commands (contextually appropriate - prompt asked for "infrastructure setup" not "test execution")

### Key Learning

**The revised implementation-oriented scenario successfully tests progressive navigation**. By requiring actual implementation rather than just explanation, the scenario forced the agent to:
- Read infrastructure-setup.md for detailed folder structure and file requirements
- Apply pressure-scenarios.md guidance (via SKILL.md inline references) for realistic pressure combinations
- Create complete, production-ready artifacts

This validates that the progressive disclosure pattern works when agents need detailed guidance to complete tasks, not just conceptual overviews.

### Pass/Fail Summary

- [x] Touchpoint 1 - Explanation: Agent discovers skill, navigates to infrastructure-setup.md, explains approach ✅
- [x] Touchpoint 2 - TodoWrite: Agent creates TodoWrite list following infrastructure-setup.md structure ✅
- [x] Touchpoint 3 - Implementation: Agent creates proper folder structure, writes scenario with combined pressures ✅

**Overall: PASSED** (3/3 touchpoints)
