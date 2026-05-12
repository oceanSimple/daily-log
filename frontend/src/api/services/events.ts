import { apiClient } from '@/api/client';
import { toEvent, toEvents } from '@/api/dto';
import type { Event } from '@/types/daily-hub';

export async function listEvents(input?: { from?: string; to?: string }) {
  return toEvents(await apiClient.get('/api/events', { query: input }));
}

export async function createEvent(input: Omit<Event, 'id'>) {
  return toEvent(await apiClient.post('/api/events', input));
}

export async function updateEvent(eventId: string, input: Omit<Event, 'id'>) {
  return toEvent(await apiClient.patch(`/api/events/${eventId}`, input));
}

export async function deleteEvent(eventId: string) {
  await apiClient.delete(`/api/events/${eventId}`);
}
