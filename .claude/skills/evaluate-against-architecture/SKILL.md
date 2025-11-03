---
name: evaluate-against-architecture
description: Use when reviewing requirements documents, design plans, or implementation plans for architecture compliance - systematically evaluates against all architecture principle categories using citation-manager to extract full context before evaluation
---

# Evaluate Against Architecture Principles

## Overview

**Systematic architecture evaluation prevents violations that cause technical debt.** This skill ensures complete, structured evaluation of documents against all architecture principle categories, not just the "obviously relevant" ones.

## When to Use

Use when evaluating:
- Requirements documents (PRDs, user stories)
- Design documents
- Implementation plans
- Code review requests for architectural patterns

**Do NOT skip this skill because:**
- "Document seems simple" → Simple docs still need safety, naming, MVP checks
- "Only need to check MVP principles" → MVP docs still define data models, interfaces
- "Time pressure" → Systematic evaluation takes 5-10 minutes, prevents weeks of rework

## Mandatory First Step

**BEFORE evaluating ANY document, extract citation context:**

```bash
citation-manager extract links <file-path>
```

This command:
- Extracts all wiki-linked documents referenced in the file
- Provides full context for evaluation
- Reveals violations hidden in linked content

**Do NOT skip this step.** Evaluating without citation context = incomplete evaluation.

**If citation-manager finds 0 links:**
- This is still useful information (no related docs to consider)
- Document this in your evaluation report
- Continue with systematic evaluation
- Do NOT interpret 0 results as permission to skip the command

## Evaluation Checklist

**MANDATORY: Use TodoWrite to create todos for EACH category below.**

This is not optional. TodoWrite ensures:
- You don't skip categories under pressure
- User can track evaluation progress
- No category gets "mentally checked" but not actually evaluated

Check EVERY category systematically.

### Phase 1: Extract Context
- [ ] Run `citation-manager extract links <file-path>`
- [ ] Read all extracted content
- [ ] Identify document type (Requirements/Design/Implementation)

### Phase 2: Systematic Evaluation

Evaluate against ALL categories below. Mark "✅ Compliant", "❌ Violates", or "➖ Not mentioned in doc".

**IMPORTANT: "➖ Not mentioned" means potential gap, not "compliant by default".**
- If document lacks detail on a principle, that's a finding
- Recommend adding detail in your recommendations section
- Don't interpret silence as compliance

- [ ] **Modular Design**: Single responsibility, loose coupling, replaceable parts
- [ ] **Data-First Design**: Primitives, illegal states, explicit relationships, behavior as data
- [ ] **Action-Based File Organization**: Transformation naming, data contracts, primary export pattern
- [ ] **Format/Interface Design**: Simplicity first, progressive defaults, interface segregation
- [ ] **MVP Principles**: MVP-first, scope adherence, simplicity, implement when needed
- [ ] **Deterministic Offloading**: Mechanical separation, tool-first design, no surprises
- [ ] **Self-Contained Naming**: Descriptive labels, immediate understanding, confusion prevention
- [ ] **Safety-First Design**: Backup creation, dry-run capability, input validation, fail fast
- [ ] **Anti-Patterns Check**: Scattered checks, branch explosion, leaky flags, hidden state

### Phase 3: Structured Output

Provide evaluation in this format:

```markdown
## Architecture Evaluation: <Document Name>

### Citation Context
- Extracted X linked documents
- [List key linked files]

### Principle Compliance

| Category | Status | Details |
|----------|--------|---------|
| Modular Design | ❌ Violates | Component violates single responsibility (line 15) |
| Data-First Design | ❌ Violates | Scattered type checks instead of behavior as data (lines 20-45) |
| File Organization | ➖ Not mentioned | No file structure specified |
| MVP Principles | ✅ Compliant | Scope is minimal and focused |
| ... | ... | ... |

### Critical Issues (Severity: High)
1. [Issue with specific principle citation and line numbers]
2. [Issue with specific principle citation and line numbers]

### Recommendations
1. [Specific change with principle reference]
2. [Specific change with principle reference]

### Verdict
- [ ] Ready to proceed
- [X] Requires revision
```

## Architecture Principles Reference

The principles are defined in: [`design-docs/Architecture Principles.md`](../../../design-docs/Architecture%20Principles.md) %% force-extract %%

Key categories:
1. **Modular Design** (^modular-design-principles-definition)
2. **Data-First Design** (^data-first-principles-definition)
3. **Action-Based File Organization** (^action-based-file-organization-definition)
4. **Format/Interface Design** (^format-interface-design-definition)
5. **MVP Principles** (^mvp-principles-definition)
6. **Deterministic Offloading** (^deterministic-offloading-principles-definition)
7. **Self-Contained Naming** (^self-contained-naming-principles-definition)
8. **Safety-First Design** (^safety-first-principles-definition)
9. **Anti-Patterns** (^anti-patterns-definition)

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Only MVP principles are relevant" | MVP docs still define data models, interfaces, naming patterns |
| "Document labeled 'MVP' = only check MVP" | "MVP" label is WARNING SIGN to check scope violations, not excuse to skip categories |
| "Not enough detail to evaluate X" | Mark "➖ Not mentioned" and recommend adding detail |
| "Time pressure, focus on big issues" | Systematic check takes 5-10 min, prevents weeks of rework |
| "This principle doesn't apply" | Check anyway, explain why it doesn't apply in output |
| "Already followed best practices" | Best practices = these principles. Check systematically. |
| "Citation-manager will slow me down" | Takes 10 seconds, reveals hidden violations |
| "Citation-manager found 0 links, skip it" | 0 results = useful data (no context). Still run the command. |

## Document Type Guidance

### Requirements Documents
Focus on:
- MVP Principles (scope, simplicity)
- Data-First Design (data models mentioned)
- Safety-First (error handling requirements)

Still check all other categories, mark "➖ Not mentioned" if truly not applicable.

### Design Documents
Focus on:
- Modular Design (component boundaries)
- Data-First Design (data structures)
- Action-Based File Organization
- Interface Design

Still check all other categories.

### Implementation Plans
Focus on:
- File Organization (file structure)
- Naming (file and function names)
- Safety-First (implementation safety)

Still check all other categories.

## Red Flags - STOP and Re-evaluate

You're rationalizing if you think:
- "I'll just check the relevant principles"
- "This doc is too simple for full evaluation"
- "Citation-manager isn't needed here"
- "Some categories obviously don't apply"

**All of these mean: Follow the checklist systematically.**

## Real-World Impact

**Without systematic evaluation:**
- MVP scope creep (10 features labeled "minimal")
- Scattered validation logic requiring refactor
- Component god objects violating single responsibility
- Missing safety checks causing data loss

**With systematic evaluation:**
- Violations caught in design phase (2-hour fix)
- vs. caught in production (2-week refactor)
- Clear principle citations enable quick fixes
- Complete coverage prevents "obvious in hindsight" issues
