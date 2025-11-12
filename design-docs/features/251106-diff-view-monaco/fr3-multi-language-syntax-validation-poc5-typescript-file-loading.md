# POC-5: TypeScript File Loading and Syntax Highlighting

**Date:** 2025-01-09
**Status:** Design - Ready for Implementation
**Related Requirements:** [FR-3: Syntax Highlighting](./fr3-multi-language-syntax-validation-design.md)
**POC Page:** Test Case 5 on [POC-4 Comprehensive Page](../../../docs/poc-monaco-diff-comprehensive.md)

---

## Problem

The VitePress data loader restricts file loading to Markdown. The current glob pattern `assets/*.md` in `docs/.vitepress/loaders/assets.data.ts` (line 11) prevents loading TypeScript, JavaScript, Vue, and other language files required by FR-3.

**Critical Risk:** Without proof that non-.md files load and syntax-highlight correctly, the entire FR-3 multi-language requirement remains unvalidated.

## Complete POC Strategy

### POC-5: TypeScript File Loading (This Document)
**Goal:** Prove the data loader loads .ts files and Monaco renders TypeScript syntax highlighting
**Validation Method:** Button toggle on POC-4 page switches between Markdown and TypeScript examples
**Timeline:** 1-2 hours
**Status:** Detailed design below

### POC-6: Multi-Language Dropdown (Future)
**Goal:** Validate all 8 FR-3 languages with dropdown selector
**Dependencies:** Requires POC-5 proving non-.md file loading works
**Timeline:** 2-3 days (after POC-5 success)
**Status:** Deferred until TypeScript validation completes

## Approach

Extend the existing data loader glob pattern to include TypeScript files, create two TypeScript example files, and add Test Case 5 to POC-4 with a simple button toggle.

