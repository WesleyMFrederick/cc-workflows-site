# POC-6: Multi-Language Dropdown - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extend POC-5 toggle pattern to dropdown selector supporting all 8 FR-3 languages

**Architecture:** Pattern extension from POC-5. Replace binary toggle with dropdown selector backed by language configuration object. Data loader expands glob pattern to support 8 file extensions. MonacoDiff component receives reactive prop updates from computed property based on dropdown selection.

**Tech Stack:** VitePress, Vue 3 Composition API, Monaco Editor, Playwright E2E

---

## Out of Scope

The following items are **deliberately excluded** from POC-6:

- **Component stability tests:** Already validated in POC-4 MonacoDiff lifecycle
- **Production error handling:** POC validates concept, not UX polish
- **Loading state refinement:** Manual validation catches functional errors
- **Automated CI integration:** Playwright tests run locally for POC validation
- **Production deployment:** POC-6 validates FR-3, production refinement comes later

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Data loader doesn't support multi-extension globs | Low | High | VitePress uses standard glob syntax; POC-5 proved `*.{md,ts}` works |
| Monaco language workers not loaded | Low | Medium | MonacoDiff.vue already loads TypeScript worker from POC-5; Vue/JS/HTML/CSS/JSON/YAML/Markdown workers load automatically |
| File path construction breaks | Medium | Medium | Test with TypeScript first (already working), then extend pattern |
| Playwright test flakiness | Medium | Low | Use generous timeouts and waitForLoadState; Monaco initialization takes 1-2 seconds |

---

## Task 1 - Expand Data Loader Glob Pattern

### Files
- `docs/.vitepress/loaders/assets.data.ts` (MODIFY)

### Step 1: Read current data loader implementation

Read the file to understand current glob pattern:

```bash
cat docs/.vitepress/loaders/assets.data.ts
```

Expected: See `assets/*.{md,ts}` glob pattern from POC-5

### Step 2: Update glob pattern to include all 8 extensions

Modify the glob pattern:

```typescript
// Before: assets/*.{md,ts}
// After: assets/*.{md,ts,js,vue,html,css,json,yaml}

export default createContentLoader('assets/*.{md,ts,js,vue,html,css,json,yaml}', {
  includeSrc: true,
  transform(rawData): AssetFile[] {
    return rawData.map(({ url, src }) => {
      // Extract original extension from URL
      const fileName = url.split('/').pop() || ''
      const ext = fileName.split('.').pop() || 'md'

      return {
        path: url.replace('/assets/', '').replace('.html', `.${ext}`),
        content: src || ''
      }
    })
  }
})
```

**Why this works:** VitePress `createContentLoader` accepts standard glob patterns. The `*.{md,ts,js,vue,html,css,json,yaml}` pattern matches files with any of these 8 extensions.

### Step 3: Verify data loader loads multiple extensions

Start dev server and check console:

```bash
npm run docs:dev
```

Expected: VitePress starts successfully, no errors in console about glob pattern

### Step 4: Verify TypeScript files still load

Navigate to `http://localhost:5173/poc-monaco-diff-comprehensive` and check browser console (F12 → Console)

Expected: See data loader logs showing TypeScript files loaded (existing POC-5 functionality still works)

### Step 5: Commit data loader changes

Use `create-git-commit` skill to commit with message:

```text
feat(loader): expand glob pattern to support 8 FR-3 languages

- Add js, vue, html, css, json, yaml extensions to glob
- Preserve existing md, ts support from POC-5
- Pattern: assets/*.{md,ts,js,vue,html,css,json,yaml}
```

---

## Task 2 - Replace Toggle Button with Dropdown Selector

### Files
- `docs/poc-monaco-diff-comprehensive.md` (MODIFY)

### Step 1: Read current POC-5 toggle implementation

Read lines 1-139 to see current toggle pattern:

```bash
head -n 139 docs/poc-monaco-diff-comprehensive.md
```

Expected: See `showTypeScript` ref and `languageFiles` computed property

### Step 2: Replace toggle with dropdown in script setup

Update the `<script setup>` section (approximately lines 1-30):

