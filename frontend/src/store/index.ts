import type { Pinia } from 'pinia';

import { useDailyHubStore } from './dailyHub';
import { usePreferencesStore } from './preferences';

export function setupStores(pinia: Pinia) {
  useDailyHubStore(pinia);
  usePreferencesStore(pinia);
}
