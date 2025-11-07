---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Claude Code Workflows"
  text: "Discussions on Claude Code and AI Assisted Workflows"
  tagline: My great project tagline
  actions:
    - theme: brand
      text: Claude Code Output Style (Deprecated)
      link: /Claude Code Output Style Depricated
    - theme: alt
      text: Markdown Examples
      link: /markdown-examples
    - theme: alt
      text: API Examples
      link: /api-examples
    - theme: alt
      text: Tools, People, and Process - The Three Legged Stool Problem
      link: /three-legged-stool-tools-people-process.md

features:
  - title: "POC-1: Monaco Diff Build & Render"
    details: 🧪 Validates Monaco Editor integration with VitePress - side-by-side diff rendering in SSR environment
    link: /poc-monaco-diff
  - title: "POC-1: Validation Results"
    details: ✅ Monaco Editor successfully renders in VitePress with SSR compatibility and side-by-side diff view
    link: /poc-monaco-diff-results
  - title: "POC-2.1: Props-Based Content"
    details: 🧪 Tests Vue 3 reactive props for dynamic content updates - oldContent, newContent, language switching
    link: /poc-monaco-diff-props
  - title: "POC-2.1: Validation Results"
    details: ✅ Watch callbacks validated - content and language props update reactively without component remount
    link: /poc-monaco-diff-props-results
  - title: "POC-2.2: Theme Synchronization"
    details: 🧪 Validates VitePress theme detection and Monaco theme sync using useData().isDark with watch callbacks
    link: /poc-monaco-diff-theme
  - title: "POC-2.2: Validation Results"
    details: ✅ Theme synchronization working - Monaco updates instantly when VitePress theme toggles light/dark
    link: /poc-monaco-diff-theme-results
---

