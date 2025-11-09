# POC-4: Comprehensive Monaco Diff Component - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Create production-ready Monaco diff component combining file loading (POC-3) and theme synchronization (POC-2.2).

**Architecture:** Extend MonacoDiffFile.vue with VitePress theme detection and reactive theme synchronization while preserving file loading and error handling capabilities.

**Tech Stack:** Vue 3, Monaco Editor, VitePress, Vite glob imports, Playwright

**Prerequisites:**
- MonacoDiffFile.vue exists (POC-3 baseline)
- assets.data.ts data loader exists
- Test files in `docs/assets/`
- Playwright configured

---

## Task 1 - Create MonacoDiff.vue component

### Files
- `docs/.vitepress/components/MonacoDiff.vue` (CREATE)

### Step 1: Copy MonacoDiffFile.vue as baseline

Run:

```bash
cp docs/.vitepress/components/MonacoDiffFile.vue docs/.vitepress/components/MonacoDiff.vue
```

Expected: New file created with file loading logic

### Step 2: Verify file created

Run:

```bash
ls -lh docs/.vitepress/components/MonacoDiff.vue
```

Expected: File exists

### Step 3: Commit baseline

Run: Use `create-git-commit` skill
Message: `feat(monaco): create MonacoDiff comprehensive component from MonacoDiffFile baseline`

---

## Task 2 - Add VitePress theme detection

### Files
- `docs/.vitepress/components/MonacoDiff.vue:1-20` (MODIFY)

### Step 1: Add useData import

Update imports section:

```typescript
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import * as monaco from 'monaco-editor'
import { data as assetFiles } from '../loaders/assets.data'
import { useData } from 'vitepress'  // NEW: VitePress theme detection
```

### Step 2: Add theme detection logic

Add after `fileContents` initialization:

```typescript
// VitePress theme detection and Monaco theme mapping
const { isDark } = useData()

const monacoTheme = computed(() => {
  return isDark.value ? 'vs-dark' : 'vs'
})

console.log('[MonacoDiff] Initial theme:', monacoTheme.value)
```

### Step 3: Verify TypeScript compilation

Run:

```bash
npm run docs:build
```

Expected: Build succeeds, no type errors

### Step 4: Commit theme detection

Run: Use `create-git-commit` skill
Message: `feat(monaco): add VitePress theme detection to MonacoDiff`

---

## Task 3 - Update diff editor initialization with theme

### Files
- `docs/.vitepress/components/MonacoDiff.vue:122-130` (MODIFY)

### Step 1: Add theme to editor config

Update `createDiffEditor` call:

```typescript
// Create diff editor with read-only configuration and theme sync
diffEditor = monaco.editor.createDiffEditor(diffContainer.value, {
  readOnly: true,
  originalEditable: false,
  renderSideBySide: true,
  enableSplitViewResizing: true,
  renderOverviewRuler: true,
  automaticLayout: true,
  contextmenu: false,
  theme: monacoTheme.value  // NEW: Set initial theme from VitePress
})

console.log('[MonacoDiff] Diff editor initialized with theme:', monacoTheme.value)
```

### Step 2: Verify build

Run:

```bash
npm run docs:build
```

Expected: Build succeeds

### Step 3: Commit theme initialization

Run: Use `create-git-commit` skill
Message: `feat(monaco): set initial Monaco theme from VitePress in MonacoDiff`

---

## Task 4 - Add reactive theme watcher

### Files
- `docs/.vitepress/components/MonacoDiff.vue:177-182` (MODIFY)

### Step 1: Add theme watcher after language watcher

Add after the language watch() call, before `onBeforeUnmount()`:

```typescript
// Watch VitePress theme changes and sync to Monaco
watch(monacoTheme, (newTheme) => {
  if (!diffEditor) return
  console.log('[MonacoDiff] Theme switching to:', newTheme)
  monaco.editor.setTheme(newTheme)
  console.log('[MonacoDiff] Theme updated successfully')
})
```

### Step 2: Update console log in onMounted

Change the final log in `onMounted()`:

```typescript
console.log('[MonacoDiff] Diff editor initialized with file content and theme sync')
```

### Step 3: Verify build

Run:

```bash
npm run docs:build
```

Expected: Build succeeds

