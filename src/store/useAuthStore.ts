import { create } from "zustand";

type User = {
  id: string;
  name: string;
  email: string;
  username?: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setSession: (data: { user: User; token: string }) => void;
  updateUser: (data: Partial<User>) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setSession: ({ user, token }) => set({ user, token, isAuthenticated: true }),
  updateUser: (partial) =>
    set((state) =>
      state.user
        ? {
            user: { ...state.user, ...partial },
          }
        : state,
    ),
  clearSession: () => set({ user: null, token: null, isAuthenticated: false }),
}));
