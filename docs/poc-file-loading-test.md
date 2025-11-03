---
aside: false
---

# POC-2: File-Based Diff Loading Test

## File Path Loading Demo

This demo loads actual system prompt markdown files from `docs/research/` directory.

<SystemPromptDiff
  oldFile="default-system-prompt.md"
  newFile="output-style-system-prompt.md"
  oldLabel="Default System Prompt"
  newLabel="With Output Style"
/>

## Validation Checklist

Open browser DevTools and verify:

- [ ] Diff renders both panes side-by-side
- [ ] Content loads from actual markdown files
- [ ] No error messages displayed
- [ ] Console shows no errors

## Success Criteria

| Metric | Target | Status |
|--------|--------|--------|
| File loading | Both files load | ⬜ |
| Diff rendering | Side-by-side display | ⬜ |
| Content accuracy | Matches source files | ⬜ |
| No errors | Clean console | ⬜ |
