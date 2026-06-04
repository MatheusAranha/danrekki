import { apiClient } from './client';

export interface Release {
  _id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export const releasesApi = {
  list: () => apiClient.get<Release[]>('/keywords').then((r) => r.data),
  get: (id: string) => apiClient.get<Release>(`/keywords/${id}`).then((r) => r.data),
  create: (body: { name: string }) =>
    apiClient.post<Release>('/keywords', body).then((r) => r.data),
  update: (id: string, body: Partial<{ name: string }>) =>
    apiClient.patch<Release>(`/keywords/${id}`, body).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/keywords/${id}`),
};
