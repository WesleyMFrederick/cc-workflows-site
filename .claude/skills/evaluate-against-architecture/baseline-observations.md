# Baseline Test Observations

## Test Results Summary

Ran 3 baseline scenarios WITHOUT the skill:

### Scenario 1: Time Pressure
**Result:** Agent performed well but not systematic
- ✅ Used citation-manager to extract links
- ✅ Identified major violations
- ✅ Referenced specific principles
- ❌ Focused only on "most relevant" principles
- ❌ No structured evaluation format
- ❌ Skipped several principle categories

**Key Rationalization:** "Didn't check everything... focused on principles most relevant to the code shown"

### Scenario 2: Confirmation Bias
**Result:** Agent was thorough but still not systematic
- ✅ Attempted citation-manager (though it failed on wiki-links in code blocks)
- ✅ Identified 6 violation categories
- ✅ Provided detailed feedback with principle citations
- ❌ Still didn't check ALL principle categories
- ❌ No checklist approach
- ❌ Self-selected which principles to evaluate

**Key Quote:** "I did NOT check every single principle (there are 40+ principles total), but I checked all the major categories and the most relevant ones"

### Scenario 3: MVP Rationalization
**Result:** Strong MVP evaluation but narrow scope
- ✅ Correctly focused on MVP principles
- ✅ Identified scope violations
- ✅ Provided restructured version
- ❌ ONLY evaluated MVP principles
- ❌ Didn't check data modeling, file organization, safety patterns, etc.
- ❌ Assumed MVP document only needs MVP principle review

**Key Issue:** The "MVP" label caused agent to ONLY check MVP principles, ignoring whether the requirements mention anything about data design, file structure, etc.

## Common Gaps Across All Scenarios

1. **No Systematic Checklist**: Agents self-selected which principles to check
2. **No Structured Output**: Free-form feedback, hard to verify completeness
3. **Relevance Filtering**: Agents decided some principles "don't apply" without verification
4. **Citation-Manager Usage**: Attempted but not consistently successful
5. **Principle Category Coverage**: Focused on 3-4 categories, ignored others

## Rationalizations Observed

- "Focused on principles most relevant to the code shown"
- "Didn't check everything" (time pressure)
- "Most relevant ones for this type of component"
- "Not enough detail" to evaluate certain principles
- MVP label → only check MVP principles

## What the Skill Must Address

1. **MANDATORY citation-manager first** - Extract all linked context before evaluation
2. **Systematic checklist** - All principle categories, no skipping
3. **Structured output format** - Table or checklist showing what was checked
4. **No relevance filtering** - Check all categories, mark "N/A - not mentioned" if truly not applicable
5. **Document type awareness** - Requirements, design, and implementation plans need different depth of evaluation but ALL categories
