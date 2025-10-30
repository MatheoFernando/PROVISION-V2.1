import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  clearAccessToken,
  setAccessToken,
} from "@/infrastructure/utils/api";

type AuthState = {
  isGlobalAdmin: boolean;
  companyId: string | null;
  setCompanyId: (companyId: string | null) => void;
  setSession: (args: {
    token: string;
    userId: string;
    companyId?: string;
  }) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
};

function readCompanyId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem("companyId");
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isGlobalAdmin: false,
      companyId: readCompanyId(),
      setCompanyId: (companyId) => {
        if (typeof window !== "undefined") {
          if (companyId) window.localStorage.setItem("companyId", companyId);
          else window.localStorage.removeItem("companyId");
        }
        set({ companyId });
      },
      setSession: ({ token, userId, companyId }) => {
        setAccessToken(token);
        if (companyId && typeof window !== "undefined") {
          window.localStorage.setItem("companyId", companyId);
        }
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
      },
    }),
    { name: "auth", storage: undefined }
  )
);
