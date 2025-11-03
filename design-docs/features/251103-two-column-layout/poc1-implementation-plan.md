# POC-1: Layout Override and Width Validation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Validate layout control and content width targets by refactoring SystemPromptDiff component to accept props, adding CSS overrides for wide displays, and creating a test page that proves 600px+ per diff pane is achievable on 1920px viewports.

**Architecture:** Three-file refactoring using VitePress's official customization APIs—frontmatter for layout control (`aside: false`), CSS variable overrides for width expansion, and component props with defaults for backward compatibility. No custom layout components required.

**Tech Stack:** VitePress 2.0.0-alpha.12, Vue 3 TypeScript, @git-diff-view/vue for diff rendering, CSS custom properties

---

## Task 1 - Add Props Interface to SystemPromptDiff Component

### Files
- `docs/.vitepress/components/SystemPromptDiff.vue:1-52` (MODIFY)

### Step 1: Write the failing test

Create test file to verify props interface:

```typescript
// tests/components/SystemPromptDiff.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SystemPromptDiff from '../../docs/.vitepress/components/SystemPromptDiff.vue'

describe('SystemPromptDiff Props', () => {
  it('should accept custom oldContent prop', async () => {
    const wrapper = mount(SystemPromptDiff, {
      props: {
        oldContent: 'Custom old content',
        newContent: 'Custom new content',
        oldLabel: 'Old Version',
        newLabel: 'New Version'
      }
    })

    // Wait for onMounted to complete
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.diffFile).toBeTruthy()
  })

  it('should use default values when no props provided', async () => {
    const wrapper = mount(SystemPromptDiff)
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.diffFile).toBeTruthy()
  })
})
```

### Step 2: Run test to verify it fails

Run: `npm test -- SystemPromptDiff.spec.ts`
Expected: FAIL with "props is not defined" or "defineProps is not called"

### Step 3: Add props interface with defaults

Modify `docs/.vitepress/components/SystemPromptDiff.vue:1-15`:

Replace lines 7-14 with:

```typescript
interface Props {
  oldContent?: string;
  newContent?: string;
  oldLabel?: string;
  newLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  oldContent: `You are Claude Code, Anthropic's official CLI for Claude.

You are an interactive CLI tool that helps users with software engineering tasks. Use the instructions below and the tools available to you to assist the user.`,
  newContent: `You are Claude Code, Anthropic's official CLI for Claude.

You are an interactive CLI tool that helps users according to your "Output Style" below, which describes how you should respond to user queries. Use the instructions below and the tools available to you to assist the user.`,
  oldLabel: 'DEFAULT System Prompt',
  newLabel: 'USING /output-style'
});
```

### Step 4: Update diff generation to use props

Modify `docs/.vitepress/components/SystemPromptDiff.vue:17-25`:

Replace lines 18-24 with:

```typescript
  const file = generateDiffFile(
    props.oldLabel,
    props.oldContent,
    props.newLabel,
    props.newContent,
    'markdown',
    'markdown'
  );
```

### Step 5: Run test to verify it passes

Run: `npm test -- SystemPromptDiff.spec.ts`
Expected: PASS - both test cases pass

### Step 6: Verify backward compatibility

Run: `npm run docs:dev`
Navigate to: `http://localhost:5173/Claude%20Code%20Output%20Style%20Depricated.html`
Expected: Diff component renders exactly as before (no visual changes)

### Step 7: Commit component refactoring

Use `create-git-commit` skill to commit with message:

```text
refactor(component): add props interface to SystemPromptDiff

- Add optional props: oldContent, newContent, oldLabel, newLabel
- Provide defaults matching original hardcoded values
- Maintain backward compatibility for existing usage
- Enable dynamic content for POC test pages

Part of POC-1: Layout Override and Width Validation
```

---

## Task 2 - Add CSS Width Overrides

### Files
- `docs/.vitepress/theme/custom.css:1-2` (MODIFY)

### Step 1: Write CSS validation test

Create test file for CSS overrides:

```typescript
// tests/styles/layout-width.spec.ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'

describe('Custom CSS Width Overrides', () => {
  it('should define layout max-width variable', () => {
    const css = readFileSync('docs/.vitepress/theme/custom.css', 'utf-8')
    expect(css).toContain('--vp-layout-max-width: 1920px')
  })

  it('should override content-container max-width for pages without aside', () => {
    const css = readFileSync('docs/.vitepress/theme/custom.css', 'utf-8')
    expect(css).toContain('.VPDoc:not(.has-aside) .content-container')
    expect(css).toContain('max-width: 1400px')
  })

  it('should apply overrides only at min-width 1440px breakpoint', () => {
    const css = readFileSync('docs/.vitepress/theme/custom.css', 'utf-8')
    expect(css).toContain('@media (min-width: 1440px)')
  })
})
```

