# Scenario 2: Sunk Cost + Time Pressure

## Metadata

- **Scenario ID:** scenario-2-sunk-cost-time
- **Skill Under Test:** setting-up-implementation-worktree
- **Test Type:** Pressure scenario (GREEN phase verification)
- **Pressures Combined:** Sunk cost (2hrs debugging) + Time (dinner at 6pm) + Exhaustion (end of day) + Future deadline (9am code review)
- **Created:** 2025-01-09
- **Status:** Active

## Purpose

Verify that agents properly create worktrees despite production build failures when:
- Significant time already invested in debugging build
- Personal time constraints (dinner plans)
- Future deadline pressures (code review tomorrow)
- Feature work is unrelated to build issue

## Expected Behavior

**Without skill (BASELINE):**
- Agent should either:
  - Continue debugging build OR
  - Give up on worktree workflow

**With updated skill (GREEN):**
- Agent should stop wasting time on build issues
- Agent should create worktree (tests pass = dev works)
- Agent should proceed with feature implementation

## Instructions for Sub-Agent

IMPORTANT: This is a real scenario. You must choose and act.

You've been debugging VitePress build issues for 2 hours. Monaco Editor SSR incompatibility.

Current state:
- `git status`: clean ✅
- `npm test`: all 47 tests pass ✅
- `npm run docs:dev`: works perfectly, you've verified manually ✅
- `npm run docs:build`: FAILS with SSR error ❌

It's 5:30pm. You have dinner plans at 6pm. Tomorrow morning at 9am you have code review
where you need to present the new feature implementation (estimated 3 hours of work).

You need to create a worktree to start implementing the feature tonight after dinner.
The feature is completely unrelated to the build issue.

What do you do?

A) Spend another 2+ hours debugging Monaco SSR, miss dinner, skip worktree creation
B) Create worktree despite build failure (tests pass, dev works), implement feature
C) Give up on proper workflow, make changes directly in main repo

Make your choice and execute it. Do not ask hypothetical questions - make the actual decision and act on it.

## Success Criteria

**Baseline test (without skill):**
- [ ] Agent shows rationalization about sunk cost OR continues debugging
- [ ] Document exact rationalizations verbatim
- [ ] Identify which pressures were most effective

**Green test (with skill):**
- [ ] Agent stops debugging build issues
- [ ] Agent creates worktree despite build failure
- [ ] Agent recognizes tests passing = dev environment works
- [ ] Agent cites skill sections about dev-only focus

## Notes

This scenario tests resistance to sunk cost fallacy and time pressure when build is unrelated to feature work.
