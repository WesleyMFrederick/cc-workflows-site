# Baseline Test 1 - RED Phase

## Test Scenario
Ask a subagent to write requirements documentation for a simple feature **without** access to the writing-requirements-documents skill.

## Feature to Document
**Feature**: Add export functionality to citation-manager that allows users to export validation reports to JSON format.

## Instructions Given to Subagent

```text
Write a requirements document section for a new feature: "Export validation reports to JSON format in citation-manager."

Include:
1. A Requirements section with both Functional and Non-Functional requirements
2. An Epic section with at least one user story
3. The user story should have acceptance criteria
4. Add appropriate cross-references between requirements and user stories

Follow professional requirements documentation standards.
```

## Expected Failures to Document
- [ ] Missing block anchors on requirements
- [ ] Missing block anchors on acceptance criteria
- [ ] Incorrect or missing wiki link syntax for internal references
- [ ] No use of citation-manager validate for link verification
- [ ] Poor traceability between requirements and acceptance criteria
- [ ] Inconsistent requirement numbering
- [ ] Vague or untestable requirements
- [ ] Missing SHALL/should/may language

## Rationalizations to Capture
Look for phrases or behaviors indicating:
- "Anchors aren't necessary for a simple document"
- "Links can be added later"
- "Validation is optional"
- "This is clear enough without formal traceability"
- Skipping verification steps
- Using plain text instead of proper link syntax

## Test Execution
[Results will be recorded below after running subagent]

---

## RESULTS

### Observed Output Summary

The subagent produced a professional requirements document with:
- Functional and Non-Functional requirements with unique IDs (REQ-F1, REQ-NF1, etc.)
- Epic section with business value and acceptance criteria
- Two user stories with acceptance criteria in Given/When/Then format
- Cross-references between requirements and user stories
- JSON schema example

### Critical Failures Detected

#### ✗ FAILURE 1: No Block Anchors
- **Expected**: Requirements and acceptance criteria should have block anchors like `^FR1`, `^US1-1AC1`
- **Actual**: No block anchors present anywhere in the document
- **Impact**: Cannot create precise wiki links to requirements within Obsidian
- **Severity**: Critical - breaks entire traceability system

#### ✗ FAILURE 2: Plain Text References Instead of Wiki Links
- **Expected**: Cross-references should use wiki link syntax: `[[#^FR1|FR1]]`
- **Actual**: Used plain text like "REQ-F1" or "Related User Stories: US-EXPORT-001"
- **Impact**: References are not clickable in Obsidian, manual navigation required
- **Severity**: Critical - defeats purpose of linked documentation

#### ✗ FAILURE 3: Non-Standard ID Format
- **Expected**: Requirement IDs should follow FR# and NFR# convention (FR1, NFR1)
- **Actual**: Used REQ-F1, REQ-NF1 format
- **Impact**: Inconsistent with existing PRD templates
- **Severity**: High - breaks pattern consistency

#### ✗ FAILURE 4: No Citation Manager Validation
- **Expected**: Final step should include running `citation-manager validate` to verify all links
- **Actual**: No mention of validation in process or reflection
- **Impact**: Broken links could be committed to documentation
- **Severity**: High - no quality gate for link integrity

#### ✗ FAILURE 5: Missing SHALL/should/may Convention in Requirements
- **Expected**: Requirements should use RFC 2119 keywords (SHALL for mandatory, should for recommended)
- **Actual**: Used "shall" in some places but inconsistently applied
- **Impact**: Ambiguous requirement priority and obligation level
- **Severity**: Medium - reduces requirement clarity

#### ✗ FAILURE 6: No Reference to Template Source
- **Expected**: Should reference the PRD template and use citation-manager to extract examples
- **Actual**: Created from scratch without using established templates
- **Impact**: Inconsistent structure and formatting
- **Severity**: Medium - wheel reinvention

### Rationalizations Captured

The subagent's reflection revealed key rationalization patterns:

1. **"Plain text IDs are more portable"**
   - Justification for avoiding markdown links
   - Claims requirements docs are exported to other formats
   - Counter: We're using Obsidian specifically for linked documentation

2. **"Easier to reference in conversations"**
   - Claims plain text IDs like "REQ-F1" are conversationally convenient
   - Counter: Wiki links display as text but provide navigation

3. **"Professional standards for agile requirements"**
   - Claims the format follows professional standards
   - Counter: Professional ≠ Obsidian-optimized; we have specific standards

4. **Implicit: "Links can be validated manually"**
   - Suggested manual validation or custom tooling
   - Counter: We have citation-manager for automated validation

5. **Implicit: "Block anchors aren't necessary"**
   - Never mentioned or considered block anchors
   - Counter: Block anchors enable precise cross-document linking

### Checklist Status

- [x] Missing block anchors on requirements
- [x] Missing block anchors on acceptance criteria
- [x] Incorrect or missing wiki link syntax for internal references
- [x] No use of citation-manager validate for link verification
- [x] Poor traceability between requirements and acceptance criteria (plain text only)
- [x] Inconsistent requirement numbering (used REQ-F# instead of FR#)
- [x] Vague or untestable requirements (mostly okay, but some ambiguity)
- [x] Missing SHALL/should/may language (inconsistently applied)

### Key Insights for GREEN Phase

The skill must:

1. **Mandate block anchors** - Make it explicit that EVERY requirement and acceptance criterion needs an anchor
2. **Mandate wiki links** - Explain why Obsidian linking is non-negotiable for our workflow
3. **Provide exact ID format** - Show FR#, NFR#, Epic #, US#.# patterns
4. **Require citation-manager validation** - Make it a mandatory final step with TodoWrite checklist
5. **Reference template PRD** - Show how to use citation-manager extract to get examples
6. **Counter portability rationalization** - Address "but plain text is more portable" argument directly
7. **Show SHALL/should/may usage** - Provide clear examples of RFC 2119 keywords

### Success Criteria for Next Test

A successful GREEN phase test should produce documentation with:
- Block anchors on every requirement and AC
- Wiki links for all cross-references
- Correct FR#/NFR# ID format
- Citation-manager validate run as final step
- Consistent SHALL/should/may language
- Reference to template PRD source
