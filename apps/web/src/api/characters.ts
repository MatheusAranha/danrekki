import { apiClient } from './client';

export interface Character {
  _id: string;
  name: string;
  user_id: string;
  clan_id: string;
  available_dt: number;
  elemental_affinities: string[];
  created_at: string;
  updated_at: string;
}

export interface CharacterRelease {
  _id: string;
  character_id: string;
  release_id: string;
  created_at: string;
}

export interface CharacterLibrary {
  _id: string;
  character_id: string;
  library_id: string;
  required_ninja_rank_id: string;
  created_at: string;
}

export interface CharacterSensei {
  _id: string;
  character_id: string;
  sensei_id: string;
  proximity: number;
  created_at: string;
}

export interface LearningProgress {
  _id: string;
  character_id: string;
  trainable_content_id: string;
  dt_invested: number;
  dt_required: number;
  status: 'in_progress' | 'completed';
  started_at: string;
  completed_at: string | null;
}

export interface TrainableContent {
  _id: string;
  type: string;
  jutsu_id: string | null;
  name: string;
  description: string;
  base_dt_cost: number;
  created_at: string;
  updated_at: string;
}

export interface Jutsu {
  _id: string;
  name: string;
  jutsu_rank_id: string;
  release_id: string;
  elements: string[];
  components: string;
  duration: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CatalogEntry {
  trainable_content: TrainableContent;
  jutsu: Jutsu | null;
  dt_cost: number;
  source:
    | { type: 'library'; library_id: string }
    | { type: 'sensei'; sensei_id: string };
  learning_progress: LearningProgress | null;
}

export interface TrainingCatalog {
  library_entries: CatalogEntry[];
  sensei_entries: CatalogEntry[];
}

export interface DtTransaction {
  _id: string;
  character_id: string;
  amount: number;
  reason: string;
  created_at: string;
}

export const charactersApi = {
  list: () => apiClient.get<Character[]>('/characters').then((r) => r.data),
  get: (id: string) =>
    apiClient.get<Character>(`/characters/${id}`).then((r) => r.data),

  getReleases: (id: string) =>
    apiClient
      .get<CharacterRelease[]>(`/characters/${id}/releases`)
      .then((r) => r.data),
  assignRelease: (id: string, body: { release_id: string }) =>
    apiClient.post(`/characters/${id}/releases`, body).then((r) => r.data),
  revokeRelease: (charId: string, releaseId: string) =>
    apiClient.delete(`/characters/${charId}/releases/${releaseId}`),

  getLibraries: (id: string) =>
    apiClient
      .get<CharacterLibrary[]>(`/characters/${id}/libraries`)
      .then((r) => r.data),
  assignLibrary: (
    id: string,
    body: { library_id: string; required_ninja_rank_id: string }
  ) => apiClient.post(`/characters/${id}/libraries`, body).then((r) => r.data),
  revokeLibrary: (charId: string, assignId: string) =>
    apiClient.delete(`/characters/${charId}/libraries/${assignId}`),

  getSenseis: (id: string) =>
    apiClient
      .get<CharacterSensei[]>(`/characters/${id}/senseis`)
      .then((r) => r.data),
  assignSensei: (
    id: string,
    body: { sensei_id: string; proximity: number }
  ) => apiClient.post(`/characters/${id}/senseis`, body).then((r) => r.data),
  revokeSensei: (charId: string, assignId: string) =>
    apiClient.delete(`/characters/${charId}/senseis/${assignId}`),

  getLearningProgress: (id: string) =>
    apiClient
      .get<LearningProgress[]>(`/characters/${id}/learning-progress`)
      .then((r) => r.data),

  addDt: (id: string, body: { amount: number; reason: string }) =>
    apiClient
      .post(`/characters/${id}/dt-transactions`, body)
      .then((r) => r.data),

  getTrainingCatalog: (id: string, includeIneligible?: boolean) =>
    apiClient
      .get<TrainingCatalog>(
        `/characters/${id}/training-catalog?include_ineligible=${includeIneligible ?? false}`
      )
      .then((r) => r.data),

  startLearning: (id: string, body: { trainable_content_id: string }) =>
    apiClient
      .post(`/characters/${id}/learning-progress`, body)
      .then((r) => r.data),

  getProgress: (charId: string, progressId: string) =>
    apiClient
      .get<LearningProgress>(
        `/characters/${charId}/learning-progress/${progressId}`
      )
      .then((r) => r.data),

  investDt: (charId: string, progressId: string, body: { amount: number }) =>
    apiClient
      .post(
        `/characters/${charId}/learning-progress/${progressId}/invest`,
        body
      )
      .then((r) => r.data),

  getDtTransactions: (id: string) =>
    apiClient
      .get<DtTransaction[]>(`/characters/${id}/dt-transactions`)
      .then((r) => r.data),
};
