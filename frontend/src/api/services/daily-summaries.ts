import { apiClient } from '@/api/client';
import { toDailySummary } from '@/api/dto';
import type { DailySummary } from '@/types/daily-hub';

export async function updateDailySummary(date: string, input: Partial<Omit<DailySummary, 'date'>>) {
  return toDailySummary(await apiClient.patch(`/api/daily-summaries/${date}`, input));
}
