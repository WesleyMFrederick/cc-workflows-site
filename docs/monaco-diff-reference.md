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

## 1. Architecture Patterns

### Component Lifecycle Pattern (SSR-Safe)

**Critical:** Both Monaco Editor AND workers must be dynamically imported to avoid SSR failures.

```typescript
// 1. Use type-only import for TypeScript types (does not execute at runtime)
import type * as Monaco from 'monaco-editor'

// 2. Create nullable monaco reference for use in lifecycle hooks
let monaco: typeof Monaco | null = null

// 3. Dynamically import Monaco + workers in onMounted (browser-only)
onMounted(async () => {
  if (!container.value) return

  // Import Monaco Editor and all workers dynamically
  const [
    monacoModule,  // Monaco Editor library itself
    { default: editorWorker },
    { default: jsonWorker },
    { default: cssWorker },
    { default: htmlWorker },
    { default: tsWorker }
  ] = await Promise.all([
    import('monaco-editor'),  // ⚠️ CRITICAL: Monaco itself must be dynamic
    import('monaco-editor/esm/vs/editor/editor.worker?worker'),
    import('monaco-editor/esm/vs/language/json/json.worker?worker'),
    import('monaco-editor/esm/vs/language/css/css.worker?worker'),
    import('monaco-editor/esm/vs/language/html/html.worker?worker'),
    import('monaco-editor/esm/vs/language/typescript/ts.worker?worker')
  ])

  // Store monaco reference for use in watch blocks
  monaco = monacoModule

  // 4. Configure workers after dynamic import
  self.MonacoEnvironment = {
    getWorker(_: any, label: string) {
      if (label === 'json') return new jsonWorker()
      if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker()
      if (label === 'html' || label === 'handlebars' || label === 'razor') return new htmlWorker()
      if (label === 'typescript' || label === 'javascript') return new tsWorker()
      return new editorWorker()
    }
  }

  // 5. Create diff editor using dynamically imported monaco
  diffEditor = monaco.editor.createDiffEditor(container.value, {
    readOnly: true,
    originalEditable: false,
    renderSideBySide: true,
    enableSplitViewResizing: true,
    renderOverviewRuler: true,
    automaticLayout: true,
    contextmenu: false,
    theme: monacoTheme.value,
    wordWrap: 'on'
  })

  // 6. Set initial models
  const originalModel = monaco.editor.createModel(oldContent, language)
  const modifiedModel = monaco.editor.createModel(newContent, language)
  diffEditor.setModel({ original: originalModel, modified: modifiedModel })
})

// 7. Use watch() for reactive prop updates (with null check)
watch(() => props.oldContent, (newValue) => {
  if (!diffEditor || !monaco) return  // ⚠️ Check monaco availability
  const model = diffEditor.getOriginalEditor().getModel()
  if (model && model.getValue() !== newValue) {
    model.setValue(newValue)  // Reuse model - no createModel
  }
})

// 8. Watch language changes (with null check)
watch(() => props.language, (newLang) => {
  if (!diffEditor || !monaco) return  // ⚠️ Check monaco availability
  const originalModel = diffEditor.getOriginalEditor().getModel()
  const modifiedModel = diffEditor.getModifiedEditor().getModel()
  if (originalModel) monaco.editor.setModelLanguage(originalModel, newLang)
  if (modifiedModel) monaco.editor.setModelLanguage(modifiedModel, newLang)
})

// 9. Cleanup in onBeforeUnmount
onBeforeUnmount(() => {
  diffEditor?.dispose()
})
```

### SSR-Safe Loading Pattern (Critical)

```vue
<!-- In markdown page -->
<script setup>
import { defineAsyncComponent } from 'vue'
import { inBrowser } from 'vitepress'

const MonacoDiff = inBrowser
  ? defineAsyncComponent(() => import('./.vitepress/components/MonacoDiffFile.vue'))
  : () => null
</script>

<ClientOnly>
  <MonacoDiff
    oldFile="assets/old.md"
    newFile="assets/new.md"
    language="markdown"
  />
</ClientOnly>
```

### Page Layout Requirements