```vue
<script setup>
import { ref, computed } from 'vue'
import { defineAsyncComponent } from 'vue'
import { inBrowser } from 'vitepress'

const MonacoDiff = inBrowser
  ? defineAsyncComponent(() => import('./.vitepress/components/MonacoDiff.vue'))
  : () => null

// --- Language Configuration ---
// Pattern: Centralized language metadata for dropdown and file resolution
const languageConfig = {
  typescript: { ext: 'ts', monaco: 'typescript', label: 'TypeScript' },
  javascript: { ext: 'js', monaco: 'javascript', label: 'JavaScript' },
  vue: { ext: 'vue', monaco: 'vue', label: 'Vue' },
  html: { ext: 'html', monaco: 'html', label: 'HTML' },
  css: { ext: 'css', monaco: 'css', label: 'CSS' },
  json: { ext: 'json', monaco: 'json', label: 'JSON' },
  yaml: { ext: 'yaml', monaco: 'yaml', label: 'YAML' },
  markdown: { ext: 'md', monaco: 'markdown', label: 'Markdown' }
}

// --- Reactive State ---
// Decision: Default to typescript (already has example files from POC-5)
const selectedLanguage = ref('typescript')

// --- Computed File Paths ---
// Integration: Maps language selection to asset file paths for MonacoDiff
const languageFiles = computed(() => {
  const config = languageConfig[selectedLanguage.value]
  return {
    oldFile: `example-${selectedLanguage.value}-before.${config.ext}`,
    newFile: `example-${selectedLanguage.value}-after.${config.ext}`,
    language: config.monaco,
    label: config.label
  }
})
</script>
```

### Step 3: Replace toggle button with dropdown in Test Case 5

Update Test Case 5 section (approximately lines 113-139):

```markdown
## Test Case 5: Multi-Language Syntax Highlighting (POC-6)

**Expected:** Dropdown selector loads all 8 languages with syntax highlighting

<div style="margin-bottom: 1rem;">
  <label for="language-select" style="margin-right: 0.5rem; font-weight: 500;">Select Language:</label>
  <select
    id="language-select"
    v-model="selectedLanguage"
    style="padding: 0.5rem; border-radius: 4px; border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg); color: var(--vp-c-text-1); cursor: pointer;"
  >
    <option v-for="(config, key) in languageConfig" :key="key" :value="key">
      {{ config.label }}
    </option>
  </select>
  <span style="margin-left: 0.5rem; color: var(--vp-c-text-2);">Current: {{ languageFiles.label }}</span>
</div>

<ClientOnly>
  <MonacoDiff
    :oldFile="languageFiles.oldFile"
    :newFile="languageFiles.newFile"
    :language="languageFiles.language"
  />
</ClientOnly>

**Test Instructions:**
1. Select each language from dropdown
2. Verify syntax highlighting differs between languages
3. Verify diff highlighting (green/red) visible
4. Toggle VitePress theme to verify consistency
5. Check console for errors
```

### Step 4: Verify dropdown renders in browser

Start dev server (if not already running) and navigate to POC page:

```bash
npm run docs:dev
```

Navigate to: `http://localhost:5173/poc-monaco-diff-comprehensive`

Expected:
- Dropdown renders with 8 options
- Currently shows "TypeScript"
- Selecting dropdown shows all 8 language labels

### Step 5: Verify TypeScript still works with dropdown

Select "TypeScript" from dropdown

Expected:
- MonacoDiff loads TypeScript example files
- Syntax highlighting visible (blue keywords, green strings)
- No console errors

### Step 6: Commit dropdown implementation

Use `create-git-commit` skill to commit with message:

```text
feat(poc6): replace toggle button with dropdown selector

- Add languageConfig object with 8 FR-3 languages
- Replace showTypeScript ref with selectedLanguage ref
- Update languageFiles computed to use config mapping
- Replace button with select dropdown in Test Case 5
- Pattern: Extends POC-5 toggle pattern to multi-language
```

---

## Task 3 - Create Example File Pairs (7 Languages)

### Files
- `docs/assets/example-javascript-before.js` (CREATE)
- `docs/assets/example-javascript-after.js` (CREATE)
- `docs/assets/example-vue-before.vue` (CREATE)
- `docs/assets/example-vue-after.vue` (CREATE)
- `docs/assets/example-html-before.html` (CREATE)
- `docs/assets/example-html-after.html` (CREATE)
- `docs/assets/example-css-before.css` (CREATE)
- `docs/assets/example-css-after.css` (CREATE)
- `docs/assets/example-json-before.json` (CREATE)
- `docs/assets/example-json-after.json` (CREATE)
- `docs/assets/example-yaml-before.yaml` (CREATE)
- `docs/assets/example-yaml-after.yaml` (CREATE)
- `docs/assets/example-markdown-before.md` (CREATE)
- `docs/assets/example-markdown-after.md` (CREATE)

