# POC-3: Monaco Diff File Loading - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Validate Monaco diff component can load content from file paths in `docs/` directory using Vite's build-time glob imports.

**Architecture:** Extend MonacoDiffBasic.vue with file path props (`oldFile`, `newFile`), use `import.meta.glob('/docs/**/*.md', { eager: true, query: '?raw' })` for build-time loading, normalize user paths (`assets/file.md`) to glob keys (`/docs/assets/file.md`), display user-friendly errors for missing files or invalid prop combinations.

**Tech Stack:** Vue 3, Monaco Editor, Vite glob imports, VitePress, Playwright

**Prerequisites:**
- Existing MonacoDiffBasic.vue component (POC-1)
- Test files exist at `docs/assets/default-system-prompt.md` and `docs/assets/output-style-system-prompt.md`
- Playwright configured for E2E testing

---

## Task 1 - Create MonacoDiffFile.vue component

### Files
- `docs/.vitepress/components/MonacoDiffFile.vue` (CREATE)

### Step 1: Copy MonacoDiffBasic.vue as starting point

Run:

```bash
cp docs/.vitepress/components/MonacoDiffBasic.vue docs/.vitepress/components/MonacoDiffFile.vue
```

Expected: New file created

### Step 2: Verify file created

Run:

```bash
ls -lh docs/.vitepress/components/MonacoDiffFile.vue
```

Expected: File exists with same size as MonacoDiffBasic.vue

### Step 3: Commit baseline

Run: Use `create-git-commit` skill
Message: `feat(monaco): create MonacoDiffFile component from MonacoDiffBasic baseline`

---

## Task 2 - Add file loading infrastructure

### Files
- `docs/.vitepress/components/MonacoDiffFile.vue` (MODIFY)

### Step 1: Add glob import at module top

Add after existing imports, before `<script setup>` content:

```typescript
// Load all markdown files at build time
const fileContents = import.meta.glob('/docs/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>

console.log('[MonacoDiffFile] Loaded files:', Object.keys(fileContents))
```

### Step 2: Build to verify glob works

Run:

```bash
npm run docs:build
```

Expected: Build succeeds, no errors about import.meta.glob

### Step 3: Check console in dev mode

Run:

```bash
npm run docs:dev
```

Navigate to: `http://localhost:5173/poc-monaco-diff`

Expected: Browser console shows `[MonacoDiffFile] Loaded files:` with array of paths like `["/docs/assets/default-system-prompt.md", ...]`

### Step 4: Commit glob import

Run: Use `create-git-commit` skill
Message: `feat(monaco): add build-time file loading with glob import`

---

## Task 3 - Add file path props

### Files
- `docs/.vitepress/components/MonacoDiffFile.vue:1-20` (MODIFY)

### Step 1: Update Props interface

Replace the current hardcoded setup with:

```typescript
interface Props {
  oldContent?: string
  newContent?: string
  oldFile?: string      // NEW: File path relative to docs/
  newFile?: string      // NEW: File path relative to docs/
  language?: string
}

const props = withDefaults(defineProps<Props>(), {
  language: 'markdown'  // Changed default for file loading
})
```

### Step 2: Verify TypeScript compilation

Run:

```bash
npm run docs:build
```

Expected: TypeScript compilation succeeds, no type errors

### Step 3: Commit props addition

Run: Use `create-git-commit` skill
Message: `feat(monaco): add oldFile/newFile props for file path loading`

---

## Task 4 - Add file path normalization functions

### Files
- `docs/.vitepress/components/MonacoDiffFile.vue` (MODIFY)

### Step 1: Add normalization functions after props definition

```typescript
// Normalize user-provided path to match glob keys
function normalizeFilePath(path: string): string {
  if (!path.startsWith('/docs/')) {
    return `/docs/${path}`
  }
  return path
}

// Load file content from glob map
function loadFileContent(path: string): string | null {
  const normalizedPath = normalizeFilePath(path)
  console.log('[MonacoDiffFile] Loading:', path, '→', normalizedPath)
  const content = fileContents[normalizedPath]
  console.log('[MonacoDiffFile] Found:', content !== undefined)
  return content ?? null
}
```

### Step 2: Verify functions compile

Run:

```bash
npm run docs:build
```

Expected: Build succeeds, no TypeScript errors

