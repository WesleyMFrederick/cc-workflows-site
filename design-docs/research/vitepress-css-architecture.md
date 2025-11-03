# VitePress CSS Architecture

**Research Date:** 2025-11-03
**Purpose:** Document CSS variables and width calculations for layout customization
**Sources:** VitePress source code, GitHub discussions #1646 and #1709

## CSS Variables for Width Control

VitePress defines these layout-related CSS variables:

```css
--vp-layout-max-width: 1440px
--vp-sidebar-width: 272px
--vp-nav-height: 64px
--vp-nav-logo-height: 24px
```

**Source:** <https://github.com/vuejs/vitepress/blob/main/src/client/theme-default/styles/vars.css>

## Default Three-Column Measurements

Desktop layout at 1440px breakpoint:

- **Left sidebar:** 272px
- **Main content area:** 912px (calculated: 1376px - 272px - 224px)
- **Right aside (TOC):** 224px
- **Window padding:** 32px left + 32px right
- **Content body padding:** 112px left + 112px right
- **Final usable content width:** 688px

### Calculation Breakdown

```text
1440px (max-width)
  - 32px (left padding)
  - 32px (right padding)
  - 272px (sidebar)
  - 224px (aside)
  - 112px (left body padding)
  - 112px (right body padding)
  = 688px usable content width
```

**Source:** GitHub Discussion #1646 "Why is the page content width 688px?"

## CSS Selector Max-Width Rules

VitePress applies different max-width values based on layout configuration:

### Three-Column Layout (with sidebar and aside)

```css
.VPDoc.has-aside .content-container {
  max-width: 688px;
}
```

### Two-Column Layout (sidebar, no aside)

```css
@media (min-width: 960px) {
  .VPDoc:not(.has-aside) .content {
    max-width: 752px;
  }
}

@media (min-width: 1440px) {
  .VPDoc:not(.has-aside) .content {
    max-width: 784px;
  }
  .VPDoc:not(.has-aside) .container {
    max-width: 1104px;
  }
}
```

### No Sidebar Layout

```css
.VPDoc:not(.has-sidebar) .content {
  max-width: 784px;
}
.VPDoc:not(.has-sidebar) .container {
  max-width: 1104px;
}
```

**Source:** GitHub Discussion #1709 and VitePress default theme CSS

## Projected Two-Column Measurements

When aside (right TOC) is disabled:

### Available Space

```text
1440px (layout max-width)
  - 32px (right padding)
  - 272px (sidebar)
  = 1136px available
```

### With Current CSS (.VPDoc:not(.has-aside))

```text
Content width: 784px (max-width from selector)
Per diff pane (÷2): 392px
```

### With Custom CSS Override (Target: 1200px content)

```text
Content width: 1200px (custom override)
Content body padding: 112px left + 112px right = 224px
Usable width: 1200px - 224px = 976px
Per diff pane (÷2): 488px
```

### With Expanded Layout Max-Width (1920px)

```text
1920px (custom max-width)
  - 32px (right padding)
  - 272px (sidebar)
  = 1616px available

Custom content width: 1400px
Content body padding: 224px
Usable width: 1176px
Per diff pane (÷2): 588px
```

## CSS Override Strategy

To achieve 600px+ per diff pane on 1920px displays:

```css
/* docs/.vitepress/theme/custom.css */

:root {
  --vp-layout-max-width: 1920px;
  --vp-sidebar-width: 272px; /* unchanged */
}

/* Override content width when aside is disabled */
@media (min-width: 1440px) {
  .VPDoc:not(.has-aside) .content-container {
    max-width: 1400px;
  }

  .VPDoc:not(.has-aside) .container {
    max-width: 1600px;
  }
}
```

### Projected Results
- **Layout max-width:** 1920px
- **Content container:** 1400px
- **Content body padding:** 224px
- **Usable width:** 1176px
- **Per diff pane:** 588px (~600px target achieved)

**Source:** <https://vitepress.dev/guide/extending-default-theme>

## VitePress Design Philosophy

The VitePress maintainer values "tight control over every pixel" and designed the 688px default width intentionally. The maintainer acknowledges that padding perception differs from absolute measurements.

**Source:** GitHub Discussion #1646

## Key Findings

1. **600px+ per pane is achievable** with CSS overrides. Remove the aside, increase `--vp-layout-max-width` to 1920px, and set `.content-container` max-width to 1400px.

2. **Use CSS variable overrides** in custom theme file rather than modifying default theme directly. This preserves upgradeability.

3. **Target the correct selectors**: `.VPDoc:not(.has-aside)` selectors control layout when aside is disabled. Override both `.content-container` and `.container` max-widths.

4. **Media queries matter**: Apply overrides at `@media (min-width: 1440px)` to avoid breaking tablet/mobile layouts.

## Implications for POC-1

The CSS override strategy is straightforward and uses officially supported customization patterns. POC-1 should:
1. Add overrides to `docs/.vitepress/theme/custom.css`
2. Test on 1920px display to validate 600px+ per pane
3. Verify no regression on smaller viewports (1440px, 1024px)
