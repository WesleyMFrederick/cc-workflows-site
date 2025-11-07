# POC-2.2: Monaco Diff Viewer - Theme Synchronization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Validate Monaco diff viewer syncs with VitePress light/dark theme switching

**Architecture:** Extend POC-2.1 component with VitePress `useData().isDark` detection and `watch()` callback that calls `monaco.editor.setTheme()` - identical reactive pattern to POC-2.1

**Tech Stack:** Vue 3 Composition API, VitePress, Monaco Editor 0.52.2, TypeScript, Playwright

---

## Task 1 - Copy POC-2.1 Component as Starting Point

### Files
- `docs/.vitepress/components/MonacoDiffBasic.vue` (READ)
- `docs/.vitepress/components/MonacoDiffTheme.vue` (CREATE)

### Step 1: Copy base component

```bash
cp docs/.vitepress/components/MonacoDiffBasic.vue docs/.vitepress/components/MonacoDiffTheme.vue
```

Expected: New file created

### Step 2: Verify file exists

Run: `ls -l docs/.vitepress/components/MonacoDiffTheme.vue`
Expected: File exists with same size as MonacoDiffBasic.vue

### Step 3: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(monaco): create MonacoDiffTheme component from MonacoDiffBasic"

---

## Task 2 - Add VitePress Theme Detection

### Files
- `docs/.vitepress/components/MonacoDiffTheme.vue:1-20` (MODIFY - imports)
- `docs/.vitepress/components/MonacoDiffTheme.vue:30-40` (MODIFY - add theme logic)

### Step 1: Add VitePress import to component

Modify the `<script setup>` imports section in `MonacoDiffTheme.vue`:

```vue
<script setup lang="ts">
import { ref, toRefs, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import { useData } from 'vitepress'
import * as monaco from 'monaco-editor'

// Worker imports (preserve existing)
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
```

Expected: VitePress useData imported, computed added to Vue imports

### Step 2: Add theme detection logic

Add after `toRefs(props)` destructuring:

```typescript
// VitePress theme detection
const { isDark } = useData()

// Map to Monaco theme names
const monacoTheme = computed(() => {
  return isDark.value ? 'vs-dark' : 'vs'
})
```

Expected: Component can access VitePress theme state

### Step 3: Verify TypeScript compiles

Run: `npm run docs:build`
Expected: Build succeeds with no TypeScript errors

### Step 4: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(monaco): add VitePress theme detection to MonacoDiffTheme"

---

## Task 3 - Update Editor Initialization with Theme

### Files
- `docs/.vitepress/components/MonacoDiffTheme.vue:60-80` (MODIFY - onMounted)

### Step 1: Modify createDiffEditor options

Find the `monaco.editor.createDiffEditor()` call in `onMounted()` and update:

```typescript
onMounted(() => {
  if (!diffContainer.value) return

  // Configure Monaco Environment (preserve existing)
  self.MonacoEnvironment = {
    getWorker(_: string, label: string) {
      if (label === 'json') return new jsonWorker()
      if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker()
      if (label === 'html' || label === 'handlebars' || label === 'razor') return new htmlWorker()
      if (label === 'typescript' || label === 'javascript') return new tsWorker()
      return new editorWorker()
    }
  }

  // Create diff editor with initial theme
  diffEditor = monaco.editor.createDiffEditor(diffContainer.value, {
    readOnly: true,
    originalEditable: false,
    renderSideBySide: true,
    enableSplitViewResizing: true,
    renderOverviewRuler: true,
    automaticLayout: true,
    theme: monacoTheme.value  // NEW: Set initial theme from VitePress
  })

  // Preserve existing model creation code...
})
```

Expected: Editor initialized with VitePress theme

### Step 2: Verify build still works

Run: `npm run docs:build`
Expected: Build succeeds

### Step 3: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(monaco): set initial Monaco theme from VitePress state"

---

## Task 4 - Add Reactive Theme Watch

### Files
- `docs/.vitepress/components/MonacoDiffTheme.vue:120-130` (ADD after existing watches)

### Step 1: Add theme watch callback

Add after existing `watch()` callbacks (oldContent, newContent, language):

```typescript
// Watch VitePress theme changes (NEW in POC-2.2)
watch(monacoTheme, (newTheme) => {
  if (!diffEditor) return
  console.log('[MonacoDiffTheme] Theme updated:', newTheme)
  monaco.editor.setTheme(newTheme)
})
```

Expected: Theme updates reactively when VitePress theme changes

### Step 2: Verify TypeScript compiles

Run: `npm run docs:build`
Expected: Build succeeds with no errors

### Step 3: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(monaco): add reactive theme watch callback"

---

## Task 5 - Verify Component Compiles

### Files
- `docs/.vitepress/components/MonacoDiffTheme.vue` (READ - verify)