### Step 3: Commit normalization functions

Run: Use `create-git-commit` skill
Message: `feat(monaco): add file path normalization and loading functions`

---

## Task 5 - Add contentOrError computed property

### Files
- `docs/.vitepress/components/MonacoDiffFile.vue` (MODIFY)

### Step 1: Import computed from vue

Update imports line:

```typescript
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
```

### Step 2: Add contentOrError computed after loading functions

```typescript
// Content loading with validation and error handling
const contentOrError = computed(() => {
  let oldContentValue = ''
  let newContentValue = ''
  let errorMessage: string | null = null

  // Validate old content source
  if (props.oldContent && props.oldFile) {
    errorMessage = 'Cannot specify both oldContent and oldFile'
  } else if (!props.oldContent && !props.oldFile) {
    errorMessage = 'Must specify either oldContent or oldFile'
  } else if (props.oldContent) {
    oldContentValue = props.oldContent
  } else if (props.oldFile) {
    const content = loadFileContent(props.oldFile)
    if (content === null) {
      errorMessage = `File not found: ${props.oldFile} (looked for: ${normalizeFilePath(props.oldFile)})`
    } else {
      oldContentValue = content
    }
  }

  // Validate new content source
  if (!errorMessage) {
    if (props.newContent && props.newFile) {
      errorMessage = 'Cannot specify both newContent and newFile'
    } else if (!props.newContent && !props.newFile) {
      errorMessage = 'Must specify either newContent or newFile'
    } else if (props.newContent) {
      newContentValue = props.newContent
    } else if (props.newFile) {
      const content = loadFileContent(props.newFile)
      if (content === null) {
        errorMessage = `File not found: ${props.newFile} (looked for: ${normalizeFilePath(props.newFile)})`
      } else {
        newContentValue = content
      }
    }
  }

  return { oldContent: oldContentValue, newContent: newContentValue, error: errorMessage }
})
```

### Step 3: Verify computed property compiles

Run:

```bash
npm run docs:build
```

Expected: Build succeeds, no TypeScript errors

### Step 4: Commit contentOrError computed

Run: Use `create-git-commit` skill
Message: `feat(monaco): add contentOrError computed with validation logic`

---

## Task 6 - Update component initialization

### Files
- `docs/.vitepress/components/MonacoDiffFile.vue` (MODIFY)

### Step 1: Update onMounted to check for errors

Replace the `onMounted` function:

```typescript
onMounted(() => {
  if (!diffContainer.value || contentOrError.value.error) {
    console.log('[MonacoDiffFile] Skipping initialization:', contentOrError.value.error)
    return
  }

  // Configure Monaco Environment for Vite native workers
  self.MonacoEnvironment = {
    getWorker(_: any, label: string) {
      if (label === 'json') {
        return new jsonWorker()
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return new cssWorker()
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return new htmlWorker()
      }
      if (label === 'typescript' || label === 'javascript') {
        return new tsWorker()
      }
      return new editorWorker()
    }
  }

  // Create diff editor with read-only configuration
  diffEditor = monaco.editor.createDiffEditor(diffContainer.value, {
    readOnly: true,
    originalEditable: false,
    renderSideBySide: true,
    enableSplitViewResizing: true,
    renderOverviewRuler: true,
    automaticLayout: true
  })

  // Create models with loaded file content
  const originalModel = monaco.editor.createModel(
    contentOrError.value.oldContent,
    props.language
  )

  const modifiedModel = monaco.editor.createModel(
    contentOrError.value.newContent,
    props.language
  )

  diffEditor.setModel({
    original: originalModel,
    modified: modifiedModel
  })

  console.log('[MonacoDiffFile] Diff editor initialized with file content')
})
```

### Step 2: Verify initialization logic compiles

Run:

```bash
npm run docs:build
```

Expected: Build succeeds

### Step 3: Commit initialization update

Run: Use `create-git-commit` skill
Message: `feat(monaco): update initialization to use loaded file content`

---

## Task 7 - Add error display template

### Files
- `docs/.vitepress/components/MonacoDiffFile.vue` (MODIFY)

### Step 1: Update template section

Replace the `<template>` section:

