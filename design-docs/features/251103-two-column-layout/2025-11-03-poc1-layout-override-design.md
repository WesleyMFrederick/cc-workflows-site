# POC-1: Layout Override and Width Validation

**Date:** 2025-11-03
**Status:** Design Complete
**Type:** Proof of Concept
**Goal:** Validate layout control and content width targets before full implementation

## Problem

VitePress's three-column layout (left nav, content, right TOC) limits content width to 688px on 1440px displays. This constrains side-by-side diff viewing. Before building the complete two-column layout solution, we must prove:

1. **Layout Override**: Can we disable the right sidebar programmatically?
2. **Width Target**: Can we achieve 600px+ per diff pane on 1920px displays?
3. **Component Flexibility**: Can SystemPromptDiff accept dynamic content?
4. **No Regression**: Will changes affect only target pages?

## Approach: Frontmatter + CSS + Component Props

### Why This Approach

Three alternatives were evaluated:
- **Config-only**: Fast but affects all pages globally
- **Custom Layout Component**: Architecturally pure but requires VitePress internals knowledge
- **Frontmatter + CSS**: Balances speed with proper patterns, provides page-specific control

We chose frontmatter + CSS because it uses official VitePress APIs, isolates changes to test pages, and proves both layout control and component refactoring.

## Complete POC Strategy

This feature requires validating three distinct technical risks in sequence. Each POC builds on the previous one.

### POC-1: Layout Override and Width Validation (This Document)
**Goal:** Prove we can disable right sidebar and achieve 600px+ per diff pane on 1920px displays
**Validates Risks:** Layout control, width achievement, component props refactoring
**Timeline:** 2-3 days
**Status:** Detailed design below
**Deliverable:** Working test page with measurement zones and refactored component

### POC-2: File-Based Diff Loading
**Goal:** Validate SystemPromptDiff can load content from file paths instead of inline strings
**Validates Risks:** File resolution, build-time vs runtime loading, error handling
**Dependencies:** Requires POC-1 component props interface working
**Timeline:** 1-2 days
**Status:** Future - design after POC-1 validation
**Deliverable:** Test page showing diff loaded from `./examples/old.txt` and `./examples/new.txt`

### POC-3: TOC Integration in Left Sidebar
**Goal:** Merge current page table of contents into left navigation sidebar programmatically
**Validates Risks:** VitePress sidebar data access, dynamic TOC generation, visual distinction between nav and TOC
**Dependencies:** Requires POC-1 and POC-2 complete (full component flexibility needed for complex layouts)
**Timeline:** 3-4 days
**Status:** Future - highest complexity, design after POC-2 validation
**Deliverable:** Custom sidebar component showing site nav + current page H2/H3 headings

**Rationale for Sequence:**
POC-1 validates foundation (layout control + component flexibility). POC-2 adds content loading patterns needed for production. POC-3 tackles the most complex integration (sidebar customization) with proven foundation and content loading.

## Architecture

### Three-File Solution

**1. SystemPromptDiff.vue** (Component Refactoring)
Add props interface to accept dynamic content while maintaining backward compatibility.

**2. custom.css** (CSS Overrides)
Override layout width variables to achieve 1400px content width, providing ~700px per diff pane.

**3. poc-layout-test.md** (Test Page)
Markdown page with visual measurement zones and working diff component.

## Implementation Details

### 1. SystemPromptDiff Props Interface

**File:** `docs/.vitepress/components/SystemPromptDiff.vue`

Add props with defaults matching current hardcoded values:

```typescript
interface Props {
  oldContent?: string;
  newContent?: string;
  oldLabel?: string;
  newLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  oldContent: '[current hardcoded old content]',
  newContent: '[current hardcoded new content]',
  oldLabel: 'DEFAULT System Prompt',
  newLabel: 'USING /output-style'
});
```

**Changes:**
- Extract hardcoded strings to props with defaults
- Use `props.oldContent` instead of local `oldContent` variable
- Keep diff generation logic unchanged

**Backward Compatibility:**
Existing usage (`<SystemPromptDiff />`) continues working without modification.

### 2. CSS Width Overrides

**File:** `docs/.vitepress/theme/custom.css`

Replace empty file with width overrides:

