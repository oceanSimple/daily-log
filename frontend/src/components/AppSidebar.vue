<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': collapsed }">
    <div class="sidebar__top">
      <div class="brand">
        <div class="brand-mark">DL</div>
        <p v-if="!collapsed" class="brand-name">Daily Log</p>
      </div>
    </div>

    <nav class="nav-list" aria-label="Main navigation">
      <n-tooltip
        v-for="item in items"
        :key="item.to"
        trigger="hover"
        placement="right"
        :disabled="!collapsed"
      >
        <template #trigger>
          <RouterLink
            :to="item.to"
            class="nav-item"
            :class="{ 'nav-item--collapsed': collapsed }"
            active-class="is-active"
          >
            <span class="nav-icon">
              <n-icon size="18">
                <component :is="item.icon" />
              </n-icon>
            </span>
            <span v-if="!collapsed" class="nav-label">{{ item.label }}</span>
          </RouterLink>
        </template>
        {{ item.label }}
      </n-tooltip>
    </nav>

    <n-tooltip trigger="hover" placement="right" :disabled="!collapsed">
      <template #trigger>
        <button
          type="button"
          class="settings-entry"
          :class="{ 'settings-entry--collapsed': collapsed }"
          @click="$emit('openSettings')"
        >
          <span class="nav-icon">
            <n-icon size="18">
              <SettingsIcon />
            </n-icon>
          </span>
          <span v-if="!collapsed" class="nav-label">{{ t('sidebar.settings') }}</span>
        </button>
      </template>
      {{ t('sidebar.settings') }}
    </n-tooltip>
  </aside>
</template>

<script setup lang="ts">
import { NIcon, NTooltip } from 'naive-ui';
import { RouterLink } from 'vue-router';

import { useAppLocale } from '@/composables/useAppLocale';
import { SettingsIcon } from '@/components/task-icons';

defineProps<{
  collapsed: boolean;
  items: Array<{
    icon: unknown;
    label: string;
    to: string;
  }>;
}>();

defineEmits<{
  openSettings: [];
}>();

const { t } = useAppLocale();
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 18px;
  height: 100%;
  min-height: 0;
  padding: 24px 18px 18px;
  border-right: 1px solid rgba(255, 255, 255, 0.4);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.36), rgba(255, 255, 255, 0.14)),
    var(--sidebar-background);
  backdrop-filter: blur(28px) saturate(150%);
  overflow-y: auto;
  transition: padding 0.18s ease;
}

.sidebar--collapsed {
  padding-inline: 12px;
}

.sidebar__top {
  display: grid;
  gap: 12px;
}

.brand {
  display: flex;
  gap: 14px;
  align-items: center;
  min-width: 0;
}

.sidebar--collapsed .brand {
  width: 100%;
  justify-content: center;
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

.brand-name {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
}

.nav-list {
  display: grid;
  gap: 8px;
  align-content: start;
}

.nav-item,
.settings-entry {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  border: 1px solid transparent;
  border-radius: 16px;
  color: inherit;
  background: transparent;
  cursor: pointer;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.settings-entry {
  margin-top: auto;
}

.nav-item--collapsed,
.settings-entry--collapsed {
  justify-content: center;
  padding-inline: 12px;
}

.nav-item:hover,
.settings-entry:hover {
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

.nav-icon {
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-label {
  min-width: 0;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

@media (max-width: 900px) {
  .sidebar,
  .sidebar--collapsed {
    padding: 20px 16px;
    border-right: 0;
    border-bottom: 1px solid var(--border-color);
  }

  .nav-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-content: start;
  }

  .nav-item--collapsed,
  .settings-entry--collapsed {
    justify-content: flex-start;
    padding-inline: 14px;
  }
}
</style>
