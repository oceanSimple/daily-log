<template>
  <div class="app-shell" :class="{ 'app-shell--sidebar-collapsed': sidebarCollapsed }">
    <AppSidebar
      :items="navItems"
      :collapsed="sidebarCollapsed"
      @open-settings="settingsOpen = true"
    />
    <div class="app-shell__content">
      <router-view />
    </div>

    <n-modal
      v-model:show="settingsOpen"
      preset="card"
      :title="t('settings.title')"
      class="settings-modal"
      style="width: min(420px, calc(100vw - 32px))"
    >
      <div class="settings-stack">
        <div class="settings-section">
          <p class="settings-section__title">{{ t('settings.sectionTitle') }}</p>
          <p class="settings-section__description">{{ t('settings.sectionDescription') }}</p>
          <div class="settings-locale-grid">
            <button
              type="button"
              class="locale-option"
              :class="{ 'locale-option--active': preferences.locale === 'zh' }"
              @click="preferences.setLocale('zh')"
            >
              {{ t('settings.zh') }}
            </button>
            <button
              type="button"
              class="locale-option"
              :class="{ 'locale-option--active': preferences.locale === 'en' }"
              @click="preferences.setLocale('en')"
            >
              {{ t('settings.en') }}
            </button>
          </div>
        </div>

        <div class="settings-section">
          <p class="settings-section__title">{{ t('settings.weekStartTitle') }}</p>
          <p class="settings-section__description">{{ t('settings.weekStartDescription') }}</p>
          <div class="settings-week-grid">
            <button
              v-for="day in weekStartOptions"
              :key="day.value"
              type="button"
              class="locale-option"
              :class="{ 'locale-option--active': preferences.weekStartDay === day.value }"
              @click="preferences.setWeekStartDay(day.value)"
            >
              {{ day.label }}
            </button>
          </div>
        </div>

        <div class="settings-placeholder">
          {{ t('settings.placeholder') }}
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { NModal } from 'naive-ui';

import AppSidebar from '@/components/AppSidebar.vue';
import { useAppLocale } from '@/composables/useAppLocale';
import {
  ArchiveIcon,
  CalendarIcon,
  ListTodoIcon,
} from '@/components/task-icons';
import { useDailyHubStore } from '@/store/dailyHub';
import { usePreferencesStore, type WeekStartDay } from '@/store/preferences';

const sidebarCollapsed = ref(true);
const settingsOpen = ref(false);
const store = useDailyHubStore();
const preferences = usePreferencesStore();
const { t } = useAppLocale();

onMounted(() => {
  void store.initialize();
});

const weekStartOptions = computed<Array<{ label: string; value: WeekStartDay }>>(() => [
  { label: t('settings.weekDays.0'), value: 0 },
  { label: t('settings.weekDays.1'), value: 1 },
  { label: t('settings.weekDays.2'), value: 2 },
  { label: t('settings.weekDays.3'), value: 3 },
  { label: t('settings.weekDays.4'), value: 4 },
  { label: t('settings.weekDays.5'), value: 5 },
  { label: t('settings.weekDays.6'), value: 6 },
]);

const navItems = computed(() => [
  {
    label: t('sidebar.calendar'),
    icon: CalendarIcon,
    to: '/calendar',
  },
  {
    label: t('sidebar.tasks'),
    icon: ListTodoIcon,
    to: `/tasks/${store.todayKey}`,
  },
  {
    label: t('sidebar.journal'),
    icon: ArchiveIcon,
    to: '/journal',
  },
]);
</script>

<style scoped>
.app-shell {
  display: grid;
  height: calc(100vh - 32px);
  min-height: calc(100vh - 32px);
  grid-template-columns: 296px minmax(0, 1fr);
  margin: 16px;
  border: var(--glass-border);
  border-radius: 32px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.56), rgba(255, 255, 255, 0.28)),
    rgba(252, 249, 245, 0.62);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.88),
    var(--shadow-strong);
  backdrop-filter: blur(30px) saturate(135%);
  overflow: hidden;
  transition: grid-template-columns 0.18s ease;
}

.app-shell--sidebar-collapsed {
  grid-template-columns: 92px minmax(0, 1fr);
}

.app-shell__content {
  min-width: 0;
  min-height: 0;
  padding: 36px 38px 44px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.34), rgba(255, 255, 255, 0.16)),
    rgba(249, 246, 241, 0.2);
  overflow-y: auto;
}

.settings-stack,
.settings-locale-grid,
.settings-week-grid {
  display: grid;
}

.settings-stack {
  gap: 18px;
}

.settings-section__title,
.settings-section__description,
.settings-placeholder {
  margin: 0;
}

.settings-section__title {
  font-size: 14px;
  font-weight: 700;
}

.settings-section__description {
  margin-top: 6px;
  color: var(--muted-text-color);
  font-size: 13px;
  line-height: 1.6;
}

.settings-locale-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.settings-week-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.locale-option {
  min-height: 42px;
  border: 1px solid var(--border-color-soft);
  border-radius: 16px;
  background:
    var(--glass-panel),
    rgba(252, 249, 245, 0.46);
  color: var(--body-text-color);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.locale-option:hover {
  transform: translateY(-1px);
}

.locale-option--active {
  border-color: rgba(111, 146, 219, 0.42);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.82),
    0 14px 28px rgba(108, 120, 133, 0.12);
}

.settings-placeholder {
  padding: 14px 16px;
  border: 1px solid var(--border-color-soft);
  border-radius: 18px;
  background:
    var(--glass-panel-soft),
    rgba(252, 249, 245, 0.42);
  color: var(--muted-text-color);
  font-size: 13px;
}

@media (max-width: 900px) {
  .app-shell {
    height: auto;
    min-height: 100vh;
    margin: 0;
    border: 0;
    border-radius: 0;
    box-shadow: none;
    backdrop-filter: none;
    grid-template-columns: 1fr;
  }

  .app-shell--sidebar-collapsed {
    grid-template-columns: 1fr;
  }

  .app-shell__content {
    padding: 20px 16px 32px;
  }

  .settings-week-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
