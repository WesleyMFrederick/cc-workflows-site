Based on the latest information for integrating Monaco Editor with VitePress using Vite in 2025, here's what you need to know:

## Monaco Editor Web Workers Configuration for VitePress

## Best Approach: Using `vite-plugin-monaco-editor`

**Installation:**

bash

`npm install --save-dev vite-plugin-monaco-editor monaco-editor`

**VitePress Configuration** (`.vitepress/config.ts` or `.vitepress/config.mts`):

typescript

`import { defineConfig } from 'vitepress' import monacoEditorPlugin from 'vite-plugin-monaco-editor' export default defineConfig({   // ... your VitePress config   vite: {     plugins: [       monacoEditorPlugin({         languageWorkers: ['editorWorkerService', 'typescript', 'json', 'css', 'html']       })     ]   } })`

## Alternative: Native Vite Worker Support

If you prefer not to use the plugin, you can configure workers manually using Vite's built-in worker support:[github+1](https://github.com/vitejs/vite/discussions/1791)​

**Setup in your component or theme:**

typescript

`import * as monaco from 'monaco-editor' import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker' import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker' import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker' import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker' import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker' self.MonacoEnvironment = {   getWorker(_: any, label: string) {     if (label === 'json') {       return new jsonWorker()     }     if (label === 'css' || label === 'scss' || label === 'less') {       return new cssWorker()     }     if (label === 'html' || label === 'handlebars' || label === 'razor') {       return new htmlWorker()     }     if (label === 'typescript' || label === 'javascript') {       return new tsWorker()     }     return new editorWorker()   } }`

## Plugin Configuration Options

The `vite-plugin-monaco-editor` offers several configuration options:[github](https://github.com/vdesjs/vite-plugin-monaco-editor)​

typescript

`monacoEditorPlugin({   // Include only specific language workers (reduces bundle size)   languageWorkers: ['editorWorkerService', 'css', 'html', 'json', 'typescript'],      // Custom workers   customWorkers: [     { label: 'graphql', entry: 'monaco-graphql/esm/graphql.worker' }   ],      // Custom public path for workers   publicPath: 'monacoeditorwork', // or use CDN      // Force build even when using CDN   forceBuildCDN: false })`

## Important Notes for VitePress

1. **Client-only initialization**: Since VitePress has SSR, wrap Monaco initialization in `onMounted` or use a client-only component
    
2. **Theme enhancement** (`.vitepress/theme/index.ts`):
    

typescript

`import DefaultTheme from 'vitepress/theme' import MonacoEditor from './components/MonacoEditor.vue' export default {   extends: DefaultTheme,   enhanceApp({ app }) {     app.component('MonacoEditor', MonacoEditor)   } }`

3. **Component implementation**:
    

text

`<script setup lang="ts"> import { onMounted, ref, onBeforeUnmount } from 'vue' import * as monaco from 'monaco-editor' const editorContainer = ref<HTMLElement>() let editor: monaco.editor.IStandaloneCodeEditor | null = null onMounted(() => {   if (editorContainer.value) {    editor = monaco.editor.create(editorContainer.value, {      value: 'console.log("Hello, Monaco!")',      language: 'javascript',      theme: 'vs-dark'    })  } }) onBeforeUnmount(() => {   editor?.dispose() }) </script> <template>   <div ref="editorContainer" style="height: 400px; width: 100%;"></div> </template>`

The **recommended approach for 2025** is using `vite-plugin-monaco-editor` as it handles the worker bundling automatically and works seamlessly with VitePress's Vite configuration.

1. [https://github.com/vitejs/vite/discussions/1791](https://github.com/vitejs/vite/discussions/1791)
2. [https://raw.githubusercontent.com/microsoft/monaco-editor/main/docs/integrate-esm.md](https://raw.githubusercontent.com/microsoft/monaco-editor/main/docs/integrate-esm.md)
3. [https://github.com/vdesjs/vite-plugin-monaco-editor](https://github.com/vdesjs/vite-plugin-monaco-editor)
4. [https://stackoverflow.com/questions/78431576/how-to-integrating-monaco-editor-with-vite-vue3-project](https://stackoverflow.com/questions/78431576/how-to-integrating-monaco-editor-with-vite-vue3-project)
5. [https://vitepress.dev/reference/site-config](https://vitepress.dev/reference/site-config)
6. [https://www.npmjs.com/package/@bithero/monaco-editor-vite-plugin](https://www.npmjs.com/package/@bithero/monaco-editor-vite-plugin)
7. [https://vitepress.dev/guide/getting-started](https://vitepress.dev/guide/getting-started)
8. [https://www.npmjs.com/package/vitepress-demo-editor?activeTab=dependencies](https://www.npmjs.com/package/vitepress-demo-editor?activeTab=dependencies)
9. [https://vite.dev/config/worker-options](https://vite.dev/config/worker-options)
10. [https://github.com/vuejs/vitepress/issues/1508](https://github.com/vuejs/vitepress/issues/1508)