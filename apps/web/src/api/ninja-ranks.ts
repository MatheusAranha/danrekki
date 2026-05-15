import { apiClient } from './client';

export interface NinjaRank {
  _id: string;
  name: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export const ninjaRanksApi = {
  list: () => apiClient.get<NinjaRank[]>('/ninja-ranks').then((r) => r.data),
  get: (id: string) =>
    apiClient.get<NinjaRank>(`/ninja-ranks/${id}`).then((r) => r.data),
  create: (body: { name: string; order: number }) =>
    apiClient.post<NinjaRank>('/ninja-ranks', body).then((r) => r.data),
  update: (id: string, body: Partial<{ name: string; order: number }>) =>
    apiClient.patch<NinjaRank>(`/ninja-ranks/${id}`, body).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/ninja-ranks/${id}`),
};
