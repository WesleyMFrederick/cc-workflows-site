<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import * as monaco from 'monaco-editor'
import { data as assetFiles } from '../loaders/assets.data'
import { useData } from 'vitepress'  // NEW: VitePress theme detection

// Vite native worker imports - bundles workers properly for production
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

// Load markdown files using VitePress content loader
// This works with srcExclude by using VitePress's data loading system
const fileContents: Record<string, string> = {}
for (const file of assetFiles) {
  fileContents[file.path] = file.content
}

console.log('[MonacoDiffFile] Loaded files:', Object.keys(fileContents))

// VitePress theme detection and Monaco theme mapping
const { isDark } = useData()

const monacoTheme = computed(() => {
  return isDark.value ? 'vs-dark' : 'vs'
})

console.log('[MonacoDiff] Initial theme:', monacoTheme.value)

interface Props {
  oldContent?: string
  newContent?: string
  oldFile?: string      // NEW: File path relative to docs/
  newFile?: string      // NEW: File path relative to docs/
  language?: string
}

const props = withDefaults(defineProps<Props>(), {
  language: 'markdown'  // Changed default for file loading
})

// Normalize user-provided path to match data loader keys
// Data loader provides just filenames like 'default-system-prompt.md'
function normalizeFilePath(path: string): string {
  // Strip any directory prefixes, we just need the filename
  return path.split('/').pop() || path
}

// Load file content from glob map
function loadFileContent(path: string): string | null {
  const normalizedPath = normalizeFilePath(path)
  console.log('[MonacoDiffFile] Loading:', path, '→', normalizedPath)
  const content = fileContents[normalizedPath]
  console.log('[MonacoDiffFile] Found:', content !== undefined)
  return content ?? null
}

// Content loading with validation and error handling
const contentOrError = computed(() => {
  let oldContentValue = ''
  let newContentValue = ''
  let errorMessage: string | null = null

  // Validate old content source
  if (props.oldContent && props.oldFile) {
    errorMessage = 'Cannot specify both oldContent and oldFile'
  } else if (!props.oldContent && !props.oldFile) {
    errorMessage = 'Must specify either oldContent or oldFile'
  } else if (props.oldContent) {
    oldContentValue = props.oldContent
  } else if (props.oldFile) {
    const content = loadFileContent(props.oldFile)
    if (content === null) {
      errorMessage = `File not found: ${props.oldFile} (looked for: ${normalizeFilePath(props.oldFile)})`
    } else {
      oldContentValue = content
    }
  }

  // Validate new content source
  if (!errorMessage) {
    if (props.newContent && props.newFile) {
      errorMessage = 'Cannot specify both newContent and newFile'
    } else if (!props.newContent && !props.newFile) {
      errorMessage = 'Must specify either newContent or newFile'
    } else if (props.newContent) {
      newContentValue = props.newContent
    } else if (props.newFile) {
      const content = loadFileContent(props.newFile)
      if (content === null) {
        errorMessage = `File not found: ${props.newFile} (looked for: ${normalizeFilePath(props.newFile)})`
      } else {
        newContentValue = content
      }
    }
  }

  return { oldContent: oldContentValue, newContent: newContentValue, error: errorMessage }
})

const diffContainer = ref(null)
let diffEditor = null

onMounted(() => {
  if (!diffContainer.value || contentOrError.value.error) {
    console.log('[MonacoDiffFile] Skipping initialization:', contentOrError.value.error)
    return
  }

  // Configure Monaco Environment for Vite native workers
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

  // Create diff editor with read-only configuration
  diffEditor = monaco.editor.createDiffEditor(diffContainer.value, {
    readOnly: true,
    originalEditable: false,
    renderSideBySide: true,
    enableSplitViewResizing: true,
    renderOverviewRuler: true,
    automaticLayout: true,
    contextmenu: false, // Disables right-click context menu
    theme: monacoTheme.value,
     wordWrap: 'on' // Enable word wrap
  })

  // Create models with loaded file content
  const originalModel = monaco.editor.createModel(
    contentOrError.value.oldContent,
    props.language
  )

  const modifiedModel = monaco.editor.createModel(
    contentOrError.value.newContent,
    props.language
  )

  diffEditor.setModel({
    original: originalModel,
    modified: modifiedModel
  })

  console.log('[MonacoDiff] Diff editor initialized with file content and theme sync')
})

// Watch file path prop changes
watch(() => [props.oldFile, props.newFile, props.oldContent, props.newContent], () => {
  if (!diffEditor || contentOrError.value.error) return

  const originalModel = diffEditor.getOriginalEditor().getModel()
  if (originalModel && originalModel.getValue() !== contentOrError.value.oldContent) {
    console.log('[MonacoDiffFile] Original content updated from file')
    originalModel.setValue(contentOrError.value.oldContent)
  }

  const modifiedModel = diffEditor.getModifiedEditor().getModel()
  if (modifiedModel && modifiedModel.getValue() !== contentOrError.value.newContent) {
    console.log('[MonacoDiffFile] Modified content updated from file')
    modifiedModel.setValue(contentOrError.value.newContent)
  }
})

// Watch language prop changes
watch(() => props.language, (newLang) => {
  if (!diffEditor) return
  const originalModel = diffEditor.getOriginalEditor().getModel()
  const modifiedModel = diffEditor.getModifiedEditor().getModel()
  if (originalModel) monaco.editor.setModelLanguage(originalModel, newLang)
  if (modifiedModel) monaco.editor.setModelLanguage(modifiedModel, newLang)
  console.log('[MonacoDiffFile] Language updated:', newLang)
})

// Watch VitePress theme changes and sync to Monaco
watch(monacoTheme, (newTheme) => {
  if (!diffEditor) return
  console.log('[MonacoDiff] Theme switching to:', newTheme)
  monaco.editor.setTheme(newTheme)
  console.log('[MonacoDiff] Theme updated successfully')
})

onBeforeUnmount(() => {
  diffEditor?.dispose()
})
</script>

<template>
  <div v-if="contentOrError.error" class="error-message" style="padding: 16px; background: #fee; border: 1px solid #fcc; border-radius: 4px; color: #c00;">
    <strong>Error:</strong> {{ contentOrError.error }}
  </div>
  <div
    v-else
    ref="diffContainer"
    class="monaco-diff-container"
    style="height: 600px; width: 100%; border: 1px solid #ccc;"
  />
</template>
