import { apiClient } from './client';

export interface Sensei {
  _id: string;
  name: string;
  description: string;
  picture_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SenseiContent {
  _id: string;
  sensei_id: string;
  trainable_content_id: string;
  required_proximity: number;
  created_at: string;
  updated_at: string;
}

export const senseisApi = {
  list: () => apiClient.get<Sensei[]>('/senseis').then((r) => r.data),
  get: (id: string) => apiClient.get<Sensei>(`/senseis/${id}`).then((r) => r.data),
  create: (body: { name: string; description: string; picture_url?: string | null }) =>
    apiClient.post<Sensei>('/senseis', body).then((r) => r.data),
  update: (id: string, body: Partial<{ name: string; description: string; picture_url: string | null }>) =>
    apiClient.patch<Sensei>(`/senseis/${id}`, body).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/senseis/${id}`),
};

export const senseiContentsApi = {
  list: (senseiId: string) =>
    apiClient
      .get<SenseiContent[]>(`/senseis/${senseiId}/contents`)
      .then((r) => r.data),
  assign: (
    senseiId: string,
    body: { trainable_content_id: string; required_proximity: number }
  ) =>
    apiClient
      .post<SenseiContent>(`/senseis/${senseiId}/contents`, body)
      .then((r) => r.data),
  delete: (senseiId: string, contentId: string) =>
    apiClient.delete(`/senseis/${senseiId}/contents/${contentId}`),
};
