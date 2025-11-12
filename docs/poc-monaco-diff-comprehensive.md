---
layout: doc
aside: right
---

# Monaco Diff Viewer POC-4: Comprehensive (File Loading + Theme Sync)

This page validates the production-ready component combining file loading and theme synchronization.

<script setup>
import { ref, computed } from 'vue'
import { defineAsyncComponent } from 'vue'
import { inBrowser } from 'vitepress'

const MonacoDiff = inBrowser
  ? defineAsyncComponent(() => import('./.vitepress/components/MonacoDiff.vue'))
  : () => null

// --- Language Configuration ---
// Pattern: Centralized language metadata for dropdown and file resolution
const languageConfig = {
  typescript: { ext: 'ts', monaco: 'typescript', label: 'TypeScript' },
  javascript: { ext: 'js', monaco: 'javascript', label: 'JavaScript' },
  vue: { ext: 'vue', monaco: 'vue', label: 'Vue' },
  html: { ext: 'html', monaco: 'html', label: 'HTML' },
  css: { ext: 'css', monaco: 'css', label: 'CSS' },
  json: { ext: 'json', monaco: 'json', label: 'JSON' },
  yaml: { ext: 'yaml', monaco: 'yaml', label: 'YAML' },
  markdown: { ext: 'md', monaco: 'markdown', label: 'Markdown' }
}

// --- Reactive State ---
// Decision: Default to typescript (already has example files from POC-5)
const selectedLanguage = ref('typescript')

// --- Computed File Paths ---
// Integration: Maps language selection to asset file paths for MonacoDiff
const languageFiles = computed(() => {
  const config = languageConfig[selectedLanguage.value]

  // Guard: Handle invalid language keys
  if (!config) {
    console.warn(`Invalid language key: "${selectedLanguage.value}". Falling back to typescript.`)
    const fallback = languageConfig.typescript
    return {
      oldFile: `example-typescript-before.${fallback.ext}`,
      newFile: `example-typescript-after.${fallback.ext}`,
      language: fallback.monaco,
      label: fallback.label
    }
  }

  return {
    oldFile: `example-${selectedLanguage.value}-before.${config.ext}`,
    newFile: `example-${selectedLanguage.value}-after.${config.ext}`,
    language: config.monaco,
    label: config.label
  }
})
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

---

## Test Case 5: Multi-Language Syntax Highlighting (POC-6)

**Expected:** Dropdown selector loads all 8 languages with syntax highlighting

<div style="margin-bottom: 1rem;">
  <label for="language-select" style="margin-right: 0.5rem; font-weight: 500;">Select Language:</label>
  <select
    id="language-select"
    v-model="selectedLanguage"
    style="padding: 0.5rem; border-radius: 4px; border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg); color: var(--vp-c-text-1); cursor: pointer;"
  >
    <option v-for="(config, key) in languageConfig" :key="key" :value="key">
      {{ config.label }}
    </option>
  </select>
  <span style="margin-left: 0.5rem; color: var(--vp-c-text-2);">Current: {{ languageFiles.label }}</span>
</div>

<ClientOnly>
  <MonacoDiff
    :oldFile="languageFiles.oldFile"
    :newFile="languageFiles.newFile"
    :language="languageFiles.language"
  />
</ClientOnly>

**Test Instructions:**
1. Select each language from dropdown
2. Verify syntax highlighting differs between languages
3. Verify diff highlighting (green/red) visible
4. Toggle VitePress theme to verify consistency
5. Check console for errors
