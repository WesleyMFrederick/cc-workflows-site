# Monaco Diff Viewer POC-1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Validate Monaco Diff Editor loads in VitePress production builds and renders side-by-side diff view

**Architecture:** SSR-safe async component loading using `inBrowser` + `defineAsyncComponent`, Monaco's `createDiffEditor` API with hardcoded content, single Playwright validation test

**Tech Stack:** Monaco Editor, vite-plugin-monaco-editor, VitePress, Playwright

**Success Criteria:**
- Production build completes without errors
- Monaco diff editor renders with 2 side-by-side panes
- Playwright test passes validating DOM structure
- No Monaco-related console errors

---

## Task 1 - Install Monaco Dependencies

### Files
- `package.json` (MODIFY)

### Step 1: Install Monaco Editor and Vite plugin

```bash
npm install monaco-editor vite-plugin-monaco-editor
```

**Expected Output:**
- Dependencies added to `package.json`
- `node_modules/` updated with Monaco packages

### Step 2: Verify installation

```bash
npm list monaco-editor vite-plugin-monaco-editor
```

**Expected Output:**

```text
cc-workflows-site@1.0.0
├── monaco-editor@<version>
└── vite-plugin-monaco-editor@<version>
```

### Step 3: Commit dependency changes

Use `create-git-commit` skill to commit package.json changes

---

## Task 2 - Write Failing Playwright Test

### Files
- `tests/poc-monaco-diff.spec.ts` (CREATE & TEST)

### Step 1: Write the failing test

Create test file with complete validation logic:

```typescript
import { test, expect } from '@playwright/test'

test('Monaco diff editor renders side-by-side view in production', async ({ page }) => {
  // Navigate to POC page
  await page.goto('/poc-monaco-diff')

  // Verify diff editor container exists and is visible
  const diffEditor = page.locator('.monaco-diff-container')
  await expect(diffEditor).toBeVisible({ timeout: 5000 })

  // Verify side-by-side panes exist (original + modified)
  const editorPanes = page.locator('.monaco-editor')
  await expect(editorPanes).toHaveCount(2, { timeout: 5000 })

  // Capture screenshot for LLM evaluation of visual diff rendering
  await page.screenshot({
    path: 'test-results/poc-monaco-diff-visual.png',
    fullPage: true
  })
})
```

**Test Design Rationale:**
- **Timeout 5000ms**: Monaco async loading needs buffer time
- **2 panes check**: Validates diff editor initialized (not basic editor)
- **`.monaco-diff-container`**: Custom class we'll add to component
- **`.monaco-editor`**: Monaco's generated class for editor instances
- **Screenshot capture**: Saves visual output for LLM evaluation of diff rendering quality

### Step 2: Run test to verify it fails

First, start the dev server in background:

```bash
npm run docs:dev &
```

Wait for server to start (check for "ready in" message), then run test:

```bash
npx playwright test tests/poc-monaco-diff.spec.ts
```

**Expected Output:**

```text
✘ Monaco diff editor renders side-by-side view in production
  Error: page.goto: net::ERR_ABORTED at /poc-monaco-diff
```

**Why it fails:** Page doesn't exist yet

### Step 3: Stop dev server

```bash
# Find and kill the backgrounded npm process
pkill -f "vitepress dev"
```

### Step 4: Commit test

Use `create-git-commit` skill to commit test file

---

## Task 3 - Create Monaco Diff Component

### Files
- `docs/.vitepress/components/MonacoDiffBasic.vue` (CREATE)

### Step 1: Create components directory

```bash
mkdir -p docs/.vitepress/components
```

### Step 2: Write the Monaco diff component

```vue
<script setup>
import { ref, onMounted } from 'vue'
import * as monaco from 'monaco-editor'

const diffContainer = ref(null)

onMounted(async () => {
  // Create diff editor with read-only configuration (NFR-3.1)
  const diffEditor = monaco.editor.createDiffEditor(diffContainer.value, {
    readOnly: true,              // Prevents all editing
    originalEditable: false,     // Locks original (left) editor
    renderSideBySide: true,      // Side-by-side view (FR-1.1)
    enableSplitViewResizing: true, // Allow pane width adjustment
    renderOverviewRuler: true    // Show minimap overview
  })

  // Create models with hardcoded content for POC validation
  const originalModel = monaco.editor.createModel(
    `const x = 1;\nconst y = 2;\nconst z = 3;`,
    'javascript'
  )

  const modifiedModel = monaco.editor.createModel(
    `const x = 10;\nconst y = 2;\nconst z = 30;`,
    'javascript'
  )

  // Set models to diff editor
  diffEditor.setModel({
    original: originalModel,
    modified: modifiedModel
  })
})
</script>

<template>
  <div ref="diffContainer" class="monaco-diff-container" style="height: 400px; border: 1px solid #ccc;"></div>
</template>
```

