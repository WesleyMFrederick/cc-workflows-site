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

<button @click="updateOld" style="margin: 8px; padding: 8px 16px; cursor: pointer;">Update Old Content</button>
<button @click="updateNew" style="margin: 8px; padding: 8px 16px; cursor: pointer;">Update New Content</button>
<button @click="switchLang" style="margin: 8px; padding: 8px 16px; cursor: pointer;">Toggle Language</button>

## Expected Behavior

- **Update Old Content**: Left pane should change to "Hi"
- **Update New Content**: Right pane should change to "Hi Universe"
- **Toggle Language**: Syntax highlighting should switch between JavaScript and TypeScript
- **Console**: Should show watch callback logs
