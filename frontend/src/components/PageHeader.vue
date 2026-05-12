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
  padding: 6px 0 6px;
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
  letter-spacing: 0.02em;
}

h1 {
  margin-top: 8px;
  max-width: 14ch;
  font-size: 38px;
  line-height: 1.08;
  font-weight: 750;
}

.description {
  max-width: 760px;
  margin-top: 14px;
  color: var(--muted-text-color-strong);
  font-size: 15px;
  line-height: 1.75;
}

.meta {
  flex-shrink: 0;
  padding: 12px 15px;
  border: var(--glass-border);
  border-radius: 18px;
  background:
    var(--glass-panel),
    rgba(252, 249, 245, 0.42);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.88),
    0 16px 34px rgba(116, 99, 83, 0.1);
  backdrop-filter: blur(22px);
}

@media (max-width: 720px) {
  .page-header {
    flex-direction: column;
  }

  h1 {
    max-width: none;
    font-size: 30px;
  }
}
</style>