**Implementation Notes:**
- **`readOnly: true`**: Satisfies NFR-3.1 (read-only requirement)
- **`renderSideBySide: true`**: Satisfies FR-1.1 (side-by-side layout)
- **Hardcoded content**: Validates render capability before adding props (POC scope)
- **Height 400px**: Sufficient for visual validation
- **Border**: Makes container visible during manual testing

### Step 3: Verify file created

```bash
ls -la docs/.vitepress/components/MonacoDiffBasic.vue
```

**Expected Output:**

```text
-rw-r--r--  1 user  staff  1234 Jan  6 10:30 MonacoDiffBasic.vue
```

### Step 4: Commit component

Use `create-git-commit` skill to commit component file

---

## Task 4 - Create POC Test Page

### Files
- `docs/poc-monaco-diff.md` (CREATE)

### Step 1: Write the test page with SSR-safe loading

Create markdown file with inline component:

```markdown
---
layout: doc
---

# Monaco Diff Viewer POC

This page validates Monaco diff editor integration with VitePress.

<script setup>
import { defineAsyncComponent } from 'vue'
import { inBrowser } from 'vitepress'

const MonacoDiffBasic = inBrowser
  ? defineAsyncComponent(() => import('./.vitepress/components/MonacoDiffBasic.vue'))
  : () => null
</script>

<ClientOnly>
  <MonacoDiffBasic />
</ClientOnly>
```

**SSR Safety Pattern (NFR-7.2):**
- **`inBrowser` check**: Prevents Monaco import during SSR build
- **`defineAsyncComponent`**: Lazy loads Monaco only in browser (NFR-1.1)
- **`ClientOnly` wrapper**: VitePress directive for client-side-only rendering
- **Conditional import**: Returns null during SSR, loads component in browser

### Step 2: Verify file created

```bash
cat docs/poc-monaco-diff.md | head -5
```

**Expected Output:**

```markdown
---
layout: doc
---

# Monaco Diff Viewer POC
```

### Step 3: Commit test page

Use `create-git-commit` skill to commit markdown file

---

## Task 5 - Update VitePress Configuration

### Files
- `docs/.vitepress/config.mts` (MODIFY)

### Step 1: Add Monaco plugin import

At the top of the file, add:

```typescript
import monacoEditorPlugin from 'vite-plugin-monaco-editor'
```

### Step 2: Add Vite configuration for Monaco

Add `vite` configuration block inside `defineConfig`:

```typescript
export default defineConfig({
  // ... existing config (title, description, themeConfig)

  vite: {
    ssr: {
      noExternal: ['monaco-editor']  // Required for Monaco in VitePress SSR
    },
    plugins: [
      monacoEditorPlugin({
        languageWorkers: ['editorWorkerService', 'typescript'],
        publicPath: 'monacoeditorwork'
      })
    ]
  }
})
```

**Configuration Rationale:**
- **`ssr.noExternal`**: Tells Vite to bundle Monaco during SSR (prevents import errors)
- **`languageWorkers`**: Minimal worker set (editorWorkerService + typescript for JS highlighting)
- **`publicPath`**: Custom path for Monaco web workers (avoids conflicts)

### Step 3: Verify syntax

```bash
npm run docs:build 2>&1 | head -20
```

Check for "building client + server bundles" message (indicates config is valid).

### Step 4: Commit configuration

Use `create-git-commit` skill to commit config changes

---

## Task 6 - Run Test to Verify Implementation

### Files
- `tests/poc-monaco-diff.spec.ts` (TEST)

### Step 1: Build production version

```bash
npm run docs:build
```

**Expected Output:**

```text
✓ building client + server bundles...
✓ rendering pages...
build complete in X.XXs
```

**Watch for errors:**
- ❌ "ReferenceError: document is not defined" = SSR leak (Monaco loaded during SSR)
- ❌ "Module not found: monaco-editor" = Missing dependency or config issue
- ✅ No errors = SSR-safe loading working

### Step 2: Start preview server in background

```bash
npm run docs:preview > /tmp/vitepress-preview.log 2>&1 &
PREVIEW_PID=$!
echo "Preview server PID: $PREVIEW_PID"
```

Wait 3 seconds for server startup:

```bash
sleep 3
```

### Step 3: Run Playwright test

```bash
npx playwright test tests/poc-monaco-diff.spec.ts --reporter=line
```

**Expected Output:**

```text
✓ Monaco diff editor renders side-by-side view in production (XXXms)

1 passed (Xs)
```

**Test will also generate:**
- Screenshot: `test-results/poc-monaco-diff-visual.png` (for LLM evaluation of diff rendering)

**If test fails, check:**
1. Container not visible = Monaco not loading (check browser console)
2. Only 1 pane = Basic editor created instead of diff editor
3. Timeout = Monaco async loading taking too long (increase timeout)

### Step 4: Stop preview server

```bash
kill $PREVIEW_PID
```

---

## Task 7 - Manual Visual Validation

