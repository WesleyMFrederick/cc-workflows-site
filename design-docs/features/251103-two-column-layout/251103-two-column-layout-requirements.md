# Two-Column Layout for Readable Diffs - Requirements

**Date:** 2025-11-03
**Status:** Requirements Gathering Complete
**Priority:** High - Readability of diffs is primary goal

## Problem Statement

The VitePress blog uses a three-column layout: left navigation sidebar, main content area, and right "On this page" table of contents. This constrains the main content width, making side-by-side diff comparisons cramped and difficult to read. Readers must scroll horizontally to view both panes of a diff, disrupting the reading experience.

## Goals

Adopt a two-column layout (left sidebar + wide main content) by integrating the page table of contents into the left navigation sidebar. This maximizes horizontal space for readable side-by-side diff comparisons.

**Primary Success Metric:** Readers can view side-by-side diffs without horizontal scrolling on standard desktop displays (1920px+).

## Functional Requirements

### FR-1: Two-Column Layout
- Remove the right "On this page" sidebar completely
- Expand main content area to use freed horizontal space
- Apply layout site-wide to all documentation pages

### FR-2: Integrated Navigation Sidebar
- Combine main site navigation with current page table of contents in left sidebar
- Display page TOC showing H2 and H3 headings only
- Distinguish site navigation items from page TOC items visually
- Link TOC items to sections on the current page

### FR-3: Responsive Behavior
- **Desktop (1024px+):** Side-by-side diff view with wide content area
- **Tablet (768px-1023px):** Side-by-side diff view with reduced content width
- **Mobile (<768px):** Stack diff panes vertically (old above, new below)

### FR-4: Content Type Support
Support diffs for these content types:
- System prompt changes
- Code comparisons
- Configuration files (JSON, YAML, etc.)
- Documentation/markdown changes

**Loading Methods:**
- Inline content definition (hardcoded strings in component)
- File path references (load content from project files)

## Non-Functional Requirements

### NFR-1: Performance
- Page load time must not increase due to TOC integration
- Generate TOC at build time, not runtime
- Prevent visible layout shifts when page loads

### NFR-2: Maintainability
- Solution must work with VitePress upgrades
- Generate TOC automatically from markdown headings (no manual maintenance)
- Separate theme customization from content clearly

### NFR-3: Accessibility
- Support keyboard navigation for site nav and page TOC
- Enable screen readers to distinguish between site navigation and page sections
- Display focus states clearly on all interactive elements

### NFR-4: Browser Compatibility
- Support modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
- Degrade gracefully for older browsers (functional even if not pixel-perfect)

### NFR-5: VitePress Alignment
- Leverage VitePress's existing APIs and hooks where possible
- Avoid fighting VitePress's default behavior
- Follow VitePress theme customization patterns

## User Stories

### US-1: Reader Views Diffs in Wide Content Area
**As a** blog reader
**I want** to view side-by-side code/config diffs in a wider main content area without horizontal scrolling
**So that** I can easily compare changes and understand the differences at a glance

**Acceptance Criteria:**
- [ ] Main content area width increases significantly compared to current three-column layout
- [ ] Right "On this page" sidebar is removed to free horizontal space
- [ ] Diff viewer displays both old and new content side-by-side on desktop (1920px)
- [ ] Each diff pane has adequate width (minimum 600px per pane) for readable code
- [ ] No horizontal scrollbar appears within the diff component
- [ ] Both panes are equally sized and visible without scrolling

---

### US-2: Reader Navigates Within Long Articles
**As a** blog reader
**I want** to jump to specific sections within the current article from the left sidebar
**So that** I can quickly navigate long technical posts without excessive scrolling

**Acceptance Criteria:**
- [ ] Current page's H2 and H3 headings appear in left sidebar
- [ ] Clicking a heading scrolls to that section smoothly
- [ ] Current section is visually highlighted in the sidebar
- [ ] Page TOC is visually distinguished from main site navigation

---

### US-3: Mobile Reader Views Diffs
**As a** mobile blog reader
**I want** diff content to adapt to my smaller screen
**So that** I can read comparisons on my phone without awkward horizontal scrolling

