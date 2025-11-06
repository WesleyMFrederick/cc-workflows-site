# Monaco Editor Research

**Research Date:** 2025-01-06
**Researcher:** Research Agent
**Sources:** Microsoft Monaco Editor Documentation, GitHub Issues, npm Registry, Stack Overflow, Bundlephobia

## Executive Summary

Monaco Editor provides powerful diff viewing but imposes severe costs: 92.7 MB unpacked (minified ~2+ MB), SSR incompatibility with VitePress, and performance degradation beyond 30 instances. Lightweight alternatives like diff2html (396 KB) or monaco-diff (standalone library) offer better trade-offs for read-only diff display.

## Key Findings

### 1. Diff Viewer Capabilities

Monaco Editor includes a rich diff editor with comprehensive features:

- **Rendering Modes**: Side-by-side (default) or inline unified view via `renderSideBySide: false`
- **Diff Algorithms**: Choice between "advanced" or "legacy" algorithms
- **Navigation**: Jump to next/previous diff, scroll to first diff after computation
- **Hide Unchanged Regions**: Collapsible unchanged code sections via `hideUnchangedRegions: { enabled: true }`
- **Whitespace Handling**: Ignores leading/trailing whitespace by default
- **Performance Limits**: 5000ms timeout, 50 MB maximum file size by default

**Source:** <https://microsoft.github.io/monaco-editor/typedoc/interfaces/editor.IDiffEditor.html>

### 2. Read-Only Diff Viewing

The `IDiffEditor` interface supports read-only viewing through standard editor methods. Configuration options include:

- `readOnly: true` - Prevents all editing
- `originalEditable: false` - Locks the original (left) editor (default)
- Access to original and modified editors via `getOriginalEditor()` and `getModifiedEditor()`
- `getLineChanges()` returns diff computation results as `ILineChange[]` objects
- `onDidUpdateDiff` event fires when diff computations complete

**Critical Limitation**: Monaco was "optimized for editing, and for showing one file at a time." Creating 30+ instances causes severe performance degradation, with CPU maxing at 100% even on powerful machines.

**Source:** <https://microsoft.github.io/monaco-editor/typedoc/interfaces/editor.IDiffEditor.html>, <https://stackoverflow.com/questions/51566332/how-to-efficiently-have-many-readonly-monaco-diff-views-on-one-page>

### 3. Theme Integration

Monaco provides robust theme support:

- **Built-in Themes**: 'vs' (light), 'vs-dark' (dark), 'hc-black', 'hc-light' (high contrast)
- **Programmatic Switching**: `monaco.editor.setTheme('vs-dark')` - called on monaco object, not editor instance
- **Custom Themes**: Create via `monaco.editor.defineTheme()` - redefining active theme applies changes immediately
- **System Sync**: Use `window.matchMedia('(prefers-color-scheme: dark)')` with listener to detect OS preference changes
- **High Contrast Override**: Set `autoDetectHighContrast: false` to prevent OS high contrast mode from overriding theme

**Implementation Pattern for VitePress**:

```javascript
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
monaco.editor.setTheme(isDark ? 'vs-dark' : 'vs');

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  monaco.editor.setTheme(e.matches ? 'vs-dark' : 'vs');
});
```

**Sources:** <https://app.studyraid.com/en/read/15534/540319/supporting-light-and-dark-mode-in-monaco>, <https://microsoft.github.io/monaco-editor/typedoc/functions/editor.setTheme.html>

## Bundle Size Analysis

### Monaco Editor (Full Package)

- **Unpacked Size**: 92.7 MB (version 0.54.0, latest as of Jan 2025)
- **node_modules Size**: 29 MB when installed
- **Minified Bundle Impact**: Minimum 2+ MB, typically 4+ MB
- **Optimized Split**: ~7.5 MB editor bundle + ~7.5 MB languages bundle with webpack plugin
- **Base Dependency**: ~15 MB before minification/gzip

**Critical Issue**: Despite using `monaco-editor-webpack-plugin` to exclude languages and features, developers report bundle size remains at 4+ MB minimum. The plugin repository was archived November 16, 2023 (now read-only).

**Sources:** <https://www.npmjs.com/package/monaco-editor>, <https://github.com/Microsoft/monaco-editor/issues/463>, <https://github.com/microsoft/monaco-editor-webpack-plugin/issues/40>

### Language Support Costs

Default monaco-editor includes all language workers:
- **Default Workers**: editorWorkerService (required), CSS, HTML, JSON, TypeScript
- **Language Dependencies**: JavaScript requires TypeScript worker; Handlebars requires HTML; SCSS/LESS require CSS
- **Selective Loading**: `vite-plugin-monaco-editor` allows specifying `languageWorkers` array to reduce bundle size

For TS/JS/Vue/JSON/YAML/Markdown support:
- TypeScript worker (includes JavaScript)
- JSON worker
- HTML worker (Vue templates)
- Additional parsers for YAML/Markdown (not built-in, requires extra packages)

**Estimated Total**: 2-4 MB minified for core diff viewer + these languages, depending on tree-shaking effectiveness.

