<template>
  <div class="system-prompt-diff">
    <div v-if="loadError" class="error-message">
      <strong>Error loading diff:</strong> {{ loadError }}
    </div>
    <DiffView v-else-if="diffFile" :diffFile="diffFile" />
  </div>
</template>

<script setup lang="ts">
import { DiffView } from '@git-diff-view/vue';
import { generateDiffFile, DiffFile } from '@git-diff-view/file';
import { onMounted, ref } from 'vue';
import '@git-diff-view/vue/styles/diff-view.css';
import { data as promptDiffs } from '../PromptDiffs.data';
import type { PromptDiffsData } from '../PromptDiffsTypes';

interface Props {
  // Existing props (from POC-1)
  oldContent?: string;
  newContent?: string;
  oldLabel?: string;
  newLabel?: string;

  // New props for POC-2
  oldFile?: string;
  newFile?: string;
}

const props = withDefaults(defineProps<Props>(), {
  oldContent: `You are Claude Code, Anthropic's official CLI for Claude.

You are an interactive CLI tool that helps users with software engineering tasks. Use the instructions below and the tools available to you to assist the user.`,
  newContent: `You are Claude Code, Anthropic's official CLI for Claude.

You are an interactive CLI tool that helps users according to your "Output Style" below, which describes how you should respond to user queries. Use the instructions below and the tools available to you to assist the user.`,
  oldLabel: 'DEFAULT System Prompt',
  newLabel: 'USING /output-style'
});

const diffFile = ref<DiffFile | null>(null);
const loadError = ref<string | null>(null);

onMounted(() => {
  try {
    // Resolve content from file paths or props
    const oldContent = props.oldFile
      ? promptDiffs.files[props.oldFile]?.content ?? ''
      : props.oldContent;

    const newContent = props.newFile
      ? promptDiffs.files[props.newFile]?.content ?? ''
      : props.newContent;

    // Check for loading errors
    if (props.oldFile && promptDiffs.files[props.oldFile]?.error) {
      throw new Error(`Failed to load ${props.oldFile}: ${promptDiffs.files[props.oldFile].error}`);
    }
    if (props.newFile && promptDiffs.files[props.newFile]?.error) {
      throw new Error(`Failed to load ${props.newFile}: ${promptDiffs.files[props.newFile].error}`);
    }

    // Generate diff (existing logic from POC-1)
    const file = generateDiffFile(
      props.oldLabel ?? props.oldFile ?? 'Old',
      oldContent,
      props.newLabel ?? props.newFile ?? 'New',
      newContent,
      'markdown',
      'markdown'
    );
    file.initTheme('light');
    file.init();
    file.buildSplitDiffLines();
    diffFile.value = file;
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Unknown error loading diff';
    console.error('[SystemPromptDiff] Load error:', error);
  }
});
</script>

<style scoped>
.system-prompt-diff {
  margin: 2rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.error-message {
  padding: 1rem;
  background: #fee;
  border: 1px solid #c33;
  border-radius: 4px;
  color: #c33;
  margin: 1rem;
}
</style>