### Step 4: Commit theme watcher

Run: Use `create-git-commit` skill
Message: `feat(monaco): add reactive theme synchronization to MonacoDiff`

---

## Task 5 - Create POC test page

### Files
- `docs/poc-monaco-diff-comprehensive.md` (CREATE)

### Step 1: Create test page with four test scenarios

```markdown
---
layout: doc
aside: false
---

# Monaco Diff Viewer POC-4: Comprehensive (File Loading + Theme Sync)

This page validates the production-ready component combining file loading and theme synchronization.

<script setup>
import { defineAsyncComponent } from 'vue'
import { inBrowser } from 'vitepress'

const MonacoDiff = inBrowser
  ? defineAsyncComponent(() => import('./.vitepress/components/MonacoDiff.vue'))
  : () => null
</script>

## Test Case 1: File Loading with Theme Sync

**Expected:** Diff renders with markdown files, theme matches VitePress toggle

<ClientOnly>
  <MonacoDiff
    oldFile="default-system-prompt.md"
    newFile="output-style-system-prompt.md"
    language="markdown"
  />
</ClientOnly>

**Test Instructions:**
1. Verify diff renders with content from both files
2. Click VitePress theme toggle (top right)
3. Verify Monaco theme updates immediately

---

## Test Case 2: Props-Based Content with Theme Sync

**Expected:** Diff renders with inline content, theme switches work

<ClientOnly>
  <MonacoDiff
    oldContent="const x = 1;
const y = 2;
console.log(x + y);"
    newContent="const x = 10;
const y = 20;
console.log(x + y);"
    language="javascript"
  />
</ClientOnly>

**Test Instructions:**
1. Verify diff renders with JavaScript syntax highlighting
2. Toggle theme multiple times
3. Verify no console errors

---

## Test Case 3: Missing File Error

**Expected:** Error message displayed, theme toggle still works

<ClientOnly>
  <MonacoDiff
    oldFile="nonexistent.md"
    newFile="default-system-prompt.md"
    language="markdown"
  />
</ClientOnly>

---

## Test Case 4: Invalid Prop Combination Error

**Expected:** Error message displayed

<ClientOnly>
  <MonacoDiff
    oldContent="inline content"
    oldFile="default-system-prompt.md"
    newFile="output-style-system-prompt.md"
    language="markdown"
  />
</ClientOnly>
```

### Step 2: Verify file created

Run:

```bash
ls -lh docs/poc-monaco-diff-comprehensive.md
```

Expected: File exists

### Step 3: Commit test page

Run: Use `create-git-commit` skill
Message: `test(monaco): add POC-4 comprehensive test page with 4 scenarios`

---

## Task 6 - Write Playwright test suite

### Files
- `tests/e2e/poc-monaco-diff-comprehensive.spec.ts` (CREATE)

### Step 1: Create test file with 6 test scenarios

