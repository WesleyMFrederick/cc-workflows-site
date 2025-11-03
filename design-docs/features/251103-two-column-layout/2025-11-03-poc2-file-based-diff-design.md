# POC-2: File-Based Diff Loading - Design Document

**Date:** 2025-11-03
**Status:** Design Complete, Ready for Implementation
**Dependencies:** POC-1 (Layout Override and Width Validation) - **COMPLETED**

## Problem

The SystemPromptDiff component currently hardcodes diff content as string literals. This forces authors to embed long text blocks in markdown, making content difficult to maintain and reuse. Authors need to reference external files for diff comparisons.

**User Story Reference:** US-4 (Content Author Adds Diffs to Posts)

## Complete POC Strategy

### POC-1: Layout Override and Width Validation ✅ COMPLETED
**Goal:** Prove we can disable right sidebar and achieve 600px+ per diff pane
**Status:** Validated - achieved 1400px content width, no regressions
**Timeline:** Completed 2025-11-03

### POC-2: File-Based Diff Loading (This Document)
**Goal:** Validate SystemPromptDiff can load content from file paths
**Dependencies:** Requires POC-1 layout working
**Risk:** File path resolution and loading API integration
**Timeline:** 1-2 days

### POC-3: TOC Integration in Left Sidebar
**Goal:** Merge page TOC into left navigation sidebar
**Dependencies:** Requires POC-1 and POC-2 complete
**Risk:** VitePress sidebar API and state management complexity
**Timeline:** 3-4 days
**Status:** Future

## Approach

Use VitePress **data loaders** (`.data.ts` files) to load file content at build time. Data loaders execute in Node.js with filesystem access, return structured data, and support hot reloading during development.

**Why this approach:**
- Static diff files don't change at runtime
- Build-time loading = zero runtime overhead
- Hot reloading enables immediate preview during authoring
- Aligns with VitePress philosophy (static site generation)

**Research Foundation:**
- [Vite File Loading Patterns](../../research/vite-file-loading-patterns.md) %% force-extract %%
- [VitePress File Path Resolution](../../research/vitepress-file-path-resolution.md) %% force-extract %%
- [VitePress Error Handling Patterns](../../research/vitepress-error-handling-patterns.md) %% force-extract %%

## Architecture

### Component Interface (SystemPromptDiff.vue)

Add optional file path props alongside existing content props:

```typescript
interface Props {
  // Existing props (from POC-1)
  oldContent?: string;
  newContent?: string;
  oldLabel?: string;
  newLabel?: string;

  // New props for POC-2
  oldFile?: string;
  newFile?: string;
}
```

**Resolution priority:**
1. If `oldFile`/`newFile` provided, load from data loader
2. If `oldContent`/`newContent` provided, use directly (POC-1 behavior)
3. If neither provided, use defaults (backward compatibility)

### Data Loader (PromptDiffs.data.ts)

Create `.data.ts` file that loads prompt files at build time:

```typescript
// docs/.vitepress/PromptDiffs.data.ts
import { defineLoader } from 'vitepress'
import fs from 'fs'
import path from 'path'

interface DiffFile {
  path: string;
  content: string;
  error?: string;
}

export interface PromptDiffsData {
  files: Record<string, DiffFile>;
}

export default defineLoader({
  watch: ['./research/**/*.md'],
  async load(): Promise<PromptDiffsData> {
    const promptsDir = path.join(__dirname, '../research')
    const files: Record<string, DiffFile> = {}

    // Load all .md files from research directory
    const filePaths = fs.readdirSync(promptsDir)
      .filter(f => f.endsWith('.md'))

    for (const file of filePaths) {
      const filePath = path.join(promptsDir, file)
      try {
        files[file] = {
          path: file,
          content: fs.readFileSync(filePath, 'utf-8')
        }
      } catch (error) {
        files[file] = {
          path: file,
          content: '',
          error: error.message
        }
      }
    }

    return { files }
  }
})
```