```yaml
---
layout: doc
aside: false  # REQUIRED: Removes right sidebar for wide diff view
---
```

**Viewport Requirements:** Side-by-side rendering requires >= 1440px width. Below this, Monaco falls back to inline diff.

---

## 2. Critical Configurations

### VitePress Config (`docs/.vitepress/config.mts`)

```typescript
export default defineConfig({
  srcExclude: ['**/assets/**'],  // Exclude from page generation

  vite: {
    ssr: {
      noExternal: ['monaco-editor']  // REQUIRED: Bundle Monaco for SSR
    }
    // NO vite-plugin-monaco-editor - use native Vite workers
  }
})
```

### Monaco Editor Options

```typescript
monaco.editor.createDiffEditor(container, {
  readOnly: true,                  // Prevent editing
  originalEditable: false,         // Lock left pane
  renderSideBySide: true,          // Side-by-side (not unified)
  enableSplitViewResizing: true,   // User can resize panes
  renderOverviewRuler: true,       // Show minimap
  automaticLayout: true,           // Auto-resize on container changes
  contextmenu: false,              // Disables right-click context menu
  theme: monacoTheme.value,        // Dynamic theme from VitePress (vs-dark / vs)
  wordWrap: 'on'                   // Enable word wrapping for long lines
})
```

---

## 3. Component API

### Props Interface

```typescript
interface Props {
  // Props-based content (POC-2.1)
  oldContent?: string
  newContent?: string

  // File-based content (POC-3)
  oldFile?: string      // e.g., 'default-system-prompt.md'
  newFile?: string      // e.g., 'output-style-system-prompt.md'

  language?: string     // Default: 'markdown'
}

const props = withDefaults(defineProps<Props>(), {
  language: 'markdown'
})
```

### Usage Examples

```vue
<!-- Props-based content -->
<MonacoDiff
  :oldContent="'const x = 1;'"
  :newContent="'const x = 10;'"
  language="javascript"
/>

<!-- File-based content -->
<MonacoDiff
  oldFile="default-system-prompt.md"
  newFile="output-style-system-prompt.md"
  language="markdown"
/>
```

### Reactive Updates Pattern (POC-2.1 Validated)

```typescript
// Use watch() + model.setValue() (NOT createModel)
watch(() => props.oldContent, (newValue) => {
  const model = diffEditor.getOriginalEditor().getModel()
  if (model && model.getValue() !== newValue) {
    model.setValue(newValue)  // Efficient - reuses model
  }
})

watch(() => props.language, (newLang) => {
  const originalModel = diffEditor.getOriginalEditor().getModel()
  const modifiedModel = diffEditor.getModifiedEditor().getModel()
  if (originalModel) monaco.editor.setModelLanguage(originalModel, newLang)
  if (modifiedModel) monaco.editor.setModelLanguage(modifiedModel, newLang)
})
```

---

## 4. Data Loading Pattern (POC-3, POC-5)

### Problem: srcExclude Blocks import.meta.glob
VitePress `srcExclude` prevents files from being processed by Vite, breaking `import.meta.glob` imports.

### Solution: Node.js fs-based Data Loader

**⚠️ Critical:** VitePress `createContentLoader` **only supports Markdown files**. For non-markdown files (TypeScript, JavaScript, Vue, etc.), you MUST use Node.js `fs` module.

**File:** `docs/.vitepress/loaders/assets.data.ts`

```typescript
import fs from 'node:fs'
import path from 'node:path'

export interface AssetFile {
  path: string
  content: string
}

declare const data: AssetFile[]
export { data }

// VitePress createContentLoader only supports Markdown files
// For non-markdown files (TypeScript, JavaScript, Vue, etc.), use Node.js fs
// This approach is validated by POC-5 (commit ebfc237)
export default {
  load() {
    const assetsDir = path.resolve(__dirname, '../../assets')
    const files: AssetFile[] = []

    // Supported extensions for multi-language syntax highlighting
    const supportedExtensions = ['.md', '.ts', '.js', '.vue', '.html', '.css', '.json', '.yaml']

    // Read all files from assets directory
    const dirEntries = fs.readdirSync(assetsDir, { withFileTypes: true })

    for (const entry of dirEntries) {
      if (entry.isFile()) {
        const ext = path.extname(entry.name)

        // Only include files with supported extensions
        if (supportedExtensions.includes(ext)) {
          const filePath = path.join(assetsDir, entry.name)
          const content = fs.readFileSync(filePath, 'utf-8')
          files.push({
            path: entry.name,
            content
          })
        }
      }
    }

    return files
  }
}
```

