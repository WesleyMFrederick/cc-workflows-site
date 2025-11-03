# Vite File Loading Patterns for VitePress

**Research Date:** 2025-11-03
**Sources:**
- [Vite Features Guide](https://vite.dev/guide/features)
- [Vite Static Asset Handling](https://vite.dev/guide/assets)
- [VitePress Data Loading Guide](https://vitepress.dev/guide/data-loading)

## Key Findings

### 1. import.meta.glob() Pattern Matching

Vite provides `import.meta.glob()` for importing multiple modules from the file system. The function accepts glob patterns and returns an object mapping file paths to import functions.

**Default (Lazy Loading):**

```typescript
const modules = import.meta.glob('./dir/*.js')
// Transforms to:
const modules = {
  './dir/bar.js': () => import('./dir/bar.js'),
  './dir/foo.js': () => import('./dir/foo.js'),
}
```

**Options:**
- `eager: true` - Loads all modules immediately with static imports
- `import: 'default'` - Extracts specific exports
- `query: '?raw'` - Adds query parameters for asset imports
- Supports multiple patterns as arrays
- Supports negative patterns with `!` prefix

**Limitations:**
- All arguments must be literals (no variables or expressions)
- Patterns must be relative (`./`), absolute (`/`), or use aliases
- Uses `tinyglobby` for pattern matching

Source: [Vite Features Guide](https://vite.dev/guide/features)

### 2. Dynamic Imports for Text Files in Vue Components

Vue components can use standard dynamic `import()` syntax with query suffixes to load text files:

```typescript
// Import as raw string
import('./file.txt?raw').then((m) => m.default)

// Import as URL
import('./file.txt?url').then((m) => m.default)
```

Combining with `import.meta.glob()`:

```typescript
const moduleStrings = import.meta.glob('./dir/*.txt', { query: '?raw' })
// Each value is () => import('./dir/file.txt?raw').then(m => m.default)
```

Source: [Vite Features Guide](https://vite.dev/guide/features)

### 3. Query Suffix Differences

**?raw** - Returns file content as string

```typescript
import shaderString from './shader.glsl?raw'
// shaderString contains the file's text content
```

**?url** - Returns resolved public URL

```typescript
import workletURL from './worklet.js?url'
// workletURL contains the asset's URL path
```

**Key Differences:**
- `?raw` loads content into memory as string (useful for text processing)
- `?url` provides reference to file location (useful for external loading)
- `?inline` forces base64 encoding
- `?no-inline` forces external URL regardless of size

Source: [Vite Static Asset Handling](https://vite.dev/guide/assets)

### 4. Build Time vs Runtime File Loading in VitePress

**Build Time (Recommended for Static Content):**

VitePress provides data loaders that execute only during build. Files must end with `.data.js` or `.data.ts`:

```typescript
// example.data.ts
export default {
  load() {
    return {
      hello: 'world'
    }
  }
}
```

Components import the processed data:

```vue
<script setup>
import { data } from './example.data.js'
</script>
```

**With File Watching:**

```typescript
import fs from 'node:fs'

export default {
  watch: ['./data/*.csv'],
  load(watchedFiles) {
    return watchedFiles.map((file) => {
      return fs.readFileSync(file, 'utf-8')
    })
  }
}
```

**Runtime (For Dynamic Content):**

Use `import.meta.glob()` with `eager: false` (default) for lazy runtime loading:

```typescript
const modules = import.meta.glob('./content/*.md')
```

Source: [VitePress Data Loading Guide](https://vitepress.dev/guide/data-loading)

### 5. VitePress-Specific Helpers

**createContentLoader** - Simplifies loading markdown files:

```typescript
import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md', {
  includeSrc: true,    // Include raw markdown
  render: true,        // Render to HTML
  excerpt: true,       // Extract excerpt
  transform(rawData) {
    return rawData.sort((a, b) => {
      return +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date)
    })
  }
})
```

**Returns ContentData[] with:**
- `url` - Page URL
- `frontmatter` - YAML frontmatter object
- `src` - Raw markdown (if `includeSrc: true`)
- `html` - Rendered HTML (if `render: true`)
- `excerpt` - Extracted excerpt (if `excerpt: true`)

**Conventions:**
- Data loader files use `.data.js` or `.data.ts` extensions
- Loaders run only in Node.js during build
- Watch option accepts glob patterns for hot reloading
- Results serialize to JSON in final bundle

Source: [VitePress Data Loading Guide](https://vitepress.dev/guide/data-loading)

## Code Examples

### Loading Multiple Markdown Files as Raw Strings

```typescript
// Build-time approach (recommended)
// files.data.ts
import fs from 'node:fs'
import path from 'node:path'
import { globby } from 'globby'

export default {
  async load() {
    const files = await globby('content/*.md')
    return files.map(file => ({
      path: file,
      content: fs.readFileSync(file, 'utf-8')
    }))
  }
}
```

### Runtime Loading with import.meta.glob

```typescript
// Vue component
<script setup lang="ts">
const diffFiles = import.meta.glob('../diffs/*.diff', {
  query: '?raw',
  eager: false
})

async function loadDiff(filename: string) {
  const loader = diffFiles[`../diffs/${filename}`]
  if (loader) {
    const module = await loader()
    return module.default // Returns file content as string
  }
}
</script>
```

### Eager Loading All Files at Build Time

```typescript
const diffs = import.meta.glob('../diffs/*.diff', {
  query: '?raw',
  eager: true,
  import: 'default'
})

// diffs is now { './file1.diff': 'content1', './file2.diff': 'content2' }
```

## Implications for POC-2

### File-Based Diff Loading Strategy

1. **Recommended Approach: Build-Time Data Loader**
   - Create `diffs.data.ts` in the component directory
   - Use `watch` option to track diff file changes
   - Load all diff files at build time
   - Serialize to JSON in bundle
   - Provides instant access without runtime loading

2. **Alternative: Runtime Lazy Loading**
   - Use `import.meta.glob()` with `{ query: '?raw', eager: false }`
   - Load diff files on-demand when user selects them
   - Reduces initial bundle size
   - Adds network delay for first load

3. **Hybrid Approach**
   - Use data loader for diff file list/metadata
   - Use `import.meta.glob()` for lazy content loading
   - Balances bundle size and performance

### Performance Considerations

- Build-time loading increases bundle size but eliminates runtime delays
- Lazy loading reduces initial bundle but adds latency
- VitePress serializes data as JSON (not executable code)
- Query suffix `?raw` is essential for text content

### Development Experience

- Watch option enables hot reloading during development
- Data loaders run only in Node.js (full filesystem access)
- TypeScript support available with `.data.ts` extension
- Error handling occurs at build time, not runtime

## Recommendation

**Use build-time data loader for POC-2 diff files.**

**Rationale:**
1. Diff files are static content (no runtime changes expected)
2. Small number of files (bundle size impact minimal)
3. Instant access improves user experience
4. Hot reloading simplifies development
5. VitePress design philosophy favors build-time optimization

**Implementation:**

```typescript
// TwoColumnLayout.data.ts
import fs from 'node:fs'
import path from 'node:path'

export default {
  watch: ['./diffs/*.diff'],
  load(watchedFiles) {
    return watchedFiles.map(file => ({
      name: path.basename(file, '.diff'),
      content: fs.readFileSync(file, 'utf-8')
    }))
  }
}
```

This provides the simplest implementation with optimal performance for the POC's requirements.
