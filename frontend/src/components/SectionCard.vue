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
  padding: 22px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background:
    var(--glass-highlight),
    var(--panel-color);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.62),
    var(--shadow-soft);
  backdrop-filter: blur(24px) saturate(150%);
}

.section-card__header {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
}

.section-card__body {
  display: grid;
  gap: 16px;
}

h2,
p {
  margin: 0;
}

h2 {
  color: var(--body-text-color);
  font-size: 17px;
  line-height: 1.3;
}

p {
  margin-top: 6px;
  color: var(--muted-text-color);
  font-size: 13px;
  line-height: 1.6;
}
</style>
