# VitePress Layout Customization APIs

**Research Date:** 2025-11-03
**Purpose:** Document official VitePress patterns for layout customization
**Sources:** VitePress official documentation (vitepress.dev)

## Disabling Right Sidebar (Outline)

VitePress provides two configuration options for controlling the right sidebar:

### Global Config

```typescript
// .vitepress/config.ts
export default {
  themeConfig: {
    outline: false,  // Disables outline/TOC completely
    // OR
    aside: false     // Disables entire aside container
  }
}
```

### Per-Page Frontmatter

```yaml
---
aside: false      # Disables aside/sidebar for this page
outline: false    # Disables just outline (table of contents)
---
```

**Recommendation:** Use `outline: false` for targeted control. Use `aside: false` to disable the entire aside container.

**Source:** <https://vitepress.dev/reference/default-theme-config>

## Custom Layout Components

### Approach 1: Wrapper Component (Recommended)

Override the default layout by creating a wrapper component that extends DefaultTheme:

**`.vitepress/theme/index.ts`:**

```typescript
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import MyLayout from './MyLayout.vue'

export default {
  extends: DefaultTheme,
  Layout: MyLayout
} satisfies Theme
```

**`.vitepress/theme/MyLayout.vue`:**

```vue
<script setup>
import DefaultTheme from 'vitepress/theme'
const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #aside-outline-before>
      My custom sidebar top content
    </template>
  </Layout>
</template>
```

### Approach 2: Render Functions

```typescript
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import MyComponent from './MyComponent.vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'aside-outline-before': () => h(MyComponent)
    })
  }
}
```

**Source:** <https://vitepress.dev/guide/extending-default-theme>

## Layout Slots

VitePress provides 15+ named slots for injecting custom content:

### Doc Layout (Default)
- `doc-top`, `doc-bottom`, `doc-footer-before`
- `doc-before`, `doc-after`
- `sidebar-nav-before`, `sidebar-nav-after`
- `aside-top`, `aside-bottom`
- `aside-outline-before`, `aside-outline-after`
- `aside-ads-before`, `aside-ads-after`

### Home Layout
- `home-hero-before`, `home-hero-info-before`, `home-hero-info`, `home-hero-info-after`
- `home-hero-actions-after`, `home-hero-image`, `home-hero-after`
- `home-features-before`, `home-features-after`

### Page Layout
- `page-top`, `page-bottom`

### Global Slots (All Layouts)
- `layout-top`, `layout-bottom`
- `nav-bar-title-before/after`, `nav-bar-content-before/after`
- `nav-screen-content-before/after`

**Source:** <https://vitepress.dev/guide/extending-default-theme>

## Theme Extending Pattern

```typescript
// .vitepress/theme/index.ts
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import MyCustomLayout from './layouts/MyCustomLayout.vue'
import MyGlobalComponent from './components/MyGlobalComponent.vue'

export default {
  extends: DefaultTheme,
  Layout: MyCustomLayout,
  enhanceApp({ app }) {
    app.component('MyGlobalComponent', MyGlobalComponent)
  }
} satisfies Theme
```

**Key principles:**
- Use `extends: DefaultTheme` to inherit all default functionality
- Override `Layout` property (optional) for custom layout structure
- Use `enhanceApp()` to register global components
- Only the base export is required; all properties are optional

**Source:** <https://vitepress.dev/guide/custom-theme>

## Layout Configuration Per Page

Control page layout via frontmatter:

```yaml
---
layout: doc      # Default: styled doc with sidebar, navbar, footer
---
```

### Available Options
- `layout: doc` - Default documentation layout with full styling
- `layout: page` - Blank page (parses markdown but minimal styling)
- `layout: home` - Templated homepage with hero and features
- `layout: false` - No layout (fully custom, removes sidebar/navbar/footer)
- `layout: custom-name` - Custom registered component

**Source:** <https://vitepress.dev/reference/default-theme-layout>

## Real-World Examples

1. **VitePress Official Docs**
   Uses default theme with slot injection for custom branding
   Pattern: Extends DefaultTheme with wrapper Layout component
   Source: <https://github.com/vuejs/vitepress>

2. **vitepress-sidebar Plugin**
   Auto-sidebar generator for complex documentation sites
   Pattern: Configuration-based sidebar generation
   Source: <https://github.com/jooy2/vitepress-sidebar>

3. **vitepress-theme-api**
   API documentation theme
   Pattern: Custom theme built by extending default theme
   Source: <https://github.com/logicspark/vitepress-theme-api>

## Key Findings

VitePress provides first-class support for layout customization through three official mechanisms:

1. **Layout Slots** (Recommended) - Inject content into 15+ named slots while preserving default functionality. Most flexible for partial customizations.

2. **Config Options** - Simple boolean/string settings like `outline: false` and `aside: false` for common customizations without custom components.

3. **Custom Layouts** - Full override capability via `layout: false` in frontmatter or custom Layout components registered in theme config.

**All approaches are officially documented and supported.** No hacks required. The layout slots pattern balances flexibility with maintainability for POC-1.
