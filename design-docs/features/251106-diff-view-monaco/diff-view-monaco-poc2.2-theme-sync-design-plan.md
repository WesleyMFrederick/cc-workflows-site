# POC-2.2: Monaco Diff Viewer - Theme Synchronization

**Date:** 2025-01-06
**Status:** Design
**Goal:** Validate component syncs with VitePress light/dark theme switching

---

## Problem Statement

POC-2.1 validated Vue props drive Monaco models reactively. Before full implementation, we must validate:

1. **Can component detect current VitePress theme (light/dark)?** ([FR-4.1](./diff-view-monaco-requirements.md#^FR4-1))
2. **Does theme update reactively when VitePress theme changes?** ([FR-4.2](./diff-view-monaco-requirements.md#^FR4-2))
3. **Do light and dark themes render with visual consistency?** ([FR-4.3](./diff-view-monaco-requirements.md#^FR4-3))

This POC answers these questions by implementing VitePress theme synchronization with the patterns validated in POC-2.1.

---

## Complete POC Strategy

### POC-2.1: Props-Based Content (Complete)
**Goal:** Prove component accepts `oldContent`, `newContent`, `language` props and updates Monaco models reactively
**Status:** Complete - validated `watch()` + reactive props pattern

### POC-2.2: Theme Synchronization (This Document)
**Goal:** Validate component syncs with VitePress light/dark theme switching
**Dependencies:** Requires POC-2.1 props pattern validated ✅
**Timeline:** 1-2 hours
**Status:** Current - detailed design below

### POC-3: File-Based Content Loading (Future)
**Goal:** Validate component loads diff content from file paths
**Dependencies:** Requires POC-2.1 and POC-2.2 complete
**Status:** Deferred until theme synchronization validated

---

## Approach

Extend POC-2.1's `MonacoDiffProps.vue` component with VitePress theme detection:

- **VitePress theme detection** - Use `useData().isDark` to detect current theme ([Research: VitePress Theme Detection](./research/vitepress-theme-detection-2025.md))
- **Reactive theme updates** - Use `watch(isDark, ...)` to react to theme changes (identical pattern to POC-2.1)
- **Monaco theme API** - Call `monaco.editor.setTheme()` to update theme without recreation ([Research: Monaco Theme API](./research/monaco-editor-theme-api-2025.md))
- **Theme name mapping** - Map `isDark` boolean to Monaco theme names: `'vs'` (light) and `'vs-dark'` (dark)

**Why this approach:** Research validates that `useData().isDark` provides reactive VitePress theme state, and `monaco.editor.setTheme()` updates themes efficiently without recreating editors. This follows the exact `watch()` pattern validated in POC-2.1. ([Research: Vue 3 Integration](./research/vue3-monaco-theme-integration-2025.md))

---

## Architecture

### VitePress Theme Detection

```typescript
import { useData } from 'vitepress'

// Extract isDark from VitePress runtime API
const { isDark } = useData()

// isDark is a boolean ref that tracks VitePress theme state
// - isDark.value === true when dark mode active
// - isDark.value === false when light mode active
```

**Source:** [VitePress Runtime API](https://vitepress.dev/reference/runtime-api), [Research: VitePress Theme Detection](./research/vitepress-theme-detection-2025.md)

### Theme Name Mapping

```typescript
// Map VitePress isDark to Monaco theme names
const monacoTheme = computed(() => {
  return isDark.value ? 'vs-dark' : 'vs'
})
```

**Monaco built-in themes:**
- `'vs'` — Light theme (NOT 'vs-light')
- `'vs-dark'` — Dark theme

**Source:** [Monaco Editor Built-in Themes](https://microsoft.github.io/monaco-editor/typedoc/types/editor.BuiltinTheme.html), [Research: Monaco Theme API](./research/monaco-editor-theme-api-2025.md)

### Reactive Theme Update Pattern

```typescript
// Watch VitePress theme changes and update Monaco
watch(isDark, (newIsDark) => {
  if (!diffEditor) return

  const themeName = newIsDark ? 'vs-dark' : 'vs'
  monaco.editor.setTheme(themeName)
})
```

**Key patterns:**
1. **Global API** - `monaco.editor.setTheme()` is global, affects all editor instances
2. **No recreation** - Editors update in-place, preserving state
3. **Performance** - Lightweight call, no memory leaks
4. **Identical to POC-2.1** - Same `watch()` pattern validated for content updates

**Source:** [Monaco Editor setTheme API](https://microsoft.github.io/monaco-editor/typedoc/functions/editor.setTheme.html), [Research: Vue 3 Integration](./research/vue3-monaco-theme-integration-2025.md)

### Complete Component Integration

```vue
<script setup lang="ts">
import { ref, toRefs, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import { useData } from 'vitepress'
import * as monaco from 'monaco-editor'

// Worker imports (preserve from POC-2.1)
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

interface Props {
  oldContent: string
  newContent: string
  language?: string
}

const props = withDefaults(defineProps<Props>(), {
  language: 'javascript'
})

const { oldContent, newContent, language } = toRefs(props)

// VitePress theme detection
const { isDark } = useData()

// Map to Monaco theme names
const monacoTheme = computed(() => {
  return isDark.value ? 'vs-dark' : 'vs'
})

const diffContainer = ref<HTMLElement | null>(null)
let diffEditor: monaco.editor.IStandaloneDiffEditor | null = null

onMounted(() => {
  if (!diffContainer.value) return

  // Configure Monaco Environment (from POC-1)
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
    theme: monacoTheme.value  // Set initial theme from VitePress
  })

  // Create initial models (from POC-2.1)
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

// Watch oldContent prop (from POC-2.1)
watch(oldContent, (newValue) => {
  if (!diffEditor) return
  const originalEditor = diffEditor.getOriginalEditor()
  const model = originalEditor.getModel()
  if (model && model.getValue() !== newValue) {
    console.log('[MonacoDiffTheme] oldContent updated')
    model.setValue(newValue)
  }
})

// Watch newContent prop (from POC-2.1)
watch(newContent, (newValue) => {
  if (!diffEditor) return
  const modifiedEditor = diffEditor.getModifiedEditor()
  const model = modifiedEditor.getModel()
  if (model && model.getValue() !== newValue) {
    console.log('[MonacoDiffTheme] newContent updated')
    model.setValue(newValue)
  }
})

// Watch language prop (from POC-2.1)
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

// Watch VitePress theme changes (NEW in POC-2.2)
watch(monacoTheme, (newTheme) => {
  if (!diffEditor) return
  console.log('[MonacoDiffTheme] Theme updated:', newTheme)
  monaco.editor.setTheme(newTheme)
})

onBeforeUnmount(() => {
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

### Test Page Usage

```markdown
---
layout: doc
aside: false
---

# Monaco Diff Viewer POC-2.2: Theme Synchronization

This page validates component syncs with VitePress theme.

<script setup>
import { ref, defineAsyncComponent } from 'vue'
import { inBrowser } from 'vitepress'

const MonacoDiffTheme = inBrowser
  ? defineAsyncComponent(() => import('./.vitepress/components/MonacoDiffTheme.vue'))
  : () => null

// Test data
const oldCode = ref(`function greet() {\\n  return \"Hello\";\\n}`)
const newCode = ref(`function greet() {\\n  return \"Hello World\";\\n}`)
</script>

<ClientOnly>
  <MonacoDiffTheme
    :oldContent="oldCode"
    :newContent="newCode"
    language="javascript"
  />
</ClientOnly>

## Test Instructions

1. **Initial Theme:** Diff editor should match current VitePress theme
2. **Toggle Theme:** Click VitePress theme toggle button (top right)
3. **Verify Sync:** Diff editor theme should update instantly
4. **Check Console:** Should show "[MonacoDiffTheme] Theme updated: vs" or "vs-dark"
```

---

## Success Metrics

### Quantitative Measurements

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Initial theme detection | Matches VitePress theme | Visual inspection of editor colors |
| Theme toggle reactivity | Updates within 100ms | Manual toggle + observation |
| Console logs show updates | Theme name logged | Browser DevTools console |
| No visual glitches | Smooth transition | Visual inspection during toggle |
| No console errors | Zero errors | Browser DevTools console |
| Playwright tests pass | All tests green | `npx playwright test` |

### Pass/Fail Criteria

**POC PASSES if:**
- ✅ Component detects initial VitePress theme on mount ([FR-4.1](./diff-view-monaco-requirements.md#^FR4-1))
- ✅ Theme updates when VitePress theme toggle clicked ([FR-4.2](./diff-view-monaco-requirements.md#^FR4-2))
- ✅ Light and dark themes render with visual consistency ([FR-4.3](./diff-view-monaco-requirements.md#^FR4-3))
- ✅ Console shows theme update logs
- ✅ No console errors during theme switching
- ✅ Playwright tests pass

**POC FAILS if:**
- ❌ Initial theme doesn't match VitePress
- ❌ Theme doesn't update when VitePress theme changes
- ❌ Visual glitches or rendering issues during switch
- ❌ Console errors appear

---

## Implementation Details

### Step 1: Copy POC-2.1 Component as Starting Point

**File:** `docs/.vitepress/components/MonacoDiffTheme.vue`

Copy `MonacoDiffProps.vue` from POC-2.1:

```bash
cp docs/.vitepress/components/MonacoDiffProps.vue docs/.vitepress/components/MonacoDiffTheme.vue
```

Expected: New file created with POC-2.1 reactive props pattern

### Step 2: Add VitePress Theme Detection

Add imports and theme detection to `MonacoDiffTheme.vue`:

```typescript
import { useData } from 'vitepress'
import { computed } from 'vue'

// Add after toRefs(props)
const { isDark } = useData()

const monacoTheme = computed(() => {
  return isDark.value ? 'vs-dark' : 'vs'
})
```

Expected: Component can access VitePress theme state

### Step 3: Update Editor Initialization with Theme

Modify `onMounted()` to set initial theme:

```typescript
diffEditor = monaco.editor.createDiffEditor(diffContainer.value, {
  readOnly: true,
  originalEditable: false,
  renderSideBySide: true,
  enableSplitViewResizing: true,
  renderOverviewRuler: true,
  automaticLayout: true,
  theme: monacoTheme.value  // NEW: Set initial theme
})
```

Expected: Editor renders with correct initial theme

### Step 4: Add Reactive Theme Watch

Add watch callback after existing prop watches:

```typescript
// Watch VitePress theme changes
watch(monacoTheme, (newTheme) => {
  if (!diffEditor) return
  console.log('[MonacoDiffTheme] Theme updated:', newTheme)
  monaco.editor.setTheme(newTheme)
})
```

Expected: Theme updates when VitePress theme toggles

### Step 5: Create POC Test Page

**File:** `docs/poc-monaco-diff-theme.md`

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

const oldCode = ref(`function greet() {\\n  return \"Hello\";\\n}`)
const newCode = ref(`function greet() {\\n  return \"Hello World\";\\n}`)
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

Expected: Test page loads, theme toggle works

### Step 6: Write Playwright Tests

**File:** `tests/e2e/poc-monaco-diff-theme.spec.ts`

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

    // Capture initial state
    await page.screenshot({
      path: 'test-results/poc2.2-initial-theme.png',
      fullPage: true
    })
  })

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

  test('handles multiple theme toggles without issues', async ({ page }) => {
    const themeToggle = page.locator('button.VPSwitch')

    // Toggle theme 4 times
    for (let i = 0; i < 4; i++) {
      await themeToggle.click()
      await page.waitForTimeout(300)
    }

    // Verify no console errors
    const errors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.waitForTimeout(500)
    expect(errors).toHaveLength(0)
  })
})
```

Expected: All 3 tests pass

### Step 7: Run Validation Sequence

```bash
# Build for production
npm run docs:build

# Preview production build
npm run docs:preview

# Run Playwright tests
npx playwright test tests/e2e/poc-monaco-diff-theme.spec.ts

# Verify screenshots show theme changes
ls -lh test-results/poc2.2-*.png
```

Expected: All tests pass, screenshots show different themes

### Step 8: Manual Verification

1. Run `npm run docs:dev`
2. Navigate to `http://localhost:5173/poc-monaco-diff-theme`
3. Verify initial theme matches VitePress
4. Click VitePress theme toggle (top right)
5. Observe instant theme update in diff editor
6. Check browser console for "[MonacoDiffTheme] Theme updated" logs
7. Toggle theme 5+ times - verify smooth updates, no errors

---

## Risk Mitigation

### If POC-2.2 Fails

**Likely failure modes:**

1. **useData() not accessible** - Component can't import VitePress composable
   - **Diagnosis:** Import error or SSR issue
   - **Fix:** Wrap in `inBrowser` check, use conditional import
   - **Pivot:** Fall back to manual theme detection via CSS classes

2. **Theme doesn't update** - Watch callback doesn't fire
   - **Diagnosis:** `computed()` or `watch()` setup incorrect
   - **Fix:** Use direct watch on `isDark` instead of computed
   - **Pivot:** Poll theme state on interval (non-reactive fallback)

3. **Visual glitches** - Theme transition shows artifacts
   - **Diagnosis:** Monaco rendering lag during theme switch
   - **Fix:** Add debounce to theme updates (100ms delay)
   - **Pivot:** Accept minor visual artifacts for MVP

**Pivot strategy:**
- If `useData()` fails, implement manual theme detection via DOM inspection
- If reactivity fails, use MutationObserver to watch theme attribute changes
- If visual issues persist, document as known limitation for MVP

### If POC-2.2 Passes

**Next steps:**
- Merge theme synchronization into main component
- Proceed to POC-3 (file-based content loading)
- High confidence for full implementation

---

## Out of Scope

**Explicitly NOT doing in POC-2.2:**

- ❌ Custom Monaco themes - Using built-in 'vs' and 'vs-dark' only
- ❌ Theme preference persistence - VitePress handles this
- ❌ Manual theme override - Users control via VitePress toggle only
- ❌ Smooth theme transitions - Instant switch acceptable for MVP
- ❌ High contrast mode - [NFR-4](./diff-view-monaco-requirements.md#^NFR4) deferred to Phase 2
- ❌ System theme detection - VitePress handles this
- ❌ Theme customization via props - Fixed VitePress theme sync only

**Rationale:** Minimal scope validates core VitePress theme synchronization. Custom themes and transitions are future enhancements.

---

## References

### Requirements
- [diff-view-monaco-requirements.md](./diff-view-monaco-requirements.md)
  - [FR-4.1: Detect VitePress theme](./diff-view-monaco-requirements.md#^FR4-1)
  - [FR-4.2: Reactive theme updates](./diff-view-monaco-requirements.md#^FR4-2)
  - [FR-4.3: Visual consistency](./diff-view-monaco-requirements.md#^FR4-3)

### POC Documents
- [POC-2.1: Props-Based Content](./diff-view-monaco-poc2-props-based-content-design-plan.md)
- [POC-2.1: Implementation Plan](./diff-view-monaco-poc2-props-based-content-implementation-plan.md)

### Research
- [VitePress Theme Detection 2025](./research/vitepress-theme-detection-2025.md)
- [Monaco Editor Theme API 2025](./research/monaco-editor-theme-api-2025.md)
- [Vue 3 Monaco Theme Integration 2025](./research/vue3-monaco-theme-integration-2025.md)

### External Sources
- [VitePress Runtime API](https://vitepress.dev/reference/runtime-api)
- [Monaco Editor setTheme API](https://microsoft.github.io/monaco-editor/typedoc/functions/editor.setTheme.html)
- [Monaco Editor Built-in Themes](https://microsoft.github.io/monaco-editor/typedoc/types/editor.BuiltinTheme.html)

---

## Timeline

**Estimated Duration:** 1-2 hours total

| Phase | Duration | Activities |
|-------|----------|------------|
| Component Extension | 20 min | Add useData, computed theme, watch callback |
| Test Page Creation | 15 min | Create markdown page with test instructions |
| Playwright Tests | 30 min | Write 3 test scenarios, capture screenshots |
| Manual Validation | 15 min | Toggle theme, verify logs, check visual consistency |
| Documentation | 20 min | Document results, prepare for POC-3 |

---

## Decision Point

**If POC-2.2 passes:**
- VitePress theme detection works via `useData().isDark`
- Monaco theme updates reactively via `monaco.editor.setTheme()`
- Pattern identical to POC-2.1's validated `watch()` approach
- Proceed to POC-3 (file-based content loading)
- Confidence level: HIGH for full theme implementation

**If POC-2.2 fails:**
- Theme detection pattern incompatible
- Pivot to manual DOM-based theme detection
- Update requirements with revised approach
- May defer reactive theme sync to Phase 2