**Component Usage:**

```typescript
import { data as assetFiles } from '../loaders/assets.data'

// Convert to Record<filename, content>
const fileContents: Record<string, string> = {}
for (const file of assetFiles) {
  fileContents[file.path] = file.content
}

console.log('[MonacoDiffFile] Loaded files:', Object.keys(fileContents))
```

### Path Normalization

```typescript
// Strip directory prefixes - data loader provides just filenames
function normalizeFilePath(path: string): string {
  return path.split('/').pop() || path
}

function loadFileContent(path: string): string | null {
  const normalizedPath = normalizeFilePath(path)
  const content = fileContents[normalizedPath]
  return content ?? null
}
```

### Error Handling Pattern

```typescript
const contentOrError = computed(() => {
  let oldContentValue = ''
  let newContentValue = ''
  let errorMessage: string | null = null

  // Validate prop combinations
  if (props.oldContent && props.oldFile) {
    errorMessage = 'Cannot specify both oldContent and oldFile'
  } else if (!props.oldContent && !props.oldFile) {
    errorMessage = 'Must specify either oldContent or oldFile'
  } else if (props.oldFile) {
    const content = loadFileContent(props.oldFile)
    if (content === null) {
      errorMessage = `File not found: ${props.oldFile}`
    } else {
      oldContentValue = content
    }
  }

  // Similar validation for newContent/newFile...

  return { oldContent: oldContentValue, newContent: newContentValue, error: errorMessage }
})
```

---

## 5. Common Pitfalls

### Pitfall 1: createContentLoader Only Supports Markdown

```typescript
// ❌ FAILS - createContentLoader only loads .md files
import { createContentLoader } from 'vitepress'
export default createContentLoader('assets/*.{md,ts,js}', { includeSrc: true })
// Result: Only .md files load, .ts and .js are ignored

// ❌ ALSO FAILS - files in srcExclude not processed by Vite
const files = import.meta.glob('/docs/assets/*.md', { eager: true, query: '?raw' })
// Result: empty object {}

// ✅ WORKS - Use Node.js fs for non-markdown files
import fs from 'node:fs'
import path from 'node:path'

export default {
  load() {
    const assetsDir = path.resolve(__dirname, '../../assets')
    const files = []
    const dirEntries = fs.readdirSync(assetsDir, { withFileTypes: true })

    for (const entry of dirEntries) {
      if (entry.isFile()) {
        const content = fs.readFileSync(path.join(assetsDir, entry.name), 'utf-8')
        files.push({ path: entry.name, content })
      }
    }
    return files
  }
}
```

**Critical Discovery (POC-6):** VitePress `createContentLoader` is **markdown-only** by design. Attempting to load TypeScript, JavaScript, Vue, or other file types will silently fail. Always use the fs-based approach shown above for multi-language support.

### Pitfall 2: SSR Errors with Monaco

**Two levels of SSR protection required:**

1. **Component level** - Use `defineAsyncComponent` + `<ClientOnly>`
2. **Worker level** - Use dynamic imports in `onMounted()`

```vue
<!-- ❌ FAILS - Monaco imported during SSR -->
<script setup>
import MonacoDiff from './components/MonacoDiff.vue'
</script>

<!-- ✅ WORKS - Client-only loading -->
<script setup>
import { defineAsyncComponent } from 'vue'
import { inBrowser } from 'vitepress'

const MonacoDiff = inBrowser
  ? defineAsyncComponent(() => import('./components/MonacoDiff.vue'))
  : () => null
</script>
<ClientOnly><MonacoDiff /></ClientOnly>
```

