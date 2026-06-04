import { apiClient } from './client';

export interface AuthResponse {
  token: string;
  user: {
    _id: string;
    email: string;
    role: string;
  };
}

export interface GoogleAuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    picture: string;
    role: string;
  };
}

export interface MeResponse {
  id?: string;
  _id?: string;
  email: string;
  name?: string;
  picture?: string;
  role: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data),

  googleLogin: (credential: string) =>
    apiClient.post<GoogleAuthResponse>('/auth/google', { credential }).then((r) => r.data),

  me: () => apiClient.get<MeResponse>('/me').then((r) => r.data),
};
