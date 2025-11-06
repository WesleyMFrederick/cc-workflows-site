
  Requirements Synthesis: Monaco Diff Viewer for Technical Blog

  Based on our elicitation session, here's the structured FR/NFR breakdown:


  Functional Requirements (FR)

  FR-1: Core Diff Display

  FR-1.1 - Side-by-side diff view showing old content (left pane) and new content (right pane)FR-1.2 - Character-level inline change highlighting within modified lines (VS Code behavior)FR-1.3 - Gutter indicators showing line-level
  changes (added/modified/deleted)FR-1.4 - Minimap visualization showing overview of changes in large files

  FR-2: Content Sourcing

  FR-2.1 - Support inline content via component props: <MonacoDiff oldContent="..." newContent="..." />FR-2.2 - Support file path references: <MonacoDiff oldFile="path/to/v1.ts" newFile="path/to/v2.ts" />FR-2.3 - Load files from
  VitePress docs/ directory structureFR-2.4 - Display error messages when file loading fails

  FR-3: Syntax Highlighting

  FR-3.1 - Support TypeScript/JavaScript syntax highlightingFR-3.2 - Support Vue/HTML/CSS syntax highlightingFR-3.3 - Support JSON/YAML configuration file highlightingFR-3.4 - Support Markdown syntax highlightingFR-3.5 - Allow
  language override via component prop: <MonacoDiff language="typescript" />

  FR-4: Theme Integration

  FR-4.1 - Auto-detect VitePress theme (light/dark) on component mountFR-4.2 - Sync Monaco theme when VitePress theme changes (reactive)FR-4.3 - Use Monaco's built-in VS Code light/dark themes

  FR-5: Component API

  FR-5.1 - Accept optional labels for old/new versions: oldLabel="v1.0" newLabel="v2.0"FR-5.2 - Display labels above respective diff panesFR-5.3 - Default to filename when labels not provided

  ---
  Non-Functional Requirements (NFR)

  NFR-1: Performance

  NFR-1.1 - Lazy-load Monaco Editor library asynchronously (not blocking initial page load)NFR-1.2 - Show loading skeleton/spinner while Monaco initializesNFR-1.3 - Monaco loads in parallel with page render (eager async, not
  on-demand)NFR-1.4 - Target: Component interactive within 2-3 seconds on 3G connection

  NFR-2: Bundle Optimization

  NFR-2.1 - Only bundle Monaco languages needed: typescript, javascript, vue, html, css, json, yaml, markdownNFR-2.2 - Tree-shake unused Monaco features if possibleNFR-2.3 - Use CDN for Monaco if it improves caching across blog posts


  NFR-3: User Experience

  NFR-3.1 - Read-only diff view (no editing capabilities)NFR-3.2 - Smooth scrolling synchronized between left/right panesNFR-3.3 - Minimap shows proportional representation of file size and change densityNFR-3.4 - Consistent VS
  Code-like visual design (colors, spacing, gutter)

  NFR-4: Accessibility (Deferred to Phase 2)

  NFR-4.1 - (Phase 2) Keyboard navigation supportNFR-4.2 - (Phase 2) Screen reader compatibilityNFR-4.3 - (Phase 2) High contrast mode support

  NFR-5: Responsive Design (Deferred to Phase 2)

  NFR-5.1 - (MVP) Optimized for desktop viewports (1280px+)NFR-5.2 - (Phase 2) Auto-switch to inline/unified view on mobile/tablet (<768px)NFR-5.3 - (Phase 2) Touch-friendly scrolling on mobile

  NFR-6: Maintainability

  NFR-6.1 - Component written in Vue 3 Composition API with TypeScriptNFR-6.2 - Props interface clearly documented with JSDoc commentsNFR-6.3 - Error handling with user-friendly messages (similar to existing SystemPromptDiff
  pattern)NFR-6.4 - Unit tests for component mounting, prop handling, theme switching

  NFR-7: Integration

  NFR-7.1 - Drop-in replacement for existing SystemPromptDiff componentNFR-7.2 - Works within VitePress markdown files without custom build configNFR-7.3 - No conflicts with VitePress default theme styles

  ---
  Out of Scope (Deferred)

  | Feature                         | Rationale                                 | Target Phase |
  |---------------------------------|-------------------------------------------|--------------|
  | Inline/unified diff mode toggle | MVP focuses on side-by-side only          | Phase 2      |
  | Mobile optimization             | Desktop blog readers are primary audience | Phase 2      |
  | Copy code snippets              | Read-only view sufficient for MVP         | Phase 3      |
  | Find/replace in diff            | Complexity vs. value for blog context     | Phase 3      |
  | Git commit integration          | File-based workflow sufficient            | Future       |
  | External URL fetching           | Security/performance concerns             | Future       |

  ---
  Success Metrics

  | Metric                             | Target                  | Measurement                       |
  |------------------------------------|-------------------------|-----------------------------------|
  | Initial load time impact           | +2-3s max               | Lighthouse performance score      |
  | Monaco bundle size                 | <2MB gzipped            | Webpack bundle analyzer           |
  | Time to interactive (Monaco ready) | <3s on 3G               | Browser DevTools network throttle |
  | Component render success rate      | 100% for valid inputs   | Unit test coverage                |
  | Theme sync accuracy                | 100% match to VitePress | Visual regression testing         |

  ---
  Key Assumptions

  1. Blog posts will primarily show diffs of <1000 lines per file
  2. Readers use modern browsers (Chrome/Firefox/Safari latest 2 versions)
  3. VitePress site already has Vue 3 runtime available
  4. Desktop-first audience (mobile optimization lower priority)
  5. Files referenced in oldFile/newFile props exist at build time

  ---
  Open Questions for Design Phase

  1. Monaco loading strategy: Should we use Monaco's webpack plugin, Vite plugin, or manual CDN integration?
  2. Diff algorithm: Should we use Monaco's built-in diff or a custom algorithm (e.g., diff-match-patch) for more control?
  3. File resolution: Should file paths be relative to markdown file location or always relative to docs/ root?
  4. Caching: Should loaded file contents be cached in memory for multiple diffs of same files on one page?

  ---
Does this FR/NFR synthesis accurately capture what you need? Any missing requirements or misunderstandings I should correct before we move to the exploration phase?