**Inside component - Complete SSR-safe pattern:**
```typescript
// ❌ FAILS - Top-level imports execute during SSR build
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'

// ✅ WORKS - Type-only import + dynamic runtime imports
import type * as Monaco from 'monaco-editor'

let monaco: typeof Monaco | null = null

onMounted(async () => {
  // Dynamically import Monaco + workers (browser-only execution)
  const [
    monacoModule,
    { default: editorWorker }
    // ... other workers
  ] = await Promise.all([
    import('monaco-editor'),  // Monaco library itself
    import('monaco-editor/esm/vs/editor/editor.worker?worker')
    // ... other worker imports
  ])

  monaco = monacoModule  // Store for use in watch blocks

  // Configure and use monaco...
})

// Watch blocks must check monaco availability
watch(someProp, () => {
  if (!monaco) return  // Guard against SSR or pre-mount execution
  monaco.editor.doSomething()
})
```

### Pitfall 3: Monaco DOM Structure Assumptions
Diff editor creates **3** `.monaco-editor` elements:
1. Left pane (original)
2. Right pane (modified)
3. Overview ruler (minimap)

### Pitfall 4: Worker Plugin Conflicts

```typescript
// ❌ DON'T USE - conflicts with VitePress
import monacoEditorPlugin from 'vite-plugin-monaco-editor'

// ✅ USE - Vite native workers (2025 best practice)
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
```

### Pitfall 5: Memory Leaks with createModel

```typescript
// ❌ MEMORY LEAK - creates new model without disposing old one
watch(content, (newValue) => {
  const model = monaco.editor.createModel(newValue, 'javascript')
  editor.setModel(model)
})

// ✅ CORRECT - reuse existing model
watch(content, (newValue) => {
  const model = editor.getModel()
  model.setValue(newValue)
})
```

---

## 6. Theme Synchronization (POC-2.2)

### VitePress Theme Detection

```typescript
import { useData } from 'vitepress'
import { computed, watch } from 'vue'

const { isDark } = useData()  // Reactive VitePress theme state

// Map to Monaco theme names
const monacoTheme = computed(() => isDark.value ? 'vs-dark' : 'vs')

// Set initial theme
monaco.editor.createDiffEditor(container.value, {
  theme: monacoTheme.value
})

// Reactive theme synchronization
watch(monacoTheme, (newTheme) => {
  if (!diffEditor) return
  monaco.editor.setTheme(newTheme)  // Updates all editors globally
})
```

**Performance:** Theme switches complete in <100ms, stable across rapid toggles.

---

## 7. Worker Setup (2025 Best Practice - SSR-Safe)

### Complete Dynamic Import Pattern

**⚠️ Critical:** BOTH Monaco Editor and workers must be dynamically imported to avoid SSR errors.

```typescript
// Step 1: Type-only import (no runtime execution)
import type * as Monaco from 'monaco-editor'

// Step 2: Create nullable reference
let monaco: typeof Monaco | null = null

// Step 3: Dynamic imports in onMounted
onMounted(async () => {
  // Import Monaco Editor library + all language workers
  const [
    monacoModule,      // ⚠️ Monaco itself must be dynamic!
    { default: editorWorker },
    { default: jsonWorker },
    { default: cssWorker },
    { default: htmlWorker },
    { default: tsWorker }
  ] = await Promise.all([
    import('monaco-editor'),  // Main library
    import('monaco-editor/esm/vs/editor/editor.worker?worker'),
    import('monaco-editor/esm/vs/language/json/json.worker?worker'),
    import('monaco-editor/esm/vs/language/css/css.worker?worker'),
    import('monaco-editor/esm/vs/language/html/html.worker?worker'),
    import('monaco-editor/esm/vs/language/typescript/ts.worker?worker')
  ])

  // Store monaco reference for watch blocks
  monaco = monacoModule

  // Configure worker resolution
  self.MonacoEnvironment = {
    getWorker(_: any, label: string) {
      if (label === 'json') return new jsonWorker()
      if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker()
      if (label === 'html' || label === 'handlebars' || label === 'razor') return new htmlWorker()
      if (label === 'typescript' || label === 'javascript') return new tsWorker()
      return new editorWorker()
    }
  }

  // Now safe to use monaco.editor.* APIs
  diffEditor = monaco.editor.createDiffEditor(container.value, { /* config */ })
})
```