**Sources:** <https://github.com/vdesjs/vite-plugin-monaco-editor>, <https://github.com/microsoft/monaco-editor-webpack-plugin>

### Lightweight Alternatives

| Library | Bundle Size | Features | Trade-offs |
|---------|-------------|----------|------------|
| **monaco-diff** | Small (minzip badge on npm) | Standalone diff computation from monaco-editor-core | Text-only diff arrays, no UI rendering |
| **diff2html** | 396 KB (unpacked) | Line-by-line & side-by-side views, syntax highlighting via highlight.js | Renders to HTML, performance degrades with very large diffs |
| **react-diff-view** | ~1.2 MB | Split/unified views, token system, web worker support | React-specific, needs Vue wrapper |
| **diff library** | Very small | Basic line-by-line text diff | No UI, computation only |

**Sources:** <https://github.com/inokawa/monaco-diff>, <https://diff2html.xyz/>, <https://npm-compare.com/react-diff-view,react-diff-viewer>

## VitePress Integration Patterns

### The SSR Problem

Monaco Editor fails during VitePress production builds with `SyntaxError: Cannot use import statement outside a module`. Development mode works; SSR build fails due to ESM/CommonJS conflicts.

**GitHub Issue #1508 Status**: Closed as stale with no definitive solution. Multiple developers reported identical failures.

**Sources:** <https://github.com/vuejs/vitepress/issues/1508>, <https://github.com/vuejs/vitepress/issues/2832>

### Documented Solutions

#### 1. Use VitePress `defineClientComponent` (Recommended)

```vue
<script setup>
import { defineClientComponent } from 'vitepress'

const MonacoDiff = defineClientComponent(() => {
  return import('./components/MonacoDiffViewer.vue')
})
</script>

<template>
  <MonacoDiff />
</template>
```

Component imported via `defineClientComponent` only loads in mounted hook, avoiding SSR.

**Source:** <https://vitepress.dev/guide/ssr-compat>

#### 2. Dynamic Import in `onMounted`

```vue
<script setup>
import { onMounted, ref } from 'vue'

const monaco = ref(null)

onMounted(async () => {
  if (!import.meta.env.SSR) {
    const monacoModule = await import('monaco-editor')
    monaco.value = monacoModule.default
    // Initialize editor
  }
})
</script>
```

**Source:** <https://vitepress.dev/guide/ssr-compat>

#### 3. Use `vite-plugin-monaco-editor`

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'

export default defineConfig({
  plugins: [
    monacoEditorPlugin({
      languageWorkers: ['editorWorkerService', 'typescript', 'json'],
      publicPath: 'monacoeditorwork',
      globalAPI: false
    })
  ]
})
```

Plugin bundles workers into `node_modules/.monaco` and serves via Vite middleware proxy.

**Configuration Options**:
- `languageWorkers`: Specify which workers to include (base worker required)
- `customWorkers`: Add third-party workers with `{ label, entry }` format
- `publicPath`: Override worker script location (default: 'monacoeditorwork')
- `globalAPI`: Expose global `monaco` object (required for Monaco 0.22.0+ ESM)
- `customDistPath`: Callback for custom worker path resolution

**Source:** <https://github.com/vdesjs/vite-plugin-monaco-editor>

#### 4. ClientOnly Component Wrapper

```vue
<template>
  <ClientOnly>
    <MonacoDiffEditor />
  </ClientOnly>
