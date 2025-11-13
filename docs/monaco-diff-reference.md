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

```typescript
// 1. Dynamically import workers in onMounted to avoid SSR issues
onMounted(async () => {
  // Import workers dynamically - only executes in browser
  const [
    { default: editorWorker },
    { default: jsonWorker },
    { default: cssWorker },
    { default: htmlWorker },
    { default: tsWorker }
  ] = await Promise.all([
    import('monaco-editor/esm/vs/editor/editor.worker?worker'),
    import('monaco-editor/esm/vs/language/json/json.worker?worker'),
    import('monaco-editor/esm/vs/language/css/css.worker?worker'),
    import('monaco-editor/esm/vs/language/html/html.worker?worker'),
    import('monaco-editor/esm/vs/language/typescript/ts.worker?worker')
  ])

  // 2. Configure workers after dynamic import
  self.MonacoEnvironment = {
    getWorker(_: any, label: string) {
      if (label === 'json') return new jsonWorker()
      if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker()
      if (label === 'html' || label === 'handlebars' || label === 'razor') return new htmlWorker()
      if (label === 'typescript' || label === 'javascript') return new tsWorker()
      return new editorWorker()
    }
  }

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

  // Set initial models
  const originalModel = monaco.editor.createModel(oldContent, language)
  const modifiedModel = monaco.editor.createModel(newContent, language)
  diffEditor.setModel({ original: originalModel, modified: modifiedModel })
})

// 3. Use watch() for reactive prop updates
watch(() => props.oldContent, (newValue) => {
  const model = diffEditor.getOriginalEditor().getModel()
  if (model && model.getValue() !== newValue) {
    model.setValue(newValue)  // Reuse model - no createModel
  }
})

// 4. Cleanup in onBeforeUnmount
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

**Inside component:**
```typescript
// ❌ FAILS - Top-level worker imports execute during SSR
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'

// ✅ WORKS - Dynamic imports in onMounted (browser-only)
onMounted(async () => {
  const { default: editorWorker } = await import('monaco-editor/esm/vs/editor/editor.worker?worker')
  // ... configure and use worker
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

### Modern Vite Native Worker Pattern with Dynamic Imports

**⚠️ Critical:** Workers must be dynamically imported inside `onMounted()` to avoid SSR "window is not defined" errors.

```typescript
// ✅ SSR-SAFE: Dynamic imports in onMounted (browser-only)
onMounted(async () => {
  // Import workers dynamically to avoid SSR issues
  const [
    { default: editorWorker },
    { default: jsonWorker },
    { default: cssWorker },
    { default: htmlWorker },
    { default: tsWorker }
  ] = await Promise.all([
    import('monaco-editor/esm/vs/editor/editor.worker?worker'),
    import('monaco-editor/esm/vs/language/json/json.worker?worker'),
    import('monaco-editor/esm/vs/language/css/css.worker?worker'),
    import('monaco-editor/esm/vs/language/html/html.worker?worker'),
    import('monaco-editor/esm/vs/language/typescript/ts.worker?worker')
  ])

  self.MonacoEnvironment = {
    getWorker(_: any, label: string) {
      if (label === 'json') return new jsonWorker()
      if (label === 'css' || label === 'scss' || label === 'less') return new cssWorker()
      if (label === 'html' || label === 'handlebars' || label === 'razor') return new htmlWorker()
      if (label === 'typescript' || label === 'javascript') return new tsWorker()
      return new editorWorker()
    }
  }
  // Create editor after worker config
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

**Problem:** Top-level worker imports using Vite's `?worker` syntax trigger browser-specific code that references the `window` object, causing SSR build failures.

**Solution:** Dynamic imports with `await import()` inside `onMounted()`:
1. **Deferred execution** - Code only runs after component mounts (browser-only)
2. **No SSR execution** - Build process doesn't evaluate dynamic imports
3. **Maintains bundling** - Vite still bundles workers for production
4. **Type-safe** - Full TypeScript support with destructured imports

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

1. **Install:** `npm install monaco-editor@0.54.0`
2. **Configure:** Add `ssr.noExternal: ['monaco-editor']` to VitePress config
3. **Create data loader:** `docs/.vitepress/loaders/assets.data.ts`
4. **Create component:** With native worker imports pattern
5. **Use SSR-safe loading:** `defineAsyncComponent` + `inBrowser` + `<ClientOnly>`
6. **Add frontmatter:** `aside: false` for wide layout
7. **Test viewport:** >= 1440px for side-by-side rendering
8. **Add theme sync:** `useData().isDark` → `monaco.editor.setTheme()`

---

## Bundle Size & Performance

- **Bundle size:** ~8 MB for full Monaco (optimize by excluding unused language workers)
- **Browser support:** Chrome, Firefox, Safari, Edge (modern versions with Web Worker support)
- **Performance:** Theme switches <100ms, no lag on rapid toggles, efficient prop updates