```vue
<template>
  <div v-if="contentOrError.error" class="error-message" style="padding: 16px; background: #fee; border: 1px solid #fcc; border-radius: 4px; color: #c00;">
    <strong>Error:</strong> {{ contentOrError.error }}
  </div>
  <div
    v-else
    ref="diffContainer"
    class="monaco-diff-container"
    style="height: 600px; width: 100%; border: 1px solid #ccc;"
  />
</template>
```

### Step 2: Verify template compiles

Run:

```bash
npm run docs:build
```

Expected: Build succeeds

### Step 3: Commit error template

Run: Use `create-git-commit` skill
Message: `feat(monaco): add error message display template`

---

## Task 8 - Add reactive file path watching

### Files
- `docs/.vitepress/components/MonacoDiffFile.vue` (MODIFY)

### Step 1: Import watch from vue

Update imports:

```typescript
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
```

### Step 2: Add watch for file path changes

Add before `onBeforeUnmount()`:

```typescript
// Watch file path prop changes
watch(() => [props.oldFile, props.newFile, props.oldContent, props.newContent], () => {
  if (!diffEditor || contentOrError.value.error) return

  const originalModel = diffEditor.getOriginalEditor().getModel()
  if (originalModel && originalModel.getValue() !== contentOrError.value.oldContent) {
    console.log('[MonacoDiffFile] Original content updated from file')
    originalModel.setValue(contentOrError.value.oldContent)
  }

  const modifiedModel = diffEditor.getModifiedEditor().getModel()
  if (modifiedModel && modifiedModel.getValue() !== contentOrError.value.newContent) {
    console.log('[MonacoDiffFile] Modified content updated from file')
    modifiedModel.setValue(contentOrError.value.newContent)
  }
})

// Watch language prop changes
watch(() => props.language, (newLang) => {
  if (!diffEditor) return
  const originalModel = diffEditor.getOriginalEditor().getModel()
  const modifiedModel = diffEditor.getModifiedEditor().getModel()
  if (originalModel) monaco.editor.setModelLanguage(originalModel, newLang)
  if (modifiedModel) monaco.editor.setModelLanguage(modifiedModel, newLang)
  console.log('[MonacoDiffFile] Language updated:', newLang)
})
```

### Step 3: Verify watch functions compile

Run:

```bash
npm run docs:build
```

Expected: Build succeeds

### Step 4: Commit reactive watching

Run: Use `create-git-commit` skill
Message: `feat(monaco): add reactive watching for file path and language changes`

---

## Task 9 - Create POC test page

### Files
- `docs/poc-monaco-diff-file.md` (CREATE)

### Step 1: Create test page with three test cases

```markdown
---
layout: doc
aside: false
---

# Monaco Diff Viewer POC-3: File-Based Content Loading

This page validates file loading from `docs/` directory.

<script setup>
import { defineAsyncComponent } from 'vue'
import { inBrowser } from 'vitepress'

const MonacoDiffFile = inBrowser
  ? defineAsyncComponent(() => import('./.vitepress/components/MonacoDiffFile.vue'))
  : () => null
</script>

## Test Case 1: Valid File Paths

**Expected:** Diff renders with content from both system prompt files

<ClientOnly>
  <MonacoDiffFile
    oldFile="assets/default-system-prompt.md"
    newFile="assets/output-style-system-prompt.md"
    language="markdown"
  />
</ClientOnly>

---

## Test Case 2: Missing File Error

**Expected:** Error message "File not found: assets/nonexistent.md"

<ClientOnly>
  <MonacoDiffFile
    oldFile="assets/nonexistent.md"
    newFile="assets/default-system-prompt.md"
    language="markdown"
  />
</ClientOnly>

---

## Test Case 3: Invalid Prop Combination

**Expected:** Error message "Cannot specify both oldContent and oldFile"

<ClientOnly>
  <MonacoDiffFile
    oldContent="inline content"
    oldFile="assets/default-system-prompt.md"
    newFile="assets/output-style-system-prompt.md"
    language="markdown"
  />
</ClientOnly>
```

### Step 2: Build and preview test page

Run:

```bash
npm run docs:build && npm run docs:preview
```

Expected: Build succeeds, preview starts at <http://localhost:4173>

### Step 3: Navigate to test page

Navigate to: `http://localhost:4173/poc-monaco-diff-file`

Expected: Page loads with three test sections

### Step 4: Commit test page

Run: Use `create-git-commit` skill
Message: `test(monaco): add POC-3 test page with three validation cases`

