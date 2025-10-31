import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  clearAccessToken,
  setAccessToken,
} from "@/infrastructure/utils/api";
import Cookies from "js-cookie";

interface AuthState {
  isGlobalAdmin: boolean;
  userId: string | null;
  companyId: string | null;
  setCompanyId: (companyId: string | null) => void;
  setIsGlobalAdmin: (isGlobalAdmin: boolean) => void;
  setUserId: (userId: string | null) => void;
  setSession: (args: {
    token: string;
    userId: string;
    companyId?: string;
    isGlobalAdmin: boolean;
  }) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

function readCompanyId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem("companyId");
  } catch {
    return null;
  }
}

function readUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem("userId");
  } catch {
    return null;
  }
}

function readIsGlobalAdmin(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Cookies.get("isGlobalAdmin") === "true";
  } catch {
    return false;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isGlobalAdmin: readIsGlobalAdmin(),
      userId: readUserId(),
      companyId: readCompanyId(),
      setCompanyId: (companyId) => {
        if (typeof window !== "undefined") {
          if (companyId) window.localStorage.setItem("companyId", companyId);
          else window.localStorage.removeItem("companyId");
        }
        set({ companyId });
      },
      setIsGlobalAdmin: (isGlobalAdmin) => {
        Cookies.set("isGlobalAdmin", String(isGlobalAdmin));
        set({ isGlobalAdmin });
      },
      setUserId: (userId) => {
        if (typeof window !== "undefined") {
          if (userId) window.localStorage.setItem("userId", userId);
          else window.localStorage.removeItem("userId");
        }
        set({ userId });
      },
      setSession: ({ token, userId, companyId, isGlobalAdmin }) => {
        setAccessToken(token);
        if (companyId && typeof window !== "undefined") {
          window.localStorage.setItem("companyId", companyId);
        }
        Cookies.set("isGlobalAdmin", String(isGlobalAdmin));
        if (companyId) set({ companyId });
        if (typeof window !== "undefined") {
          window.localStorage.setItem("userId", userId);
        }
        set({ userId, isGlobalAdmin });
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
        if (typeof window !== "undefined")
          window.localStorage.removeItem("companyId");
        if (typeof window !== "undefined")
          window.localStorage.removeItem("userId");
        Cookies.remove("isGlobalAdmin");
        set({ isGlobalAdmin: false, userId: null, companyId: null });
      },
    }),
    { name: "auth", storage: undefined }
  )
);
