---
layout: doc
aside: false
---

# Monaco Diff Viewer POC-3: File-Based Content Loading

This page validates file loading from `docs/` directory.

<script setup>
import { defineAsyncComponent } from 'vue'
import { inBrowser } from 'vitepress'

const MonacoDiffFile = inBrowser
  ? defineAsyncComponent(() => import('./.vitepress/components/MonacoDiffFile.vue'))
  : () => null
</script>

## Test Case 1: Valid File Paths

**Expected:** Diff renders with content from both system prompt files

<ClientOnly>
  <MonacoDiffFile
    oldFile="default-system-prompt.md"
    newFile="output-style-system-prompt.md"
    language="markdown"
  />
</ClientOnly>

---

## Test Case 2: Missing File Error

**Expected:** Error message "File not found: nonexistent.md"

<ClientOnly>
  <MonacoDiffFile
    oldFile="nonexistent.md"
    newFile="default-system-prompt.md"
    language="markdown"
  />
</ClientOnly>

---

## Test Case 3: Invalid Prop Combination

**Expected:** Error message "Cannot specify both oldContent and oldFile"

<ClientOnly>
  <MonacoDiffFile
    oldContent="inline content"
    oldFile="default-system-prompt.md"
    newFile="output-style-system-prompt.md"
    language="markdown"
  />
</ClientOnly>