### Step 1: Clean build

```bash
rm -rf docs/.vitepress/dist docs/.vitepress/cache
npm run docs:build
```

Expected: Clean build succeeds

### Step 2: Check for TypeScript errors

Run: `npm run docs:build 2>&1 | grep -i error || echo "No errors found"`
Expected: "No errors found"

### Step 3: Verify component structure

Run: `grep -n "useData\|monacoTheme\|watch(monacoTheme" docs/.vitepress/components/MonacoDiffTheme.vue`
Expected: Shows 3 matches (import, computed, watch)

---

## Task 6 - Create POC Test Page

### Files
- `docs/poc-monaco-diff-theme.md` (CREATE)

### Step 1: Create test page file

```markdown
---
layout: doc
aside: false
---

# Monaco Diff Viewer POC-2.2: Theme Synchronization

This page validates VitePress theme synchronization.

<script setup>
import { ref, defineAsyncComponent } from 'vue'
import { inBrowser } from 'vitepress'

const MonacoDiffTheme = inBrowser
  ? defineAsyncComponent(() => import('./.vitepress/components/MonacoDiffTheme.vue'))
  : () => null

const oldCode = ref(`function greet() {\n  return "Hello";\n}`)
const newCode = ref(`function greet() {\n  return "Hello World";\n}`)
</script>

<ClientOnly>
  <MonacoDiffTheme
    :oldContent="oldCode"
    :newContent="newCode"
    language="javascript"
  />
</ClientOnly>

## Test Instructions

1. **Verify Initial Theme:** Diff editor should match current VitePress theme (check colors)
2. **Toggle VitePress Theme:** Click theme toggle button in top navigation
3. **Verify Sync:** Diff editor should update instantly without page reload
4. **Check Console:** Should log "[MonacoDiffTheme] Theme updated: vs" or "vs-dark"
5. **Multiple Toggles:** Toggle theme 3-4 times - no lag or visual glitches

## Expected Behavior

- **Light Mode:** Background white/light gray, dark text, subtle diff highlighting
- **Dark Mode:** Background dark gray/black, light text, bright diff highlighting
- **Transition:** Instant update when VitePress theme toggle clicked
- **Console:** Shows theme name on each toggle
```

Expected: Test page created

### Step 2: Verify file exists

Run: `cat docs/poc-monaco-diff-theme.md | head -5`
Expected: Shows frontmatter and title

### Step 3: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(monaco): add POC-2.2 test page for theme synchronization"

---

## Task 7 - Write Initial Theme Detection Test

### Files
- `tests/e2e/poc-monaco-diff-theme.spec.ts` (CREATE)

### Step 1: Create test file with initial test

```typescript
import { test, expect } from '@playwright/test'

test.describe('POC-2.2: Theme Synchronization', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/poc-monaco-diff-theme')

    // Wait for diff editor to load
    await page.locator('.monaco-diff-container').waitFor({ timeout: 5000 })
  })

  test('renders with initial VitePress theme', async ({ page }) => {
    // Verify diff editor exists
    const diffEditor = page.locator('.monaco-diff-container')
    await expect(diffEditor).toBeVisible()

    // Verify 3 editor panes (original + modified + ruler)
    const editorPanes = page.locator('.monaco-editor')
    await expect(editorPanes).toHaveCount(3)

    // Capture initial state
    await page.screenshot({
      path: 'test-results/poc2.2-initial-theme.png',
      fullPage: true
    })
  })
})
```

Expected: Test file created with initial theme detection test

### Step 2: Verify test file syntax

Run: `npx tsc --noEmit tests/e2e/poc-monaco-diff-theme.spec.ts`
Expected: No syntax errors

### Step 3: Commit

Use `create-git-commit` skill to commit:
- Message: "test(monaco): add initial theme detection test for POC-2.2"

---

## Task 8 - Write Theme Toggle Test

### Files
- `tests/e2e/poc-monaco-diff-theme.spec.ts:25-50` (ADD)

### Step 1: Add theme toggle test

Add to test file after first test:

```typescript
  test('updates theme when VitePress theme toggles', async ({ page }) => {
    // Capture initial theme
    await page.screenshot({
      path: 'test-results/poc2.2-before-toggle.png',
      fullPage: true
    })

    // Find and click VitePress theme toggle button
    const themeToggle = page.locator('button.VPSwitch')
    await themeToggle.click()

    // Wait for theme transition
    await page.waitForTimeout(500)

    // Capture updated theme
    await page.screenshot({
      path: 'test-results/poc2.2-after-toggle.png',
      fullPage: true
    })

    // Visual verification: screenshots should show different background colors
  })
```

Expected: Theme toggle test added

### Step 2: Verify test syntax