**Acceptance Criteria:**
- [ ] On screens <768px, diff panes stack vertically
- [ ] Old version appears above new version
- [ ] Both versions are fully readable without horizontal scroll
- [ ] Left sidebar collapses to hamburger menu on mobile

---

### US-4: Content Author Adds Diffs to Posts
**As a** content author
**I want** to embed diffs in my markdown using either inline content or file paths
**So that** I can show comparisons without duplicating file content in my markdown

**Acceptance Criteria:**
- [ ] Adding markdown headings automatically updates sidebar TOC
- [ ] SystemPromptDiff component accepts inline content (current behavior)
- [ ] SystemPromptDiff component accepts file paths to load content
- [ ] File paths are resolved relative to project root or docs directory
- [ ] File loading errors display helpful messages in dev and build
- [ ] No special frontmatter or config required for wide layout
- [ ] Preview in dev server matches production build

**Example Usage:**

```vue
<!-- Inline content -->
<SystemPromptDiff
  oldContent="content here"
  newContent="updated content"
/>

<!-- File paths -->
<SystemPromptDiff
  oldFile="./prompts/v1.txt"
  newFile="./prompts/v2.txt"
/>
```

---

### US-5: Site Maintainer Upgrades VitePress
**As a** site maintainer
**I want** the custom layout to survive VitePress version updates
**So that** I can keep dependencies current without breaking the site

**Acceptance Criteria:**
- [ ] Custom theme extends VitePress default theme properly
- [ ] Uses documented VitePress APIs and hooks
- [ ] Clear documentation of customizations made
- [ ] No monkey-patching or brittle CSS overrides

## Possible Implementation Approaches

These approaches will be evaluated against architectural principles in the design phase:

### Approach 1: Custom Layout Component
Create custom Layout.vue that fully controls page structure. Combines sidebar nav + page TOC programmatically.

**Pros:** Most maintainable, proper data integration
**Cons:** Requires understanding VitePress layout internals

### Approach 2: CSS Override + Manual TOC
Hide right sidebar with CSS, widen content area, manually add TOC items to sidebar config.

**Pros:** Quickest implementation
**Cons:** Fragile to VitePress updates, requires manual TOC maintenance per page

### Approach 3: Hybrid: Config + Custom Sidebar
Use VitePress config to disable outline (right TOC), create custom sidebar component that auto-merges nav + current page headings.

**Pros:** Balanced complexity, leverages VitePress APIs for TOC data
**Cons:** Moderate complexity

## Architecture Principles to Apply

When evaluating approaches, apply these principles from `Architecture Principles.md`:

- **Modular Design:** Loose coupling, single responsibility, replaceable parts
- **Data-First Design:** Clean data models drive clean code
- **Simplicity First:** Favor direct implementation paths
- **MVP-First:** Build functionality that proves the concept works
- **Foundation Reuse:** Leverage existing VitePress APIs instead of recreating
- **Tool-First Design:** Use VitePress's built-in APIs for TOC generation

## Out of Scope

- Custom diff syntax highlighting (use existing library)
- Three-way diffs or merge conflict visualization
- Diff commenting or annotation features
- Custom color themes beyond VitePress defaults
- Integration with version control systems

## Next Steps

1. Research VitePress layout customization APIs and TOC generation
2. Create design document evaluating approaches against architecture principles
3. Build proof-of-concept for selected approach
4. Implement full solution
5. Test across browsers and devices
6. Document customizations for future maintainers

## References

- **CodeHike Layout:** <https://codehike.org/docs/code> (reference for two-column design)
- **Current Site:** <http://localhost:5173/Claude%20Code%20Output%20Style%20Depricated.html>
- **Architecture Principles:** `/Users/wesleyfrederick/Documents/ObsidianVaultNew/0_SoftwareDevelopment/cc-workflows/design-docs/Architecture Principles.md`
- **VitePress Config:** `docs/.vitepress/config.mts`
- **Current Theme:** `docs/.vitepress/theme/index.ts`
- **Existing Diff Component:** `docs/.vitepress/components/SystemPromptDiff.vue`
