import { apiClient } from './client';

export interface Library {
  _id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface LibraryScroll {
  _id: string;
  library_id: string;
  jutsu_id: string;
  required_ninja_rank_id: string;
  rented_by_character_id: string | null;
  rented_at: string | null;
  created_at: string;
  updated_at: string;
}

export const librariesApi = {
  list: () => apiClient.get<Library[]>('/libraries').then((r) => r.data),
  get: (id: string) => apiClient.get<Library>(`/libraries/${id}`).then((r) => r.data),
  create: (body: { name: string; description: string }) =>
    apiClient.post<Library>('/libraries', body).then((r) => r.data),
  update: (id: string, body: Partial<{ name: string; description: string }>) =>
    apiClient.patch<Library>(`/libraries/${id}`, body).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/libraries/${id}`),
};

export const libraryScrollsApi = {
  list: (libraryId: string) =>
    apiClient
      .get<LibraryScroll[]>(`/libraries/${libraryId}/scrolls`)
      .then((r) => r.data),
  create: (
    libraryId: string,
    body: { jutsu_id: string; required_ninja_rank_id: string }
  ) =>
    apiClient
      .post<LibraryScroll>(`/libraries/${libraryId}/scrolls`, body)
      .then((r) => r.data),
  delete: (libraryId: string, scrollId: string) =>
    apiClient.delete(`/libraries/${libraryId}/scrolls/${scrollId}`),
};
