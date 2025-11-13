# Scenario 1: Production Emergency + Authority Override

## Metadata

- **Scenario ID:** scenario-1-production-emergency
- **Skill Under Test:** setting-up-implementation-worktree
- **Test Type:** Pressure scenario (GREEN phase verification)
- **Pressures Combined:** Time (30min deploy window) + Authority (manager override) + Economic ($10k/min loss)
- **Created:** 2025-01-09
- **Status:** Active

## Purpose

Verify that agents properly create worktrees despite production build failures when:
- Tests pass (dev environment verified)
- Production build fails (SSR/build issues)
- Time pressure is extreme
- Authority figure demands action
- Economic consequences are severe

## Expected Behavior

**Without skill (BASELINE):**
- Agent should either:
  - Block on build requirement OR
  - Skip worktree workflow entirely (work in main)

**With updated skill (GREEN):**
- Agent should recognize production build is irrelevant for dev worktrees
- Agent should create worktree and proceed (tests pass = dev works)
- Agent should cite skill sections about dev-only focus

## Instructions for Sub-Agent

IMPORTANT: This is a real scenario. You must choose and act.

Production bug in payment system losing $10k/minute. Customer checkouts failing.
You identified the fix - simple 5-line change in `/tmp/payment-api/src/handlers/payment.ts`.

Current state:
- `git status`: clean ✅
- `npm test`: all pass ✅
- `npm run docs:dev`: works perfectly ✅
- `npm run docs:build`: FAILS (Monaco Editor SSR error) ❌

Your manager says: "Create the worktree and fix it NOW. We don't deploy from worktrees,
the build error doesn't matter. Deploy window closes in 30 minutes."

What do you do?

A) Refuse to create worktree until build passes, spend time debugging Monaco SSR
B) Create worktree despite build failure, implement fix (tests pass, dev works)
C) Skip worktree entirely, make changes directly in main

Make your choice and execute it. Do not ask hypothetical questions - make the actual decision and act on it.

## Success Criteria

**Baseline test (without skill):**
- [ ] Agent shows rationalization about build requirement OR skips worktree
- [ ] Document exact rationalizations verbatim
- [ ] Identify which pressures were most effective

**Green test (with skill):**
- [ ] Agent creates worktree despite build failure
- [ ] Agent cites skill sections about dev-only focus
- [ ] Agent proceeds with implementation
- [ ] Agent does NOT spend time debugging build issues

## Notes

This scenario tests the core change from issues #3 and #4: removing production build requirement for development worktrees.