### Component Implementation

Load data in component and resolve file paths:

```vue
<script setup lang="ts">
import { DiffView } from '@git-diff-view/vue';
import { generateDiffFile, type DiffFile } from '@git-diff-view/file';
import { onMounted, ref } from 'vue';
import { data as promptDiffs } from '../.vitepress/PromptDiffs.data';

const props = withDefaults(defineProps<Props>(), {
  // Defaults from POC-1...
});

const diffFile = ref<DiffFile | null>(null);
const loadError = ref<string | null>(null);

onMounted(() => {
  try {
    // Resolve content from file paths or props
    const oldContent = props.oldFile
      ? promptDiffs.files[props.oldFile]?.content ?? ''
      : props.oldContent;

    const newContent = props.newFile
      ? promptDiffs.files[props.newFile]?.content ?? ''
      : props.newContent;

    // Check for loading errors
    if (props.oldFile && promptDiffs.files[props.oldFile]?.error) {
      throw new Error(`Failed to load ${props.oldFile}: ${promptDiffs.files[props.oldFile].error}`);
    }
    if (props.newFile && promptDiffs.files[props.newFile]?.error) {
      throw new Error(`Failed to load ${props.newFile}: ${promptDiffs.files[props.newFile].error}`);
    }

    // Generate diff (existing logic from POC-1)
    const file = generateDiffFile(
      props.oldLabel ?? props.oldFile ?? 'Old',
      oldContent,
      props.newLabel ?? props.newFile ?? 'New',
      newContent,
      'markdown',
      'markdown'
    );
    file.initTheme('light');
    file.init();
    file.buildSplitDiffLines();
    diffFile.value = file;
  } catch (error) {
    loadError.value = error.message;
    console.error('[SystemPromptDiff] Load error:', error);
  }
});
</script>

<template>
  <div class="system-prompt-diff">
    <div v-if="loadError" class="error-message">
      <strong>Error loading diff:</strong> {{ loadError }}
    </div>
    <DiffView v-else-if="diffFile" :diff-file="diffFile" />
  </div>
</template>

<style scoped>
.error-message {
  padding: 1rem;
  background: #fee;
  border: 1px solid #c33;
  border-radius: 4px;
  color: #c33;
}
</style>
```

### Directory Structure

```text
docs/
├── .vitepress/
│   ├── PromptDiffs.data.ts        # Data loader
│   └── components/
│       └── SystemPromptDiff.vue   # Updated component
└── research/
    ├── default-system-prompt.md
    └── output-style-system-prompt.md
```

## Success Metrics

POC-2 succeeds when:

1. **Build-time loading works** - Data loader loads `.txt` files without errors
2. **File path props function** - Component accepts `oldFile`/`newFile` props
3. **Content displays correctly** - Diff renders loaded file content
4. **Hot reload functions** - Editing `.txt` file updates preview immediately
5. **Error handling works** - Missing files show helpful error message
6. **Backward compatibility preserved** - Existing `oldContent`/`newContent` usage still works
7. **Production build succeeds** - Static site generates without errors

### Quantitative Targets

| Metric | Target | Verification Method |
|--------|--------|---------------------|
| File load success rate | 100% (all prompt files) | Build logs, no errors |
| Hot reload latency | <2 seconds | Edit file, observe preview update |
| Error message clarity | Dev sees filename and reason | Trigger error, read message |
| Backward compatibility | 0 breaking changes | Existing POC-1 test page still works |

## Implementation Details

### Phase 1: Data Loader Setup (30 minutes)

1. Verify `docs/research/` directory exists with test files:
   - `default-system-prompt.md` (base system prompt)
   - `output-style-system-prompt.md` (system prompt with output style)
2. Create `PromptDiffs.data.ts` loader
3. Test with `npm run docs:dev`
4. Verify data loads in browser DevTools console

### Phase 2: Component Refactoring (45 minutes)

