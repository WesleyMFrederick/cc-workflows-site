# Vue 3 + Monaco Editor Theme Integration Research

**Research Date:** 2025-01-06
**Sources:** Perplexity Search (Best Practices 2025)

## Key Findings

### Core Integration Pattern: watch() + setTheme()

The recommended pattern for reactive Monaco theme updates in Vue 3 uses the Composition API with `watch()` to call `monaco.editor.setTheme()` without recreating editor instances.

```vue
<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as monaco from 'monaco-editor'

const isDarkMode = ref(false)
let editor = null

// Initialize editor once
onMounted(() => {
  const container = document.getElementById('monaco-container')

  editor = monaco.editor.create(container, {
    value: 'console.log("Hello, Monaco!");',
    language: 'javascript',
    theme: isDarkMode.value ? 'vs-dark' : 'vs',
    automaticLayout: true,
  })
})

// Watch for theme changes and update without recreation
watch(isDarkMode, (newValue) => {
  if (editor) {
    const themeName = newValue ? 'vs-dark' : 'vs'
    monaco.editor.setTheme(themeName)
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (editor) {
    editor.dispose()
  }
})
</script>
```

## Advantages of This Pattern

1. **Direct API Usage:** Avoid recreating editor instances which destroys undo/redo history, cursor position, and state
2. **No Memory Leaks:** Editor created once, updated through theme changes - no orphaned DOM nodes
3. **Preserves Editor State:** Selections, scroll positions, model changes persist across theme transitions
4. **Performance:** Significantly more efficient than dispose/recreate pattern

## Diff Editor Integration

The same pattern applies to diff editors:

```vue
<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as monaco from 'monaco-editor'

const currentTheme = ref('vs')
let diffEditor = null

onMounted(() => {
  const container = document.getElementById('diff-container')

  const originalModel = monaco.editor.createModel(
    'const oldCode = "version 1";',
    'javascript'
  )

  const modifiedModel = monaco.editor.createModel(
    'const newCode = "version 2";',
    'javascript'
  )

  diffEditor = monaco.editor.createDiffEditor(container, {
    theme: currentTheme.value,
    automaticLayout: true,
  })

  diffEditor.setModel({
    original: originalModel,
    modified: modifiedModel,
  })
})

watch(currentTheme, (newTheme) => {
  if (diffEditor) {
    monaco.editor.setTheme(newTheme)
  }
})

onUnmounted(() => {
  if (diffEditor) {
    diffEditor.dispose()
  }
})
</script>
```

## Best Practices 2025

### 1. Memory Management
- **Always dispose editor in `onUnmounted`** to prevent memory leaks
- **`monaco.editor.setTheme()` is lightweight** - no resource leaks from repeated calls in watch
- **Never recreate in watch** - Primary source of performance issues and memory leaks

### 2. Use Composition API
- **`watch()` with refs** is more readable and performant than Options API watchers
- **Enables proper tree-shaking** in modern build tools
- **Standard pattern** for Vue 3 reactive updates

### 3. Debounce if Needed
For rapid theme changes, debounce the setTheme call:

```javascript
import { debounce } from 'lodash-es'

const debouncedThemeUpdate = debounce((newTheme) => {
  if (editor) {
    monaco.editor.setTheme(newTheme)
  }
}, 100)

watch(currentTheme, debouncedThemeUpdate)
```

### 4. Avoid Common Anti-Patterns
- **Never call `monaco.editor.create()` inside watch** - Creates memory leaks
- **Never recreate models** - Use existing models and update via setTheme
- **Don't use `editor.updateOptions({ theme })`** - Not designed for theme switching

## VitePress Integration Example

```vue
<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useData } from 'vitepress'
import * as monaco from 'monaco-editor'

// Detect VitePress theme
const { isDark } = useData()

// Map to Monaco theme names
const monacoTheme = computed(() => {
  return isDark.value ? 'vs-dark' : 'vs'
})

let editor = null

onMounted(() => {
  const container = document.getElementById('monaco-editor')

  editor = monaco.editor.create(container, {
    value: 'function hello() {\n  console.log("Monaco in VitePress");\n}',
    language: 'javascript',
    theme: monacoTheme.value,
    automaticLayout: true,
  })
})

// React to VitePress theme changes
watch(monacoTheme, (newTheme) => {
  if (editor) {
    monaco.editor.setTheme(newTheme)
  }
})

onUnmounted(() => {
  if (editor) {
    editor.dispose()
  }
})
</script>
```

## Performance Considerations

### Vite Configuration
Configure Monaco plugin to load only necessary languages to minimize bundle size:

```javascript
// vite.config.js
import monacoEditorPlugin from 'vite-plugin-monaco-editor'

export default {
  plugins: [
    monacoEditorPlugin({
      languages: ['javascript', 'typescript', 'json', 'html', 'css']
    })
  ]
}
```

### Testing Theme Switching
- Test rapid theme toggles to ensure no visual glitches
- Verify memory doesn't grow with repeated switches
- Check that editor state (content, selection, scroll) persists

## Implications for POC-2.2

1. **Pattern Validated:** Identical to POC-2.1's `watch()` + `model.setValue()` pattern
2. **Simple Implementation:** 5-10 lines of code in component
3. **No New Concepts:** Uses already-validated Vue 3 Composition API patterns
4. **Performance Proven:** `setTheme()` is lightweight and leak-free
5. **Complete Solution:** VitePress `isDark` → `watch()` → `monaco.editor.setTheme()`

## Recommendation

Implement POC-2.2 by:
1. Import `useData` from 'vitepress'
2. Extract `isDark` ref
3. Add `watch(isDark, ...)` callback (similar to POC-2.1 content watches)
4. Call `monaco.editor.setTheme(isDark.value ? 'vs-dark' : 'vs')` in callback
5. Test with VitePress theme toggle button

**Expected Implementation Time:** 30-45 minutes (validated pattern, minimal new code)

## References

- [Vue 3 Monaco Integration](https://github.com/Simon-He95/vue-use-monaco)
- [Monaco Editor Performance Guide](https://blog.expo.dev/building-a-code-editor-with-monaco-f84b3a06deaf)
- Perplexity Search: "Monaco Editor theme update without recreating editor Vue 3 best practices 2025"
