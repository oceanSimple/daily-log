import { apiClient } from '@/api/client';
import { toTask, toTasks } from '@/api/dto';
import type { Task } from '@/types/daily-hub';

export async function listTasks(input?: { from?: string; to?: string; status?: string }) {
  return toTasks(await apiClient.get('/api/tasks', { query: input }));
}

export async function createTask(input: Omit<Task, 'id'>) {
  return toTask(await apiClient.post('/api/tasks', input));
}

export async function updateTask(taskId: string, input: Omit<Task, 'id'>) {
  return toTask(await apiClient.patch(`/api/tasks/${taskId}`, input));
}

export async function deleteTask(taskId: string) {
  await apiClient.delete(`/api/tasks/${taskId}`);
}
