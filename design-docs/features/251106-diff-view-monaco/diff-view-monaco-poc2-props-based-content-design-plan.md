# POC-2.1: Monaco Diff Viewer - Props-Based Content

**Date:** 2025-01-06
**Status:** Design
**Goal:** Validate component accepts props for diff content and updates Monaco models reactively

---

## Problem Statement

POC-1 validated Monaco diff editor renders with hardcoded content. Before full implementation, we must validate:

1. **Can Vue props drive Monaco model content reactively?**
2. **What's the optimal pattern for updating models without memory leaks?**
3. **Does `watch()` + `model.setValue()` handle prop changes efficiently?**

This POC answers these questions by implementing prop-based content loading with the patterns recommended in Vue 3 Composition API best practices.

---

## Complete POC Strategy

### POC-2.1: Props-Based Content (This Document)
**Goal:** Prove component accepts `oldContent`, `newContent`, `language` props and updates Monaco models reactively
**Timeline:** 2-3 hours
**Status:** Current - detailed design below

### POC-2.2: Theme Synchronization (Future)
**Goal:** Validate component syncs with VitePress light/dark theme switching
**Requirements:** [FR-4.1](./diff-view-monaco-requirements.md#^FR4-1), [FR-4.2](./diff-view-monaco-requirements.md#^FR4-2), [FR-4.3](./diff-view-monaco-requirements.md#^FR4-3)
**Dependencies:** Requires POC-2.1 props pattern validated
**Timeline:** 1-2 hours
**Status:** Deferred until POC-2.1 validates prop reactivity pattern

---

## Approach

Extend POC-1's `MonacoDiffBasic.vue` component with Vue 3 Composition API props pattern:

- **Props interface** - Accept `oldContent`, `newContent`, `language` ([FR-2.1](./diff-view-monaco-requirements.md#^FR2-1), [FR-3.5](./diff-view-monaco-requirements.md#^FR3-5), [FR-5 - Component API](<./diff-view-monaco-requirements.md#FR-5 - Component API FR5>))
- **Reactive updates** - Use `watch()` + `toRefs()` to react to prop changes (Vue 3 Composition API best practice 2025)
- **Efficient model updates** - Call `model.setValue()` instead of recreating models (prevents memory churn)
- **Performance guards** - Check if content changed before updating (avoid unnecessary renders)

**Why this approach:** Vue 3 Composition API guide demonstrates `watch()` + `model.setValue()` pattern for Monaco integration. This avoids memory leaks from recreating models and follows 2025 best practices for reactive prop handling.

**Source:** [Vue 3 Composition API with Monaco Editor Best Practices (2025 Guide)](https://www.bacancytechnology.com/qanda/vue/watch-props-change-with-vue-composition-api-vue-3)

---

## Architecture

### Component Props Interface

```typescript
interface Props {
  oldContent: string      // Original/left pane content (FR-2.1)
  newContent: string      // Modified/right pane content (FR-2.1)
  language?: string       // Syntax highlighting language (FR-3.5, default: 'javascript')
}
```

### Reactive Update Pattern

```vue
<script setup lang="ts">
import { ref, toRefs, watch, onMounted, onBeforeUnmount } from 'vue'
import * as monaco from 'monaco-editor'

// Worker imports (from POC-1)
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
// ... other workers

const props = withDefaults(defineProps<Props>(), {
  language: 'javascript'
})

// Convert props to refs for reactivity (Vue 3 best practice)
const { oldContent, newContent, language } = toRefs(props)

const diffContainer = ref(null)
let diffEditor = null

onMounted(() => {
  // Configure Monaco Environment (from POC-1)
  self.MonacoEnvironment = { /* worker setup */ }

  // Create diff editor (from POC-1)
  diffEditor = monaco.editor.createDiffEditor(diffContainer.value, {
    readOnly: true,
    originalEditable: false,
    renderSideBySide: true,
    enableSplitViewResizing: true,
    renderOverviewRuler: true
  })

  // Create initial models from props
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

// Watch oldContent prop - update original (left) model
watch(oldContent, (newContent) => {
  if (!diffEditor) return

  const originalEditor = diffEditor.getOriginalEditor()
  const model = originalEditor.getModel()

  // Performance guard: only update if content changed
  if (model && model.getValue() !== newContent) {
    model.setValue(newContent)
  }
})

// Watch newContent prop - update modified (right) model
watch(newContent, (newContent) => {
  if (!diffEditor) return

  const modifiedEditor = diffEditor.getModifiedEditor()
  const model = modifiedEditor.getModel()

  // Performance guard: only update if content changed
  if (model && model.getValue() !== newContent) {
    model.setValue(newContent)
  }
})

// Watch language prop - update both models
watch(language, (newLang) => {
  if (!diffEditor) return

  const originalModel = diffEditor.getOriginalEditor().getModel()
  const modifiedModel = diffEditor.getModifiedEditor().getModel()

  if (originalModel) {
    monaco.editor.setModelLanguage(originalModel, newLang)
  }
  if (modifiedModel) {
    monaco.editor.setModelLanguage(modifiedModel, newLang)
  }
})

onBeforeUnmount(() => {
  // Dispose editor (models disposed automatically)
  diffEditor?.dispose()
})
</script>

<template>
  <div
    ref="diffContainer"
    class="monaco-diff-container"
    style="height: 600px; width: 100%; border: 1px solid #ccc;"
  />
</template>
```

### Key Patterns from Research

#### 1. Access Models via Individual Editors

```javascript
// Don't recreate models - update in-place
diffEditor.getOriginalEditor().getModel().setValue(newContent)
diffEditor.getModifiedEditor().getModel().setValue(newContent)
```

#### 2. Performance Guard Pattern

```javascript
// Check before updating to avoid unnecessary re-renders
if (model.getValue() !== newContent) {
  model.setValue(newContent)
}
```

#### 3. Language Switching

```javascript
// Use Monaco's setModelLanguage instead of recreating models
monaco.editor.setModelLanguage(model, newLanguage)
```

### Test Page Usage

```markdown
---
layout: doc
aside: false
---

# Monaco Diff Viewer POC-2.1

<script setup>
import { ref, defineAsyncComponent } from 'vue'
import { inBrowser } from 'vitepress'

const MonacoDiffProps = inBrowser
  ? defineAsyncComponent(() => import('./.vitepress/components/MonacoDiffProps.vue'))
  : () => null

// Reactive test data
const oldCode = ref(`const x = 1;\nconst y = 2;`)
const newCode = ref(`const x = 10;\nconst y = 20;`)
const lang = ref('javascript')
</script>

<ClientOnly>
  <MonacoDiffProps
    :oldContent="oldCode"
    :newContent="newCode"
    :language="lang"
  />
</ClientOnly>

<button @click="oldCode = 'const x = 999;'">Update Old Content</button>
<button @click="newCode = 'const x = 999;'">Update New Content</button>
<button @click="lang = 'typescript'">Switch to TypeScript</button>
```

---

## Success Metrics

### Quantitative Measurements

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Component accepts props | Props interface compiles | TypeScript type checking |
| Initial render uses props | Correct content displays | Playwright visual verification |
| `oldContent` prop reactivity | Left pane updates on change | Playwright button click test |
| `newContent` prop reactivity | Right pane updates on change | Playwright button click test |
| `language` prop reactivity | Syntax highlighting changes | Playwright visual verification |
| No memory leaks | Models not recreated | Console log model creation count |
| Performance guard works | setValue only when changed | Console log update call count |
| Playwright tests pass | All tests green | `npx playwright test` |

### Pass/Fail Criteria

**POC PASSES if:**
- ✅ Component renders with initial prop values
- ✅ Left pane updates when `oldContent` prop changes
- ✅ Right pane updates when `newContent` prop changes
- ✅ Syntax highlighting updates when `language` prop changes
- ✅ Models created once (not recreated on prop changes)
- ✅ No console errors
- ✅ Playwright tests pass

**POC FAILS if:**
- ❌ Props don't trigger model updates
- ❌ Models recreated on every prop change (memory leak)
- ❌ Watch callbacks don't fire
- ❌ Content updates fail silently

---

## Implementation Details

### Step 1: Create Props-Based Component

**File:** `docs/.vitepress/components/MonacoDiffProps.vue`

Copy `MonacoDiffBasic.vue` from POC-1 and add:
1. Props interface with TypeScript
2. `toRefs()` to convert props to reactive refs
3. `watch()` callbacks for each prop
4. Performance guards in watch callbacks

### Step 2: Create POC Test Page

**File:** `docs/poc-monaco-diff-props.md`

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

<button @click="updateOld" style="margin: 8px; padding: 8px 16px;">Update Old Content</button>
<button @click="updateNew" style="margin: 8px; padding: 8px 16px;">Update New Content</button>
<button @click="switchLang" style="margin: 8px; padding: 8px 16px;">Toggle Language</button>
```

### Step 3: Write Playwright Tests

**File:** `tests/e2e/poc-monaco-diff-props.spec.ts`

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

    // Visual verification shows left pane changed
  })

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
})
```

### Step 4: Run Validation Sequence

```bash
# Build for production
npm run docs:build

# Preview production build
npm run docs:preview

# Run Playwright tests
npx playwright test tests/e2e/poc-monaco-diff-props.spec.ts

# Verify screenshots show content updates
ls -lh test-results/poc2-*.png
```

### Step 5: Verify No Memory Leaks

Add console logging to watch callbacks:

```typescript
let updateCount = 0

watch(oldContent, (newContent) => {
  updateCount++
  console.log(`[POC-2.1] oldContent watch fired (count: ${updateCount})`)
  // ... update logic
})
```

Verify in browser DevTools:
1. Click "Update Old Content" button 3 times
2. Console should show 3 log entries (not model recreation)
3. Check memory tab - no Model object accumulation

---

## Risk Mitigation

### If POC-2.1 Fails

**Likely failure modes:**

1. **Props not reactive** - `watch()` callbacks don't fire
   - **Diagnosis:** Check `toRefs()` usage, verify props destructured correctly
   - **Fix:** Use getter functions: `watch(() => props.oldContent, ...)`

2. **Models don't update** - `setValue()` calls fail silently
   - **Diagnosis:** Check `diffEditor` initialized before watch fires
   - **Fix:** Add null checks or defer watch with `{ flush: 'post' }`

3. **Memory leaks** - Models recreated instead of updated
   - **Diagnosis:** Console shows multiple `createModel()` calls
   - **Fix:** Verify using `model.setValue()` not `createModel()` in watch

**Pivot strategy:**
- If watch pattern fails, investigate `watchEffect()` alternative
- If model updates fail, consider recreating models (accept memory trade-off for MVP)
- If performance unacceptable, defer reactivity to Phase 2 (static props only for MVP)

### If POC-2.1 Passes

**Next steps (POC-2.2):**
- Add theme prop for Monaco editor theme
- Implement VitePress theme sync using `useData().isDark`
- Add `watch()` for theme switching

---

## Out of Scope

**Explicitly NOT doing in POC-2.1:**

- ❌ Theme synchronization - [FR-4.1](./diff-view-monaco-requirements.md#^FR4-1), [FR-4.2](./diff-view-monaco-requirements.md#^FR4-2) (Deferred to POC-2.2)
- ❌ File path loading - [FR-2.2](./diff-view-monaco-requirements.md#^FR2-2), [FR-2.3](./diff-view-monaco-requirements.md#^FR2-3) (Deferred to POC-3)
- ❌ Loading states - [NFR-1.2](./diff-view-monaco-requirements.md#^NFR1-2) (Deferred to full implementation)
- ❌ Error handling - [FR-2.4](./diff-view-monaco-requirements.md#^FR2-4) (Deferred to full implementation)
- ❌ Labels/captions - [FR-5.1](./diff-view-monaco-requirements.md#^FR5-1), [FR-5.2](./diff-view-monaco-requirements.md#^FR5-2) (Deferred to full implementation)
- ❌ Multiple language support beyond JavaScript/TypeScript - [FR-3](./diff-view-monaco-requirements.md#^FR3) (Deferred to full implementation)
- ❌ Options prop (editor configuration) - Future enhancement
- ❌ Two-way binding / `v-model` - Read-only component per [NFR-3.1](./diff-view-monaco-requirements.md#^NFR3-1)

**Rationale:** Minimal scope validates core prop reactivity pattern. Theme sync and file loading build on this foundation.

---

## References

### Requirements
- [diff-view-monaco-requirements.md](./diff-view-monaco-requirements.md)

### POC Documents
- [POC-1: Validate Build and Render](./diff-view-monaco-poc1-validate-diff-view-builds-design-plan.md)
- [POC-1: Results](../../docs/poc-monaco-diff-results.md)

### External Sources
- [Vue 3 Composition API: Watch Props with toRefs()](https://www.bacancytechnology.com/qanda/vue/watch-props-change-with-vue-composition-api-vue-3)
- [Monaco Editor: setModelLanguage API](https://microsoft.github.io/monaco-editor/typedoc/functions/editor.setModelLanguage.html)
- [Monaco Editor: ITextModel.setValue()](https://microsoft.github.io/monaco-editor/typedoc/interfaces/editor.ITextModel.html#setValue)
- [Monaco Editor: IDiffEditor API](https://microsoft.github.io/monaco-editor/typedoc/interfaces/editor.IDiffEditor.html)

---

## Timeline

**Estimated Duration:** 2-3 hours total

| Phase | Duration | Activities |
|-------|----------|------------|
| Component Extension | 45 min | Add props interface, toRefs, watch callbacks |
| Test Page Creation | 30 min | Create markdown page with reactive controls |
| Playwright Tests | 45 min | Write 4 test scenarios, capture screenshots |
| Validation | 30 min | Run tests, verify console logs, check memory |

---

## Decision Point

**If POC-2.1 passes:**
- Vue props pattern drives Monaco models successfully
- `watch()` + `model.setValue()` handles reactivity efficiently
- No memory leaks from model recreation
- Proceed to POC-2.2 (theme synchronization)
- Confidence level: HIGH for full component implementation

**If POC-2.1 fails:**
- Props reactivity pattern incompatible with Monaco
- Pivot to static props only (no watch, accept content on mount)
- Defer dynamic updates to Phase 2
- Update requirements with revised approach
