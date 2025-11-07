# POC-3: Monaco Diff Viewer - File-Based Content Loading

**Date:** 2025-01-08
**Status:** Design
**Goal:** Validate component loads diff content from file paths in `docs/` directory

---

## Problem Statement

POC-2.1 validated props-based content updates. POC-2.2 validated theme synchronization. Before full implementation, we must validate:

1. **Can component load file content from `docs/` relative paths?** ([FR-2.2](./diff-view-monaco-requirements.md#^FR2-2))
2. **Does Vite's `import.meta.glob()` work with multi-level paths?** ([FR-2.3](./diff-view-monaco-requirements.md#^FR2-3))
3. **Do file loading errors display user-friendly messages?** ([FR-2.4](./diff-view-monaco-requirements.md#^FR2-4))

This POC answers these questions using Vite's build-time file loading with the reactive patterns validated in POC-2.1 and POC-2.2.

---

## Complete POC Strategy

### POC-1: Monaco Diff Basic Rendering (Complete)
**Goal:** Validate Monaco builds and renders side-by-side diffs
**Status:** Complete - validated basic rendering works

### POC-2.1: Props-Based Content (Complete)
**Goal:** Prove component accepts `oldContent`, `newContent`, `language` props and updates Monaco models reactively
**Status:** Complete - validated `watch()` + reactive props pattern

### POC-2.2: Theme Synchronization (Complete)
**Goal:** Validate component syncs with VitePress light/dark theme switching
**Status:** Complete - validated `useData().isDark` + `monaco.editor.setTheme()` pattern

### POC-3: File-Based Content Loading (This Document)
**Goal:** Validate component loads diff content from file paths in `docs/` directory
**Dependencies:** Requires POC-2.1 reactive props ✅, POC-2.2 theme sync ✅
**Timeline:** 2-3 hours
**Status:** Current - detailed design below

### POC-4: Language Auto-Detection (Future)
**Goal:** Validate automatic language detection from file extensions
**Dependencies:** Requires POC-3 file loading validated
**Timeline:** 1 hour
**Status:** Deferred until file loading validated

---

## Approach

Extend POC-2.2's `MonacoDiffTheme.vue` component with file path props and Vite's build-time file loading:

- **File path props** - Accept `oldFile`, `newFile` as alternative to `oldContent`, `newContent` ([FR-2.2](./diff-view-monaco-requirements.md#^FR2-2))
- **Build-time loading** - Use `import.meta.glob()` with `?raw` query to load all markdown files at build time
- **Path resolution** - Resolve paths relative to `docs/` root ([FR-2.3](./diff-view-monaco-requirements.md#^FR2-3), user specified "relative to docs/ folder")
- **Error handling** - Display user-friendly error when file path not found ([FR-2.4](./diff-view-monaco-requirements.md#^FR2-4))
- **Reactive updates** - Use `watch()` pattern from POC-2.1 to react to file path changes

**Why this approach:** Research shows Vite's dynamic import (`await import()`) fails for multi-level paths like `docs/assets/file.md`. However, `import.meta.glob()` with eager loading handles multi-level paths and loads files at build time, eliminating runtime fetch failures. This approach requires no custom build config and works within VitePress constraints.

**Sources:**
- [Vite Dynamic Import Limitations](https://vite.dev/guide/features) - "Dynamic imports limited to one directory depth"
- [Vite Glob Import with Raw Query](https://vite.dev/guide/features) - `import.meta.glob('./dir/*.ext', { eager: true, query: '?raw' })`
- [VitePress Path Resolution](https://vitepress.dev/guide/getting-started) - "VitePress resolves from docs/ root"

---

## Architecture

### Component Props Interface

```typescript
interface Props {
  // Content props (from POC-2.1, POC-2.2)
  oldContent?: string
  newContent?: string

  // NEW: File path props (POC-3)
  oldFile?: string       // Path relative to docs/, e.g., 'assets/file-v1.md'
  newFile?: string       // Path relative to docs/, e.g., 'assets/file-v2.md'

  language?: string      // Syntax highlighting (from POC-2.1)
}
```

**Validation rules:**
- Exactly one of `oldContent` or `oldFile` required (not both)
- Exactly one of `newContent` or `newFile` required (not both)

### Build-Time File Loading

```typescript
// Load all markdown files at build time
const fileContents = import.meta.glob('/docs/**/*.md', {
  eager: true,        // Load immediately, not lazy
  query: '?raw',      // Import as raw text string
  import: 'default'   // Import default export (the string content)
})

// Result object structure:
// {
//   '/docs/assets/default-system-prompt.md': 'file content as string...',
//   '/docs/assets/output-style-system-prompt.md': 'file content as string...',
//   '/docs/guide/getting-started.md': 'file content as string...'
// }
```

**Key patterns:**
1. **Eager loading** - All files loaded at build time, no async required
2. **Raw query** - Files imported as text strings, not modules
3. **Glob pattern** - `/docs/**/*.md` matches all `.md` files recursively
4. **String literal** - Pattern must be literal string, no variables allowed

**Source:** [Vite import.meta.glob Documentation](https://vite.dev/guide/features#glob-import)

### File Path Resolution

```typescript
// Normalize user-provided path to match glob keys
function normalizeFilePath(path: string): string {
  // User provides: 'assets/default-system-prompt.md'
  // Glob key is:   '/docs/assets/default-system-prompt.md'

  // Add /docs prefix if missing
  if (!path.startsWith('/docs/')) {
    path = `/docs/${path}`
  }

  return path
}

// Load file content from glob map
function loadFileContent(path: string): string | null {
  const normalizedPath = normalizeFilePath(path)
  return fileContents[normalizedPath] ?? null
}
```

**Source:** User requirement "relative to docs/ folder"

### Error Handling Pattern

```typescript
// Computed property for validation
const contentOrError = computed(() => {
  let oldContentValue: string
  let newContentValue: string
  let errorMessage: string | null = null

  // Validate exactly one source for old content
  if (props.oldContent && props.oldFile) {
    errorMessage = 'Cannot specify both oldContent and oldFile'
  } else if (!props.oldContent && !props.oldFile) {
    errorMessage = 'Must specify either oldContent or oldFile'
  }

  // Load old content
  if (props.oldContent) {
    oldContentValue = props.oldContent
  } else if (props.oldFile) {
    const content = loadFileContent(props.oldFile)
    if (content === null) {
      errorMessage = `File not found: ${props.oldFile}`
    } else {
      oldContentValue = content
    }
  }

  // Load new content (same pattern)
  // ...

  return { oldContent: oldContentValue, newContent: newContentValue, error: errorMessage }
})
```

**Display error in template:**

```vue
<template>
  <div v-if="contentOrError.error" class="error-message">
    {{ contentOrError.error }}
  </div>
  <div v-else ref="diffContainer" class="monaco-diff-container" />
</template>
```

**Source:** [NFR-6.3](./diff-view-monaco-requirements.md#^NFR6-3) - "Error handling with user-friendly messages"

### Reactive File Path Updates

```typescript
// Watch file path props (pattern from POC-2.1)
watch(() => [props.oldFile, props.newFile, props.oldContent, props.newContent], () => {
  if (!diffEditor) return
  if (contentOrError.value.error) return

  // Update original model
  const originalModel = diffEditor.getOriginalEditor().getModel()
  if (originalModel && originalModel.getValue() !== contentOrError.value.oldContent) {
    console.log('[MonacoDiffFile] Original content updated')
    originalModel.setValue(contentOrError.value.oldContent)
  }

  // Update modified model
  const modifiedModel = diffEditor.getModifiedEditor().getModel()
  if (modifiedModel && modifiedModel.getValue() !== contentOrError.value.newContent) {
    console.log('[MonacoDiffFile] Modified content updated')
    modifiedModel.setValue(contentOrError.value.newContent)
  }
})
```

**Source:** POC-2.1 validated `watch()` + `model.setValue()` pattern

### Complete Component Integration

```vue
<script setup lang="ts">
import { ref, toRefs, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import { useData } from 'vitepress'
import * as monaco from 'monaco-editor'

// Worker imports (from POC-2.1, POC-2.2)
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
// ... other workers

// Load all markdown files at build time (NEW in POC-3)
const fileContents = import.meta.glob('/docs/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
})

interface Props {
  oldContent?: string
  newContent?: string
  oldFile?: string      // NEW
  newFile?: string      // NEW
  language?: string
}

const props = withDefaults(defineProps<Props>(), {
  language: 'markdown'  // Default to markdown for file loading
})

// VitePress theme detection (from POC-2.2)
const { isDark } = useData()
const monacoTheme = computed(() => isDark.value ? 'vs-dark' : 'vs')

// File path normalization (NEW in POC-3)
function normalizeFilePath(path: string): string {
  if (!path.startsWith('/docs/')) {
    return `/docs/${path}`
  }
  return path
}

function loadFileContent(path: string): string | null {
  const normalizedPath = normalizeFilePath(path)
  return fileContents[normalizedPath] ?? null
}

// Content loading with error handling (NEW in POC-3)
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

const diffContainer = ref<HTMLElement | null>(null)
let diffEditor: monaco.editor.IStandaloneDiffEditor | null = null

onMounted(() => {
  if (!diffContainer.value || contentOrError.value.error) return

  // Configure Monaco Environment (from POC-1)
  self.MonacoEnvironment = {
    getWorker(_: string, label: string) {
      if (label === 'typescript' || label === 'javascript') return new tsWorker()
      return new editorWorker()
    }
  }

  // Create diff editor with initial theme (from POC-2.2)
  diffEditor = monaco.editor.createDiffEditor(diffContainer.value, {
    readOnly: true,
    originalEditable: false,
    renderSideBySide: true,
    enableSplitViewResizing: true,
    renderOverviewRuler: true,
    automaticLayout: true,
    theme: monacoTheme.value
  })

  // Create initial models from loaded content (NEW in POC-3)
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
})

// Watch file path changes (NEW in POC-3)
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

// Watch language prop (from POC-2.1)
watch(() => props.language, (newLang) => {
  if (!diffEditor) return
  const originalModel = diffEditor.getOriginalEditor().getModel()
  const modifiedModel = diffEditor.getModifiedEditor().getModel()
  if (originalModel) monaco.editor.setModelLanguage(originalModel, newLang)
  if (modifiedModel) monaco.editor.setModelLanguage(modifiedModel, newLang)
})

// Watch theme changes (from POC-2.2)
watch(monacoTheme, (newTheme) => {
  if (!diffEditor) return
  console.log('[MonacoDiffFile] Theme updated:', newTheme)
  monaco.editor.setTheme(newTheme)
})

onBeforeUnmount(() => {
  diffEditor?.dispose()
})
</script>

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

### Test Page Usage

```markdown
---
layout: doc
aside: false
---

# Monaco Diff Viewer POC-3: File-Based Content Loading

This page validates file loading from `docs/` directory.

<script setup>
import { ref, defineAsyncComponent } from 'vue'
import { inBrowser } from 'vitepress'

const MonacoDiffFile = inBrowser
  ? defineAsyncComponent(() => import('./.vitepress/components/MonacoDiffFile.vue'))
  : () => null
</script>

<ClientOnly>
  <MonacoDiffFile
    oldFile="assets/default-system-prompt.md"
    newFile="assets/output-style-system-prompt.md"
    language="markdown"
  />
</ClientOnly>

## Test Cases

### Case 1: Valid File Paths (Above)
- Old: `assets/default-system-prompt.md`
- New: `assets/output-style-system-prompt.md`
- Expected: Diff renders with file contents

### Case 2: Missing File Error

<ClientOnly>
  <MonacoDiffFile
    oldFile="assets/nonexistent.md"
    newFile="assets/default-system-prompt.md"
    language="markdown"
  />
</ClientOnly>

Expected: Error message "File not found: assets/nonexistent.md"

### Case 3: Invalid Prop Combination

<ClientOnly>
  <MonacoDiffFile
    oldContent="inline content"
    oldFile="assets/default-system-prompt.md"
    newFile="assets/output-style-system-prompt.md"
    language="markdown"
  />
</ClientOnly>

Expected: Error message "Cannot specify both oldContent and oldFile"
```

---

## Success Metrics

### Quantitative Measurements

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| File loading success | Valid paths load content | Visual inspection of diff rendering |
| Path resolution | `docs/assets/file.md` resolves | Console logs show normalized paths |
| Error handling | Missing files show error message | Visual inspection of error display |
| No build errors | Build completes successfully | `npm run docs:build` exit code 0 |
| No runtime errors | Zero console errors for valid paths | Browser DevTools console |
| Playwright tests pass | All tests green | `npx playwright test` |

### Pass/Fail Criteria

**POC PASSES if:**
- ✅ Component loads content from valid file paths ([FR-2.2](./diff-view-monaco-requirements.md#^FR2-2))
- ✅ Multi-level paths (`assets/file.md`) resolve correctly ([FR-2.3](./diff-view-monaco-requirements.md#^FR2-3))
- ✅ Missing files display user-friendly error ([FR-2.4](./diff-view-monaco-requirements.md#^FR2-4))
- ✅ Error for invalid prop combinations (both content and file)
- ✅ Console logs show file loading and path normalization
- ✅ No build or runtime errors for valid inputs
- ✅ Playwright tests pass

**POC FAILS if:**
- ❌ File loading fails for valid paths
- ❌ Multi-level paths don't resolve
- ❌ Missing files crash component instead of showing error
- ❌ Build fails due to glob pattern issues
- ❌ Runtime errors for valid file paths

---

## Implementation Details

### Step 1: Copy POC-2.2 Component as Starting Point

**File:** `docs/.vitepress/components/MonacoDiffFile.vue`

Copy `MonacoDiffTheme.vue` from POC-2.2:

```bash
cp docs/.vitepress/components/MonacoDiffTheme.vue docs/.vitepress/components/MonacoDiffFile.vue
```

Expected: New file created with POC-2.2 props + theme patterns

### Step 2: Add File Loading at Module Top

Add glob import before component definition:

```typescript
// Add after import statements, before <script setup>
const fileContents = import.meta.glob('/docs/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
})

console.log('[MonacoDiffFile] Loaded files:', Object.keys(fileContents))
```

Expected: Build succeeds, console shows all loaded file paths

### Step 3: Add File Path Props

Update Props interface:

```typescript
interface Props {
  oldContent?: string
  newContent?: string
  oldFile?: string      // NEW
  newFile?: string      // NEW
  language?: string
}

const props = withDefaults(defineProps<Props>(), {
  language: 'markdown'  // Changed default for file loading
})
```

Expected: TypeScript compilation succeeds

### Step 4: Add File Loading Functions

Add before `contentOrError` computed:

```typescript
function normalizeFilePath(path: string): string {
  if (!path.startsWith('/docs/')) {
    return `/docs/${path}`
  }
  return path
}

function loadFileContent(path: string): string | null {
  const normalizedPath = normalizeFilePath(path)
  console.log('[MonacoDiffFile] Loading:', path, '→', normalizedPath)
  const content = fileContents[normalizedPath]
  console.log('[MonacoDiffFile] Found:', content !== undefined)
  return content ?? null
}
```

Expected: Functions compile, ready for use

### Step 5: Add Content Loading Computed Property

Add `contentOrError` computed (see Architecture section for full code)

Expected: Computed property handles both inline content and file paths

### Step 6: Update onMounted to Check for Errors

Modify `onMounted()`:

```typescript
onMounted(() => {
  if (!diffContainer.value || contentOrError.value.error) return
  // ... rest of onMounted code (unchanged)
})
```

Expected: Component skips initialization when error present

### Step 7: Add Error Display Template

Update template:

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

Expected: Error messages display in red box

### Step 8: Update Watch to Handle File Paths

Replace content watches with combined watch (see Architecture section for full code)

Expected: File path changes trigger content updates

### Step 9: Create POC Test Page

**File:** `docs/poc-monaco-diff-file.md`

Create test page with 3 test cases (see Test Page Usage section for full content)

Expected: Test page loads with 3 diff components showing different scenarios

### Step 10: Write Playwright Tests

**File:** `tests/e2e/poc-monaco-diff-file.spec.ts`

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

    // Capture successful render
    await page.screenshot({
      path: 'test-results/poc3-valid-files.png',
      fullPage: true
    })

    // Check console for loading logs
    const logs: string[] = []
    page.on('console', msg => {
      if (msg.text().includes('[MonacoDiffFile]')) {
        logs.push(msg.text())
      }
    })

    await page.waitForTimeout(1000)
    expect(logs.length).toBeGreaterThan(0)
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
      if (msg.text().includes('Loading:')) {
        logs.push(msg.text())
      }
    })

    await page.waitForTimeout(2000)

    // Should see normalization: assets/file.md → /docs/assets/file.md
    const hasNormalization = logs.some(log =>
      log.includes('assets/') && log.includes('/docs/assets/')
    )
    expect(hasNormalization).toBe(true)
  })
})
```

Expected: All 4 tests pass

### Step 11: Run Validation Sequence

```bash
# Build for production
npm run docs:build

# Check for build errors
echo $?  # Should be 0

# Preview production build
npm run docs:preview

# Run Playwright tests
npx playwright test tests/e2e/poc-monaco-diff-file.spec.ts

# Verify screenshots captured
ls -lh test-results/poc3-*.png
```

Expected: Build succeeds, all tests pass, screenshots show valid and error states

### Step 12: Manual Verification

1. Run `npm run docs:dev`
2. Navigate to `http://localhost:5173/poc-monaco-diff-file`
3. Verify first diff shows content from both system prompt files
4. Verify second diff shows "File not found" error in red box
5. Verify third diff shows "Cannot specify both" error in red box
6. Open browser console:
   - Look for "[MonacoDiffFile] Loaded files:" with array of paths
   - Look for "[MonacoDiffFile] Loading:" logs showing path normalization
   - Look for "[MonacoDiffFile] Found:" logs showing true/false
7. Verify no console errors for valid file paths

---

## Risk Mitigation

### If POC-3 Fails

**Likely failure modes:**

1. **Glob pattern doesn't match files** - `fileContents` object empty
   - **Diagnosis:** Console log shows empty object or missing keys
   - **Fix:** Adjust glob pattern (try `/docs/**/*` or `../../docs/**/*.md`)
   - **Pivot:** Use dynamic `fetch()` with runtime error handling (slower, less reliable)

2. **Path normalization incorrect** - Files don't resolve
   - **Diagnosis:** Console shows "Found: false" for valid paths
   - **Fix:** Log `Object.keys(fileContents)` to see actual keys, adjust normalization
   - **Pivot:** Require users to provide full paths including `/docs/` prefix

3. **Build fails with glob error** - Vite can't process pattern
   - **Diagnosis:** Build error mentioning import.meta.glob
   - **Fix:** Move glob outside component (module-level import)
   - **Pivot:** Use VitePress data loader (`.data.ts` file) to load files

4. **Runtime errors in production** - Works in dev, fails in build
   - **Diagnosis:** Different path resolution in production
   - **Fix:** Test with `npm run docs:build` + `npm run docs:preview` early
   - **Pivot:** Use eager glob with absolute paths from project root

**Pivot strategy:**
- If glob fails, fall back to dynamic fetch with runtime file loading
- If path resolution fails, require absolute paths or limit to single directory
- If build-time loading problematic, defer to Phase 2 with runtime fetch

### If POC-3 Passes

**Next steps:**
- Merge file loading into main component
- Proceed to POC-4 (language auto-detection from file extensions)
- High confidence for full FR-2 implementation

---

## Out of Scope

**Explicitly NOT doing in POC-3:**

- ❌ Language auto-detection from file extensions - [FR-3.5](./diff-view-monaco-requirements.md#^FR3-5) (Deferred to POC-4)
- ❌ File path autocomplete or validation - Future enhancement
- ❌ Caching loaded files in memory - [QUESTION5](./diff-view-monaco-requirements.md#^QUESTION5) (Deferred to full implementation)
- ❌ Loading states during file load - [NFR-1.2](./diff-view-monaco-requirements.md#^NFR1-2) (Not needed for build-time loading, deferred for runtime loading)
- ❌ Support for non-markdown files - [FR-3](./diff-view-monaco-requirements.md#^FR3) (Deferred to full implementation)
- ❌ External URL fetching - Out of scope per requirements
- ❌ Git integration or commit-based loading - Out of scope per requirements
- ❌ Labels from filenames - [FR-5.3](./diff-view-monaco-requirements.md#^FR5-3) (Deferred to full implementation)

**Rationale:** Minimal scope validates core file loading mechanism with multi-level path resolution and error handling. Language detection and other features build on this foundation.

---

## References

### Requirements
- [diff-view-monaco-requirements.md](./diff-view-monaco-requirements.md)
  - [FR-2.2: File path references](./diff-view-monaco-requirements.md#^FR2-2)
  - [FR-2.3: Load from docs/ directory](./diff-view-monaco-requirements.md#^FR2-3)
  - [FR-2.4: Error messages for load failures](./diff-view-monaco-requirements.md#^FR2-4)
  - [QUESTION4: File path resolution strategy](./diff-view-monaco-requirements.md#^QUESTION4)

### POC Documents
- [POC-2.1: Props-Based Content](./diff-view-monaco-poc2-props-based-content-design-plan.md)
- [POC-2.2: Theme Synchronization](./diff-view-monaco-poc2.2-theme-sync-design-plan.md)

### External Sources
- [Vite Features Guide: import.meta.glob](https://vite.dev/guide/features#glob-import)
- [Vite Features Guide: Raw Import Query](https://vite.dev/guide/features#importing-asset-as-string)
- [Vite Features Guide: Dynamic Import Limitations](https://vite.dev/guide/features#dynamic-import)
- [VitePress Getting Started: File Structure](https://vitepress.dev/guide/getting-started)
- [VitePress Routing: File-Based Routing](https://vitepress.dev/guide/routing)

---

## Timeline

**Estimated Duration:** 2-3 hours total

| Phase | Duration | Activities |
|-------|----------|------------|
| Component Extension | 45 min | Add glob, file props, loading functions, error handling |
| Test Page Creation | 20 min | Create markdown page with 3 test cases |
| Playwright Tests | 40 min | Write 4 test scenarios, capture screenshots |
| Validation | 30 min | Run build, tests, manual verification |
| Troubleshooting | 15 min | Debug path resolution if needed |

---

## Decision Point

**If POC-3 passes:**
- Vite `import.meta.glob()` handles multi-level file loading
- Path normalization resolves `docs/`-relative paths correctly
- Error handling provides clear feedback for missing files
- Pattern integrates with POC-2.1/POC-2.2 reactive patterns
- Proceed to POC-4 (language auto-detection)
- Confidence level: HIGH for full FR-2 implementation

**If POC-3 fails:**
- Glob pattern incompatible with VitePress build
- Pivot to runtime `fetch()` with async loading
- Update requirements with revised approach
- May defer file loading to Phase 2 (inline content only for MVP)