### Build Output
Workers successfully bundle to production:

```text
dist/assets/
  css.worker-[hash].js      (1.0 MB)
  editor.worker-[hash].js   (246 KB)
  html.worker-[hash].js     (677 KB)
  json.worker-[hash].js     (374 KB)
  ts.worker-[hash].js       (5.8 MB)
```

**Total:** ~8.1 MB (expected for full Monaco with TypeScript support)

### Why Dynamic Imports Are Required

**Root Cause:** Monaco Editor's module-level code and worker imports reference browser globals (`window`, `self`, `document`) that don't exist in Node.js SSR environments.

**What Fails:**
- `import * as monaco from 'monaco-editor'` - Module initialization code runs during SSR
- `import worker from 'monaco-editor/...?worker'` - Worker imports trigger browser-specific code
- Both cause "window is not defined" or "ReferenceError: self is not defined" during build

**Solution Pattern:**
```typescript
// ✅ Use type-only import (erased at runtime, safe for SSR)
import type * as Monaco from 'monaco-editor'

// ✅ Dynamic imports in onMounted (browser-only execution)
onMounted(async () => {
  const [monacoModule, ...workers] = await Promise.all([
    import('monaco-editor'),
    // worker imports...
  ])
  monaco = monacoModule
})
```

**Why This Works:**
1. **Deferred execution** - Code only runs after component mounts in browser
2. **No SSR evaluation** - Build process doesn't execute dynamic imports
3. **Maintains bundling** - Vite still bundles Monaco and workers for production
4. **Type-safe** - `import type` provides TypeScript types without runtime import
5. **Null-safe** - Watch blocks check `if (!monaco)` before using APIs

### Why This Pattern Works
1. **No plugin dependency** - Vite handles `?worker` imports natively
2. **VitePress compatible** - No conflicts with VitePress build process
3. **SSR-safe** - Dynamic imports + worker setup in `onMounted` (client-only)
4. **Production-ready** - Workers automatically bundled and hashed