### Step 1: Create JavaScript example files

**File:** `docs/assets/example-javascript-before.js`

```javascript
// Callback-based async pattern
function fetchUserData(userId, callback) {
  fetch(`/api/users/${userId}`)
    .then(response => response.json())
    .then(data => callback(null, data))
    .catch(error => callback(error, null))
}

function processUser(userId) {
  fetchUserData(userId, (error, user) => {
    if (error) {
      console.error('Failed to fetch user:', error)
      return
    }

    console.log('User:', user.name)
    console.log('Email:', user.email)
  })
}

processUser(123)
```

**File:** `docs/assets/example-javascript-after.js`

```javascript
// Modern async/await pattern
async function fetchUserData(userId) {
  const response = await fetch(`/api/users/${userId}`)
  return await response.json()
}

async function processUser(userId) {
  try {
    const user = await fetchUserData(userId)
    console.log('User:', user.name)
    console.log('Email:', user.email)
  } catch (error) {
    console.error('Failed to fetch user:', error)
  }
}

processUser(123)
```

### Step 2: Create Vue example files

**File:** `docs/assets/example-vue-before.vue`

```vue
<template>
  <div class="counter">
    <h2>{{ title }}</h2>
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
    <button @click="decrement">Decrement</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: 'Counter Component',
      count: 0
    }
  },
  methods: {
    increment() {
      this.count++
    },
    decrement() {
      this.count--
    }
  }
}
</script>

<style scoped>
.counter {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
</style>
```

**File:** `docs/assets/example-vue-after.vue`

```vue
<template>
  <div class="counter">
    <h2>{{ title }}</h2>
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
    <button @click="decrement">Decrement</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const title = ref('Counter Component')
const count = ref(0)

const increment = () => {
  count.value++
}

const decrement = () => {
  count.value--
}
</script>

<style scoped>
.counter {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
</style>
```

### Step 3: Create HTML example files

**File:** `docs/assets/example-html-before.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog Post</title>
</head>
<body>
  <div id="header">
    <h1>My Blog</h1>
    <div id="nav">
      <a href="/">Home</a>
      <a href="/about">About</a>
    </div>
  </div>

  <div id="content">
    <div class="post">
      <h2>Article Title</h2>
      <p>Published on <span class="date">2024-01-15</span></p>
      <div class="body">
        <p>Article content goes here...</p>
      </div>
    </div>
  </div>

  <div id="footer">
    <p>Copyright 2024</p>
  </div>
</body>
</html>
```

**File:** `docs/assets/example-html-after.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog Post</title>
</head>
<body>
  <header>
    <h1>My Blog</h1>
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
    </nav>
  </header>

  <main>
    <article class="post">
      <h2>Article Title</h2>
      <time datetime="2024-01-15" class="date">Published on 2024-01-15</time>
      <section class="body">
        <p>Article content goes here...</p>
      </section>
    </article>
  </main>

  <footer>
    <p>Copyright 2024</p>
  </footer>
</body>
</html>
```

### Step 4: Create CSS example files

**File:** `docs/assets/example-css-before.css`

```css
/* Component styles with hardcoded values */

.button {
  background-color: #3b82f6;
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.button:hover {
  background-color: #2563eb;
}

.button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.card {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.text-muted {
  color: #6b7280;
  font-size: 14px;
}
```

**File:** `docs/assets/example-css-after.css`

```css
/* Component styles with CSS custom properties */

:root {
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-disabled: #9ca3af;
  --color-text-light: #ffffff;
  --color-text-muted: #6b7280;
  --color-bg: #ffffff;
  --color-border: #e5e7eb;
  --spacing-sm: 12px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --radius: 8px;
  --font-size-base: 16px;
  --font-size-sm: 14px;
}

.button {
  background-color: var(--color-primary);
  color: var(--color-text-light);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius);
  border: none;
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: background-color 0.2s;
}

.button:hover {
  background-color: var(--color-primary-hover);
}

.button:disabled {
  background-color: var(--color-disabled);
  cursor: not-allowed;
}

.card {
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: var(--spacing-lg);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.text-muted {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
```

### Step 5: Create JSON example files

