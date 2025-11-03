<template>
  <div v-if="diffFile" class="system-prompt-diff">
    <DiffView :data="diffFile" />
  </div>
</template>

<script setup lang="ts">
import { DiffView } from '@git-diff-view/vue';
import { generateDiffFile, type DiffFile } from '@git-diff-view/file';
import { onMounted, ref } from 'vue';
import '@git-diff-view/vue/styles/diff-view.css';

interface Props {
  oldContent?: string;
  newContent?: string;
  oldLabel?: string;
  newLabel?: string;
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

onMounted(() => {
  const file = generateDiffFile(
    props.oldLabel,
    props.oldContent,
    props.newLabel,
    props.newContent,
    'markdown',
    'markdown'
  );
  file.initTheme('light');
  file.init();
  file.buildSplitDiffLines();
  diffFile.value = file;
});
</script>

<style scoped>
.system-prompt-diff {
  margin: 2rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}
</style>
