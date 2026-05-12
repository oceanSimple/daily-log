<template>
  <section class="section-card">
    <header v-if="title || $slots.header" class="section-card__header">
      <div>
        <h2 v-if="title">{{ title }}</h2>
        <p v-if="description">{{ description }}</p>
      </div>
      <slot name="header" />
    </header>
    <div class="section-card__body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
  description?: string;
}>();
</script>

<style scoped>
.section-card {
  position: relative;
  padding: 24px;
  border: var(--glass-border);
  border-radius: var(--radius-card);
  background:
    var(--glass-panel-warm),
    var(--panel-color);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.88),
    var(--shadow-soft);
  backdrop-filter: blur(26px) saturate(135%);
}

.section-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.32), transparent 42%);
  opacity: 0.8;
}

.section-card__header {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
}

.section-card__body {
  position: relative;
  display: grid;
  gap: 16px;
}

h2,
p {
  margin: 0;
}

h2 {
  color: var(--body-text-color);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
}

p {
  margin-top: 6px;
  color: var(--muted-text-color);
  font-size: 13px;
  line-height: 1.6;
}
</style>
