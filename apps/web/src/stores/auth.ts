import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/auth';

export interface AuthUser {
  _id: string;
  email: string;
  role: string;
  name?: string;
  picture?: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  revalidate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      revalidate: async () => {
        if (!get().token) return;
        try {
          const data = await authApi.me();
          const id = data.id ?? data._id ?? '';
          set((s) => ({
            user: s.user ? { ...s.user, _id: id, email: data.email, role: data.role, name: data.name, picture: data.picture } : null,
          }));
        } catch {
          set({ token: null, user: null });
        }
      },
    }),
    { name: 'danrekki-auth' }
  )
);
