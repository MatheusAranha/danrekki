import { apiClient } from './client';

export interface Clan {
  _id: string;
  name: string;
  dt_modifiers: { release_id: string; multiplier: number }[];
  created_at: string;
  updated_at: string;
}

export const clansApi = {
  list: () => apiClient.get<Clan[]>('/clans').then((r) => r.data),
  get: (id: string) => apiClient.get<Clan>(`/clans/${id}`).then((r) => r.data),
  create: (body: { name: string; dt_modifiers: Clan['dt_modifiers'] }) =>
    apiClient.post<Clan>('/clans', body).then((r) => r.data),
  update: (
    id: string,
    body: Partial<{ name: string; dt_modifiers: Clan['dt_modifiers'] }>
  ) => apiClient.patch<Clan>(`/clans/${id}`, body).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/clans/${id}`),
};
