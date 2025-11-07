<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as monaco from 'monaco-editor'

// Vite native worker imports - bundles workers properly for production
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

const diffContainer = ref(null)
let diffEditor = null

onMounted(async () => {
  // Configure Monaco Environment for Vite native workers (2025 best practice)
  self.MonacoEnvironment = {
    getWorker(_: any, label: string) {
      if (label === 'json') {
        return new jsonWorker()
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return new cssWorker()
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return new htmlWorker()
      }
      if (label === 'typescript' || label === 'javascript') {
        return new tsWorker()
      }
      return new editorWorker()
    }
  }

  // Create diff editor with read-only configuration (NFR-3.1)
  diffEditor = monaco.editor.createDiffEditor(diffContainer.value, {
    readOnly: true,              // Prevents all editing
    originalEditable: false,     // Locks original (left) editor
    renderSideBySide: true,      // Side-by-side view (FR-1.1)
    enableSplitViewResizing: true, // Allow pane width adjustment
    renderOverviewRuler: true    // Show minimap overview
  })

  // Create models with hardcoded content for POC validation
  const originalModel = monaco.editor.createModel(
    `const x = 1;\nconst y = 2;\nconst z = 3;`,
    'javascript'
  )

  const modifiedModel = monaco.editor.createModel(
    `const x = 10;\nconst y = 2;\nconst z = 30;`,
    'javascript'
  )

  // Set models to diff editor
  diffEditor.setModel({
    original: originalModel,
    modified: modifiedModel
  })
})

onBeforeUnmount(() => {
  diffEditor?.dispose()
})
</script>

<template>
  <div ref="diffContainer" class="monaco-diff-container" style="height: 600px; width: 100%; border: 1px solid #ccc;"></div>
</template>
