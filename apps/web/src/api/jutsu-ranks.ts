import { apiClient } from './client';

export interface JutsuRank {
  _id: string;
  name: string;
  order: number;
  dt_cost: number;
  created_at: string;
  updated_at: string;
}

export const jutsuRanksApi = {
  list: () => apiClient.get<JutsuRank[]>('/jutsu-ranks').then((r) => r.data),
  get: (id: string) =>
    apiClient.get<JutsuRank>(`/jutsu-ranks/${id}`).then((r) => r.data),
  create: (body: { name: string; order: number; dt_cost: number }) =>
    apiClient.post<JutsuRank>('/jutsu-ranks', body).then((r) => r.data),
  update: (id: string, body: Partial<{ name: string; order: number; dt_cost: number }>) =>
    apiClient.patch<JutsuRank>(`/jutsu-ranks/${id}`, body).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/jutsu-ranks/${id}`),
};
