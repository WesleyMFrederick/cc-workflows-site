# POC-1: Monaco Diff Viewer - Validate Build and Render

**Date:** 2025-01-06
**Status:** Design
**Goal:** Validate Monaco Diff Editor loads and renders side-by-side view in VitePress production builds

---

## Problem Statement

Monaco Editor has known SSR incompatibility with VitePress (GitHub issues #1508, #2832). Before investing in full diff viewer implementation, we must validate:

1. **Can Monaco load in VitePress production builds without SSR errors?**
2. **Can Monaco's diff editor render side-by-side view correctly?**

This POC answers both questions with minimal code, validating the foundational technical assumptions.

---

## Complete POC Strategy

### POC-1: Validate Diff Viewer Builds (This Document)
**Goal:** Prove Monaco diff editor loads in production and renders side-by-side view
**Timeline:** 1 hour
**Status:** Current - detailed design below

### POC-2: Props-Based Content and Theme Sync (Future)
**Goal:** Validate component accepts props for content and syncs with VitePress theme
**Requirements:** [FR-2.1](./diff-view-monaco-requirements.md#^FR2-1), [FR-4.1](./diff-view-monaco-requirements.md#^FR4-1), [FR-4.2](./diff-view-monaco-requirements.md#^FR4-2), [FR-5 - Component API](<diff-view-monaco-requirements.md#FR-5 - Component API FR5>)
**Dependencies:** Requires POC-1 passing
**Timeline:** 1-2 hours
**Status:** Deferred until POC-1 validates technical feasibility

### POC-3: File-Based Loading Pattern (Future)
**Goal:** Validate loading diff content from file paths
**Requirements:** [FR-2.2](./diff-view-monaco-requirements.md#^FR2-2), [FR-2.3](./diff-view-monaco-requirements.md#^FR2-3), [FR-2.4](./diff-view-monaco-requirements.md#^FR2-4)
**Dependencies:** Requires POC-2 passing
**Timeline:** 1-2 hours
**Status:** Deferred

---

## Approach

Create minimal Monaco diff viewer component using:
- SSR-safe loading pattern (`inBrowser + defineAsyncComponent`) - Validates [NFR-1.1](./diff-view-monaco-requirements.md#^NFR1-1) async loading
- Hardcoded before/after content (proves render works) - Validates [FR-1.1](./diff-view-monaco-requirements.md#^FR1-1) side-by-side display
- Read-only configuration (matches [NFR-3.1](./diff-view-monaco-requirements.md#^NFR3-1)) - No editing capabilities required
- Single Playwright test (validates in production build) - Validates [NFR-7.2](./diff-view-monaco-requirements.md#^NFR7-2) VitePress integration

**Why this approach:** Validates actual diff editor API (not basic editor) with minimum code. If this works, props/theme/file-loading are straightforward enhancements.

---

## Architecture

### File Structure

```text
docs/
├── poc-monaco-diff.md                    # POC test page
└── .vitepress/
    ├── config.mts                        # Updated with Monaco config
    └── components/
        └── MonacoDiffBasic.vue           # Minimal diff viewer

tests/
└── poc-monaco-diff.spec.ts               # Playwright validation
```

### Component Pattern

**SSR-Safe Loading in Markdown:**

```vue
<script setup>
import { defineAsyncComponent } from 'vue'
import { inBrowser } from 'vitepress'

const MonacoDiffBasic = inBrowser
  ? defineAsyncComponent(() => import('./.vitepress/components/MonacoDiffBasic.vue'))
  : () => null
</script>

<template>
  <ClientOnly>
    <MonacoDiffBasic />
  </ClientOnly>
</template>
```

**Monaco Diff Editor Component:**

```vue
<script setup>
import { ref, onMounted } from 'vue'
import * as monaco from 'monaco-editor'

const diffContainer = ref(null)

onMounted(async () => {
  // Create diff editor with read-only configuration
  const diffEditor = monaco.editor.createDiffEditor(diffContainer.value, {
    readOnly: true,              // Prevents all editing
    originalEditable: false,     // Locks original (left) editor
    renderSideBySide: true,      // Side-by-side view (default)
    enableSplitViewResizing: true, // Allow pane width adjustment
    renderOverviewRuler: true    // Show minimap overview
  })

  // Create models with hardcoded content
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

**Vite Configuration:**

```typescript
// docs/.vitepress/config.mts
import { defineConfig } from 'vitepress'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'

export default defineConfig({
  // ... existing config

  vite: {
    ssr: {
      noExternal: ['monaco-editor']  // Required for Monaco in VitePress
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

---

## Monaco Read-Only Diff Configuration

Based on Monaco's `IDiffEditor` interface, we use these settings for read-only viewing:

### Core Options
- **`readOnly: true`** - Prevents all editing in both panes ([NFR-3.1](./diff-view-monaco-requirements.md#^NFR3-1))
- **`originalEditable: false`** - Locks the original (left) editor (default behavior)
- **`renderSideBySide: true`** - Side-by-side view ([FR-1.1](./diff-view-monaco-requirements.md#^FR1-1))

### Additional Methods Available (Not Used in POC-1)
- `getOriginalEditor()` - Access to left editor instance (for future enhancements)
- `getModifiedEditor()` - Access to right editor instance (for future enhancements)
- `getLineChanges()` - Returns `ILineChange[]` diff computation results (for future analytics)
- `onDidUpdateDiff` - Event fires when diff computations complete (for future loading states)

**Source:** [Monaco IDiffEditor Documentation](https://microsoft.github.io/monaco-editor/typedoc/interfaces/editor.IDiffEditor.html)

---

## Success Metrics

### Quantitative Measurements

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Production build completes | Exit code 0 | `npm run docs:build` |
| Diff editor DOM renders | `.monaco-diff-editor` visible | Browser DevTools / Playwright |
| Side-by-side panes exist | 2 `.monaco-editor` elements | Playwright `locator().count()` |
| Diff highlighting visible | Visual indicators between panes | Manual visual verification |
| Monaco chunk loads | >100KB downloaded | DevTools Network tab |
| Playwright test passes | Green test status | `npx playwright test` |
| Screenshot captured | Visual output for LLM eval | `test-results/poc-monaco-diff-visual.png` |

### Pass/Fail Criteria

**POC PASSES if:**
- ✅ All quantitative metrics meet targets
- ✅ No console errors related to Monaco
- ✅ Diff editor interactive (scrolling works in both panes)

**POC FAILS if:**
- ❌ Production build errors occur
- ❌ Monaco container not visible in browser
- ❌ Only single pane renders (diff editor init failed)
- ❌ Console shows Monaco-related errors

---

## Implementation Details

### Step 1: Install Dependencies

```bash
npm install monaco-editor vite-plugin-monaco-editor
```

### Step 2: Create POC Test Page
**File:** `docs/poc-monaco-diff.md`

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

### Step 3: Create Diff Viewer Component
**File:** `docs/.vitepress/components/MonacoDiffBasic.vue`

See component code in Architecture section above.

### Step 4: Update Vite Config
**File:** `docs/.vitepress/config.mts`

Add SSR configuration and Monaco plugin (see Architecture section).

### Step 5: Write Playwright Test
**File:** `tests/poc-monaco-diff.spec.ts`

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

### Step 6: Run Validation Sequence

```bash
# Build for production
npm run docs:build

# Preview production build locally
npm run docs:preview

# Run Playwright test
npx playwright test tests/poc-monaco-diff.spec.ts
```

---

## Risk Mitigation

### If POC-1 Fails

**Likely failure modes:**
1. **SSR build errors** - Monaco cannot load in VitePress despite workarounds
2. **Diff editor doesn't render** - `createDiffEditor()` fails silently
3. **Only one pane renders** - Side-by-side layout broken

**Pivot strategy:**
- Recommend `diff2html` library (396 KB, SSR-compatible, proven with VitePress)
- Trade-off: Less interactive than Monaco, but sufficient for documentation use case
- **Source:** [diff2html-lightweight-research.md](./research/diff2html-lightweight-research.md)

### If POC-1 Passes

**Next steps (POC-2):**
- Add component props for content (`oldContent`, `newContent`)
- Implement VitePress theme synchronization using `useData().isDark`
- Add language prop for syntax highlighting override

---

## Out of Scope

**Explicitly NOT doing in POC-1:**

- ❌ Component props - [FR-2.1](./diff-view-monaco-requirements.md#^FR2-1), [FR-5 - Component API](<diff-view-monaco-requirements.md#FR-5 - Component API FR5>) (Deferred to POC-2)
- ❌ Theme synchronization - [FR-4.1](./diff-view-monaco-requirements.md#^FR4-1), [FR-4.2](./diff-view-monaco-requirements.md#^FR4-2) (Deferred to POC-2)
- ❌ File content loading - [FR-2.2](./diff-view-monaco-requirements.md#^FR2-2), [FR-2.3](./diff-view-monaco-requirements.md#^FR2-3) (Deferred to POC-3)
- ❌ Language detection - [FR-3.5](./diff-view-monaco-requirements.md#^FR3-5) (Deferred to POC-2)
- ❌ Error handling - [FR-2.4](./diff-view-monaco-requirements.md#^FR2-4), [NFR-6.3](./diff-view-monaco-requirements.md#^NFR6-3) (Deferred to POC-3)
- ❌ Loading states - [NFR-1.2](./diff-view-monaco-requirements.md#^NFR1-2) (Deferred to POC-2)
- ❌ Multiple diff instances (POC validates single instance only)
- ❌ Bundle size optimization - [NFR-2.1](./diff-view-monaco-requirements.md#^NFR2-1), [NFR-2.2](./diff-view-monaco-requirements.md#^NFR2-2) (Deferred to full implementation)
- ❌ Editor cleanup - [NFR-6 - Maintainability](<diff-view-monaco-requirements.md#NFR-6 - Maintainability NFR6>) (Deferred to full implementation)
- ❌ Minimap customization - [FR-1.4](./diff-view-monaco-requirements.md#^FR1-4) (Using defaults for POC)
- ❌ Line/gutter customization - [FR-1.3](./diff-view-monaco-requirements.md#^FR1-3), [NFR-3.4](./diff-view-monaco-requirements.md#^NFR3-4) (Using defaults for POC)
- ❌ Advanced diff options (Using Monaco defaults for POC)

**Rationale:** Minimal scope validates core technical assumptions. Enhancements deferred until feasibility proven.

---

## References

### Research Documents
- [Monaco Editor Research](./research/monaco-editor-research.md)
- [VitePress Integration Patterns](./research/vitepress-integration-patterns.md)
- [Requirements Whiteboard](./diff-view-monaco-whiteboard.md)

### External Sources
- [Monaco IDiffEditor API](https://microsoft.github.io/monaco-editor/typedoc/interfaces/editor.IDiffEditor.html)
- [VitePress SSR Compatibility](https://vitepress.dev/guide/ssr-compat)
- [VitePress Issue #2832 (Working Solution)](https://github.com/vuejs/vitepress/issues/2832)

---

## Timeline

**Estimated Duration:** 1 hour total

| Phase | Duration | Activities |
|-------|----------|-----------|
| Setup | 10 min | Install dependencies, create files |
| Implementation | 30 min | Write component, update config, create test page |
| Testing | 10 min | Build production, run Playwright test |
| Validation | 10 min | Manual verification, document results |

---

## Decision Point

**If POC-1 passes:**
- Monaco diff editor is viable for VitePress
- Proceed to POC-2 (props and theme integration)
- Confidence level: HIGH for full implementation

**If POC-1 fails:**
- Monaco incompatible with VitePress production builds
- Pivot to `diff2html` alternative
- Update requirements document with revised approach
