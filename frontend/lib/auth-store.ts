import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, User } from './api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { user, token } = await authApi.login(email, password);
          localStorage.setItem('taskflow_token', token);
          set({ user, token, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const { user, token } = await authApi.register(name, email, password);
          localStorage.setItem('taskflow_token', token);
          set({ user, token, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: () => {
        localStorage.removeItem('taskflow_token');
        set({ user: null, token: null });
        window.location.href = '/login';
      },

      loadUser: async () => {
        const token = localStorage.getItem('taskflow_token');
        if (!token) return;
        try {
          const user = await authApi.me();
          set({ user, token });
        } catch {
          localStorage.removeItem('taskflow_token');
          set({ user: null, token: null });
        }
      },
    }),
    {
      name: 'taskflow-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
);
