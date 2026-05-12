<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <article class="markdown-preview" v-html="html" />
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { renderMarkdown } from '@/utils/markdown';

const props = defineProps<{
  content: string;
}>();

const html = computed(() => renderMarkdown(props.content));
</script>

<style scoped>
.markdown-preview {
  color: var(--body-text-color);
  line-height: 1.82;
}

.markdown-preview :deep(h1),
.markdown-preview :deep(h2),
.markdown-preview :deep(p),
.markdown-preview :deep(ul) {
  margin: 0 0 12px;
}

.markdown-preview :deep(h1) {
  font-size: 24px;
  line-height: 1.2;
}

.markdown-preview :deep(h2) {
  font-size: 18px;
  line-height: 1.3;
}

.markdown-preview :deep(ul) {
  padding-left: 20px;
}

.markdown-preview :deep(code) {
  padding: 2px 6px;
  border-radius: 8px;
  background: rgba(233, 239, 250, 0.86);
  font-family:
    'SFMono-Regular', ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace;
  font-size: 0.92em;
}
</style>
