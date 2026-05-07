import type { Pinia } from 'pinia';

import { useDailyHubStore } from './dailyHub';

export function setupStores(pinia: Pinia) {
  useDailyHubStore(pinia);
}