---

## Task 10 - Write Playwright test suite

### Files
- `tests/e2e/poc-monaco-diff-file.spec.ts` (CREATE)

### Step 1: Create test file with four test scenarios

```typescript
import { test, expect } from '@playwright/test'

test.describe('POC-3: File-Based Content Loading', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/poc-monaco-diff-file')
  })

  test('loads content from valid file paths', async ({ page }) => {
    // First diff component should render (valid paths)
    const diffEditor = page.locator('.monaco-diff-container').first()
    await diffEditor.waitFor({ timeout: 5000 })
    await expect(diffEditor).toBeVisible()

    // Verify Monaco editor panes exist (3 = left + right + overview ruler)
    const editorPanes = page.locator('.monaco-editor')
    await expect(editorPanes).toHaveCount(3, { timeout: 5000 })

    // Capture successful render
    await page.screenshot({
      path: 'test-results/poc3-valid-files.png',
      fullPage: true
    })
  })

  test('displays error for missing file', async ({ page }) => {
    // Second diff component should show error
    const errorMessages = page.locator('.error-message')
    await expect(errorMessages.nth(0)).toBeVisible()
    await expect(errorMessages.nth(0)).toContainText('File not found: assets/nonexistent.md')

    // Capture error display
    await page.screenshot({
      path: 'test-results/poc3-missing-file-error.png',
      fullPage: true
    })
  })

  test('displays error for invalid prop combination', async ({ page }) => {
    // Third diff component should show error
    const errorMessages = page.locator('.error-message')
    await expect(errorMessages.nth(1)).toBeVisible()
    await expect(errorMessages.nth(1)).toContainText('Cannot specify both oldContent and oldFile')

    // Capture error display
    await page.screenshot({
      path: 'test-results/poc3-invalid-props-error.png',
      fullPage: true
    })
  })

  test('resolves multi-level paths correctly', async ({ page }) => {
    // Check console logs for path normalization
    const logs: string[] = []
    page.on('console', msg => {
      if (msg.text().includes('[MonacoDiffFile]')) {
        logs.push(msg.text())
      }
    })

    await page.waitForTimeout(2000)

    // Should see file loading logs
    const hasLoadingLogs = logs.some(log => log.includes('Loading:'))
    expect(hasLoadingLogs).toBe(true)

    // Should see normalization: assets/file.md → /docs/assets/file.md
    const hasNormalization = logs.some(log =>
      log.includes('assets/') && log.includes('/docs/assets/')
    )
    expect(hasNormalization).toBe(true)
  })
})
```

### Step 2: Run Playwright tests

Run:

```bash
npx playwright test tests/e2e/poc-monaco-diff-file.spec.ts
```

Expected: All 4 tests PASS

### Step 3: Verify screenshots captured

Run:

```bash
ls -lh test-results/poc3-*.png
```

Expected: Three screenshot files exist:
- `poc3-valid-files.png`
- `poc3-missing-file-error.png`
- `poc3-invalid-props-error.png`

### Step 4: Commit test suite

Run: Use `create-git-commit` skill
Message: `test(monaco): add POC-3 Playwright test suite with 4 scenarios`

---

## Task 11 - Run production build validation

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

Expected: Build completes with exit code 0, no errors

### Step 3: Check build exit code

Run:

```bash
echo $?
```

Expected: Output is `0`

### Step 4: Start preview server

Run:

```bash
npm run docs:preview
```

Expected: Preview server starts at <http://localhost:4173>

### Step 5: Run all Playwright tests

Run (in separate terminal):

```bash
npx playwright test tests/e2e/poc-monaco-diff-file.spec.ts --reporter=list
```

Expected: All tests PASS, screenshots captured

---

## Task 12 - Manual browser verification

### Files
- (verification only, no file changes)

### Step 1: Start dev server

Run:

```bash
npm run docs:dev
```

Expected: Dev server starts at <http://localhost:5173>

### Step 2: Navigate to test page

Navigate to: `http://localhost:5173/poc-monaco-diff-file`

Expected: Page loads without errors

### Step 3: Verify Test Case 1 (valid files)

Visual check:
- ✅ Monaco diff editor renders side-by-side
- ✅ Left pane shows content from default-system-prompt.md
- ✅ Right pane shows content from output-style-system-prompt.md
- ✅ Diff highlights show differences between files