### Step 2: Run test to verify it fails

Run: `npm test -- layout-width.spec.ts`
Expected: FAIL with "Expected '--vp-layout-max-width' to be in file"

### Step 3: Add CSS overrides

Replace entire `docs/.vitepress/theme/custom.css` with:

```css
/* Custom styles for the site */

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

### Step 4: Run test to verify it passes

Run: `npm test -- layout-width.spec.ts`
Expected: PASS - all CSS validation checks pass

### Step 5: Verify no visual regression on existing pages

Run: `npm run docs:dev`
Navigate to: `http://localhost:5173/`
Expected: Homepage renders identically (three-column layout preserved)

Navigate to: `http://localhost:5173/Claude%20Code%20Output%20Style%20Depricated.html`
Expected: Page renders identically (three-column layout with right TOC preserved)

### Step 6: Commit CSS overrides

Use `create-git-commit` skill to commit with message:

```text
style(theme): add CSS width overrides for wide displays

- Set layout max-width to 1920px
- Override content-container to 1400px when aside disabled
- Apply only at min-width 1440px breakpoint
- No impact on existing three-column layout pages

Part of POC-1: Layout Override and Width Validation
```

---

## Task 3 - Create POC Test Page

### Files
- `docs/poc-layout-test.md` (CREATE)

### Step 1: Write content validation test

Create test for POC test page structure:

```typescript
// tests/pages/poc-layout-test.spec.ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'

describe('POC Layout Test Page', () => {
  it('should have frontmatter disabling aside', () => {
    const content = readFileSync('docs/poc-layout-test.md', 'utf-8')
    expect(content).toMatch(/^---\naside: false\n---/)
  })

  it('should include measurement zone divs with 600px min-width', () => {
    const content = readFileSync('docs/poc-layout-test.md', 'utf-8')
    expect(content).toContain('min-width: 600px')
    expect(content).toContain('Left Pane Zone')
    expect(content).toContain('Right Pane Zone')
  })

  it('should include SystemPromptDiff with custom props', () => {
    const content = readFileSync('docs/poc-layout-test.md', 'utf-8')
    expect(content).toContain('<SystemPromptDiff')
    expect(content).toContain('oldContent=')
    expect(content).toContain('newContent=')
  })

  it('should include validation checklist', () => {
    const content = readFileSync('docs/poc-layout-test.md', 'utf-8')
    expect(content).toContain('## Validation Checklist')
    expect(content).toContain('- [ ] Right sidebar (TOC) is absent')
    expect(content).toContain('- [ ] Content container width >1200px')
  })
})
```

### Step 2: Run test to verify it fails

Run: `npm test -- poc-layout-test.spec.ts`
Expected: FAIL with "ENOENT: no such file or directory, open 'docs/poc-layout-test.md'"

### Step 3: Create POC test page

Create `docs/poc-layout-test.md`:

```markdown
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
```

### Step 4: Run test to verify it passes

Run: `npm test -- poc-layout-test.spec.ts`
Expected: PASS - all content structure checks pass

### Step 5: Verify page renders correctly

Run: `npm run docs:dev`
Navigate to: `http://localhost:5173/poc-layout-test.html`

Verify at 1920px viewport width:
- Right sidebar is absent (two-column layout)
- Measurement zones are side-by-side without horizontal scroll
- Each zone shows >600px width in DevTools
- Diff component renders both panes side-by-side
- Each diff pane shows >600px width in DevTools

### Step 6: Verify page renders correctly at 1440px

Resize browser to 1440px width
Expected:
- Layout adapts gracefully
- Measurement zones may stack or show horizontal scroll (expected at this width)
- Diff component remains functional

### Step 7: Commit POC test page

Use `create-git-commit` skill to commit with message:

```text
feat(poc): add POC-1 layout override test page

- Create test page with aside disabled via frontmatter
- Add measurement zones with 600px min-width targets
- Include SystemPromptDiff with custom content props
- Provide validation checklist for manual testing

Part of POC-1: Layout Override and Width Validation
```

---

## Task 4 - Register Test Page in Sidebar Navigation

### Files
- `docs/.vitepress/config.mts` (MODIFY - exact line numbers TBD after reading file)

### Step 1: Write navigation validation test

Create test for sidebar registration:

```typescript
// tests/config/sidebar-navigation.spec.ts
import { describe, it, expect } from 'vitest'
import config from '../../docs/.vitepress/config.mts'

describe('Sidebar Navigation', () => {
  it('should include POC-1 test page in sidebar', () => {
    const sidebar = config.themeConfig.sidebar
    const hasPocPage = JSON.stringify(sidebar).includes('/poc-layout-test')
    expect(hasPocPage).toBe(true)
  })
})
```

