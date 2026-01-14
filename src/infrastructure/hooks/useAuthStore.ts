import { create } from "zustand";
import {
  clearAccessToken,
  setAccessToken,
} from "@/infrastructure/utils/api";
import type { MeResponseEntity } from "@/infrastructure/schema/schema-auth";
import Cookies from "js-cookie";

interface AuthState {
  isGlobalAdmin: boolean | null;
  userId: string | null;
  companyId: string | null;
  userData: MeResponseEntity | null;
  setCompanyId: (companyId: string | null) => void;
  setUserData: (args: {
    userId: string;
    companyId: string | null;
    isGlobalAdmin: boolean;
  }) => void;
  setMeData: (data: MeResponseEntity) => void;
  setSession: (args: {
    token: string;
    userId: string;
    companyId?: string;
    isGlobalAdmin: boolean;
  }) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isGlobalAdmin: null,
  userId: null,
  companyId: null,
  userData: null,
  setCompanyId: (companyId) => {
    set({ companyId });
  },
  setUserData: ({ userId, companyId, isGlobalAdmin }) => {
    set({ userId, companyId, isGlobalAdmin });
  },
  setMeData: (data) => {
    const { id, companyId, isGlobalAdmin } = data;
    set({
      userId: id,
      companyId: companyId ?? null,
      isGlobalAdmin,
      userData: data,
    });
  },
  setSession: ({ token, userId, companyId, isGlobalAdmin }) => {
    setAccessToken(token);
    set({ userId, companyId: companyId ?? null, isGlobalAdmin });
  },
  setToken: (token) => {
    if (token) {
      setAccessToken(token);
    } else {
      clearAccessToken();
    }
  },
  logout: () => {
    clearAccessToken();
    Cookies.remove('isGlobalAdmin');
    set({
      isGlobalAdmin: null,
      userId: null,
      companyId: null,
      userData: null,
    });
  },
}));
