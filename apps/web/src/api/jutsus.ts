import { apiClient } from './client';

export interface Jutsu {
  _id: string;
  name: string;
  jutsu_rank_id: string;
  keyword_ids: string[];
  elements: string[];
  casting_time: string;
  range: string;
  chakra_cost: string;
  components: string;
  duration: string;
  description: string;
  at_higher_ranks: string | null;
  created_at: string;
  updated_at: string;
}

export const jutsusApi = {
  list: () => apiClient.get<Jutsu[]>('/jutsus').then((r) => r.data),
  get: (id: string) => apiClient.get<Jutsu>(`/jutsus/${id}`).then((r) => r.data),
  create: (body: {
    name: string;
    jutsu_rank_id: string;
    keyword_ids: string[];
    elements: string[];
    casting_time: string;
    range: string;
    chakra_cost: string;
    components: string;
    duration: string;
    description: string;
    at_higher_ranks: string | null;
  }) => apiClient.post<Jutsu>('/jutsus', body).then((r) => r.data),
  update: (
    id: string,
    body: Partial<{
      name: string;
      jutsu_rank_id: string;
      keyword_ids: string[];
      elements: string[];
      casting_time: string;
      range: string;
      chakra_cost: string;
      components: string;
      duration: string;
      description: string;
      at_higher_ranks: string | null;
    }>
  ) => apiClient.patch<Jutsu>(`/jutsus/${id}`, body).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/jutsus/${id}`),
};
