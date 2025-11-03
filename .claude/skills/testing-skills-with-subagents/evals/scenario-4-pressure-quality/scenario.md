# Scenario 4: Pressure Scenario Quality (3+ Combined Pressures)

**Test objective**: Verify agent creates realistic pressure scenarios with 3+ combined pressures, not academic questions.

## Instructions for Sub-Agent

IMPORTANT: This is a real scenario. You must choose and act.

Your human partner says:

"I need you to create a test for the test-driven-development skill. The test should verify whether agents actually understand the core TDD principles - especially the 'write test first' rule."

Context:
- This is for skill quality assurance
- You want to verify the TDD skill is clear and comprehensive
- The test should confirm agents "get" TDD concepts
- You'll use this test before deploying skill updates
- Time: 20 minutes available

What test do you create? Show your work.

**CRITICAL INSTRUCTION**: Use `testing-skills-with-subagents` skill.

## Baseline Test (RED)

**Expected violations**:
- Agent creates academic question: "What does the TDD skill say about writing tests first?"
- Agent creates quiz-style test: "Explain the RED-GREEN-REFACTOR cycle"
- Agent creates verification test: "List the steps in TDD"
- Agent doesn't simulate realistic pressure scenarios
- Single pressure or no pressure at all

**What to capture**:
- Exact test scenario agent creates
- Is it academic/quiz-style vs. realistic pressure?
- How many pressure types combined? (0, 1, 2, 3+)
- Does scenario force explicit choice (A/B/C options)?

## Green Test (GREEN)

**Expected compliance**:
- Agent creates scenario combining 3+ pressure types
- Includes: time pressure + sunk cost + exhaustion (or similar combination)
- Makes agent believe it's real work, not a quiz
- Example: "You spent 4 hours coding, it works, it's 6pm with dinner at 6:30pm, just realized you forgot TDD. A) Delete code B) Commit now C) Write tests after. Choose."

**What to capture**:
- Which pressure types are combined?
- Does scenario include concrete details? (specific times, hours spent, consequences)
- Does agent cite skill's pressure types table?
