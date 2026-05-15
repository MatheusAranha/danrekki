import { apiClient } from './client';

export interface AuthResponse {
  token: string;
  user: {
    _id: string;
    email: string;
    role: string;
  };
}

export const authApi = {
  login: (email: string, password: string) =>
    apiClient
      .post<AuthResponse>('/auth/login', { email, password })
      .then((r) => r.data),
};