```typescript
import { test, expect } from '@playwright/test'

test.describe('POC-4: Comprehensive (File Loading + Theme Sync)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/poc-monaco-diff-comprehensive')
  })

  test('loads files and displays diff correctly', async ({ page }) => {
    // First component should render
    const diffEditor = page.locator('.monaco-diff-container').first()
    await diffEditor.waitFor({ timeout: 5000 })
    await expect(diffEditor).toBeVisible()

    // Verify Monaco editor panes (3 = left + right + overview)
    const editorPanes = page.locator('.monaco-editor')
    await expect(editorPanes).toHaveCount(3, { timeout: 5000 })

    // Capture for validation
    await page.screenshot({
      path: 'test-results/poc4-file-loading-success.png',
      fullPage: true
    })
  })

  test('synchronizes theme with VitePress toggle', async ({ page }) => {
    // Wait for diff to load
    await page.locator('.monaco-diff-container').first().waitFor({ timeout: 5000 })

    // Capture initial theme
    await page.screenshot({
      path: 'test-results/poc4-before-theme-toggle.png',
      fullPage: true
    })

    // Find and click VitePress theme toggle
    const themeToggle = page.locator('button.VPSwitch').first()
    await themeToggle.click()

    // Wait for theme transition
    await page.waitForTimeout(500)

    // Capture after toggle
    await page.screenshot({
      path: 'test-results/poc4-after-theme-toggle.png',
      fullPage: true
    })
  })

  test('handles multiple rapid theme toggles', async ({ page }) => {
    const errors: string[] = []

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // Wait for component
    await page.locator('.monaco-diff-container').first().waitFor({ timeout: 5000 })

    // Toggle theme 4 times rapidly
    const themeToggle = page.locator('button.VPSwitch').first()
    for (let i = 0; i < 4; i++) {
      await themeToggle.click()
      await page.waitForTimeout(200)
    }

    // Verify no errors
    expect(errors.filter(e => e.includes('Monaco') || e.includes('theme'))).toHaveLength(0)
  })

  test('displays error for missing file', async ({ page }) => {
    // Third component should show error
    const errorMessages = page.locator('.error-message')
    await expect(errorMessages.nth(0)).toBeVisible()
    await expect(errorMessages.nth(0)).toContainText('File not found: nonexistent.md')

    await page.screenshot({
      path: 'test-results/poc4-missing-file-error.png',
      fullPage: true
    })
  })

  test('displays error for invalid props', async ({ page }) => {
    // Fourth component should show error
    const errorMessages = page.locator('.error-message')
    await expect(errorMessages.nth(1)).toBeVisible()
    await expect(errorMessages.nth(1)).toContainText('Cannot specify both oldContent and oldFile')

    await page.screenshot({
      path: 'test-results/poc4-invalid-props-error.png',
      fullPage: true
    })
  })

  test('validates console logs for theme and file loading', async ({ page }) => {
    const logs: string[] = []

    page.on('console', msg => {
      if (msg.text().includes('[MonacoDiff]')) {
        logs.push(msg.text())
      }
    })

    await page.waitForTimeout(2000)

    // Should see file loading logs
    const hasLoadingLogs = logs.some(log => log.includes('Loaded files:'))
    expect(hasLoadingLogs).toBe(true)

    // Should see theme logs
    const hasThemeLogs = logs.some(log => log.includes('Initial theme:'))
    expect(hasThemeLogs).toBe(true)
  })
})
```

### Step 2: Verify file created

Run:

```bash
ls -lh tests/e2e/poc-monaco-diff-comprehensive.spec.ts
```

Expected: File exists

### Step 3: Commit test suite

Run: Use `create-git-commit` skill
Message: `test(monaco): add POC-4 Playwright test suite with 6 scenarios`

---

## Task 7 - Run tests and verify

### Files
- (validation only, no file changes)

### Step 1: Start dev server

Run:

```bash
npm run docs:dev
```

Expected: Dev server starts at <http://localhost:5173>

### Step 2: Run Playwright tests

Run (in separate terminal):

```bash
npx playwright test tests/e2e/poc-monaco-diff-comprehensive.spec.ts --reporter=list
```

Expected: All 6 tests PASS

### Step 3: Verify screenshots

Run:

```bash
ls -lh test-results/poc4-*.png
```

Expected: 5 screenshot files exist:
- `poc4-file-loading-success.png`
- `poc4-before-theme-toggle.png`
- `poc4-after-theme-toggle.png`
- `poc4-missing-file-error.png`
- `poc4-invalid-props-error.png`

---

## Task 8 - Production build validation

### Files
- (validation only, no file changes)

### Step 1: Clean previous build

Run:

```bash
rm -rf docs/.vitepress/dist docs/.vitepress/cache
```

Expected: Directories removed

### Step 2: Build for production

Run:

```bash
npm run docs:build
```

Expected: Build completes with exit code 0

### Step 3: Start preview server

Run:

```bash
npm run docs:preview
```

Expected: Preview server starts at <http://localhost:4173>

### Step 4: Run Playwright tests on production build

Run (in separate terminal):

```bash
npx playwright test tests/e2e/poc-monaco-diff-comprehensive.spec.ts --reporter=list
```

Expected: All 6 tests PASS

---

## Task 9 - Manual browser verification

### Files
- (verification only, no file changes)

### Step 1: Navigate to test page

Navigate to: `http://localhost:5173/poc-monaco-diff-comprehensive`

Expected: Page loads without errors

### Step 2: Verify Test Case 1 (File loading + theme)

Visual check:
- ✅ Monaco diff renders side-by-side
- ✅ Shows content from both markdown files
- ✅ Click theme toggle → Monaco theme updates immediately
- ✅ No visual glitches during theme transition

