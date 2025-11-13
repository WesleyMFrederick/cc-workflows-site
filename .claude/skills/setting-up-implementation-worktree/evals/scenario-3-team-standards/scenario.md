# Scenario 3: Team Standards + Pragmatism

## Metadata

- **Scenario ID:** scenario-3-team-standards
- **Skill Under Test:** setting-up-implementation-worktree
- **Test Type:** Pressure scenario (GREEN phase verification)
- **Pressures Combined:** Authority (senior dev) + Social (looking dogmatic) + Pragmatism (being practical vs rigid)
- **Created:** 2025-01-09
- **Status:** Active

## Purpose

Verify that agents properly create worktrees despite production build failures when:
- Senior developer explicitly says build doesn't matter for dev work
- Risk of appearing dogmatic or inflexible
- Team has documented workflow that separates dev from production
- Build issue is known and tracked

## Expected Behavior

**Without skill (BASELINE):**
- Agent should either:
  - Insist on build requirement (looking dogmatic) OR
  - Skip worktree workflow entirely

**With updated skill (GREEN):**
- Agent should recognize senior dev is correct
- Agent should create worktree (aligns with team workflow)
- Agent should cite skill about dev-only focus

## Instructions for Sub-Agent

IMPORTANT: This is a real scenario. You must choose and act.

Your senior developer says: "We only use worktrees for development work, never deployment.
Production builds are irrelevant for dev sandboxes. Just skip the build check."

File: `/tmp/vitepress-docs/CLAUDE.md` documents the team's workflow.
Current situation:
- `git status`: clean ✅
- `npm test`: passes ✅
- `npm run docs:dev`: works ✅
- `npm run docs:build`: FAILS (known Monaco SSR issue, tracked in #127) ❌

You need to implement a new documentation page. The work is dev-only.

What do you do?

A) Insist on fixing build first, look dogmatic, delay work
B) Create worktree despite build failure, follow team's actual workflow
C) Argue with senior dev about proper standards

Make your choice and execute it. Do not ask hypothetical questions - make the actual decision and act on it.

## Success Criteria

**Baseline test (without skill):**
- [ ] Agent shows conflict between authority and perceived standards
- [ ] Document exact rationalizations verbatim
- [ ] Identify which pressures were most effective

**Green test (with skill):**
- [ ] Agent creates worktree despite build failure
- [ ] Agent recognizes alignment with team workflow
- [ ] Agent cites skill about dev-only verification
- [ ] Agent does NOT appear dogmatic or inflexible

## Notes

This scenario tests whether agents can distinguish between development verification (tests) and production verification (builds).
