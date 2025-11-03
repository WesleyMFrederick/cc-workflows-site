# SystemPromptDiff Component Analysis

**Research Date:** 2025-11-03
**Component Location:** `docs/.vitepress/components/SystemPromptDiff.vue`
**Purpose:** Document current implementation for refactoring planning

## Props Interface

**Current state:** None. Component accepts no props and uses hardcoded content.

```typescript
// No props interface defined
```

## Dependencies

### NPM Packages
- `@git-diff-view/vue` - Vue component for rendering diffs
- `@git-diff-view/file` - File utilities for generating diff structures
- `@git-diff-view/vue/styles/diff-view.css` - Diff view styling

### Vue Imports

```typescript
import { DiffView } from '@git-diff-view/vue';
import { generateDiffFile, type DiffFile } from '@git-diff-view/file';
import { onMounted, ref } from 'vue';
```

## Implementation Details

### Content Generation
Hardcoded comparison of two system prompt versions:
- **Old:** Default Claude Code system prompt
- **New:** System prompt with `/output-style` modifications

### Diff Initialization Flow

```typescript
const file = generateDiffFile(
  'DEFAULT System Prompt',    // old file name
  oldContent,                  // old content string
  'USING /output-style',       // new file name
  newContent,                  // new content string
  'markdown',                  // old file syntax
  'markdown'                   // new file syntax
);
file.initTheme('light');
file.init();
file.buildSplitDiffLines();
```

### Reactive Rendering
Uses Vue's `ref` and `onMounted` to manage diff state:
- Initializes diff on component mount
- Renders `DiffView` component only when `diffFile` is populated (`v-if="diffFile"`)
- Ensures proper initialization before display

## Styling Approach

### Current Width/Sizing
No explicit width constraints—inherits from parent container.

### Component Styles

```css
.system-prompt-diff {
  margin: 2rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}
```

**Key characteristics:**
- Vertical margins: 2rem (32px) above/below
- Border: 1px solid with 8px rounded corners
- Uses VitePress theme variable for divider color
- `overflow: hidden` clips content to border-radius

## Current Usage

### Locations
1. `docs/Claude Code Output Style Depricated.md`
   - Section: "System Prompt Comparison"
   - Usage: `<SystemPromptDiff />`

2. `docs/research/Claude Code Output Style Depricated.md`
   - Matching usage in research version
   - Usage: `<SystemPromptDiff />`

## Refactoring Requirements for POC-1

### Add Props Interface

```typescript
interface Props {
  oldContent?: string;
  newContent?: string;
  oldLabel?: string;
  newLabel?: string;
}
```

### Maintain Backward Compatibility
Default values must match current hardcoded content so existing usage (`<SystemPromptDiff />`) continues working without changes.

### Keep Diff Logic Unchanged
The `generateDiffFile` and rendering logic works correctly—only parameterize the inputs.

### Preserve Styling
Current CSS classes and styling should remain unchanged for consistency across existing and new usage.

## Key Findings

The component provides solid diff rendering functionality using a well-maintained library. The only blocker for POC-1 is the lack of a props interface. Refactoring is straightforward: extract hardcoded values to optional props with defaults. No changes needed to diff generation logic or styling.
