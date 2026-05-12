import { apiClient } from '@/api/client';
import { toLogEntry } from '@/api/dto';
import type { LogEntry } from '@/types/daily-hub';

export async function createLogEntry(input: Omit<LogEntry, 'id'>) {
  return toLogEntry(await apiClient.post('/api/log-entries', input));
}

export async function updateLogEntry(entryId: string, input: Omit<LogEntry, 'id'>) {
  return toLogEntry(await apiClient.patch(`/api/log-entries/${entryId}`, input));
}

export async function deleteLogEntry(entryId: string) {
  await apiClient.delete(`/api/log-entries/${entryId}`);
}
