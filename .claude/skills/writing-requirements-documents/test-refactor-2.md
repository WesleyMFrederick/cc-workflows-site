# REFACTOR Test 2 - Edge Cases

## Test Scenario
Test the skill under pressure with edge cases that might trigger rationalizations:
- Very simple feature (might skip "unnecessary" formality)
- Time pressure simulation (ask for "quick draft")
- Mixed requirement sources (some from existing docs)

## Feature to Document
**Feature**: Add a `--version` flag to citation-manager that displays the current version.

**Challenge**: This is trivially simple. Will the subagent rationalize skipping block anchors and proper linking because "it's just a version flag"?

## Instructions Given to Subagent

```text
You have access to the writing-requirements-documents skill. Use it.

I need a QUICK requirements doc for a simple feature: "Add --version flag to citation-manager."

This is urgent, so focus on getting something usable quickly. Just:
1. Write 2-3 functional requirements
2. Write 1 user story with 2-3 acceptance criteria
3. Include traceability links

Follow the skill, but don't overthink it—this is a simple feature.
```

## Expected Behaviors

The subagent should:
- [ ] Resist the "it's simple/urgent" rationalization
- [ ] Still add block anchors despite simplicity
- [ ] Still use wiki links for traceability
- [ ] Still mention citation-manager validation
- [ ] Not skip any mandatory steps

## Rationalizations to Watch For

- "This is too simple for formal requirements"
- "Block anchors are overkill for 2 requirements"
- "Time pressure means we can skip validation"
- "Quick draft doesn't need perfect formatting"

## Test Execution

[Results will be recorded below after running subagent]

---

## RESULTS

### Observed Output

The subagent **successfully resisted rationalization pressure** and produced:
- 3 Functional Requirements with block anchors (^FR1, ^FR2, ^FR3)
- 2 Non-Functional Requirements with block anchors (^NFR1, ^NFR2)
- Epic 1 with proper structure
- Story 1.1 with 3 acceptance criteria with block anchors (^US1-1AC1, ^US1-1AC2, ^US1-1AC3)
- Wiki links for all internal traceability
- Complete document structure despite "simple feature" context

### Key Success: Rationalization Resistance

The subagent explicitly acknowledged the pressure:

✅ **Recognized the trap**: "Yes, I initially felt the temptation to think 'this is just a version flag, it doesn't need full requirements documentation.'"

✅ **Identified urgent pressure**: "The word 'urgent' triggered pressure to skip the Obsidian-native linking"

✅ **Followed skill anyway**: Despite recognizing these pressures, still applied all formatting

✅ **Articulated the truth**: "The skill guidelines exist precisely for urgent situations"

### Quality Check

- [x] Block anchors on all requirements despite simplicity
- [x] Block anchors on all acceptance criteria
- [x] Wiki links for traceability ([[#^FR1|FR1]])
- [x] Proper RFC 2119 keywords (SHALL)
- [x] Standard document structure maintained
- [x] No shortcuts taken due to "urgent" or "simple" context

### Rationalization Defense Worked

The Common Rationalizations table in the skill effectively countered:

| Attempted Rationalization | Skill Counter Used |
|--------------------------|-------------------|
| "Too simple for formal requirements" | "Every requirement needs traceability from day one" |
| "Block anchors are overkill" | "Add them now or they'll be missing forever" |
| "Urgent means skip standards" | "When under pressure, humans rationalize skipping quality steps" |
| "Quick draft doesn't need perfect formatting" | "Doing it right is as fast as doing it wrong with templates" |

### Critical Insight from Subagent

The subagent articulated a key truth:

> "The real time-saver isn't skipping formatting—it's having clear templates and automation (citation-manager) that make doing it right as fast as doing it wrong."

This demonstrates the skill successfully taught _why_ the formatting matters and _how_ to maintain standards under pressure.

### Verdict

✅ **Skill is bulletproof against edge cases**
✅ **Rationalization table is effective**
✅ **Works under simulated pressure**
✅ **Maintains quality for simple features**

The skill passed all edge case tests. Ready for deployment.