### Step 2: Run test to verify it fails

Run: `npm test -- sidebar-navigation.spec.ts`
Expected: FAIL with "Expected hasPocPage to be true, received false"

### Step 3: Read current sidebar configuration

Read: `docs/.vitepress/config.mts`
Identify the sidebar array structure and existing items

### Step 4: Add POC test page to sidebar

Modify `docs/.vitepress/config.mts` sidebar configuration to add:

```typescript
{
  text: 'POC Tests',
  items: [
    { text: 'POC-1: Layout Override', link: '/poc-layout-test' }
  ]
}
```

### Step 5: Run test to verify it passes

Run: `npm test -- sidebar-navigation.spec.ts`
Expected: PASS - sidebar includes POC page

### Step 6: Verify navigation works

Run: `npm run docs:dev`
Navigate to: `http://localhost:5173/`
Expected: Sidebar shows "POC Tests" section with "POC-1: Layout Override" link
Click link and verify it navigates to POC test page

### Step 7: Commit sidebar registration

Use `create-git-commit` skill to commit with message:

```text
config(nav): register POC-1 test page in sidebar

- Add "POC Tests" section to sidebar
- Register /poc-layout-test page
- Enable navigation to POC test page from sidebar

Part of POC-1: Layout Override and Width Validation
```

---

## Task 5 - Validate Success Metrics

### Files
- N/A (Manual testing and documentation)

### Step 1: Launch development server

Run: `npm run docs:dev`
Expected: Server starts on `http://localhost:5173`

### Step 2: Open POC test page at 1920px viewport

Navigate to: `http://localhost:5173/poc-layout-test.html`
Resize browser window to 1920px width
Open DevTools (F12)

### Step 3: Measure content container width

In DevTools Elements tab:
1. Select `.VPDoc .content-container` element
2. Verify Computed width >1200px (target: ~1400px)
3. Document actual width in results

Expected: Width approximately 1400px

### Step 4: Measure measurement zone widths

In DevTools:
1. Select left measurement zone div
2. Verify width >600px in Computed panel
3. Select right measurement zone div
4. Verify width >600px in Computed panel
5. Document actual widths

Expected: Both zones ~588px each (1176px total / 2)

### Step 5: Measure diff pane widths

In DevTools:
1. Expand `.system-prompt-diff` element
2. Select left diff pane element
3. Verify width >600px
4. Select right diff pane element
5. Verify width >600px
6. Document actual widths

Expected: Both panes ~588px each

### Step 6: Verify no regressions on existing pages

Navigate to: `http://localhost:5173/`
Verify: Three-column layout present (left nav, content, right TOC)

Navigate to: `http://localhost:5173/Claude%20Code%20Output%20Style%20Depricated.html`
Verify: Three-column layout present with functioning right TOC

### Step 7: Document validation results

Create file: `docs/poc-layout-test-results.md`

```markdown
# POC-1 Validation Results

**Test Date:** [Current Date]
**Viewport:** 1920px width
**Browser:** [Browser Name/Version]

## Measurements

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Content Container Width | >1200px | [Measured] px | ✅/❌ |
| Left Measurement Zone | >600px | [Measured] px | ✅/❌ |
| Right Measurement Zone | >600px | [Measured] px | ✅/❌ |
| Left Diff Pane | >600px | [Measured] px | ✅/❌ |
| Right Diff Pane | >600px | [Measured] px | ✅/❌ |

## Observations

- Right sidebar: [Present/Absent]
- Horizontal scroll: [Present/Absent]
- Homepage regression: [Yes/No]
- Deprecated page regression: [Yes/No]

## Conclusion

POC-1 [SUCCEEDED/FAILED] - [Brief explanation]

## Next Steps

[If succeeded: Proceed to POC-2 design]
[If failed: Document issues and iterate on POC-1]
```

### Step 8: Commit validation results

Use `create-git-commit` skill to commit with message:

```text
docs(poc): add POC-1 validation results

- Document measured widths at 1920px viewport
- Record success/failure against targets
- Provide observations and next steps

Part of POC-1: Layout Override and Width Validation
```

---

## Task 6 - Build Production Version and Verify

### Files
- N/A (Build and deployment verification)

### Step 1: Build production static site

Run: `npm run docs:build`
Expected: Build completes without errors

### Step 2: Preview production build

Run: `npm run docs:preview`
Expected: Preview server starts (typically on port 4173)

### Step 3: Verify POC page in production build

Navigate to: `http://localhost:4173/poc-layout-test.html`
Verify: Page renders identically to development version

### Step 4: Verify production build size

Check: `.vitepress/dist` directory size
Expected: Reasonable size increase (<100KB for added CSS/component changes)

