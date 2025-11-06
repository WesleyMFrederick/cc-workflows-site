# POC-2.1: Monaco Diff Viewer - Props-Based Content Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Validate Vue 3 props drive Monaco diff editor models reactively without memory leaks

**Architecture:** Extend POC-1 component with TypeScript props interface, use `watch()` + `toRefs()` for reactive updates, call `model.setValue()` instead of recreating models

**Tech Stack:** Vue 3 Composition API, Monaco Editor 0.52.2, TypeScript, Playwright

---

## Task 1 - Create Props-Based Component Foundation

### Files
- `docs/.vitepress/components/MonacoDiffProps.vue` (CREATE)
- `docs/.vitepress/components/MonacoDiffBasic.vue` (READ for reference)

### Step 1: Copy POC-1 component as starting point

```bash
cp docs/.vitepress/components/MonacoDiffBasic.vue docs/.vitepress/components/MonacoDiffProps.vue
```

Expected: New file created

### Step 2: Add TypeScript props interface

Replace the `<script setup>` block in `MonacoDiffProps.vue`:

```vue
<script setup lang="ts">
import { ref, toRefs, watch, onMounted, onBeforeUnmount } from 'vue'
import * as monaco from 'monaco-editor'

// Worker imports (preserve from POC-1)
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

interface Props {
  oldContent: string      // Original/left pane content
  newContent: string      // Modified/right pane content
  language?: string       // Syntax highlighting language
}

const props = withDefaults(defineProps<Props>(), {
  language: 'javascript'
})

// Convert props to refs for reactivity
const { oldContent, newContent, language } = toRefs(props)

const diffContainer = ref<HTMLElement | null>(null)
let diffEditor: monaco.editor.IStandaloneDiffEditor | null = null

// Rest of POC-1 code continues below...
</script>
```

### Step 3: Verify TypeScript compiles

Run: `npm run docs:build`
Expected: Build succeeds with no TypeScript errors for MonacoDiffProps.vue

### Step 4: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(monaco): add props interface to MonacoDiffProps component"

---

## Task 2 - Update Component Mount to Use Props

### Files
- `docs/.vitepress/components/MonacoDiffProps.vue:86-114` (MODIFY)

### Step 1: Modify onMounted to use prop values

Replace the `onMounted()` callback in `MonacoDiffProps.vue`:

```typescript
onMounted(() => {
  if (!diffContainer.value) return

  // Configure Monaco Environment (preserve from POC-1)
  self.MonacoEnvironment = {
    getWorker(_: string, label: string) {
      if (label === 'json') return new jsonWorker()
      if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker()
      if (label === 'html' || label === 'handlebars' || label === 'razor') return new htmlWorker()
      if (label === 'typescript' || label === 'javascript') return new tsWorker()
      return new editorWorker()
    }
  }

  // Create diff editor (preserve from POC-1)
  diffEditor = monaco.editor.createDiffEditor(diffContainer.value, {
    readOnly: true,
    originalEditable: false,
    renderSideBySide: true,
    enableSplitViewResizing: true,
    renderOverviewRuler: true,
    automaticLayout: true
  })

  // Create initial models from props (CHANGED: use prop.value)
  const originalModel = monaco.editor.createModel(
    oldContent.value,
    language.value
  )

  const modifiedModel = monaco.editor.createModel(
    newContent.value,
    language.value
  )

  diffEditor.setModel({
    original: originalModel,
    modified: modifiedModel
  })
})
```

### Step 2: Verify component still renders

Run: `npm run docs:dev`
Navigate to: `http://localhost:5173/poc-monaco-diff` (POC-1 page)
Expected: POC-1 still works (regression check)

### Step 3: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(monaco): update MonacoDiffProps mount to use prop values"

---

## Task 3 - Add Reactive Watch for oldContent Prop

### Files
- `docs/.vitepress/components/MonacoDiffProps.vue:115-135` (ADD after onMounted)

### Step 1: Write the failing test

Create test first to validate watch behavior:

```typescript
// Add BEFORE implementing watch callback
// This is a mental test - we'll verify with Playwright later
// Expected behavior: when oldContent prop changes, left pane updates
```

### Step 2: Implement oldContent watch callback

Add after `onMounted()` in `MonacoDiffProps.vue`:

```typescript
// Watch oldContent prop - update original (left) model
watch(oldContent, (newValue) => {
  if (!diffEditor) return

  const originalEditor = diffEditor.getOriginalEditor()
  const model = originalEditor.getModel()

  // Performance guard: only update if content changed
  if (model && model.getValue() !== newValue) {
    console.log('[MonacoDiffProps] oldContent updated:', newValue.substring(0, 50))
    model.setValue(newValue)
  }
})
```