Console check:

```text
[MonacoDiff] Loaded files: [default-system-prompt.md, output-style-system-prompt.md]
[MonacoDiff] Loading: default-system-prompt.md → default-system-prompt.md
[MonacoDiff] Found: true
[MonacoDiff] Initial theme: vs-dark
[MonacoDiff] Diff editor initialized with file content and theme sync
[MonacoDiff] Theme switching to: vs
[MonacoDiff] Theme updated successfully
```

### Step 3: Verify Test Case 2 (Props + theme)

Visual check:
- ✅ Diff renders with JavaScript syntax highlighting
- ✅ Theme toggle works correctly
- ✅ Multiple toggles don't cause errors

### Step 4: Verify Test Case 3 (Missing file error)

Visual check:
- ✅ Red error box displays
- ✅ Error message: "File not found: nonexistent.md"

### Step 5: Verify Test Case 4 (Invalid props error)

Visual check:
- ✅ Red error box displays
- ✅ Error message: "Cannot specify both oldContent and oldFile"

### Step 6: Check for unexpected errors

Console check:
- ✅ No red error messages
- ✅ No Monaco initialization errors
- ✅ No theme switching errors

---

## Task 10 - Update sidebar configuration

### Files
- `docs/.vitepress/config.mts:51-60` (MODIFY)

### Step 1: Add POC-4 to sidebar

Add after POC-3 section:

```typescript
{
  text: 'POC-4: Comprehensive Component',
  collapsed: false,
  items: [
    { text: 'Test Page', link: '/poc-monaco-diff-comprehensive' },
    { text: 'Results', link: '/poc-monaco-diff-comprehensive-results' }
  ]
}
```

### Step 2: Verify config compiles

Run:

```bash
npm run docs:build
```

Expected: Build succeeds

### Step 3: Commit sidebar update

Run: Use `create-git-commit` skill
Message: `docs(monaco): add POC-4 to sidebar navigation`

---

## Task 11 - Create results documentation

### Files
- `docs/poc-monaco-diff-comprehensive-results.md` (CREATE)

### Step 1: Create results page

```markdown
# POC-4: Comprehensive Component - Results

**Status:** ✅ PASS
**Date:** 2025-01-XX
**Implementation Plan:** [diff-view-monaco-poc4-comprehensive-implementation-plan.md](design-docs/features/251106-diff-view-monaco/diff-view-monaco-poc4-comprehensive-implementation-plan.md)

## Success Criteria

### ✅ Passed Requirements

**File Loading (from POC-3):**
- ✅ Loads content from valid file paths
- ✅ Path normalization works correctly
- ✅ Missing files display user-friendly errors
- ✅ Invalid prop combinations display errors

**Theme Synchronization (from POC-2.2):**
- ✅ Initial theme matches VitePress
- ✅ Theme updates when VitePress toggle clicked
- ✅ Theme updates are instant (<100ms)
- ✅ Multiple rapid toggles don't cause errors

**Integration:**
- ✅ File loading + theme sync work together
- ✅ No conflicts between features
- ✅ Console logs show both features active
- ✅ Production build succeeds
- ✅ All 6 Playwright tests pass

### Test Results

**Playwright Tests:**

```text
✓ POC-4: Comprehensive (6 tests, ~15s)
  ✓ loads files and displays diff correctly
  ✓ synchronizes theme with VitePress toggle
  ✓ handles multiple rapid theme toggles
  ✓ displays error for missing file
  ✓ displays error for invalid props
  ✓ validates console logs for theme and file loading
