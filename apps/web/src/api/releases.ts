import { apiClient } from './client';

export interface Release {
  _id: string;
  name: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export const releasesApi = {
  list: () => apiClient.get<Release[]>('/releases').then((r) => r.data),
  get: (id: string) => apiClient.get<Release>(`/releases/${id}`).then((r) => r.data),
  create: (body: { name: string; date: string }) =>
    apiClient.post<Release>('/releases', body).then((r) => r.data),
  update: (id: string, body: Partial<{ name: string; date: string }>) =>
    apiClient.patch<Release>(`/releases/${id}`, body).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/releases/${id}`),
};
