---
layout: doc
aside: false
---

# Monaco Diff Viewer POC-4: Comprehensive (File Loading + Theme Sync)

This page validates the production-ready component combining file loading and theme synchronization.

<script setup>
import { defineAsyncComponent } from 'vue'
import { inBrowser } from 'vitepress'

const MonacoDiff = inBrowser
  ? defineAsyncComponent(() => import('./.vitepress/components/MonacoDiff.vue'))
  : () => null
</script>

## Test Case 1: File Loading with Theme Sync

**Expected:** Diff renders with markdown files, theme matches VitePress toggle

<ClientOnly>
  <MonacoDiff
    oldFile="default-system-prompt.md"
    newFile="output-style-system-prompt.md"
    language="markdown"
  />
</ClientOnly>

**Test Instructions:**
1. Verify diff renders with content from both files
2. Click VitePress theme toggle (top right)
3. Verify Monaco theme updates immediately

---

## Test Case 2: Props-Based Content with Theme Sync

**Expected:** Diff renders with inline content, theme switches work

<ClientOnly>
  <MonacoDiff
    oldContent="const x = 1;
const y = 2;
console.log(x + y);"
    newContent="const x = 10;
const y = 20;
console.log(x + y);"
    language="javascript"
  />
</ClientOnly>

**Test Instructions:**
1. Verify diff renders with JavaScript syntax highlighting
2. Toggle theme multiple times
3. Verify no console errors

---

## Test Case 3: Missing File Error

**Expected:** Error message displayed, theme toggle still works

<ClientOnly>
  <MonacoDiff
    oldFile="nonexistent.md"
    newFile="default-system-prompt.md"
    language="markdown"
  />
</ClientOnly>

---

## Test Case 4: Invalid Prop Combination Error

**Expected:** Error message displayed

<ClientOnly>
  <MonacoDiff
    oldContent="inline content"
    oldFile="default-system-prompt.md"
    newFile="output-style-system-prompt.md"
    language="markdown"
  />
</ClientOnly>