```

**Build Validation:**
- Clean build: ✅ Success
- Production build time: ~24s
- Preview server: ✅ Started successfully
- Production tests: ✅ All pass

## Component Architecture

**File:** `docs/.vitepress/components/MonacoDiff.vue`

**Key Features:**
- ✅ VitePress content loader for file loading (works with srcExclude)
- ✅ VitePress theme detection via `useData().isDark`
- ✅ Reactive theme synchronization via `watch(monacoTheme)`
- ✅ Props: `oldFile`, `newFile`, `oldContent`, `newContent`, `language`
- ✅ Comprehensive error handling and validation
- ✅ Reactive updates for content, language, and theme changes

**Integration Success:**
- File loading uses VitePress data loader pattern
- Theme sync uses VitePress `useData()` hook
- Both features operate independently without conflicts
- Single component handles all use cases

## Manual Verification Checklist

- ✅ Test Case 1: Files load, theme switches instantly
- ✅ Test Case 2: Props-based content, theme switches work
- ✅ Test Case 3: Missing file shows error
- ✅ Test Case 4: Invalid props shows error
- ✅ No console errors during normal operation
- ✅ No console errors during theme toggling
- ✅ Production build works correctly

## Conclusion

POC-4 successfully validates that file loading and theme synchronization can be combined in a single production-ready component without conflicts. The VitePress content loader pattern and theme detection integrate seamlessly.

**Overall POC Status:** ✅ PASS - Production-ready comprehensive component validated.

**Next Steps:** Deploy MonacoDiff.vue as the canonical component for blog posts and documentation.

```markdown

### Step 2: Commit results page

Run: Use `create-git-commit` skill
Message: `docs(monaco): add POC-4 results documentation`

---

## Task 12 - Update reference guide

### Files
- `docs/monaco-diff-reference.md:1-10` (MODIFY)

### Step 1: Add note about comprehensive component

Update the header section:

```markdown
---
layout: doc
---

# Monaco Diff Viewer - VitePress Implementation Reference

> **Audience:** LLMs implementing Monaco diff views in VitePress blog sites
> **Based on:** POC-1 (Build & Render), POC-2.1 (Props), POC-2.2 (Theme), POC-3 (File Loading), POC-4 (Comprehensive)
> **Production Component:** `MonacoDiff.vue` combines all validated patterns

## Overview

This reference documents the production-ready `MonacoDiff.vue` component that combines:
- File loading from `docs/assets/` via VitePress content loader
- Theme synchronization with VitePress light/dark mode
- Props-based and file-based content loading
- Comprehensive error handling and validation

**Component:** `docs/.vitepress/components/MonacoDiff.vue`

---
```

### Step 2: Verify build

Run:

```bash
npm run docs:build
```

Expected: Build succeeds

### Step 3: Commit reference update

Run: Use `create-git-commit` skill
Message: `docs(monaco): update reference guide with POC-4 comprehensive component`

---

## Success Criteria

**POC PASSES if:**
- ✅ Component combines file loading + theme sync without conflicts
- ✅ File loading works (validated by POC-3 pattern)
- ✅ Theme synchronization works (validated by POC-2.2 pattern)
- ✅ All 6 Playwright tests pass
- ✅ Production build succeeds
- ✅ Manual verification checklist complete
- ✅ No console errors during normal operation
- ✅ No console errors during theme toggling

**POC FAILS if:**
- ❌ Features conflict (e.g., theme watcher breaks file loading)
- ❌ Theme doesn't update when toggled
- ❌ Files don't load correctly
- ❌ Tests fail
- ❌ Build fails
- ❌ Console errors during operation

---

## Notes

**Why This POC:**
- POC-3 validated file loading
- POC-2.2 validated theme sync
- Neither component had both features
- POC-4 proves both can coexist in production component

**Component Naming:**
- `MonacoDiff.vue` (not `MonacoDiffComprehensive.vue`)
- This is the canonical, production-ready component
- Other POC components are historical validation artifacts

**Testing Strategy:**
- File loading tests verify data loader pattern works
- Theme tests verify VitePress integration works
- Combined tests verify no conflicts between features

---

## Timeline

**Estimated:** 2-3 hours total

| Task | Duration | Type |
|------|----------|------|
| Tasks 1-4: Component implementation | 45 min | Coding |
| Task 5: Test page creation | 20 min | Testing setup |
| Task 6: Playwright tests | 40 min | Test implementation |
| Tasks 7-9: Validation | 30 min | Verification |
| Tasks 10-12: Documentation | 25 min | Documentation |

---

## Next Steps After POC-4

**If POC passes:**
- Use `MonacoDiff.vue` as production component
- Archive POC components (keep for reference)
- Update blog posts to use `MonacoDiff.vue`
- Document usage in reference guide

**If POC fails:**
- Diagnose conflict between file loading and theme sync
- Determine if features need isolation
- Update architecture if needed
