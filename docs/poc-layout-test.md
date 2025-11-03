---
aside: false
---

# POC-1: Layout Override and Width Validation

## Width Measurement Demo

<div style="display: flex; gap: 16px; margin: 2rem 0;">
  <div style="flex: 1; min-width: 600px; height: 200px; background: #e3f2fd; border: 2px solid #2196f3; display: flex; align-items: center; justify-content: center; font-weight: bold;">
    Left Pane Zone (600px min)
  </div>
  <div style="flex: 1; min-width: 600px; height: 200px; background: #fff3e0; border: 2px solid #ff9800; display: flex; align-items: center; justify-content: center; font-weight: bold;">
    Right Pane Zone (600px min)
  </div>
</div>

## Diff Rendering Test

<SystemPromptDiff
  oldContent="Sample old prompt content for testing width and layout behavior in two-column mode."
  newContent="Sample new prompt content with changes for testing width and layout behavior in two-column mode with significantly more content to demonstrate wrapping."
  oldLabel="Version 1"
  newLabel="Version 2"
/>

## Validation Checklist

Open browser DevTools and verify:

- [ ] Right sidebar (TOC) is absent
- [ ] Content container width >1200px @ 1920px viewport
- [ ] Both measurement zones visible without horizontal scroll
- [ ] Each zone width >600px
- [ ] Diff component renders both panes side-by-side
- [ ] Each diff pane width >600px
- [ ] No horizontal scrollbar within diff component
- [ ] Existing pages retain three-column layout (spot check homepage)

## Success Criteria

| Metric | Target | Status |
|--------|--------|--------|
| Layout Override | Right sidebar absent | ⬜ |
| Content Width @ 1920px | >1200px | ⬜ |
| Measurement Zones | Both visible, no h-scroll | ⬜ |
| Zone Width | >600px each | ⬜ |
| Diff Rendering | Side-by-side panes | ⬜ |
| Diff Pane Width | >600px each | ⬜ |
| No Regression | Other pages unchanged | ⬜ |
| Component Props | Custom content renders | ⬜ |
