<template>
  <aside class="sidebar">
    <div class="sidebar__top">
      <div class="brand">
        <div class="brand-mark">DL</div>
        <div>
          <p class="brand-name">Daily Log</p>
          <p class="brand-meta">Personal daily hub</p>
        </div>
      </div>

      <div class="sidebar-summary">
        <p class="sidebar-summary__label">Today</p>
        <p class="sidebar-summary__value">Focus the day before the day gets noisy.</p>
      </div>
    </div>

    <nav class="nav-list" aria-label="Main navigation">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        active-class="is-active"
      >
        <div class="nav-copy">
          <span class="nav-label">{{ item.label }}</span>
          <span class="nav-note">{{ item.note }}</span>
        </div>
      </RouterLink>
    </nav>

    <div class="sidebar-footer">
      <p class="sidebar-footer__title">MVP mode</p>
      <p class="sidebar-footer__copy">Tasks, events, journal, summary. Just enough structure to keep the week upright.</p>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';

defineProps<{
  items: Array<{
    label: string;
    note: string;
    to: string;
  }>;
}>();
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px 18px 18px;
  border-right: 1px solid rgba(255, 255, 255, 0.4);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.36), rgba(255, 255, 255, 0.14)),
    var(--sidebar-background);
  backdrop-filter: blur(28px) saturate(150%);
}

.sidebar__top {
  display: grid;
  gap: 18px;
}

.brand {
  display: flex;
  gap: 14px;
  align-items: center;
}

.brand-mark {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.36);
  border-radius: 14px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.24), rgba(255, 255, 255, 0.04)),
    linear-gradient(135deg, rgba(6, 122, 114, 0.9), rgba(46, 121, 220, 0.84));
  color: #f7fbff;
  font-size: 14px;
  font-weight: 700;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.34),
    0 12px 24px rgba(49, 104, 167, 0.18);
}

.brand-name,
.brand-meta {
  margin: 0;
}

.brand-name {
  font-size: 15px;
  font-weight: 700;
}

.brand-meta {
  margin-top: 4px;
  color: var(--muted-text-color);
  font-size: 12px;
}

.sidebar-summary,
.sidebar-footer {
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.42);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.54), rgba(255, 255, 255, 0.24)),
    rgba(244, 248, 252, 0.36);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.58);
  backdrop-filter: blur(22px) saturate(150%);
}

.sidebar-summary__label,
.sidebar-summary__value,
.sidebar-footer__title,
.sidebar-footer__copy {
  margin: 0;
}

.sidebar-summary__label,
.sidebar-footer__title {
  color: var(--muted-text-color);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.sidebar-summary__value,
.sidebar-footer__copy {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.55;
}

.nav-list {
  display: grid;
  gap: 8px;
  align-content: start;
}

.nav-item {
  display: block;
  padding: 14px 14px 13px;
  border: 1px solid transparent;
  border-radius: 16px;
  color: inherit;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.nav-item:hover {
  border-color: rgba(255, 255, 255, 0.42);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.48), rgba(255, 255, 255, 0.18)),
    rgba(242, 247, 253, 0.32);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.48),
    0 12px 24px rgba(90, 118, 156, 0.08);
  transform: translateX(1px);
}

.nav-item.is-active {
  border-color: rgba(255, 255, 255, 0.56);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.62), rgba(255, 255, 255, 0.2)),
    linear-gradient(135deg, rgba(191, 240, 233, 0.38), rgba(226, 238, 255, 0.28));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.56),
    0 14px 28px rgba(96, 131, 173, 0.12);
}

.nav-copy {
  display: grid;
  gap: 4px;
}

.nav-label {
  font-size: 14px;
  font-weight: 600;
}

.nav-note {
  color: var(--muted-text-color);
  font-size: 12px;
  line-height: 1.45;
}

@media (max-width: 900px) {
  .sidebar {
    padding: 20px 16px;
    border-right: 0;
    border-bottom: 1px solid var(--border-color);
  }

  .nav-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-content: start;
  }

  .sidebar-footer {
    display: none;
  }
}
</style>
