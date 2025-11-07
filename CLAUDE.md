# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a VitePress documentation site focused on Claude Code workflows and AI-assisted development discussions.

## Common Commands

```bash
# Start development server (runs at http://localhost:5173)
npm run docs:dev

# Build static site for production
npm run docs:build

# Preview production build locally
npm run docs:preview

# Citation Manager: validate and extract markdown linkci content
citation-manager validate <file>              # Check citations resolve
citation-manager validate <file> --fix       # Auto-fix anchors
citation-manager extract links <file>         # Extract all linked content
citation-manager extract header <file> <name> # Extract specific header
citation-manager extract file <file>          # Extract entire file
citation-manager ast <file>                   # Show AST for debugging

# Add -h to any command for detailed help
```

## Architecture

### Content Structure
- All documentation content lives in `docs/` directory as Markdown files
- `docs/index.md` is the homepage with hero section and feature cards
- `docs/archive/` contains deprecated/example content
- Content is written in Markdown with VitePress frontmatter for layout configuration

### Configuration
- Site configuration: `docs/.vitepress/config.mts`
  - Defines site title, description, navigation, sidebar, and theme settings
  - Sidebar navigation is manually configured in `themeConfig.sidebar`
  - Add new pages by creating `.md` files in docs/ and registering them in the sidebar config

### Build Artifacts
- `.vitepress/cache/` - VitePress build cache (gitignored)
- `.vitepress/dist/` - Production build output (gitignored)

## Adding New Content

1. Create a new `.md` file in the `docs/` directory
2. Add frontmatter if needed (e.g., `layout: home`, `layout: doc`)
3. Register the page in `docs/.vitepress/config.mts` sidebar array
4. VitePress uses file-based routing: `/docs/my-page.md` → `/my-page.html`
