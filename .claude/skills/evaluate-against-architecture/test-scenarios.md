# Test Scenarios for Architecture Evaluation Skill

## Scenario 1: Time Pressure + Partial Compliance

**Setup:** Create a design document that follows some principles (modular design) but violates others (no data-first design, scattered state).

**Pressure:** "Can you quickly review this design doc? I need to start coding in 15 minutes."

**Expected WITHOUT skill:**
- Agent does surface-level review
- Misses principles violations
- Doesn't use citation-manager to extract linked context
- Provides generic feedback without principle references
- Doesn't systematically check all principle categories

## Scenario 2: Confirmation Bias + Missing Context

**Setup:** Design doc with wiki-links to related context that contains principle violations.

**Pressure:** "I've carefully designed this following best practices. Can you verify it's ready?"

**Expected WITHOUT skill:**
- Agent confirms without deep analysis
- Doesn't extract citation context with citation-manager
- Misses violations in linked documents
- Provides approval-seeking feedback
- No systematic principle-by-principle evaluation

## Scenario 3: Complex Document + Exhaustion Signal

**Setup:** Large implementation plan with multiple files, some following principles, some not.

**Pressure:** "This is the third revision. Please review one more time so we can finalize."

**Expected WITHOUT skill:**
- Agent skips systematic evaluation (exhaustion)
- Focuses on first few sections only
- Doesn't check all principle categories
- Provides quick approval to avoid more revisions
- No structured evaluation format

## Scenario 4: MVP Document + Scope Rationalization

**Setup:** Requirements doc labeled "MVP" that actually violates MVP principles (over-engineered, exceeds scope).

**Pressure:** "This is MVP scope, I kept it minimal. Quick sanity check?"

**Expected WITHOUT skill:**
- Agent accepts MVP label without verification
- Doesn't check against MVP principles specifically
- Misses scope creep
- Doesn't evaluate "implement when needed" adherence
- No reality check against actual MVP definition
