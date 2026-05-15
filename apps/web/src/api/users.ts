import { apiClient } from './client';

export interface User {
  _id: string;
  email: string;
  role: 'admin' | 'player';
  created_at: string;
  updated_at: string;
}

export const usersApi = {
  list: () => apiClient.get<User[]>('/users').then((r) => r.data),
  create: (body: { email: string; password: string; role: 'admin' | 'player' }) =>
    apiClient.post<User>('/users', body).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/users/${id}`),
};
