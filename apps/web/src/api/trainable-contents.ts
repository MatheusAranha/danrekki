import { apiClient } from './client';

export type ContentType =
  | 'jutsu'
  | 'tool'
  | 'weapon_or_armor'
  | 'skill_proficiency'
  | 'feat';

export interface TrainableContent {
  _id: string;
  type: ContentType;
  jutsu_id: string | null;
  name: string;
  description: string;
  base_dt_cost: number;
  created_at: string;
  updated_at: string;
}

export const trainableContentsApi = {
  list: () =>
    apiClient.get<TrainableContent[]>('/trainable-contents').then((r) => r.data),
  get: (id: string) =>
    apiClient
      .get<TrainableContent>(`/trainable-contents/${id}`)
      .then((r) => r.data),
  create: (body: {
    type: ContentType;
    jutsu_id?: string;
    name: string;
    description: string;
    base_dt_cost: number;
  }) => apiClient.post<TrainableContent>('/trainable-contents', body).then((r) => r.data),
  update: (
    id: string,
    body: Partial<{
      type: ContentType;
      jutsu_id: string | null;
      name: string;
      description: string;
      base_dt_cost: number;
    }>
  ) =>
    apiClient
      .patch<TrainableContent>(`/trainable-contents/${id}`, body)
      .then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/trainable-contents/${id}`),
};
