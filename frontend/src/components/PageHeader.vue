<template>
  <header class="page-header">
    <div>
      <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
      <h1 v-if="title">{{ title }}</h1>
      <p v-if="description" class="description">{{ description }}</p>
    </div>
    <div v-if="$slots.meta" class="meta">
      <slot name="meta" />
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  eyebrow?: string;
  title?: string;
  description?: string;
}>();
</script>

<style scoped>
.page-header {
  display: flex;
  gap: 20px;
  justify-content: space-between;
  align-items: flex-start;
  padding: 6px 0 2px;
}

.eyebrow,
h1,
.description {
  margin: 0;
}

.eyebrow {
  color: var(--highlight-color);
  font-size: 13px;
  font-weight: 700;
}

h1 {
  margin-top: 8px;
  max-width: 12ch;
  font-size: 34px;
  line-height: 1.15;
}

.description {
  max-width: 760px;
  margin-top: 12px;
  color: var(--muted-text-color);
  font-size: 15px;
  line-height: 1.7;
}

.meta {
  flex-shrink: 0;
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.52), rgba(255, 255, 255, 0.18)),
    rgba(244, 248, 252, 0.3);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.56),
    0 10px 28px rgba(88, 112, 146, 0.08);
  backdrop-filter: blur(18px);
}

@media (max-width: 720px) {
  .page-header {
    flex-direction: column;
  }

  h1 {
    max-width: none;
    font-size: 28px;
  }
}
</style>
