# VitePress Current Setup

**Research Date:** 2025-11-03
**VitePress Version:** 2.0.0-alpha.12
**Purpose:** Document current configuration and theme structure

## Configuration Analysis

### Layout Settings (docs/.vitepress/config.mts)
The site uses default VitePress layout behavior with no explicit overrides:
- No `outline` configuration (defaults to showing right sidebar TOC)
- No `aside` configuration (defaults to enabling aside container)
- No layout-specific CSS variables defined

### Sidebar Structure
Two main sections:
- "Claude Code Workflows" - primary navigation
- "Research" - collapsible section (collapsed by default)

Currently sparse with two navigation items pointing to deprecated content pages.

### Navigation Bar
- Site title: "Claude Code Workflows"
- Home link
- GitHub external link
- Social links (GitHub icon)

## Theme Structure (docs/.vitepress/theme/index.ts)

### Base Theme
Extends VitePress DefaultTheme with minimal customization.

### Registered Components
- `SystemPromptDiff` - Global component for displaying diff views
- Located at: `docs/.vitepress/components/SystemPromptDiff.vue`

### Custom Styling
Imports `custom.css` file, which is currently empty.

## Existing Custom Components

### SystemPromptDiff.vue
Diff viewer component for comparing system prompts:
- Uses `@git-diff-view/vue` library
- Renders side-by-side markdown diff view
- Styled with VitePress CSS variables
- Currently hardcoded content (no props interface)

## Key Findings

The site relies entirely on VitePress default behavior. No layout customizations exist beyond a single global component. The empty `custom.css` file indicates no CSS overrides. This clean slate simplifies POC implementation—no existing customizations to work around.

## Implications for POC-1

**Advantages:**
- No conflicting layout overrides to reconcile
- Clean starting point for CSS customizations
- Existing SystemPromptDiff component provides diff rendering foundation

**Requirements:**
- Must refactor SystemPromptDiff to accept props (currently hardcoded)
- Can safely add CSS overrides without breaking existing customizations
- Layout changes will be immediately visible (no competing styles)
