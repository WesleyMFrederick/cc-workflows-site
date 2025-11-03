# Root Cause Analysis: Diff Viewer Not Loading

**Date:** 2025-11-03
**Issue:** Diff viewer rendering as empty collapsed box (40px height)
**Status:** ✅ RESOLVED

## Issue Description

The diff viewer component on both POC-1 and POC-2 pages was rendering as an empty collapsed box (40px height) instead of displaying the full side-by-side diff content with syntax highlighting.

## Root Cause

**Incorrect prop name in DiffView component template.**

The template was using `:data="diffFile"` but the `@git-diff-view/vue` DiffView component expects the prop to be named `:diffFile`.

**Location:** `docs/.vitepress/components/SystemPromptDiff.vue:6`

## Discovery Process

Applied **root-cause-tracing** skill to systematically trace backward from symptom to source:

1. **Observed symptom**: Diff viewer appeared but was only 40px tall
2. **Traced data loader**: Confirmed files loaded successfully (14835 and 19305 chars)
3. **Traced component onMounted**: Confirmed content resolved correctly
4. **Identified buildSplitDiffLines() anomaly**: Method called but `hasSplitLines: false`
5. **Researched correct API usage**: Found DiffView expects `diffFile` prop, not `data`
6. **Applied fix**: Changed prop name from `:data` to `:diffFile`

## Fix Applied

```diff
// docs/.vitepress/components/SystemPromptDiff.vue
<template>
  <div class="system-prompt-diff">
    <div v-if="loadError" class="error-message">
      <strong>Error loading diff:</strong> {{ loadError }}
    </div>
-   <DiffView v-else-if="diffFile" :data="diffFile" />
+   <DiffView v-else-if="diffFile" :diffFile="diffFile" />
  </div>
</template>
```

## Validation Results

### Before Fix
- POC-1 height: 42px (empty)
- POC-2 height: 40px (empty)
- No diff content visible
- No error messages

### After Fix
- ✅ **POC-1 (inline content)**: 64px height with proper diff display
- ✅ **POC-2 (file loading)**: 4126px height with full system prompt diff
- ✅ **Both pages**: Side-by-side diff with syntax highlighting and diff coloring
- ✅ **All validation criteria**: Passed

## Defense-in-Depth Recommendations

To prevent similar issues in the future:

### 1. TypeScript Prop Validation
Add TypeScript type checking to catch incorrect prop names at compile time:

```typescript
import type { DiffFile } from '@git-diff-view/file';
import type { ComponentProps } from 'vue';
import { DiffView } from '@git-diff-view/vue';

// Type-safe props
const props: ComponentProps<typeof DiffView> = {
  diffFile: file
};
```

### 2. E2E Test for Rendering
Add test that verifies diff viewer renders with content:

```typescript
test('diff viewer should render with height > 100px', async ({ page }) => {
  await page.goto('/poc-file-loading-test.html');
  const diffBox = await page.locator('.system-prompt-diff').boundingBox();
  expect(diffBox.height).toBeGreaterThan(100);
});
```

### 3. Unit Test for Correct Prop Name
Mock DiffView and verify correct prop is passed:

```typescript
test('should pass diffFile prop to DiffView', () => {
  const wrapper = mount(SystemPromptDiff, {
    props: { oldContent: 'old', newContent: 'new' }
  });
  const diffView = wrapper.findComponent(DiffView);
  expect(diffView.props('diffFile')).toBeDefined();
});
```

## Lessons Learned

1. **Component library documentation is critical**: Always verify exact prop names from official docs
2. **Visual symptoms need data verification**: Empty render doesn't mean data loading failed
3. **Root cause tracing prevents symptom fixes**: Without tracing, might have tried re-implementing buildSplitDiffLines()
4. **Tests didn't catch the issue**: Need better integration tests that verify visual rendering

## Related Files

- `docs/.vitepress/components/SystemPromptDiff.vue` - Fixed component
- `docs/poc-file-loading-test.md` - POC-2 test page
- `docs/poc-layout-test.md` - POC-1 test page
- `docs/.vitepress/PromptDiffs.data.ts` - Data loader (working correctly)
