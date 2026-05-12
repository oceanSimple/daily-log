import { apiClient } from '@/api/client';
import { toDayRecord, toDayRecords } from '@/api/dto';

export async function getDayRecord(date: string) {
  return toDayRecord(await apiClient.get(`/api/day-records/${date}`));
}

export async function listDayRecords(input?: { from?: string; to?: string }) {
  return toDayRecords(await apiClient.get('/api/day-records', { query: input }));
}