**References:**
- [VitePress Issue #2832](https://github.com/vuejs/vitepress/issues/2832)
- [GitHub Issue #10](https://github.com/WesleyMFrederick/cc-workflows-site/issues/10) - SSR Build Failure Fix

---

## Quick Start Checklist

### 1. Installation & Configuration
- **Install:** `npm install monaco-editor@0.54.0`
- **VitePress Config:** Add `ssr.noExternal: ['monaco-editor']` to `vite.ssr` in config.mts
- **Exclude assets:** Add `srcExclude: ['**/assets/**']` to prevent asset files from being rendered as pages

### 2. Component Implementation (SSR-Safe Pattern)

```vue
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import type * as Monaco from 'monaco-editor'  // ⚠️ Type-only import

let monaco: typeof Monaco | null = null
let diffEditor = null
const container = ref(null)

onMounted(async () => {
  if (!container.value) return

  // ⚠️ CRITICAL: Dynamic imports for Monaco + workers
  const [monacoModule, { default: editorWorker }, ...otherWorkers] = await Promise.all([
    import('monaco-editor'),  // Monaco itself must be dynamic
    import('monaco-editor/esm/vs/editor/editor.worker?worker'),
    // ... other worker imports
  ])

  monaco = monacoModule  // Store for watch blocks

  self.MonacoEnvironment = {
    getWorker(_: any, label: string) {
      // Worker resolution logic
      return new editorWorker()
    }
  }

  diffEditor = monaco.editor.createDiffEditor(container.value, {
    readOnly: true,
    renderSideBySide: true,
    automaticLayout: true,
    theme: 'vs-dark'
  })

  // Set models...
})

onBeforeUnmount(() => {
  diffEditor?.dispose()
})
</script>

<template>
  <div ref="container" style="height: 600px; border: 1px solid #ccc;" />
</template>
```

### 3. Page Usage (SSR-Safe Loading)

```vue
<!-- In your markdown page -->
<script setup>
import { defineAsyncComponent } from 'vue'
import { inBrowser } from 'vitepress'

// ⚠️ CRITICAL: Wrap component in SSR guard
const MonacoDiff = inBrowser
  ? defineAsyncComponent(() => import('./.vitepress/components/MonacoDiff.vue'))
  : () => null
</script>

<ClientOnly>
  <MonacoDiff oldFile="before.md" newFile="after.md" language="markdown" />
</ClientOnly>
```

### 4. Page Configuration
```yaml
---
layout: doc
aside: false  # Required for wide diff view
---
```

### 5. Data Loader (for file-based content)
- **Create:** `docs/.vitepress/loaders/assets.data.ts`
- **Use Node.js fs:** VitePress `createContentLoader` only supports `.md` files
- **Export interface:** Return array of `{ path: string, content: string }`

### 6. Validation Checklist
- ✓ Build succeeds: `npm run docs:build` completes without SSR errors
- ✓ No "window is not defined" errors
- ✓ Monaco renders correctly in browser
- ✓ Theme sync works (if implemented)
- ✓ Props update reactively (if using dynamic content)
- ✓ Viewport >= 1440px for side-by-side view

---

## Bundle Size & Performance

- **Bundle size:** ~8 MB for full Monaco (optimize by excluding unused language workers)
- **Browser support:** Chrome, Firefox, Safari, Edge (modern versions with Web Worker support)
- **Performance:** Theme switches <100ms, no lag on rapid toggles, efficient prop updates

---

## Troubleshooting SSR Issues

### Error: "window is not defined"

**Symptom:** Build fails with `ReferenceError: window is not defined`

**Diagnosis:**
```bash
npm run docs:build
# Error output shows file path where window is referenced
```

**Common Causes & Fixes:**

1. **Top-level Monaco import**
   ```typescript
   // ❌ Problem
   import * as monaco from 'monaco-editor'

   // ✅ Solution
   import type * as Monaco from 'monaco-editor'
   let monaco: typeof Monaco | null = null
   onMounted(async () => {
     monaco = await import('monaco-editor')
   })
   ```

2. **Top-level worker imports**
   ```typescript
   // ❌ Problem
   import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'

   // ✅ Solution
   onMounted(async () => {
     const { default: editorWorker } = await import('monaco-editor/esm/vs/editor/editor.worker?worker')
   })
   ```

3. **Component not wrapped in SSR guard**
   ```vue
   <!-- ❌ Problem -->
   <script setup>
   import MonacoDiff from './.vitepress/components/MonacoDiff.vue'
   </script>
   <MonacoDiff />

   <!-- ✅ Solution -->
   <script setup>
   import { defineAsyncComponent } from 'vue'
   import { inBrowser } from 'vitepress'

   const MonacoDiff = inBrowser
     ? defineAsyncComponent(() => import('./.vitepress/components/MonacoDiff.vue'))
     : () => null
   </script>
   <ClientOnly><MonacoDiff /></ClientOnly>
   ```

4. **Missing monaco null check in watch blocks**
   ```typescript
   // ❌ Problem
   watch(props.language, (newLang) => {
     monaco.editor.setModelLanguage(model, newLang)  // Crashes if monaco is null
   })

   // ✅ Solution
   watch(props.language, (newLang) => {
     if (!monaco) return  // Guard against pre-mount execution
     monaco.editor.setModelLanguage(model, newLang)
   })
   ```

### Verification After Fix

```bash
# Clean build artifacts
rm -rf docs/.vitepress/dist docs/.vitepress/cache

# Rebuild (should complete without errors)
npm run docs:build

# Expected output:
# ✓ building client + server bundles...
# ✓ rendering pages...

# Preview to verify Monaco works in browser
npm run docs:preview
```

### Still Having Issues?

1. Check VitePress config includes: `vite.ssr.noExternal: ['monaco-editor']`
2. Verify all `monaco.*` API calls are inside `onMounted()` or guarded with `if (!monaco)`
3. Ensure TypeScript understands `import type` (requires TypeScript 3.8+)
4. Review error stack trace for exact line causing SSR failure