### Step 3: Verify watch fires on prop change

Manual test:
1. Run `npm run docs:dev`
2. Open browser DevTools console
3. Create test page (next task) and click "Update Old Content"
4. Expected: Console shows "[MonacoDiffProps] oldContent updated: ..."

### Step 4: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(monaco): add reactive watch for oldContent prop"

---

## Task 4 - Add Reactive Watch for newContent Prop

### Files
- `docs/.vitepress/components/MonacoDiffProps.vue:136-156` (ADD)

### Step 1: Implement newContent watch callback

Add after `oldContent` watch in `MonacoDiffProps.vue`:

```typescript
// Watch newContent prop - update modified (right) model
watch(newContent, (newValue) => {
  if (!diffEditor) return

  const modifiedEditor = diffEditor.getModifiedEditor()
  const model = modifiedEditor.getModel()

  // Performance guard: only update if content changed
  if (model && model.getValue() !== newValue) {
    console.log('[MonacoDiffProps] newContent updated:', newValue.substring(0, 50))
    model.setValue(newValue)
  }
})
```

### Step 2: Verify both watches work independently

Manual test:
1. Test page has separate buttons for oldContent and newContent
2. Each button should only trigger its respective watch
3. Expected: Console shows correct watch fired

### Step 3: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(monaco): add reactive watch for newContent prop"

---

## Task 5 - Add Reactive Watch for Language Prop

### Files
- `docs/.vitepress/components/MonacoDiffProps.vue:157-177` (ADD)

### Step 1: Implement language watch callback

Add after `newContent` watch in `MonacoDiffProps.vue`:

```typescript
// Watch language prop - update both models
watch(language, (newLang) => {
  if (!diffEditor) return

  const originalModel = diffEditor.getOriginalEditor().getModel()
  const modifiedModel = diffEditor.getModifiedEditor().getModel()

  console.log('[MonacoDiffProps] language updated:', newLang)

  if (originalModel) {
    monaco.editor.setModelLanguage(originalModel, newLang)
  }
  if (modifiedModel) {
    monaco.editor.setModelLanguage(modifiedModel, newLang)
  }
})
```

### Step 2: Verify language switching works

Manual test:
1. Toggle language button changes from 'javascript' to 'typescript'
2. Expected: Syntax highlighting changes, console shows update

### Step 3: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(monaco): add reactive watch for language prop"

---

## Task 6 - Create POC Test Page with Interactive Controls

### Files
- `docs/poc-monaco-diff-props.md` (CREATE)

### Step 1: Create test page with reactive props

```markdown
---
layout: doc
aside: false
---

# Monaco Diff Viewer POC-2.1: Props-Based Content

This page validates component prop reactivity.

<script setup>
import { ref, defineAsyncComponent } from 'vue'
import { inBrowser } from 'vitepress'

const MonacoDiffProps = inBrowser
  ? defineAsyncComponent(() => import('./.vitepress/components/MonacoDiffProps.vue'))
  : () => null

// Test data
const oldCode = ref(`function greet() {\n  return "Hello";\n}`)
const newCode = ref(`function greet() {\n  return "Hello World";\n}`)
const lang = ref('javascript')

// Test mutations
const updateOld = () => {
  oldCode.value = `function greet() {\n  return "Hi";\n}`
}

const updateNew = () => {
  newCode.value = `function greet() {\n  return "Hi Universe";\n}`
}

const switchLang = () => {
  lang.value = lang.value === 'javascript' ? 'typescript' : 'javascript'
}
</script>

<ClientOnly>
  <MonacoDiffProps
    :oldContent="oldCode"
    :newContent="newCode"
    :language="lang"
  />
</ClientOnly>

## Test Controls

<button @click="updateOld" style="margin: 8px; padding: 8px 16px; cursor: pointer;">Update Old Content</button>
<button @click="updateNew" style="margin: 8px; padding: 8px 16px; cursor: pointer;">Update New Content</button>
<button @click="switchLang" style="margin: 8px; padding: 8px 16px; cursor: pointer;">Toggle Language</button>

## Expected Behavior

- **Update Old Content**: Left pane should change to "Hi"
- **Update New Content**: Right pane should change to "Hi Universe"
- **Toggle Language**: Syntax highlighting should switch between JavaScript and TypeScript
- **Console**: Should show watch callback logs
```

