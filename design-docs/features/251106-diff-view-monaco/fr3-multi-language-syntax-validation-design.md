# FR-3 Multi-Language Syntax Highlighting Validation - Design Document

**Date:** 2025-11-09
**Status:** Approved
**Related Requirements:** [FR-3: Syntax Highlighting ^FR3](diff-view-monaco-requirements.md#FR-3%20Syntax%20Highlighting%20FR3)

---

## Purpose

Validate FR-3 (Syntax Highlighting) by creating an interactive test case demonstrating Monaco Editor's syntax highlighting across 8 target languages. The test validates that the MonacoDiff component correctly applies language-specific syntax highlighting alongside diff highlighting.

## Scope

**In Scope:**
- Create 8 language example pairs (before/after files) in `docs/assets/`
- Add Test Case 5 to existing POC-4 page with language switcher dropdown
- Validate syntax highlighting for: TypeScript, JavaScript, Vue, HTML, CSS, JSON, YAML, Markdown

**Out of Scope:**
- Modifications to MonacoDiff component (already supports dynamic language switching)
- New VitePress data loaders (existing assets.data.ts handles all file types)
- Additional language support beyond FR-3 requirements

## Architecture

### Component Layers

```text
┌─────────────────────────────────────────┐
│  poc-monaco-diff-comprehensive.md       │
│  (Vue script setup + select dropdown)   │
│  - Reactive language selection          │
│  - Computed file paths                  │
└────────────────┬────────────────────────┘
                 │ Props: oldFile, newFile, language
                 ▼
┌─────────────────────────────────────────┐
│  MonacoDiff.vue Component               │
│  - Watchers respond to prop changes     │
│  - Updates Monaco models & language     │
└────────────────┬────────────────────────┘
                 │ Reads from data loader
                 ▼
┌─────────────────────────────────────────┐
│  assets.data.ts (VitePress loader)      │
│  - Loads docs/assets/*.{ts,js,vue,...}  │
└─────────────────────────────────────────┘
```

### Data Flow

1. User selects language from dropdown
2. `selectedLanguage` ref updates
3. `currentFiles` computed property recalculates file paths
4. New props flow to MonacoDiff component
5. MonacoDiff watchers detect prop changes (lines 163-187)
6. Monaco editor updates content and syntax language
7. Syntax highlighting re-renders with new language mode

## File Organization

### Asset Files

Location: `docs/assets/`
Naming Pattern: `example-{language}-{before|after}.{ext}`

| Language   | Before File                     | After File                    | Monaco Language ID |
|------------|---------------------------------|-------------------------------|--------------------|
| TypeScript | example-typescript-before.ts    | example-typescript-after.ts   | typescript         |
| JavaScript | example-javascript-before.js    | example-javascript-after.js   | javascript         |
| Vue        | example-vue-before.vue          | example-vue-after.vue         | vue                |
| HTML       | example-html-before.html        | example-html-after.html       | html               |
| CSS        | example-css-before.css          | example-css-after.css         | css                |
| JSON       | example-json-before.json        | example-json-after.json       | json               |
| YAML       | example-yaml-before.yaml        | example-yaml-after.yaml       | yaml               |
| Markdown   | example-markdown-before.md      | example-markdown-after.md     | markdown           |

### Example Content Themes

Each language pair demonstrates realistic refactoring:

- **TypeScript**: Adding type annotations to JavaScript function
- **JavaScript**: Converting callback pattern to async/await
- **Vue**: Upgrading Options API to Composition API
- **HTML**: Adding semantic HTML5 elements
- **CSS**: Refactoring to CSS custom properties
- **JSON**: Adding/modifying configuration properties
- **YAML**: Restructuring CI/CD pipeline configuration
- **Markdown**: Improving documentation structure

## Implementation Details

### Page Script Setup

```vue
<script setup>
import { ref, computed } from 'vue'
import { defineAsyncComponent } from 'vue'
import { inBrowser } from 'vitepress'

const MonacoDiff = inBrowser
  ? defineAsyncComponent(() => import('./.vitepress/components/MonacoDiff.vue'))
  : () => null

// Reactive state
const selectedLanguage = ref('typescript')

// Language configuration mapping
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

// Computed file paths based on selection
const currentFiles = computed(() => {
  const config = languageConfig[selectedLanguage.value]
  return {
    before: `example-${selectedLanguage.value}-before.${config.ext}`,
    after: `example-${selectedLanguage.value}-after.${config.ext}`,
    language: config.monaco
  }
})
</script>
```

### Template Structure

```vue
<template>
  <div class="language-selector">
    <label for="language-select">Select Language:</label>
    <select id="language-select" v-model="selectedLanguage">
      <option v-for="(config, key) in languageConfig" :key="key" :value="key">
        {{ config.label }}
      </option>
    </select>
  </div>

  <ClientOnly>
    <MonacoDiff
      :oldFile="currentFiles.before"
      :newFile="currentFiles.after"
      :language="currentFiles.language"
    />
  </ClientOnly>
</template>
```

## Validation Criteria

Test Case 5 validates FR-3 through the following checklist:

### Functional Validation
- [ ] Dropdown populates with all 8 language options
- [ ] Selecting each language loads correct before/after files
- [ ] Syntax highlighting renders correctly for each language
- [ ] Diff highlighting (green/red) appears alongside syntax colors
- [ ] Language switching updates both content and syntax highlighting
- [ ] File loading errors display user-friendly messages

### Integration Validation
- [ ] Theme toggle works correctly when switching languages
- [ ] No console errors when rapidly switching languages
- [ ] Monaco editor maintains responsive layout during switches
- [ ] VitePress data loader provides all file types

### Requirements Mapping
- FR-3.1: TypeScript and JavaScript syntax highlighting ✓
- FR-3.2: Vue, HTML, and CSS syntax highlighting ✓
- FR-3.3: JSON and YAML syntax highlighting ✓
- FR-3.4: Markdown syntax highlighting ✓
- FR-3.5: Language specification via component prop ✓

## Testing Approach

### Manual Testing Steps

1. Navigate to updated POC-4 page
2. Locate Test Case 5: Multi-Language Syntax Highlighting
3. For each language in dropdown:
   - Select language
   - Verify syntax highlighting appears
   - Verify diff highlighting (additions/deletions) visible
   - Check console for errors
4. Toggle VitePress theme while viewing different languages
5. Rapidly switch between languages to test stability

### Success Criteria

- All 8 languages render with correct syntax highlighting
- Syntax colors differ visibly between languages
- Diff highlighting remains visible alongside syntax highlighting
- No JavaScript errors in console
- Theme switching works smoothly during language changes

## Technical Notes

### Why No Component Changes?

The existing MonacoDiff component already supports dynamic language switching through watchers (lines 180-187):

```typescript
watch(() => props.language, (newLang) => {
  if (!diffEditor) return
  const originalModel = diffEditor.getOriginalEditor().getModel()
  const modifiedModel = diffEditor.getModifiedEditor().getModel()
  if (originalModel) monaco.editor.setModelLanguage(originalModel, newLang)
  if (modifiedModel) monaco.editor.setModelLanguage(modifiedModel, newLang)
  console.log('[MonacoDiffFile] Language updated:', newLang)
})
```

This watcher responds to prop changes and calls Monaco's `setModelLanguage()` API, triggering syntax highlighting updates.

### Why Dropdown over Button Group?

Button group was considered but rejected:
- 8 buttons consume significant vertical space
- Dropdown is more compact and familiar
- Button group provides no functional advantage for language selection
- Dropdown scales better if additional languages added later

### Asset Loader Compatibility

The existing `assets.data.ts` loader uses glob pattern `assets/*.md` but VitePress data loaders support any file extension. No modifications required—the loader will automatically include `.ts`, `.js`, `.vue`, etc. files when present in the assets directory.

## Implementation Checklist

- [ ] Create 8 before/after file pairs in docs/assets/
- [ ] Add Test Case 5 section to poc-monaco-diff-comprehensive.md
- [ ] Implement Vue script setup with reactive language selection
- [ ] Add dropdown UI with language options
- [ ] Add validation checklist to test case
- [ ] Manually test all languages and theme switching
- [ ] Document validation results

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loader doesn't handle non-.md extensions | High | Verify loader behavior with test file; modify glob pattern if needed |
| Monaco language IDs differ from expectations | Medium | Reference Monaco documentation for correct language identifiers |
| File size bloat from 16 new files | Low | Keep examples concise (10-20 lines each); acceptable for test assets |
| Syntax highlighting doesn't differ visibly | Low | Use language-specific features (types, JSX, YAML syntax) to ensure visual differences |

---

**Design Status:** Ready for implementation
**Next Steps:** Proceed to implementation phase with task breakdown
