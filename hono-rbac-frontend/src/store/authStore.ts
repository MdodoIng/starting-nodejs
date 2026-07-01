import { create } from 'zustand';

type User = {
  id: number;
  email: string;
  role: string;
  name?: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
  isModerator: () => boolean;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  login: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
  isAdmin: () => get().user?.role === 'admin',
  isModerator: () => ['admin', 'moderator'].includes(get().user?.role || ''),
}));