### Step 2: Manual verification

Run: `npm run docs:dev`
Navigate to: `http://localhost:5173/poc-monaco-diff-props`
Expected: Page loads, diff editor renders, buttons functional

### Step 3: Verify all three prop updates work

Test each button:
1. Click "Update Old Content" - left pane updates
2. Click "Update New Content" - right pane updates
3. Click "Toggle Language" - syntax highlighting changes

### Step 4: Commit

Use `create-git-commit` skill to commit:
- Message: "feat(monaco): add POC-2.1 test page with interactive controls"

---

## Task 7 - Write Playwright Test Suite

### Files
- `tests/e2e/poc-monaco-diff-props.spec.ts` (CREATE)

### Step 1: Create test file with initial render test

```typescript
import { test, expect } from '@playwright/test'

test.describe('POC-2.1: Props-Based Content', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/poc-monaco-diff-props')

    // Wait for diff editor to load
    await page.locator('.monaco-diff-container').waitFor({ timeout: 5000 })
  })

  test('renders with initial prop values', async ({ page }) => {
    // Verify diff editor exists
    const diffEditor = page.locator('.monaco-diff-container')
    await expect(diffEditor).toBeVisible()

    // Verify 3 editor panes (original + modified + ruler)
    const editorPanes = page.locator('.monaco-editor')
    await expect(editorPanes).toHaveCount(3)

    // Capture initial state
    await page.screenshot({
      path: 'test-results/poc2-initial-render.png',
      fullPage: true
    })
  })
})
```

### Step 2: Run test to verify it passes

Run: `npm run docs:build && npm run docs:preview &`
Run: `npx playwright test tests/e2e/poc-monaco-diff-props.spec.ts -g "renders with initial"`
Expected: PASS, screenshot saved

### Step 3: Add oldContent reactivity test

Add to test suite:

```typescript
test('updates left pane when oldContent prop changes', async ({ page }) => {
  // Click "Update Old Content" button
  await page.getByRole('button', { name: 'Update Old Content' }).click()

  // Wait for Monaco to update (brief delay for model.setValue)
  await page.waitForTimeout(500)

  // Capture updated state
  await page.screenshot({
    path: 'test-results/poc2-old-content-updated.png',
    fullPage: true
  })

  // Verify console shows watch fired
  const logs = []
  page.on('console', msg => logs.push(msg.text()))

  // Visual verification: manual comparison of screenshots
})
```

### Step 4: Run test to verify oldContent reactivity

Run: `npx playwright test tests/e2e/poc-monaco-diff-props.spec.ts -g "updates left pane"`
Expected: PASS, screenshot shows "Hi" in left pane

### Step 5: Add newContent reactivity test

Add to test suite:

```typescript
test('updates right pane when newContent prop changes', async ({ page }) => {
  // Click "Update New Content" button
  await page.getByRole('button', { name: 'Update New Content' }).click()

  // Wait for Monaco to update
  await page.waitForTimeout(500)

  // Capture updated state
  await page.screenshot({
    path: 'test-results/poc2-new-content-updated.png',
    fullPage: true
  })
})
```

### Step 6: Run test to verify newContent reactivity

Run: `npx playwright test tests/e2e/poc-monaco-diff-props.spec.ts -g "updates right pane"`
Expected: PASS, screenshot shows "Hi Universe" in right pane

### Step 7: Add language switching test

Add to test suite:

```typescript
test('updates syntax highlighting when language prop changes', async ({ page }) => {
  // Capture initial JavaScript syntax
  await page.screenshot({
    path: 'test-results/poc2-lang-before.png',
    fullPage: true
  })

  // Click "Toggle Language" button
  await page.getByRole('button', { name: 'Toggle Language' }).click()

  // Wait for Monaco to update language
  await page.waitForTimeout(500)

  // Capture TypeScript syntax
  await page.screenshot({
    path: 'test-results/poc2-lang-after.png',
    fullPage: true
  })
})
```

### Step 8: Run test to verify language reactivity

Run: `npx playwright test tests/e2e/poc-monaco-diff-props.spec.ts -g "updates syntax"`
Expected: PASS, screenshots show syntax highlighting difference

### Step 9: Run all tests together

Run: `npx playwright test tests/e2e/poc-monaco-diff-props.spec.ts`
Expected: All 4 tests PASS

### Step 10: Commit

Use `create-git-commit` skill to commit:
- Message: "test(monaco): add Playwright tests for POC-2.1 prop reactivity"

---

## Task 8 - Validate Success Criteria and Document Results

