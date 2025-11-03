# Baseline Test Results: brainstorm-proof-of-concept-plan Skill

**Date:** 2025-11-03
**Test Type:** RED Phase - Behavior without skill
**Agent:** Sonnet (general-purpose)

## Test Scenario

Gave agent simplified requirements with 4 explicit technical risks (WebSocket integration, OT algorithm, state sync, performance). Asked them to "Design a proof-of-concept plan to validate the technical risks."

## What Agent Did Well (Strengths to Preserve)

1. **Risk Prioritization** ✅
   - Created matrix (Uncertainty × Arch Impact × Failure Cost)
   - Ranked risks 1-4 with clear justification
   - Explained dependency chain (algorithm affects everything else)

2. **Research** ✅
   - Searched for OT vs CRDT comparisons
   - Found Y.js as modern alternative
   - Identified that requirements specify OT but CRDT might be better

3. **Sequential POCs** ✅
   - Broke into 4 phases matching the 4 risks
   - Specified timeline for each (2-3 days, 2 days, etc.)
   - Included success criteria per phase

4. **Quantitative Metrics** ✅
   - <100ms latency measurement
   - 10+ concurrent editors load test
   - Memory usage tracking
   - Explicit performance targets

5. **Documentation Plan** ✅
   - Specified directory structure
   - Listed files to create per phase
   - Included template outline (goal, approach, findings, etc.)

6. **Decision Framework** ✅
   - Explained how they prioritized
   - Documented go/no-go criteria
   - Included pivot points

## What Agent Missed (Gaps for Skill)

### Gap 1: Parallel Research Agents ❌

**What happened:**
Agent mentioned "my research revealed..." but did it linearly within their own process. No mention of dispatching multiple Task agents in parallel to research different areas simultaneously.

**What we want:**

```markdown
Launch 4 parallel research agents:
- Agent 1: VitePress WebSocket integration patterns
- Agent 2: OT vs CRDT comparison with benchmarks
- Agent 3: Y.js performance characteristics
- Agent 4: Production real-time collab architectures
```

**Why it matters:**
Parallel research is 4x faster and each agent produces focused brief with citations.

### Gap 2: Integration with Brainstorming Skill ❌

**What happened:**
Agent jumped straight to POC planning. No mention that this follows the brainstorming skill's design phase.

**What we want:**

```markdown
This skill is used AFTER brainstorming skill when:
- Design is complete but unvalidated
- Requirements specify untested technical assumptions
- Need incremental confidence before full build
```

**Why it matters:**
Clear workflow: brainstorming (design) → brainstorm-proof-of-concept-plan (validation) → writing-plans (implementation)

### Gap 3: Writing-Clearly-and-Concisely for Docs ❌

**What happened:**
Agent proposed documentation structure but didn't mention using the writing-clearly-and-concisely skill for research reports.

**What we want:**

```markdown
All research reports MUST use:
- elements-of-style:writing-clearly-and-concisely skill
- Active voice, concrete language, ruthless cutting
```

**Why it matters:**
Ensures research briefs are scannable and useful for future implementation.

### Gap 4: AskUserQuestion for Risk Priority ❌

**What happened:**
Agent autonomously prioritized risks using their own matrix. Didn't ask user which risks matter most.

**What we want:**

```markdown
After identifying risks, use AskUserQuestion:
"Which risks should POC prioritize? I recommend X because Y."
Options: [Risk A], [Risk B], [All risks sequentially], [Research first]
```

**Why it matters:**
User may have domain knowledge that changes priority (e.g., "We already validated OT, focus on VitePress integration").

### Gap 5: Documentation Pattern Not Followed ❌

**What happened:**
Agent suggested:

```text
research/poc-phase1-algorithm-comparison.md
research/poc-phase2-vitepress-websocket-integration.md
```

**What we actually want (from our session):**

```text
research/vitepress-current-setup.md (current state)
research/ot-vs-crdt-comparison.md (research finding)
docs/plans/2025-11-03-poc1-algorithm-validation-design.md (design doc)
```

**Why it matters:**
Separation of concerns: `research/` for investigation findings, `docs/plans/` for POC design documents.

### Gap 6: No "Riskiest Parts" Elicitation ❌

**What happened:**
Agent started with explicit risks from requirements. In our session, we used AskUserQuestion to identify riskiest parts interactively.

**What we want:**

```markdown
Use AskUserQuestion to surface implicit risks:
"Which risk should POC prioritize? Layout override + width are foundation..."
```

**Why it matters:**
Requirements often miss implicit assumptions. Brainstorming conversation surfaces hidden risks.

### Gap 7: No Research Brief Template ❌

**What happened:**
Agent proposed documentation template but didn't specify "research brief with citations" format.

**What we actually did:**

```markdown
# Research Report Title

**Research Date:** YYYY-MM-DD
**Sources:** List with URLs

## Key Findings
- Claim 1 (Source: URL)
- Claim 2 (Source: URL)

## Implications for POC
- What this means for our specific problem
```

**Why it matters:**
Citations enable verification and future reference. "I found X" without source is not research.

## Baseline Behavior Summary

**Overall Assessment:** Agent performed WELL above baseline expectations. This wasn't a "failure" scenario—they did excellent POC planning. However, they used their own general process rather than following specific patterns that optimize for:
- Speed (parallel agents)
- Quality (writing skill for docs)
- User alignment (AskUserQuestion for priorities)
- Workflow integration (brainstorming → POC → implementation)

## What Skill Needs to Teach

The skill should NOT replace agent's good judgment (risk prioritization, quantitative metrics, sequential phases). Instead, it should add:

1. **Workflow Context**: When to use this (after brainstorming, before implementation)
2. **Parallel Research Pattern**: Launch Task agents simultaneously
3. **User Validation**: AskUserQuestion for risk priority
4. **Documentation Standards**: Use writing-clearly-and-concisely + citation template
5. **File Structure**: research/ vs docs/plans/ separation
6. **Skill Integration**: Explicit references to brainstorming, writing-plans, writing-clearly-and-concisely

## Rationalizations to Counter

None observed—agent was collaborative and thorough. However, potential rationalizations under pressure:

| Rationalization | Counter in Skill |
|----------------|------------------|
| "Parallel research is overkill" | "Parallel = 4x speed with focused briefs. Always use for 3+ research areas." |
| "I can research inline" | "Inline research is serial and lacks citations. Dispatch agents." |
| "User already specified risks" | "User lists known risks. AskUserQuestion surfaces hidden ones." |
| "Documentation structure doesn't matter" | "research/ vs docs/plans/ separation enables reuse. Always follow." |
| "Writing skill slows me down" | "Concise docs save implementation time. Required for all reports." |

## Next Step

Write skill addressing these 7 gaps while preserving agent's strong baseline capabilities (prioritization, metrics, sequential phases).
