import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clearAccessToken, getAccessToken, setAccessToken } from '@/infrastructure/utils/api';

type AuthState = {
  userId: string | null;
  isAuthenticated: boolean;
  refreshToken?: string | null;
  expiresAt?: string | null;
  isGlobalAdmin: boolean;
  clearUserLocal: () => void;
  setUserId: (id: string | null) => void;
  setToken: (token: string | null) => void;
  setSession: (args: { token: string; userId: string; refreshToken?: string; expiresAt?: string }) => void;
  setIsGlobalAdmin: (isGlobalAdmin: boolean) => void;
  logout: () => void;
};


function getIsGlobalAdminFromStorage(): boolean {
  return true;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      isAuthenticated: Boolean(getAccessToken()),
      //isGlobalAdmin: getIsGlobalAdminFromStorage(),
      isGlobalAdmin: false,
      setUserId: (id) => set({ userId: id }),
      setSession: ({ token, userId, refreshToken, expiresAt }) => {
        setAccessToken(token);
        set({ isAuthenticated: true, userId, refreshToken: refreshToken ?? null, expiresAt: expiresAt ?? null });
      },
      setIsGlobalAdmin: (isGlobalAdmin) => set({ isGlobalAdmin }),
      setToken: (token) => {
        if (token) {
          setAccessToken(token);
          set({ isAuthenticated: true });
        } else {
          clearAccessToken();
          set({ isAuthenticated: false, userId: null, isGlobalAdmin: false });
        }
      },
      clearUserLocal: () => {
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.removeItem('user');
          } catch {
            // ignore storage errors
          }
        }
      },
      logout: () => {
        clearAccessToken();
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.removeItem('user');
          } catch {
            // ignore storage errors
          }
        }
        set({ isAuthenticated: false, userId: null, isGlobalAdmin: false });
      },
    }),
    { name: 'auth-store' }
  )
);


