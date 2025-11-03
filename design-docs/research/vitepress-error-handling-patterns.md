# VitePress Error Handling Patterns

**Research Date:** 2025-11-03
**Sources:**
- [VitePress SSR Compatibility Guide](https://vitepress.dev/guide/ssr-compat)
- [VitePress Runtime API](https://vitepress.dev/reference/runtime-api)
- [Vue 3 Error Handling](https://madewithvuejs.com/blog/guide-to-error-exception-handling-in-vue-apps)
- [Vue Error Boundaries Pattern](https://medium.com/@dillonchanis/handling-errors-in-vue-with-error-boundaries-91f6ead0093b)
- [VitePress GitHub Issues](https://github.com/vuejs/vitepress/issues)

## Key Findings

**VitePress lacks explicit error handling documentation.** The official guides address SSR compatibility and data loading but provide no guidance for handling missing files, unreadable resources, or component errors during development or build.

**Development and build environments behave differently.** Components that work in `npm run docs:dev` may fail during `npm run docs:build` due to SSR (server-side rendering). Common failures include:
- Browser API access (window, document) during SSR
- Module import conflicts between CommonJS and ESM
- Custom directives without SSR transforms
- Missing file references that cause Rollup errors

**Vue provides error handling mechanisms, but VitePress doesn't document their use.** Vue 3's `onErrorCaptured` lifecycle hook and `app.config.errorHandler` can catch errors, but VitePress offers no conventions for when to use them or how to display errors to users.

**Environment detection requires manual checks.** VitePress provides `import.meta.env.SSR` to detect server-side rendering and `inBrowser` (undocumented in official API reference) for runtime browser detection. Developers must implement their own conditionals.

**No user-facing error message conventions exist.** VitePress displays technical build errors directly to developers but provides no patterns for graceful degradation or user-friendly messages when components encounter runtime errors.

## Error Handling Strategies

### Strategy 1: Client-Only Components with ClientOnly Wrapper

**Use case:** Components that access browser APIs or are not SSR-compatible.

```vue
<template>
  <ClientOnly>
    <ComponentThatAccessesWindow />
  </ClientOnly>
</template>
```

**Limitations:** The component renders nothing during SSR. No fallback UI appears until client-side hydration completes.

### Strategy 2: Conditional Imports in Theme Setup

**Use case:** Plugins or libraries that fail during SSR.

```javascript
// .vitepress/theme/index.js
export default {
  async enhanceApp({ app }) {
    if (!import.meta.env.SSR) {
      const plugin = await import('plugin-that-access-window-on-import')
      app.use(plugin)
    }
  }
}
```

**Benefit:** Prevents import errors during build. **Drawback:** Adds complexity to theme configuration.

### Strategy 3: Vue Error Boundary Component

**Use case:** Catching errors in child components and displaying fallback UI.

```vue
<template>
  <div>
    <div v-if="error" class="error-boundary">
      <h2>Something went wrong</h2>
      <p>{{ error }}</p>
      <button @click="resetError">Try again</button>
    </div>
    <slot v-else></slot>
  </div>
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue';

const error = ref(null);

onErrorCaptured((err, instance, info) => {
  error.value = `${err.toString()}\nInfo: ${info}`;
  return false; // Prevents error from propagating
});

function resetError() {
  error.value = null;
}
</script>
```

**Benefit:** Prevents entire application crash. **Drawback:** Requires wrapping potentially error-prone components. Does not catch errors in event handlers.

### Strategy 4: Try-Catch with Reactive Error State

**Use case:** Handling file loading errors in component logic.

```vue
<script setup>
import { ref, onMounted } from 'vue';

const fileContent = ref('');
const error = ref(null);

async function loadFile(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load ${path}: ${response.statusText}`);
    }
    fileContent.value = await response.text();
  } catch (err) {
    error.value = err.message;
  }
}

onMounted(() => {
  loadFile('/content/file.md');
});
</script>

<template>
  <div v-if="error" class="error-message">
    <p>{{ error }}</p>
  </div>
  <div v-else>
    {{ fileContent }}
  </div>
</template>
```

**Benefit:** Explicit control over error display. **Drawback:** Requires try-catch in every component that loads external resources.

### Strategy 5: Environment-Aware Error Messages

**Use case:** Showing detailed errors in development, graceful messages in production.

```vue
<script setup>
import { ref } from 'vue';

const isDev = import.meta.env.DEV;

function handleError(err) {
  if (isDev) {
    console.error('Detailed error for debugging:', err);
    return `Error: ${err.message}\nStack: ${err.stack}`;
  } else {
    return 'Unable to load content. Please try again later.';
  }
}
</script>
```

**Benefit:** Developers see full errors; users see friendly messages. **Limitation:** Requires consistent implementation across components.

## Implications for POC-2

### Handling Missing or Unreadable Files

**Development:**
- Display full error message with file path
- Show stack trace for debugging
- Provide "Try again" action

**Production:**
- Display user-friendly message: "Content unavailable"
- Log error to console for debugging (without exposing paths)
- Gracefully degrade (show empty state, not crash)

### Component Architecture

Wrap file-loading components in error boundary or implement try-catch with reactive error state:

```vue
<ErrorBoundary>
  <TwoColumnDiff
    leftPath="/design-docs/old-version.md"
    rightPath="/design-docs/new-version.md"
  />
  <template #fallback="{ error }">
    <div class="error-state">
      <p v-if="import.meta.env.DEV">{{ error.message }}</p>
      <p v-else>Unable to display comparison. Please check file paths.</p>
    </div>
  </template>
</ErrorBoundary>
```

### SSR Compatibility

File loading must occur in `onMounted` (client-only lifecycle hook):

```vue
<script setup>
onMounted(async () => {
  // Safe: runs only on client
  await loadFiles(props.leftPath, props.rightPath);
});
</script>
```

**Avoid:** File system access during setup or render, which executes during SSR.

## Recommendation

**Implement error boundaries with environment-aware messages.** For POC-2:

1. **Wrap components in custom ErrorBoundary** that uses `onErrorCaptured`
2. **Use try-catch in file loading logic** to handle missing/unreadable files explicitly
3. **Check `import.meta.env.DEV`** to display detailed errors in development, user-friendly messages in production
4. **Load files in `onMounted`** to ensure client-side execution and avoid SSR conflicts
5. **Test build process** to verify errors don't break static site generation

**Example implementation:**

```vue
<!-- ErrorBoundary.vue -->
<script setup>
import { ref, onErrorCaptured } from 'vue';

const error = ref(null);
const isDev = import.meta.env.DEV;

onErrorCaptured((err, instance, info) => {
  error.value = { err, info };
  return false;
});
</script>

<template>
  <div v-if="error">
    <slot name="fallback" :error="error.err" :info="error.info">
      <div class="error-fallback">
        <p v-if="isDev">{{ error.err.message }}</p>
        <p v-else>Something went wrong. Please refresh the page.</p>
      </div>
    </slot>
  </div>
  <slot v-else></slot>
</template>
```

This approach balances developer experience (detailed debugging information) with user experience (graceful failures) while maintaining VitePress SSR compatibility.
