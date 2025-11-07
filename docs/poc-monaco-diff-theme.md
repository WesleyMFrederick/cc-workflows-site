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

const oldCode = ref(`function greet() {\n  return "Hello";\n}`)
const newCode = ref(`function greet() {\n  return "Hello World";\n}`)
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