Console check:

```text
[MonacoDiffFile] Loaded files: [array of paths]
[MonacoDiffFile] Loading: assets/default-system-prompt.md → /docs/assets/default-system-prompt.md
[MonacoDiffFile] Found: true
[MonacoDiffFile] Loading: assets/output-style-system-prompt.md → /docs/assets/output-style-system-prompt.md
[MonacoDiffFile] Found: true
[MonacoDiffFile] Diff editor initialized with file content
```

### Step 4: Verify Test Case 2 (missing file)

Visual check:
- ✅ Red error box displays
- ✅ Error message reads: "Error: File not found: assets/nonexistent.md (looked for: /docs/assets/nonexistent.md)"

Console check:

```text
[MonacoDiffFile] Loading: assets/nonexistent.md → /docs/assets/nonexistent.md
[MonacoDiffFile] Found: false
[MonacoDiffFile] Skipping initialization: File not found: assets/nonexistent.md (looked for: /docs/assets/nonexistent.md)
```

### Step 5: Verify Test Case 3 (invalid props)

Visual check:
- ✅ Red error box displays
- ✅ Error message reads: "Error: Cannot specify both oldContent and oldFile"

Console check:

```text
[MonacoDiffFile] Skipping initialization: Cannot specify both oldContent and oldFile
```

### Step 6: Check for unexpected console errors

Console check:
- ✅ No red error messages
- ✅ No warnings about missing files for valid test cases
- ✅ No Monaco initialization errors

### Step 7: Document verification results

Create verification checklist:
- [ ] Test Case 1: Valid files render diff correctly
- [ ] Test Case 2: Missing file shows error message
- [ ] Test Case 3: Invalid props shows error message
- [ ] Console logs show path normalization
- [ ] No unexpected console errors
- [ ] Playwright tests all pass
- [ ] Production build succeeds

---

## Success Criteria

**POC PASSES if:**
- ✅ Component loads content from valid file paths (FR-2.2)
- ✅ Multi-level paths (`assets/file.md`) resolve correctly (FR-2.3)
- ✅ Missing files display user-friendly error (FR-2.4)
- ✅ Error for invalid prop combinations (both content and file)
- ✅ Console logs show file loading and path normalization
- ✅ No build or runtime errors for valid inputs
- ✅ All 4 Playwright tests pass
- ✅ Manual verification checklist complete

**POC FAILS if:**
- ❌ File loading fails for valid paths
- ❌ Multi-level paths don't resolve
- ❌ Missing files crash component instead of showing error
- ❌ Build fails due to glob pattern issues
- ❌ Runtime errors for valid file paths

---

## Notes

**File Path Format:**
- Users provide: `assets/file.md` (relative to docs/)
- Glob keys are: `/docs/assets/file.md` (absolute with /docs prefix)
- Normalization function handles conversion

**Test Files:**
- `docs/assets/default-system-prompt.md` - exists (16.8KB)
- `docs/assets/output-style-system-prompt.md` - exists (16.6KB)
- These are real files moved from `reference-docs/` directory

**Console Logging Strategy:**
- Log all file loading attempts for debugging
- Log path normalization to validate resolution
- Log initialization success/failure
- Logs help validate POC without inspecting Monaco content

**Why Not Test Monaco Content?**
- Monaco renders in canvas/DOM, hard to query text content
- Screenshots provide visual validation
- Console logs prove files loaded
- Error messages validate failure paths

---

## Timeline

**Estimated:** 2-3 hours total

| Task | Duration | Type |
|------|----------|------|
| Tasks 1-8: Component implementation | 90 min | Coding |
| Task 9: Test page creation | 20 min | Testing setup |
| Task 10: Playwright tests | 40 min | Test implementation |
| Task 11: Production validation | 15 min | Validation |
| Task 12: Manual verification | 20 min | Verification |

---

## Next Steps After POC-3

**If POC passes:**
- Merge file loading patterns into main component
- Proceed to POC-4: Language auto-detection from file extensions
- High confidence for full FR-2 implementation

**If POC fails:**
- Diagnose failure mode (glob pattern, path resolution, build errors)
- Pivot to alternative approach (dynamic fetch, VitePress data loader)
- Update requirements with revised approach