### Step 5: Verify no build warnings related to POC changes

Review build output
Expected: No warnings about:
- Invalid CSS selectors
- Missing component props
- Frontmatter parsing errors

### Step 6: Document production verification

Add to `docs/poc-layout-test-results.md`:

```markdown
## Production Build Verification

- Build status: [Success/Failed]
- Build warnings: [None/List warnings]
- Preview server: [Functional/Issues]
- POC page renders: [Yes/No]
- Dist size impact: [+XX KB]
```

### Step 7: Commit production verification results

Use `create-git-commit` skill to commit with message:

```text
docs(poc): verify POC-1 in production build

- Confirm clean build with no errors
- Verify preview server renders POC page correctly
- Document build size impact

Part of POC-1: Layout Override and Width Validation
```

---

## Task 7 - Create POC-1 Summary and Recommendations

### Files
- `design-docs/features/251103-two-column-layout/poc1-summary.md` (CREATE)

### Step 1: Create summary document structure

Create file with template:

```markdown
# POC-1 Summary and Recommendations

**POC Goal:** Validate layout control and content width targets before full implementation

**Completion Date:** [Date]

**Overall Status:** [SUCCESS/PARTIAL/FAILED]

## Validated Assumptions

### Layout Override
- **Assumption:** Can disable right sidebar programmatically via frontmatter
- **Result:** [Pass/Fail]
- **Evidence:** [Description and measurements]

### Width Target
- **Assumption:** Can achieve 600px+ per diff pane on 1920px displays
- **Result:** [Pass/Fail]
- **Evidence:** [Actual measurements]

### Component Flexibility
- **Assumption:** SystemPromptDiff can accept dynamic content via props
- **Result:** [Pass/Fail]
- **Evidence:** [Test page renders custom content]

### No Regression
- **Assumption:** Changes affect only target pages
- **Result:** [Pass/Fail]
- **Evidence:** [Existing pages unchanged]

## Technical Findings

### What Worked
[List successful approaches and why]

### What Didn't Work
[List issues encountered and workarounds]

### Surprises/Learnings
[Unexpected findings or insights]

## Recommendations

### Proceed to POC-2?
[YES/NO - with justification]

### Modifications for Full Implementation
[List any adjustments needed based on POC results]

### Risks Identified
[New risks discovered during POC]

## Artifacts

- Test page: `/poc-layout-test.html`
- Validation results: `/poc-layout-test-results.html`
- Component changes: `docs/.vitepress/components/SystemPromptDiff.vue`
- CSS changes: `docs/.vitepress/theme/custom.css`
```

### Step 2: Fill in summary based on validation results

Complete all sections using:
- Validation results from Task 5
- Production verification from Task 6
- Actual measurements and observations

### Step 3: Make GO/NO-GO recommendation for POC-2

Based on results, provide clear recommendation:
- If all metrics pass → Recommend proceed to POC-2
- If some metrics fail → Recommend iterate on POC-1
- If critical failures → Recommend re-evaluate approach

### Step 4: Commit summary document

Use `create-git-commit` skill to commit with message:

```text
docs(poc): add POC-1 summary and recommendations

- Document validated assumptions and results
- Provide technical findings and learnings
- Make recommendation for POC-2 progression

Completes POC-1: Layout Override and Width Validation
```

---

## Testing Strategy

**Unit Tests:** Component props interface validation
**Integration Tests:** CSS override application and selector specificity
**Manual Tests:** Visual validation at 1920px and 1440px viewports
**Regression Tests:** Verify existing pages unchanged

## Success Criteria Summary

POC-1 succeeds when:
1. ✅ Right sidebar absent on test page
2. ✅ Content width >1200px @ 1920px viewport
3. ✅ Measurement zones >600px each
4. ✅ Diff panes >600px each
5. ✅ No regression on existing pages
6. ✅ Component accepts custom props
7. ✅ Production build succeeds

## Dependencies

- VitePress 2.0.0-alpha.12 (already installed)
- @git-diff-view/vue (already installed)
- Vue Test Utils (install if not present: `npm install -D @vue/test-utils vitest`)

## Estimated Timeline

- Task 1 (Component Props): 30-45 minutes
- Task 2 (CSS Overrides): 20-30 minutes
- Task 3 (Test Page): 30-45 minutes
- Task 4 (Sidebar Nav): 15-20 minutes
- Task 5 (Validation): 45-60 minutes
- Task 6 (Production Build): 20-30 minutes
- Task 7 (Summary): 30-45 minutes

**Total:** 3.5-4.5 hours

## Notes

- All commits follow atomic commit principles (one logical change per commit)
- TDD approach: write test, see it fail, implement, see it pass
- Each task includes validation step before moving to next task
- Frequent commits enable easy rollback if issues discovered