**Why This Approach:**
- **Minimal scope:** Single language (TypeScript) proves multi-language capability without full FR-3 implementation
- **Fast validation:** Button toggle (not dropdown) reduces UI complexity
- **Low risk:** Builds on validated POC-4 architecture per [Monaco Diff Reference](../../../docs/monaco-diff-reference.md#component-lifecycle-pattern)
- **Incremental:** POC-6 adds remaining languages only after TypeScript proves viable

## Architecture

### Data Loader Changes

**File:** `docs/.vitepress/loaders/assets.data.ts`

**Current Implementation:**

```typescript
export default createContentLoader('assets/*.md', {
  includeSrc: true,
  transform(rawData): AssetFile[] {
    return rawData.map(({ url, src }) => ({
      path: url.replace('/assets/', '').replace('.html', '.md'),
      content: src || ''
    }))
  }
})
```

**Required Change:**

```typescript
export default createContentLoader('assets/*.{md,ts}', {
  includeSrc: true,
  transform(rawData): AssetFile[] {
    return rawData.map(({ url, src }) => {
      // Extract original extension from URL
      const fileName = url.split('/').pop() || ''
      const ext = fileName.split('.').pop() || 'md'

      return {
        path: url.replace('/assets/', '').replace('.html', `.${ext}`),
        content: src || ''
      }
    })
  }
})
```

**Rationale:** VitePress `createContentLoader` accepts glob patterns per [VitePress Data Loading API](https://vitepress.dev/guide/data-loading). The `*.{md,ts}` pattern loads both Markdown and TypeScript files.

### Asset Files

**Location:** `docs/assets/`

Create two TypeScript example files demonstrating type annotation refactoring:

**File:** `example-typescript-before.ts`

```typescript
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0)
}

const cart = [
  { name: 'Widget', price: 10 },
  { name: 'Gadget', price: 20 }
]

console.log(calculateTotal(cart))
```

**File:** `example-typescript-after.ts`

```typescript
interface CartItem {
  name: string
  price: number
}

function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}

const cart: CartItem[] = [
  { name: 'Widget', price: 10 },
  { name: 'Gadget', price: 20 }
]

console.log(calculateTotal(cart))
```

**Diff Highlights:**
- Addition of `CartItem` interface (green)
- Type annotations on function parameters and return type (green)
- Typed array declaration (green)

### Page Implementation

**File:** `docs/poc-monaco-diff-comprehensive.md`

Add Test Case 5 after existing Test Case 4:

```vue
<script setup>
import { ref, computed } from 'vue'
// ... existing imports ...

// New reactive state for language toggle
const showTypeScript = ref(false)

// Computed files based on toggle
const languageFiles = computed(() => {
  if (showTypeScript.value) {
    return {
      oldFile: 'example-typescript-before.ts',
      newFile: 'example-typescript-after.ts',
      language: 'typescript',
      label: 'TypeScript'
    }
  } else {
    return {
      oldFile: 'default-system-prompt.md',
      newFile: 'output-style-system-prompt.md',
      language: 'markdown',
      label: 'Markdown'
    }
  }
})
</script>

## Test Case 5: TypeScript File Loading

**Expected:** MonacoDiff loads .ts files and renders TypeScript syntax highlighting

<div style="margin-bottom: 1rem;">
  <button @click="showTypeScript = !showTypeScript">
    Toggle Language (Currently: {{ languageFiles.label }})
  </button>
</div>

<ClientOnly>
  <MonacoDiff
    :oldFile="languageFiles.oldFile"
    :newFile="languageFiles.newFile"
    :language="languageFiles.language"
  />
</ClientOnly>

**Test Instructions:**
1. Verify Markdown diff renders initially
2. Click "Toggle Language" button
3. Verify TypeScript diff loads
4. Check console for errors
5. Verify TypeScript syntax highlighting (blue keywords, green strings, etc.)
6. Verify diff highlighting (green additions for type annotations)
```

## Success Metrics

**Quantitative Criteria:**
1. ✅ Data loader loads both .md and .ts files (verify in console logs)
2. ✅ Button toggles between Markdown and TypeScript (visible UI change)
3. ✅ TypeScript syntax highlighting visible (keywords colored differently than Markdown)
4. ✅ Diff highlighting visible (green additions for type annotations)
5. ✅ Zero console errors during toggle operations
6. ✅ Theme switching works for TypeScript content

**Go Criteria:**
- All 6 metrics pass → Proceed to POC-6 (multi-language dropdown)

**No-Go Criteria:**
- Data loader fails to load .ts files → Investigate VitePress glob limitations
- TypeScript syntax highlighting absent → Check Monaco worker configuration
- Console errors on toggle → Debug MonacoDiff component watchers

## Implementation Details

### Step 1: Update Data Loader
**File:** `docs/.vitepress/loaders/assets.data.ts`
**Change:** Update glob pattern from `assets/*.md` to `assets/*.{md,ts}`
**Change:** Update transform logic to preserve original file extensions
**Verification:** Run `npm run docs:dev` and check console for loaded file list

### Step 2: Create TypeScript Examples
**Files:** `docs/assets/example-typescript-before.ts`, `docs/assets/example-typescript-after.ts`
**Content:** Type annotation refactoring (interface, typed parameters, return type)
**Verification:** Files appear in data loader output

### Step 3: Add Test Case 5
**File:** `docs/poc-monaco-diff-comprehensive.md`
**Add:** Reactive `showTypeScript` ref
**Add:** Computed `languageFiles` property
**Add:** Test Case 5 section with toggle button
**Verification:** Button renders, toggle updates component props

### Step 4: Manual Validation
**Actions:**
1. Navigate to POC-4 page in dev server
2. Scroll to Test Case 5
3. Verify Markdown diff renders
4. Click toggle button
5. Verify TypeScript diff loads with syntax highlighting
6. Toggle theme (light/dark)
7. Verify no console errors

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Data loader doesn't support multi-extension globs | Low | High | VitePress uses standard glob syntax; fallback: separate loaders for each extension |
| TypeScript worker not loaded | Low | High | Verify worker imports in MonacoDiff.vue per [Reference](../../../docs/monaco-diff-reference.md#worker-setup-2025-best-practice) |
| Path normalization breaks | Medium | Medium | Add comprehensive logging; test with various path formats |
| Syntax colors invisible | Low | Low | Validate theme contrast; TypeScript has distinct keyword/type highlighting |

## Out of Scope

The following items remain out of scope for POC-5:

- **Remaining 7 languages:** JavaScript, Vue, HTML, CSS, JSON, YAML, Markdown (deferred to POC-6)
- **Dropdown UI:** Button toggle sufficient for single-language validation
- **FR-3 complete validation:** POC-5 proves concept; full FR-3 requires POC-6
- **Production refinement:** Example file quality, error messaging polish

Per [FR-3 Requirements](./fr3-multi-language-syntax-validation-design.md#^FR3), full multi-language validation occurs in POC-6.

## References

- **FR-3 Design Document:** [fr3-multi-language-syntax-validation-design.md](./fr3-multi-language-syntax-validation-design.md)
- **Monaco Diff Reference:** [monaco-diff-reference.md](../../../docs/monaco-diff-reference.md)
- **POC-4 Implementation:** [poc-monaco-diff-comprehensive.md](../../../docs/poc-monaco-diff-comprehensive.md)
- **VitePress Data Loading:** [VitePress Guide](https://vitepress.dev/guide/data-loading)
- **Existing Data Loader:** `docs/.vitepress/loaders/assets.data.ts`

---

**Next Steps:** Implement Step 1-4, validate success metrics, document results, proceed to POC-6 if successful.