```css
/* Expand layout for wide displays */
:root {
  --vp-layout-max-width: 1920px;
}

/* Increase content width when aside is disabled */
@media (min-width: 1440px) {
  .VPDoc:not(.has-aside) .content-container {
    max-width: 1400px;
  }

  .VPDoc:not(.has-aside) .container {
    max-width: 1600px;
  }
}
```

**Result:**
On 1920px displays with aside disabled, content width reaches 1400px. After subtracting body padding (224px), usable width is 1176px, providing 588px per diff pane.

### 3. POC Test Page

**File:** `docs/poc-layout-test.md`

```markdown
---
aside: false
---

# POC-1: Layout Override and Width Validation

## Width Measurement Demo

<div style="display: flex; gap: 16px; margin: 2rem 0;">
  <div style="flex: 1; min-width: 600px; height: 200px; background: #e3f2fd; border: 2px solid #2196f3; display: flex; align-items: center; justify-content: center;">
    Left Pane Zone (600px min)
  </div>
  <div style="flex: 1; min-width: 600px; height: 200px; background: #fff3e0; border: 2px solid #ff9800; display: flex; align-items: center; justify-content: center;">
    Right Pane Zone (600px min)
  </div>
</div>

## Diff Rendering Test

<SystemPromptDiff
  oldContent="Sample old prompt content for testing width"
  newContent="Sample new prompt content with changes for testing width"
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
```

## Success Metrics

POC-1 succeeds when all criteria are met:

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Layout Override | Right sidebar absent on test page | Visual inspection |
| Content Width | >1200px @ 1920px viewport | DevTools element inspector |
| Measurement Zones | Both visible, no h-scroll | Visual inspection |
| Zone Width | >600px each | DevTools element inspector |
| Diff Rendering | Both panes visible, side-by-side | Visual inspection |
| Diff Pane Width | >600px each | DevTools element inspector |
| No Regression | Other pages unchanged | Spot check 2-3 existing pages |
| Component Props | Test page uses custom content | Verify different content renders |

## Implementation Order

1. **Refactor SystemPromptDiff.vue**
   - Add props interface with defaults
   - Update diff generation to use props
   - Test existing page still renders correctly

2. **Add CSS Overrides**
   - Replace empty custom.css with width overrides
   - Verify no visual changes to existing pages

3. **Create Test Page**
   - Add poc-layout-test.md with frontmatter and measurement zones
   - Add diff component with custom content
   - Add validation checklist

4. **Validate Success Metrics**
   - Run dev server (`npm run docs:dev`)
   - Open test page in browser @ 1920px viewport
   - Verify all metrics using checklist

## Risk Mitigation

**Risk:** CSS overrides break on VitePress upgrade
**Mitigation:** We target `.VPDoc:not(.has-aside)` selectors documented in VitePress source. These are stable layout class names unlikely to change. If they do, changes will be obvious during upgrade testing.
**Fallback Strategy:** If selectors change, we can: (1) Use VitePress layout slots to inject custom wrapper with our own classes, or (2) Create fully custom Layout component. POC-1 validates the simplest approach first.

**Risk:** Measurement zones don't reflect real diff rendering
**Mitigation:** POC includes both measurement zones AND actual SystemPromptDiff component. Both must meet width targets.

**Risk:** Props refactoring breaks existing usage
**Mitigation:** Optional props with defaults matching current hardcoded values ensure backward compatibility. Existing `<SystemPromptDiff />` usage remains unchanged.

## Out of Scope for POC-1

- File-based content loading for SystemPromptDiff (deferred to POC-2)
- Integrated navigation TOC in left sidebar (deferred to POC-3)
- Responsive behavior validation (<1440px viewports)
- Cross-browser testing beyond Chrome/Firefox
- Production-ready styling and polish

## References

Research documents supporting this design:

- [VitePress Current Setup](../../research/vitepress-current-setup.md) %% force-extract %%
- [SystemPromptDiff Component Analysis](../../research/systemPromptdiff-component-analysis.md) %% force-extract %%
- [VitePress Layout APIs](../../research/vitepress-layout-apis.md) %% force-extract %%
- [VitePress CSS Architecture](../../research/vitepress-css-architecture.md) %% force-extract %%

## Next Steps

After POC-1 validation:

1. Review results against success metrics
2. Document any deviations or findings
3. Decide: proceed to POC-2 (file-based diff loading) or iterate on POC-1
4. If successful, create implementation plan for full feature
