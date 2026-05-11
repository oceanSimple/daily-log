import { watch, ref } from 'vue';
import { defineStore } from 'pinia';

export type AppLocale = 'zh' | 'en';
export type WeekStartDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const LOCALE_STORAGE_KEY = 'daily-log-locale';
const WEEK_START_STORAGE_KEY = 'daily-log-week-start-day';

function readStoredLocale(): AppLocale {
  if (typeof window === 'undefined') return 'zh';
  const value = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return value === 'en' ? 'en' : 'zh';
}

function readStoredWeekStartDay(): WeekStartDay {
  if (typeof window === 'undefined') return 1;
  const value = Number(window.localStorage.getItem(WEEK_START_STORAGE_KEY));
  return value >= 0 && value <= 6 ? (value as WeekStartDay) : 1;
}

export const usePreferencesStore = defineStore('preferences', () => {
  const locale = ref<AppLocale>(readStoredLocale());
  const weekStartDay = ref<WeekStartDay>(readStoredWeekStartDay());

  watch(
    locale,
    (value) => {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(LOCALE_STORAGE_KEY, value);
    },
    { immediate: true },
  );

  watch(
    weekStartDay,
    (value) => {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(WEEK_START_STORAGE_KEY, String(value));
    },
    { immediate: true },
  );

  function setLocale(value: AppLocale) {
    locale.value = value;
  }

  function setWeekStartDay(value: WeekStartDay) {
    weekStartDay.value = value;
  }

  return {
    locale,
    weekStartDay,
    setLocale,
    setWeekStartDay,
  };
});
