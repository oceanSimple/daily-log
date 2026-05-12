import { apiClient } from '@/api/client';
import { toDashboard, type DashboardDto } from '@/api/dto';

export async function getDashboard() {
  return toDashboard(await apiClient.get<DashboardDto>('/api/dashboard'));
}
