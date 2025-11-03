# VitePress File Path Resolution

**Research Date:** 2025-11-03
**Sources:**
- [VitePress Asset Handling](https://vitepress.dev/guide/asset-handling)
- [VitePress Using Vue in Markdown](https://vitepress.dev/guide/using-vue)
- [VitePress Runtime API](https://vitepress.dev/reference/runtime-api)
- [VitePress Site Config](https://vitepress.dev/reference/site-config)
- [VitePress Markdown Extensions](https://vitepress.dev/guide/markdown)
- [GitHub Issue #607: Relative Assets in Components](https://github.com/vuejs/vitepress/issues/607)

## Key Findings

**VitePress treats markdown and Vue components differently for asset handling** (Source: GitHub Issue #607)
- Markdown images (`![](./path)`) process automatically through Vite's asset pipeline
- Vue component props receiving relative paths do not process automatically
- Framework cannot distinguish between asset paths and display strings in props

**The @ symbol provides source-root resolution** (Source: Markdown Extensions)
- `@` resolves to source root (project root by default, or `srcDir` if configured)
- Works in code snippet imports (`<<< @/filepath`) and markdown inclusion (`<!--@include: @/parts/file.md-->`)
- Does not work for Vue component imports in `<script setup>` blocks

**Each markdown file compiles to a Vue Single-File Component** (Source: Using Vue in Markdown)
- Vite processes all markdown files through its build pipeline
- Standard Vite asset handling applies to markdown content
- Components must use explicit imports for code-splitting

**Production builds differ from development** (Source: Asset Handling)
- Production: Assets copy to output directory with hashed filenames
- Production: Images under 4kb base64-inline (configurable via `vite` option)
- Development: Assets serve directly without hashing or copying

**VitePress provides runtime context APIs** (Source: Runtime API)
- `useData()` returns page metadata including `relativePath` and `filePath`
- `useRoute()` provides current path and full PageData object
- `withBase()` helper prepends configured base URL to paths

## Path Resolution Rules

### Markdown Context

**Relative paths in markdown resolve from the markdown file's location:**

```markdown
<!-- In docs/guides/tutorial.md -->
![Image](./images/screenshot.png)
<!-- Resolves to docs/guides/images/screenshot.png -->
```

**Source-root paths use @ symbol:**

```markdown
<!-- In any markdown file -->
![Image](@/assets/logo.png)
<!-- Resolves to {srcDir}/assets/logo.png -->
```

**Public directory uses absolute paths:**

```markdown
<!-- Files in ./public/ -->
![Icon](/icon.png)
<!-- Resolves to /icon.png in output -->
```

### Vue Component Context

**Component imports use relative paths from the markdown file:**

```vue
<!-- In docs/guides/tutorial.md -->
<script setup>
import CustomComponent from '../components/CustomComponent.vue'
</script>
```

**Asset imports require explicit imports:**

```vue
<!-- WRONG: Relative path in prop won't bundle -->
<MyImage src="./image.png" />

<!-- CORRECT: Import asset in script block -->
<script setup>
import imageUrl from './image.png'
</script>
<MyImage :src="imageUrl" />
```

**Custom aliases require Vite configuration:**

```typescript
// docs/.vitepress/config.mts
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'

export default defineConfig({
  vite: {
    resolve: {
      alias: {
        '@components': fileURLToPath(new URL('./theme/components', import.meta.url))
      }
    }
  }
})
```

### Dynamic Path Resolution

**Use `withBase()` for deployment flexibility:**

```vue
<script setup>
import { withBase } from 'vitepress'
const imagePath = withBase('/assets/image.png')
</script>
```

**Use `useData()` to access current page context:**

```vue
<script setup>
import { useData } from 'vitepress'
const { page } = useData()
// page.relativePath: 'guides/tutorial.md'
// page.filePath: 'docs/guides/tutorial.md'
</script>
```

## Implications for POC-2

### Problem Statement
SystemPromptDiff component needs to read `.txt` files from a different directory than the markdown file using it. The component must resolve paths correctly in both dev and production.

### Path Resolution Challenges

1. **Markdown file location varies across documentation structure**
   - POC markdown: `docs/poc-layout-test.md`
   - Future markdown files may exist in subdirectories: `docs/guides/workflows/example.md`

2. **Source files live outside VitePress directory structure**
   - System prompts: `~/.claude/scripts/*/system-prompt.txt`
   - Files exist on filesystem but outside project root

3. **Component cannot use relative paths in props**
   - Vue props with relative strings won't bundle
   - Framework treats prop values as display text, not asset references

4. **No built-in support for external file references**
   - VitePress asset pipeline assumes files live in project
   - Public directory requires files at build time

### Viable Solutions

#### Option A: Copy files to project and use explicit imports

```vue
<!-- In markdown file -->
<script setup>
import SystemPromptDiff from '../components/SystemPromptDiff.vue'
import promptBefore from '@/prompts/before.txt?raw'
import promptAfter from '@/prompts/after.txt?raw'
</script>

<SystemPromptDiff :before="promptBefore" :after="promptAfter" />
```

- Pros: Standard Vite workflow, works in dev and production
- Cons: Requires copying external files into project

#### Option B: Use source-root paths with copied files

```vue
<!-- Component reads files at build time -->
<SystemPromptDiff before="@/prompts/before.txt" after="@/prompts/after.txt" />
```

- Pros: Clean markdown syntax
- Cons: Requires build-time file resolution, complex component implementation

#### Option C: Pass content as frontmatter

```yaml
---
promptBefore: |
  System prompt content here...
promptAfter: |
  Updated prompt content here...
---

<SystemPromptDiff :before="$frontmatter.promptBefore" :after="$frontmatter.promptAfter" />
```

- Pros: No file resolution needed, portable
- Cons: Duplicates content, poor version control

### Runtime vs Build-Time Considerations

**Build-time approach:**
- Vite processes imports during build
- Assets bundle with hashed names
- No runtime file system access needed
- **Recommended for production deployments**

**Runtime approach:**
- Component fetches files via HTTP in browser
- Requires files in `public/` directory
- Adds network requests and loading states
- **Not recommended: adds complexity**

## Recommendation

### Use Option A: Explicit imports with copied files

**Implementation:**
1. Create `docs/prompts/` directory for system prompt copies
2. Add build script to copy files from `~/.claude/scripts/` to `docs/prompts/`
3. Import prompt files in markdown with `?raw` suffix
4. Pass imported content to SystemPromptDiff component as props

**Rationale:**
- Aligns with VitePress asset handling model
- Works identically in dev and production
- No custom path resolution logic needed
- Clear dependency tracking through imports
- Component receives raw text content, not file paths

**Example markdown usage:**

```vue
<script setup>
import SystemPromptDiff from '../components/SystemPromptDiff.vue'
import promptV1 from '@/prompts/workflow-v1.txt?raw'
import promptV2 from '@/prompts/workflow-v2.txt?raw'
</script>

<SystemPromptDiff
  :before="promptV1"
  :after="promptV2"
  title="Workflow System Prompt Evolution"
/>
```

**Build integration:**

```json
{
  "scripts": {
    "docs:dev": "npm run copy-prompts && vitepress dev docs",
    "docs:build": "npm run copy-prompts && vitepress build docs",
    "copy-prompts": "node scripts/copy-prompts.js"
  }
}
```

This approach requires no custom path resolution, leverages Vite's proven asset pipeline, and maintains clear separation between build-time preparation and runtime rendering.