### Files
- None (manual testing)

### Step 1: Start dev server

```bash
npm run docs:dev
```

**Expected Output:**

```text
  vitepress v2.x.x

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Step 2: Open browser and navigate

Open <http://localhost:5173/poc-monaco-diff> in your browser.

### Step 3: Visual validation checklist

Verify these metrics from the design plan:

| Metric | Target | How to Verify |
|--------|--------|---------------|
| Diff editor DOM renders | `.monaco-diff-editor` visible | Browser DevTools > Elements > Search for class |
| Side-by-side panes exist | 2 `.monaco-editor` elements | DevTools > Elements > Count instances |
| Diff highlighting visible | Red/green indicators between panes | Visual inspection of rendered diff |
| No console errors | Clean console | DevTools > Console (should be empty) |

**Expected Visual Result:**
- Left pane: `const x = 1;` `const y = 2;` `const z = 3;`
- Right pane: `const x = 10;` (red highlight) `const y = 2;` `const z = 30;` (red highlight)
- Diff gutter showing change indicators between panes
- Both panes scrollable independently

### Step 4: Stop dev server

Press `Ctrl+C` in terminal to stop server.

---

## Task 8 - Document POC Results

### Files
- `docs/poc-monaco-diff-results.md` (CREATE)

### Step 1: Create results document

```markdown
# POC-1: Monaco Diff Viewer - Results

**Date:** [Current Date]
**Status:** [PASS/FAIL]

## Success Metrics

| Metric | Target | Result | Status |
|--------|--------|--------|--------|
| Production build completes | Exit code 0 | [Exit code] | [✅/❌] |
| Diff editor DOM renders | `.monaco-diff-editor` visible | [Yes/No] | [✅/❌] |
| Side-by-side panes exist | 2 `.monaco-editor` elements | [Count] | [✅/❌] |
| Diff highlighting visible | Visual indicators present | [Yes/No] | [✅/❌] |
| Playwright test passes | Green status | [Pass/Fail] | [✅/❌] |
| Console errors | None | [Error count] | [✅/❌] |

## Screenshots

[Add screenshots of rendered diff editor]

## Next Steps

**If POC PASSED:**
- Proceed to POC-2: Props-based content and theme synchronization
- Confidence level: HIGH for full implementation

**If POC FAILED:**
- Document failure mode (SSR error / render failure / diff not loading)
- Evaluate pivot to diff2html alternative
- Update requirements document with revised approach
```

### Step 2: Fill in actual results

Replace placeholders with actual test results from Tasks 6-7.

### Step 3: Commit results document

Use `create-git-commit` skill to commit results file

---

## Verification Checklist

Before marking POC complete, verify:

- [ ] `npm run docs:build` completes with exit code 0
- [ ] Production preview shows Monaco diff editor at `/poc-monaco-diff`
- [ ] Playwright test passes: `npx playwright test tests/poc-monaco-diff.spec.ts`
- [ ] Browser DevTools shows 2 `.monaco-editor` instances
- [ ] Visual diff highlighting visible (red/green change indicators)
- [ ] No Monaco-related errors in browser console
- [ ] Results documented in `docs/poc-monaco-diff-results.md`
- [ ] All changes committed to Git

## Troubleshooting Guide

### Build Fails with "document is not defined"

**Problem:** Monaco importing during SSR build

**Solution:** Verify `inBrowser` check in `poc-monaco-diff.md`:

```vue
const MonacoDiffBasic = inBrowser
  ? defineAsyncComponent(...)
  : () => null  // Must return null for SSR
```

### Test Shows Only 1 Editor Pane

**Problem:** `createDiffEditor` not called or failed silently

**Solution:**
1. Check browser console for Monaco errors
2. Verify `createDiffEditor` (not `create`) in `MonacoDiffBasic.vue`
3. Verify models set correctly: `diffEditor.setModel({ original, modified })`

### Monaco Container Not Visible

**Problem:** Component not rendering or CSS issue

**Solution:**
1. Check `ClientOnly` wrapper in markdown
2. Verify component import path: `./.vitepress/components/MonacoDiffBasic.vue`
3. Check container has height: `style="height: 400px"`

### Playwright Timeout

**Problem:** Monaco taking >5s to load

**Solution:**
1. Increase timeout in test: `{ timeout: 10000 }`
2. Check network tab for slow Monaco chunk downloads
3. Verify Monaco workers loading correctly

---

## Time Estimate

**Total:** 60-90 minutes

| Task | Estimated Time |
|------|----------------|
| Task 1: Install dependencies | 5 min |
| Task 2: Write failing test | 10 min |
| Task 3: Create component | 10 min |
| Task 4: Create test page | 5 min |
| Task 5: Update config | 10 min |
| Task 6: Run tests | 10 min |
| Task 7: Manual validation | 10 min |
| Task 8: Document results | 10 min |

**Buffer:** 30 min for troubleshooting if needed