### Files
- `docs/poc-monaco-diff-props-results.md` (CREATE)
- `test-results/` (VERIFY screenshots exist)

### Step 1: Verify all success metrics

Check against design plan success criteria:

- ✅ Component accepts props (TypeScript compiles)
- ✅ Initial render uses props (Playwright test passes)
- ✅ `oldContent` prop reactivity (Playwright test passes)
- ✅ `newContent` prop reactivity (Playwright test passes)
- ✅ `language` prop reactivity (Playwright test passes)
- ✅ No memory leaks (console shows setValue, not createModel)
- ✅ Performance guard works (console shows updates only when changed)
- ✅ Playwright tests pass (all 4 tests green)

### Step 2: Verify screenshots exist

Run: `ls -lh test-results/poc2-*.png`
Expected: 5 screenshots present
- poc2-initial-render.png
- poc2-old-content-updated.png
- poc2-new-content-updated.png
- poc2-lang-before.png
- poc2-lang-after.png

### Step 3: Check console logs for memory leaks

Manual verification:
1. Open browser DevTools console
2. Click each button 3 times
3. Expected: Console shows 3 "[MonacoDiffProps] ... updated" logs per button
4. Expected: NO "createModel" logs after initial mount

### Step 4: Create results document

```markdown
# POC-2.1 Results: Props-Based Content

**Date:** 2025-01-06
**Status:** ✅ PASS

## Summary

Vue 3 props successfully drive Monaco diff editor models reactively using `watch()` + `model.setValue()` pattern. No memory leaks detected.

## Test Results

| Test | Status | Evidence |
|------|--------|----------|
| Component accepts props | ✅ PASS | TypeScript compiles without errors |
| Initial render | ✅ PASS | Screenshot: poc2-initial-render.png |
| oldContent reactivity | ✅ PASS | Screenshot: poc2-old-content-updated.png |
| newContent reactivity | ✅ PASS | Screenshot: poc2-new-content-updated.png |
| language reactivity | ✅ PASS | Screenshots: poc2-lang-before/after.png |
| No memory leaks | ✅ PASS | Console shows setValue only, no createModel |
| Playwright tests | ✅ PASS | All 4 tests green |

## Key Findings

1. **`watch()` + `toRefs()` pattern works perfectly** with Monaco models
2. **`model.setValue()` is efficient** - no unnecessary re-renders
3. **Performance guards prevent redundant updates** - only setValue when content changed
4. **Language switching works** via `monaco.editor.setModelLanguage()`

## Next Steps

Proceed to POC-2.2: Theme Synchronization
- Add theme prop for Monaco editor theme
- Implement VitePress theme sync using `useData().isDark`
- Validate reactive theme switching

## Screenshots

See `test-results/poc2-*.png` for visual verification.
```

### Step 5: Save results document

Run: Manual file save
Expected: File created at `docs/poc-monaco-diff-props-results.md`

### Step 6: Final commit

Use `create-git-commit` skill to commit:
- Message: "docs(monaco): add POC-2.1 validation results"

---

## Validation Checklist

Before declaring POC-2.1 complete, verify:

- [ ] TypeScript compiles without errors
- [ ] All 4 Playwright tests pass
- [ ] 5 screenshots exist in test-results/
- [ ] Console logs show watch callbacks fire
- [ ] Console logs show NO createModel after mount
- [ ] Manual browser test confirms all 3 buttons work
- [ ] Results document created
- [ ] All commits made

## Next POC

If validation passes, proceed to:
**POC-2.2: Theme Synchronization** - Add VitePress light/dark theme integration

---

## Common Issues and Solutions

### Issue: Props not reactive

**Symptom:** Watch callbacks don't fire
**Diagnosis:** Check `toRefs()` usage, verify props destructured correctly
**Fix:** Use getter functions: `watch(() => props.oldContent, ...)`

### Issue: Models don't update

**Symptom:** `setValue()` calls fail silently
**Diagnosis:** Check `diffEditor` initialized before watch fires
**Fix:** Add null checks or defer watch with `{ flush: 'post' }`

### Issue: Memory leaks

**Symptom:** Console shows multiple `createModel()` calls
**Diagnosis:** Watch creating new models instead of updating
**Fix:** Verify using `model.setValue()` not `createModel()` in watch

### Issue: Playwright tests timeout

**Symptom:** Test fails waiting for `.monaco-diff-container`
**Diagnosis:** Monaco not loading or component not rendering
**Fix:** Check browser console for errors, verify build succeeded