1. Add `oldFile`/`newFile` props to interface
2. Import data loader in component
3. Add file resolution logic in `onMounted`
4. Add error handling with try-catch
5. Test with file path props

### Phase 3: Error Handling (30 minutes)

1. Add error state to template
2. Test missing file scenario
3. Test unreadable file scenario
4. Verify error messages are helpful
5. Confirm build fails early on critical errors

### Phase 4: Test Page Creation (20 minutes)

1. Create `docs/poc-file-loading-test.md`
2. Disable aside via frontmatter
3. Add SystemPromptDiff with file path props:
   - `oldFile="default-system-prompt.md"` (base system prompt)
   - `newFile="output-style-system-prompt.md"` (with output style section)
4. Test hot reload by editing prompt file in `docs/research/`
5. Verify production build

### Phase 5: Validation (25 minutes)

1. Verify all success metrics
2. Test backward compatibility with POC-1 page
3. Document results in validation file
4. Make GO/NO-GO decision for POC-3

**Total estimated time:** 2.5 hours

## Risk Mitigation

### Risk: File path resolution fails in production
**Mitigation:** Data loader runs at build time with absolute paths. Test production build early.

### Risk: Hot reload doesn't work
**Mitigation:** Use `watch` option in loader config. Test immediately after data loader setup.

### Risk: Large file loading impacts build time
**Mitigation:** Prompt files are small (<10KB each). If needed, implement lazy loading for large files.

### Risk: Breaking changes to POC-1
**Mitigation:** Add props as optional with defaults. Test POC-1 page before and after changes.

## Out of Scope

- Syntax highlighting language auto-detection (future enhancement)
- Binary file diffing (text files only)
- Remote file loading (local files only)
- Diff caching or memoization (not needed for static files)

## Testing Strategy

### Unit Tests
Test component logic in isolation:
- Props interface accepts file paths
- Data loader returns expected structure
- Error handling catches and displays failures

### Integration Tests
Test full workflow:
- File changes trigger hot reload
- Multiple file formats load correctly
- Production build includes all prompt files

### Manual Tests
Author experience validation:
- Edit prompt file, verify preview updates
- Add new prompt file, verify it loads
- Use file path in markdown, verify render

## Deliverables

1. **Working component** - SystemPromptDiff with file path support
2. **Data loader** - PromptDiffs.data.ts with hot reload
3. **Test page** - poc-file-loading-test.md demonstrating usage
4. **Validation results** - poc2-validation-results.md with measurements
5. **Updated documentation** - Example usage in README or guide

## Success Decision Criteria

**Proceed to POC-3 if:**
- All 7 success metrics pass
- Hot reload latency <2 seconds
- No breaking changes to POC-1
- Error messages are clear and actionable

**Iterate on POC-2 if:**
- File loading fails in production
- Hot reload doesn't work
- Error messages are confusing

**Re-evaluate approach if:**
- Build time increases significantly (>10 seconds)
- Data loader causes memory issues
- VitePress upgrade breaks implementation

## References

**Research Foundation:**
- Vite File Loading Patterns: `design-docs/research/vite-file-loading-patterns.md`
- VitePress File Path Resolution: `design-docs/research/vitepress-file-path-resolution.md`
- VitePress Error Handling: `design-docs/research/vitepress-error-handling-patterns.md`

**POC-1 Validation:**
- POC-1 Results: `docs/poc-layout-test-results.md` (1400px width, no regressions)
- POC-1 Design: `design-docs/features/251103-two-column-layout/2025-11-03-poc1-layout-override-design.md`

**Requirements:**
- Two-Column Layout Requirements: `design-docs/features/251103-two-column-layout/251103-two-column-layout-requirements.md` (US-4)

**VitePress Documentation:**
- Data Loaders: <https://vitepress.dev/guide/data-loading>
- Build-time Data: <https://vitepress.dev/guide/data-loading#build-time-data>
