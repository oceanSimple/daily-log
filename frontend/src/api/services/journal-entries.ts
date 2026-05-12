import { apiClient } from '@/api/client';
import { toJournalEntry } from '@/api/dto';

export async function updateJournalEntry(date: string, input: { title: string; content: string }) {
  return toJournalEntry(await apiClient.patch(`/api/journal-entries/${date}`, input));
}