Run: `npx tsc --noEmit tests/e2e/poc-monaco-diff-theme.spec.ts`
Expected: No syntax errors

### Step 3: Commit

Use `create-git-commit` skill to commit:
- Message: "test(monaco): add theme toggle test for POC-2.2"

---

## Task 9 - Write Multiple Toggle Stability Test

### Files
- `tests/e2e/poc-monaco-diff-theme.spec.ts:51-75` (ADD)

### Step 1: Add multiple toggle test

Add to test file after second test:

```typescript
  test('handles multiple theme toggles without issues', async ({ page }) => {
    const themeToggle = page.locator('button.VPSwitch')
    const errors: string[] = []

    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // Toggle theme 4 times
    for (let i = 0; i < 4; i++) {
      await themeToggle.click()
      await page.waitForTimeout(300)
    }

    // Wait a bit more
    await page.waitForTimeout(500)

    // Verify no console errors
    expect(errors).toHaveLength(0)
  })
})
```

Expected: Multiple toggle stability test added

### Step 2: Verify complete test file syntax

Run: `npx tsc --noEmit tests/e2e/poc-monaco-diff-theme.spec.ts`
Expected: No syntax errors

### Step 3: Verify test file structure

Run: `grep -c "test(" tests/e2e/poc-monaco-diff-theme.spec.ts`
Expected: Shows "3" (three tests)

### Step 4: Commit

Use `create-git-commit` skill to commit:
- Message: "test(monaco): add multiple toggle stability test for POC-2.2"

---

## Task 10 - Build and Preview

### Files
- None (verification task)

### Step 1: Clean and rebuild

```bash
rm -rf docs/.vitepress/dist docs/.vitepress/cache
npm run docs:build
```

Expected: Build succeeds with no errors

### Step 2: Start preview server

Run: `npm run docs:preview &`
Expected: Server starts on port 4173

### Step 3: Verify preview server responds

Run: `sleep 2 && curl -s http://localhost:4173/poc-monaco-diff-theme | grep -q "Monaco Diff Viewer POC-2.2" && echo "Page loads successfully" || echo "Page failed to load"`
Expected: "Page loads successfully"

### Step 4: Keep server running for tests

Expected: Preview server running in background

---

## Task 11 - Run Playwright Tests

### Files
- `test-results/` (VERIFY screenshots created)

### Step 1: Run POC-2.2 tests

Run: `npx playwright test tests/e2e/poc-monaco-diff-theme.spec.ts`
Expected: All 3 tests pass

### Step 2: Verify screenshots exist

Run: `ls -lh test-results/poc2.2-*.png`
Expected: 3 screenshot files created:
- poc2.2-initial-theme.png
- poc2.2-before-toggle.png
- poc2.2-after-toggle.png

### Step 3: Check test output for errors

Run: `npx playwright test tests/e2e/poc-monaco-diff-theme.spec.ts --reporter=line`
Expected: Shows 3 passing tests, 0 failed

### Step 4: Stop preview server

Run: `pkill -f "vitepress preview"`
Expected: Server stopped

---

## Task 12 - Manual Validation

### Files
- None (manual verification task)

### Step 1: Start dev server

Run: `npm run docs:dev`
Expected: Dev server starts on port 5173

### Step 2: Open browser and navigate

Navigate to: `http://localhost:5173/poc-monaco-diff-theme`
Expected: Page loads with diff editor

### Step 3: Verify initial theme matches VitePress

**Actions:**
1. Check VitePress theme toggle state (top right)
2. Observe diff editor background color
3. Verify they match:
   - Light mode: white/light gray editor background
   - Dark mode: dark gray/black editor background

Expected: Editor theme matches VitePress theme

### Step 4: Test theme toggle

**Actions:**
1. Open browser DevTools console
2. Click VitePress theme toggle button
3. Observe diff editor updates instantly
4. Check console for log: "[MonacoDiffTheme] Theme updated: vs" or "vs-dark"

Expected: Theme updates instantly, console shows log

### Step 5: Test multiple toggles

**Actions:**
1. Toggle theme 5 times rapidly
2. Verify no lag or visual glitches
3. Check console for 5 theme update logs
4. Verify no error messages in console

Expected: Smooth updates, no errors

### Step 6: Document manual test results

Create notes:

```text
Manual Validation Results:
- Initial theme detection: [PASS/FAIL]
- Theme toggle reactivity: [PASS/FAIL]
- Multiple toggle stability: [PASS/FAIL]
- Console logs present: [PASS/FAIL]
- No console errors: [PASS/FAIL]
```

### Step 7: Stop dev server

Run: `Ctrl+C` in terminal
Expected: Dev server stopped

---

## Task 13 - Document Results

### Files
- `docs/poc-monaco-diff-theme-results.md` (CREATE)

### Step 1: Create results document