**File:** `docs/assets/example-json-before.json`

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "vue": "^3.3.0"
  }
}
```

**File:** `docs/assets/example-json-after.json`

```json
{
  "name": "my-app",
  "version": "1.1.0",
  "description": "A modern Vue 3 application with routing and testing",
  "author": "Development Team <dev@example.com>",
  "license": "MIT",
  "keywords": ["vue", "vite", "spa"],
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "lint": "eslint src"
  },
  "dependencies": {
    "vue": "^3.3.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "eslint": "^8.50.0"
  }
}
```

### Step 6: Create YAML example files

**File:** `docs/assets/example-yaml-before.yaml`

```yaml
# Basic GitHub Actions CI workflow
name: CI Pipeline

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
```

**File:** `docs/assets/example-yaml-after.yaml`

```yaml
# Enhanced GitHub Actions CI workflow with matrix testing
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    name: Test on Node ${{ matrix.node-version }}
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 21]
      fail-fast: false

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Upload coverage
        if: matrix.node-version == 20
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

### Step 7: Create Markdown example files

**File:** `docs/assets/example-markdown-before.md`

```markdown
# API Documentation

## Getting Started

To use the API, send requests to our endpoint.

## Authentication

Include your API key in the header.

## Example

Request:
```http
GET /api/users
```

Response:

```json
{
  "users": []
}
```

**File:** `docs/assets/example-markdown-after.md`

```markdown
# API Documentation

## Table of Contents

- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
- [Examples](#examples)
- [Error Handling](#error-handling)

## Getting Started

To use the API, send HTTP requests to our REST endpoint at `https://api.example.com`.

**Requirements:**
- Valid API key (obtain from dashboard)
- HTTPS connection required
- JSON request/response format

## Authentication

Include your API key in the `Authorization` header using Bearer token format:

```http
Authorization: Bearer YOUR_API_KEY
```

**Security Notes:**
- Never commit API keys to source control
- Rotate keys regularly
- Use environment variables for key storage

## Endpoints

### GET /api/users

Retrieve a list of all users.

**Parameters:**
- `limit` (optional): Maximum number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**

```json
{
  "users": [
    {
      "id": 1,
      "name": "Alice Johnson",
      "email": "alice@example.com"
    },
    {
      "id": 2,
      "name": "Bob Smith",
      "email": "bob@example.com"
    }
  ],
  "total": 2,
  "limit": 50,
  "offset": 0
}
```

## Examples

### List Users

**Request:**

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.example.com/api/users?limit=10
```

**Response:**

```json
{
  "users": [
    { "id": 1, "name": "Alice Johnson", "email": "alice@example.com" }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

## Error Handling

The API uses standard HTTP status codes:

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid or missing API key |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

**Error Response Format:**

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Missing required parameter: limit",
    "details": {}
  }
}
```

```text

### Step 8: Verify files are created

List the assets directory:

```bash
ls -la docs/assets/example-*
```

Expected: See 16 example files total (8 languages × 2 files, including TypeScript from POC-5)

### Step 9: Test JavaScript in browser

Navigate to POC page and select "JavaScript" from dropdown

Expected:
- Files load successfully
- Syntax highlighting visible (keywords, strings, functions colored)
- Diff shows callback removal (red) and async/await addition (green)
- No console errors

### Step 10: Test Vue in browser

Select "Vue" from dropdown

Expected:
- Files load successfully
- Syntax highlighting for template, script, style sections
- Diff shows Options API removal and Composition API addition
- No console errors

### Step 11: Quick test remaining languages

Select each language (HTML, CSS, JSON, YAML, Markdown) and verify:
- Files load (no error messages)
- Diff appears (left/right panes visible)
- No console errors

### Step 12: Commit all example files

Use `create-git-commit` skill to commit with message:

```text
feat(poc6): add example files for 7 FR-3 languages

- Add JavaScript: callback to async/await refactoring
- Add Vue: Options API to Composition API conversion
- Add HTML: div soup to semantic HTML5
- Add CSS: hardcoded values to custom properties
- Add JSON: basic to enhanced package.json
- Add YAML: basic to matrix GitHub Actions workflow
- Add Markdown: minimal to comprehensive API docs
- Total: 14 new files (7 languages × 2 files each)
```

---

## Task 4 - Add Playwright Validation Test

### Files
- `tests/e2e/poc6-multi-language-dropdown.spec.ts` (CREATE & TEST)

### Step 1: Write the Playwright test

Create test file:

**File:** `tests/e2e/poc6-multi-language-dropdown.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('POC-6: Multi-Language Dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/poc-monaco-diff-comprehensive')
    await page.waitForLoadState('networkidle')
  })

  test('dropdown renders with 8 language options', async ({ page }) => {
    // Given: POC page loads
    const dropdown = page.locator('#language-select')

    // Then: Dropdown visible with 8 options
    await expect(dropdown).toBeVisible()

    // Verify all 8 languages present
    const options = await dropdown.locator('option').allTextContents()
    expect(options).toHaveLength(8)
    expect(options).toContain('TypeScript')
    expect(options).toContain('JavaScript')
    expect(options).toContain('Vue')
    expect(options).toContain('HTML')
    expect(options).toContain('CSS')
    expect(options).toContain('JSON')
    expect(options).toContain('YAML')
    expect(options).toContain('Markdown')
  })

  test('selecting each language loads MonacoDiff successfully', async ({ page }) => {
    const dropdown = page.locator('#language-select')
    const languages = ['typescript', 'javascript', 'vue', 'html', 'css', 'json', 'yaml', 'markdown']

    for (const lang of languages) {
      // When: Select language from dropdown
      await dropdown.selectOption(lang)
      await page.waitForTimeout(1000) // Allow Monaco to initialize

      // Then: MonacoDiff renders with 3 editor panes (left, right, overview)
      const diffContainer = page.locator('.monaco-diff-container')
      await expect(diffContainer).toBeVisible({ timeout: 5000 })

      const editorPanes = diffContainer.locator('.monaco-editor')
      await expect(editorPanes).toHaveCount(3, { timeout: 5000 })

      // Verify no error messages
      const errorMessage = page.locator('.error-message')
      await expect(errorMessage).not.toBeVisible()
    }
  })

  test('rapid language switching produces no errors', async ({ page }) => {
    // Track console errors
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // When: Rapidly switch between languages
    const dropdown = page.locator('#language-select')
    const languages = ['javascript', 'vue', 'html', 'css', 'typescript', 'json', 'yaml', 'markdown']

    for (const lang of languages) {
      await dropdown.selectOption(lang)
      await page.waitForTimeout(200) // Minimal delay
    }

    // Allow time for any delayed errors
    await page.waitForTimeout(1000)

    // Then: No Monaco-related errors
    const monacoErrors = errors.filter(e =>
      e.includes('Monaco') ||
      e.includes('editor') ||
      e.includes('model') ||
      e.includes('worker')
    )
    expect(monacoErrors).toHaveLength(0)
  })
})
```

### Step 2: Run test to verify all 8 languages load

```bash
npm run test:e2e -- poc6-multi-language-dropdown.spec.ts
```

Expected: All 3 tests PASS
- Test 1: Dropdown renders with 8 options
- Test 2: All 8 languages load successfully
- Test 3: No errors during rapid switching

### Step 3: Run test in headed mode for visual confirmation

```bash
npm run test:e2e -- poc6-multi-language-dropdown.spec.ts --headed
```

Expected: Browser opens, tests run visibly, all languages load with syntax highlighting

### Step 4: Commit Playwright test

Use `create-git-commit` skill to commit with message:

```text
test(poc6): add Playwright validation for dropdown selector

- Test 1: Verify dropdown renders with 8 language options
- Test 2: Verify all 8 languages load MonacoDiff successfully
- Test 3: Verify rapid switching produces no console errors
- Pattern: E2E validation for FR-3 multi-language requirement
```

---

## Task 5 - Manual Validation Checklist

### Files
- None (manual browser testing)

### Step 1: Start dev server

```bash
npm run docs:dev
```

Navigate to: `http://localhost:5173/poc-monaco-diff-comprehensive`

### Step 2: Validate TypeScript

1. ✅ Select "TypeScript" from dropdown
2. ✅ Verify keywords (interface, function, const) have blue syntax highlighting
3. ✅ Verify diff shows green additions for type annotations
4. ✅ Toggle VitePress theme (light/dark)
5. ✅ Verify syntax visible in both themes
6. ✅ Check console for errors (F12 → Console)

### Step 3: Validate JavaScript

1. ✅ Select "JavaScript" from dropdown
2. ✅ Verify async/await keywords have syntax highlighting
3. ✅ Verify diff shows callback removal (red) and async/await (green)
4. ✅ Toggle theme, verify visibility
5. ✅ Check console for errors

### Step 4: Validate Vue

1. ✅ Select "Vue" from dropdown
2. ✅ Verify template/script/style sections have distinct colors
3. ✅ Verify diff shows Options API → Composition API conversion
4. ✅ Toggle theme, verify visibility
5. ✅ Check console for errors

### Step 5: Validate HTML

1. ✅ Select "HTML" from dropdown
2. ✅ Verify tags (header, main, article, time) have syntax highlighting
3. ✅ Verify diff shows semantic element replacements
4. ✅ Toggle theme, verify visibility
5. ✅ Check console for errors

### Step 6: Validate CSS

1. ✅ Select "CSS" from dropdown
2. ✅ Verify :root selector and var() functions have syntax highlighting
3. ✅ Verify diff shows custom property additions
4. ✅ Toggle theme, verify visibility
5. ✅ Check console for errors

### Step 7: Validate JSON

1. ✅ Select "JSON" from dropdown
2. ✅ Verify keys/strings/values have distinct syntax colors
3. ✅ Verify diff shows package.json enhancements
4. ✅ Toggle theme, verify visibility
5. ✅ Check console for errors

### Step 8: Validate YAML

1. ✅ Select "YAML" from dropdown
2. ✅ Verify keys, arrays, strings have syntax highlighting
3. ✅ Verify diff shows GitHub Actions workflow enhancements
4. ✅ Toggle theme, verify visibility
5. ✅ Check console for errors

### Step 9: Validate Markdown

1. ✅ Select "Markdown" from dropdown
2. ✅ Verify headings, code blocks, lists have syntax highlighting
3. ✅ Verify diff shows documentation structure additions
4. ✅ Toggle theme, verify visibility
5. ✅ Check console for errors

### Step 10: Take validation screenshots

Capture evidence:
1. Screenshot of dropdown with all 8 options visible
2. Screenshot of JavaScript syntax highlighting
3. Screenshot of Vue syntax highlighting
4. Screenshot of theme toggle working (light/dark comparison)

Save to: `design-docs/features/251106-diff-view-monaco/validation-screenshots/`

### Step 11: Document validation results

Create validation report:

**Validation Date:** [DATE]
**All Tests Passed:** YES/NO
**Issues Found:** [List any issues]
**Browser:** [Chrome/Firefox/Safari version]
**Screenshots:** [Link to screenshot directory]

**Pass Criteria Met:**
- ✅ All 8 languages load successfully
- ✅ Dropdown selector works correctly
- ✅ Syntax highlighting visible for all languages
- ✅ Diff highlighting visible for all languages
- ✅ Theme switching works across all languages
- ✅ Zero console errors during normal usage
- ✅ Playwright tests pass (from Task 4)

### Step 12: Mark POC-6 complete

If all validation passes:
- POC-6 successfully validates FR-3 multi-language syntax highlighting
- Ready to proceed with production refinement (out of scope for POC)
- Close POC-6 milestone

---

## Success Metrics

**Functional Requirements (FR-3):**
- ✅ FR-3.1: TypeScript and JavaScript syntax highlighting
- ✅ FR-3.2: Vue, HTML, and CSS syntax highlighting
- ✅ FR-3.3: JSON and YAML syntax highlighting
- ✅ FR-3.4: Markdown syntax highlighting
- ✅ FR-3.5: Language specification via component prop

**Deliverables:**
- ✅ Data loader supports 8 extensions
- ✅ 16 asset files total (8 languages × 2 files including POC-5 TypeScript)
- ✅ Dropdown selector replaces toggle button
- ✅ Playwright tests validate file loading
- ✅ Manual validation checklist completed (40 checks pass)

**Timeline:** 5-7 hours implementation + 1 hour validation = **6-8 hours total**

---

## References

- **POC-5 Design:** [fr3-multi-language-syntax-validation-poc5-typescript-file-loading.md](./fr3-multi-language-syntax-validation-poc5-typescript-file-loading.md)
- **FR-3 Requirements:** [fr3-multi-language-syntax-validation-design.md](./fr3-multi-language-syntax-validation-design.md)
- **POC-4 Implementation:** [poc-monaco-diff-comprehensive.md](../../../docs/poc-monaco-diff-comprehensive.md)
- **Monaco Diff Reference:** [monaco-diff-reference.md](../../../docs/monaco-diff-reference.md)
- **VitePress Data Loading:** [VitePress Guide](https://vitepress.dev/guide/data-loading)
- **Playwright Documentation:** [playwright.dev](https://playwright.dev)