</template>
```

VitePress built-in `<ClientOnly>` component renders slot only on client side.

**Source:** <https://vitepress.dev/guide/ssr-compat>

### Async Loading Strategy

Monaco tries to keep computations limited to viewport size. For 20 visible lines, typing, colorizing, and painting compute only those 20 lines, not the entire buffer.

**Best Practice for VitePress**:
1. Use `defineClientComponent` for component-level code splitting
2. Import Monaco Editor dynamically in `onMounted` hook
3. Check `import.meta.env.SSR` before importing
4. Initialize editor only after DOM mount with `nextTick()`

**Sources:** <https://vitepress.dev/guide/ssr-compat>, <https://news.ycombinator.com/item?id=11940043>

## Limitations and Trade-offs

### What Monaco Cannot Do Well

1. **Multiple Instances**: Performance collapses around 30 instances (100% CPU utilization)
2. **SSR/Static Generation**: Requires browser APIs, incompatible with Node.js SSR without workarounds
3. **Bundle Size Control**: Minimum 2+ MB even with aggressive tree-shaking
4. **Small Diffs**: Overkill for simple text comparisons - full VS Code editor for basic diff viewing
5. **Tree-Shaking**: Core architecture prevents removing features like minimap or rulers

**Source:** <https://stackoverflow.com/questions/51566332/how-to-efficiently-have-many-readonly-monaco-diff-views-on-one-page>

### Performance Considerations

- **Timeout**: Diff computation cancels after 5000ms by default
- **File Size Limit**: 50 MB maximum by default
- **Container Resizing**: Automatic size checking has "severe performance impact"
- **Memory Usage**: Each instance creates ~100 large JavaScript objects
- **Optimization**: Monaco computes only viewport-visible content, but initialization overhead remains high

**Sources:** <https://microsoft.github.io/monaco-editor/typedoc/interfaces/editor.IDiffEditorBaseOptions.html>, <https://stackoverflow.com/questions/51566332/how-to-efficiently-have-many-readonly-monaco-diff-views-on-one-page>

### Maintenance Burden

- **Webpack Plugin Archived**: `monaco-editor-webpack-plugin` is read-only as of Nov 16, 2023
- **Vite Plugin Ecosystem**: Community-maintained plugins (`vite-plugin-monaco-editor`, `@tomjs/vite-plugin-monaco-editor`)
- **VitePress Compatibility**: No official support; requires workarounds and client-side only loading
- **Breaking Changes**: Major Monaco updates may break integration patterns

**Sources:** <https://github.com/microsoft/monaco-editor-webpack-plugin>, <https://github.com/vdesjs/vite-plugin-monaco-editor>

## Recommendation

**Monaco Editor is NOT suitable for VitePress diff viewing in this project.**

### Reasons

1. **Bundle Size**: 2+ MB minimum (92.7 MB unpacked) for basic diff viewing
2. **VitePress SSR Incompatibility**: No official solution; requires complex workarounds with `defineClientComponent`
3. **Performance**: Designed for single editor instance; multiple diffs on one page cause severe degradation
4. **Maintenance Risk**: Webpack plugin archived; relies on community Vite plugins
5. **Overkill**: Full VS Code editor features unnecessary for read-only diff display

### Alternative: diff2html

**Recommended**: Use `diff2html` for VitePress integration

**Advantages**:
- 396 KB unpacked (vs 92.7 MB Monaco)
- Supports line-by-line and side-by-side views
- Syntax highlighting via highlight.js
- Renders static HTML (SSR-compatible)
- GitHub-like diff UI
- Mature library with Vue compatibility

**Implementation Approach**:
1. Install: `npm install diff2html`
2. Use in Vue component with `onMounted` to avoid SSR issues with highlight.js
3. Generate diff HTML from file content
4. Sync theme with VitePress dark mode via CSS variables

**Trade-off**: Less interactive than Monaco (no code folding, hover tooltips), but sufficient for documentation diff viewing.

### Alternative: monaco-diff (Computation Only)

If you need Monaco's diff algorithm without the editor UI:

**Advantages**:
- Standalone library, small bundle
- Exports `diff()` and `linesDiff()` functions
- No UI dependencies
- MIT licensed

**Use Case**: Generate diff data, render with custom lightweight UI

**Source:** <https://github.com/inokawa/monaco-diff>

## References

### Official Documentation
- Monaco Editor API: <https://microsoft.github.io/monaco-editor/typedoc/>
- IDiffEditor Interface: <https://microsoft.github.io/monaco-editor/typedoc/interfaces/editor.IDiffEditor.html>
- IDiffEditorOptions: <https://microsoft.github.io/monaco-editor/typedoc/interfaces/editor.IDiffEditorOptions.html>
- setTheme API: <https://microsoft.github.io/monaco-editor/typedoc/functions/editor.setTheme.html>
- VitePress SSR Compatibility: <https://vitepress.dev/guide/ssr-compat>

### GitHub Issues & Discussions
- VitePress Monaco Integration Issue #1508: <https://github.com/vuejs/vitepress/issues/1508>
- VitePress Monaco Build Issue #2832: <https://github.com/vuejs/vitepress/issues/2832>
- Monaco Bundle Size Issue #463: <https://github.com/Microsoft/monaco-editor/issues/463>
- Monaco Webpack Plugin Bundle Size #40: <https://github.com/microsoft/monaco-editor-webpack-plugin/issues/40>
- Vite Monaco Import Discussion #1791: <https://github.com/vitejs/vite/discussions/1791>

### npm Packages
- monaco-editor: <https://www.npmjs.com/package/monaco-editor>
- vite-plugin-monaco-editor: <https://github.com/vdesjs/vite-plugin-monaco-editor>
- monaco-diff: <https://github.com/inokawa/monaco-diff>
- diff2html: <https://www.npmjs.com/package/diff2html>

### Stack Overflow
- Multiple Monaco Diff Viewers Performance: <https://stackoverflow.com/questions/51566332/how-to-efficiently-have-many-readonly-monaco-diff-views-on-one-page>
- Monaco Editor with Vite + Vue3: <https://stackoverflow.com/questions/78431576/how-to-integrating-monaco-editor-with-vite-vue3-project>
- Import Monaco with Vite 2: <https://stackoverflow.com/questions/65953675/import-monaco-editor-using-vite-2>

### Community Resources
- Monaco Theme Support Guide: <https://app.studyraid.com/en/read/15534/540319/supporting-light-and-dark-mode-in-monaco>
- Monaco Performance Discussion (Hacker News): <https://news.ycombinator.com/item?id=11940043>
- Bundlephobia (Bundle Size Analysis): <https://bundlephobia.com/package/monaco-editor>
- diff2html Official Site: <https://diff2html.xyz/>