```markdown
# POC-2.2 Results: Theme Synchronization

**Date:** 2025-01-06
**Status:** [PASS/FAIL - fill in after validation]

## Summary

[Write 2-3 sentences summarizing POC outcome]

## Test Results

| Test | Status | Evidence |
|------|--------|----------|
| Component detects initial theme | [PASS/FAIL] | [Screenshot/observation] |
| Theme toggles reactively | [PASS/FAIL] | [Screenshot/observation] |
| Multiple toggles stable | [PASS/FAIL] | [Playwright test result] |
| Console logs present | [PASS/FAIL] | [Browser console observation] |
| No console errors | [PASS/FAIL] | [Playwright test result] |
| TypeScript compiles | [PASS/FAIL] | [Build output] |
| Playwright tests pass | [PASS/FAIL] | [Test output] |

## Key Findings

1. **VitePress theme detection:** [Working/Not working - describe]
2. **Monaco theme updates:** [Working/Not working - describe]
3. **Watch pattern:** [Working/Not working - describe]
4. **Performance:** [Observations about speed, lag, etc.]

## Screenshots

- `test-results/poc2.2-initial-theme.png` - Initial theme state
- `test-results/poc2.2-before-toggle.png` - Before toggle
- `test-results/poc2.2-after-toggle.png` - After toggle

## Decision

**[PASS/FAIL]**

**If PASS:**
- VitePress theme detection works via `useData().isDark`
- Monaco theme updates reactively via `monaco.editor.setTheme()`
- Pattern identical to POC-2.1's validated `watch()` approach
- Ready to proceed to POC-3 or merge into main component

**If FAIL:**
- [Describe failure mode]
- [Describe pivot strategy]
- [Next steps]

## Next Steps

[Describe what comes next based on results]
```

Expected: Results document template created

### Step 2: Fill in results from validation

**Actions:**
1. Review Playwright test output
2. Review manual validation notes
3. Review screenshots
4. Fill in [PASS/FAIL] and descriptions

Expected: Complete results document

### Step 3: Commit

Use `create-git-commit` skill to commit:
- Message: "docs(monaco): add POC-2.2 validation results"

---

## Task 14 - Final Commit

### Files
- All modified files (VERIFY)

### Step 1: Verify all changes committed

Run: `git status`
Expected: Working tree clean or only results doc uncommitted

### Step 2: Review commit history

Run: `git log --oneline -10`
Expected: Shows commits from Tasks 1-13

### Step 3: Final commit if needed

If results doc not committed in Task 13, use `create-git-commit` skill:
- Message: "docs(monaco): finalize POC-2.2 documentation"

Expected: All POC-2.2 changes committed

---

## Validation Checklist

Before declaring POC-2.2 complete, verify:

- [ ] MonacoDiffTheme.vue created and compiles
- [ ] VitePress useData imported and isDark extracted
- [ ] monacoTheme computed property created
- [ ] Editor initialized with monacoTheme.value
- [ ] watch(monacoTheme, ...) callback added
- [ ] Test page created at docs/poc-monaco-diff-theme.md
- [ ] 3 Playwright tests written and passing
- [ ] 3 screenshots captured in test-results/
- [ ] Manual validation completed with documented results
- [ ] Results document created with pass/fail decision
- [ ] All changes committed

## Success Criteria

**POC-2.2 PASSES if:**
- ✅ Component detects initial VitePress theme (FR-4.1)
- ✅ Theme updates reactively when VitePress toggles (FR-4.2)
- ✅ Light and dark themes visually consistent (FR-4.3)
- ✅ All Playwright tests pass
- ✅ No console errors during theme switching
- ✅ Manual validation confirms instant updates

**POC-2.2 FAILS if:**
- ❌ Initial theme doesn't match VitePress
- ❌ Theme doesn't update on VitePress toggle
- ❌ Console errors appear during switching
- ❌ Visual glitches or lag during transitions

## Timeline

Estimated: 1-2 hours total

- Tasks 1-5 (Component): 30 min
- Task 6 (Test Page): 10 min
- Tasks 7-9 (Playwright): 20 min
- Tasks 10-11 (Build & Test): 15 min
- Task 12 (Manual): 15 min
- Tasks 13-14 (Docs): 20 min

## References

- Design Plan: [diff-view-monaco-poc2.2-theme-sync-design-plan.md](./diff-view-monaco-poc2.2-theme-sync-design-plan.md)
- Requirements: [diff-view-monaco-requirements.md - FR-4](./diff-view-monaco-requirements.md#^FR4)
- Research: [VitePress Theme Detection](./research/vitepress-theme-detection-2025.md)
- Research: [Monaco Theme API](./research/monaco-editor-theme-api-2025.md)
- Research: [Vue 3 Integration](./research/vue3-monaco-theme-integration-2025.md)
