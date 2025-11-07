# VitePress Theme Detection Research

**Research Date:** 2025-01-06
**Sources:** Perplexity Search (Best Practices 2025)

## Key Findings

### useData Composable API
- **Import:** `import { useData } from 'vitepress'`
- **Access isDark:** `const { isDark } = useData()`
- **Type:** `isDark` is a boolean ref that tracks dark mode state
- **Reactivity:** Automatically reflects current theme state

### Reactive Theme Detection Pattern

```vue
<script setup>
import { useData } from 'vitepress'
import { watch, ref } from 'vue'

const { isDark } = useData()
const theme = ref(isDark.value ? 'dark' : 'light')

watch(isDark, (newIsDark) => {
  theme.value = newIsDark ? 'dark' : 'light'
})
</script>
```

### Best Practices 2025
1. **Reactive Updates:** Always use watchers with `isDark` for live theme toggling
2. **SSR Compatibility:** `useData()` works in SSR - server-rendered pages display correct theme on first load
3. **Initial Detection:** Access `isDark.value` on mount for initial theme
4. **Direct ref access:** Use `.value` in script, reference directly in templates

### Component Integration Pattern

```vue
<script setup>
import { useData } from 'vitepress'
import { watch, ref } from 'vue'
import MonacoEditor from './MonacoEditor.vue'

const { isDark } = useData()
const editorTheme = ref(isDark.value ? 'dark' : 'light')

watch(isDark, (newIsDark) => {
  editorTheme.value = newIsDark ? 'dark' : 'light'
})
</script>

<template>
  <MonacoEditor :theme="editorTheme" />
</template>
```

## Implications for POC-2.2

1. **Validated Pattern:** The `watch(isDark, ...)` pattern is identical to POC-2.1's validated `watch()` approach
2. **No Additional Complexity:** VitePress provides ready-made reactive theme state
3. **SSR Safe:** No browser-specific checks needed
4. **Direct Integration:** Can pass to Monaco component as prop or use directly

## Recommendation

Use `useData().isDark` with `watch()` callback to detect VitePress theme changes. This aligns perfectly with POC-2.1's validated reactive prop pattern.

**Implementation:**
- Import `useData` from 'vitepress'
- Extract `isDark` ref
- Watch `isDark` and call `monaco.editor.setTheme()` in callback
- No special handling needed - standard Vue 3 Composition API pattern

## References

- [VitePress Runtime API](https://vitepress.dev/reference/runtime-api)
- [VitePress Extending Default Theme](https://vitepress.dev/guide/extending-default-theme)
- Perplexity Search: "VitePress useData isDark composable API best practices 2025"
