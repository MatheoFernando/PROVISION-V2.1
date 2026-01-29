import { create } from "zustand";
import {
  clearAccessToken,
  setAccessToken,
  api,
} from "@/infrastructure/utils/api";
import type { MeResponseEntity } from "@/infrastructure/schema/schema-auth";
import type { RolePermission } from "@/infrastructure/types/domain"; // Import RolePermission
import type { ModuleSchema } from "@/infrastructure/schema/schema-module";
import Cookies from "js-cookie";

interface AuthState {
  isGlobalAdmin: boolean | null;
  isAdmin: boolean | null;
  userId: string | null;
  companyId: string | null;
  userData: MeResponseEntity | null;
  rolePermissions: RolePermission[];
  modules: ModuleSchema[];
  setCompanyId: (companyId: string | null) => void;
  setUserData: (args: {
    userId: string;
    companyId: string | null;
    isGlobalAdmin: boolean;
    isAdmin: boolean;
  }) => void;
  setMeData: (data: MeResponseEntity) => void;
  setSession: (args: {
    token: string;
    userId: string;
    companyId?: string;
    isGlobalAdmin: boolean;
    isAdmin: boolean;
  }) => void;
  setToken: (token: string | null) => void;
  loadRolePermissions: (roleId: string) => Promise<void>;
  setModules: (modules: ModuleSchema[]) => void;
  loadModules: () => Promise<void>;
  logout: () => void;
  canAccess: (module: string, level: number) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isGlobalAdmin: null,
  isAdmin: null,
  userId: null,
  companyId: null,
  userData: null,
  rolePermissions: [],
  modules: [],
  setCompanyId: (companyId) => {
    set({ companyId });
  },
  setUserData: ({ userId, companyId, isGlobalAdmin, isAdmin }) => {
    set({ userId, companyId, isGlobalAdmin, isAdmin });
  },
  setMeData: (data) => {
    const { id, companyId, isGlobalAdmin, isAdmin } = data;
    set({
      userId: id,
      companyId: companyId ?? null,
      isGlobalAdmin,
      isAdmin,
      userData: data,
    });
  },
  setSession: ({ token, userId, companyId, isGlobalAdmin, isAdmin }) => {
    setAccessToken(token);
    set({ userId, companyId: companyId ?? null, isGlobalAdmin, isAdmin });
  },
  setToken: (token) => {
    if (token) {
      setAccessToken(token);
    } else {
      clearAccessToken();
    }
  },
  setModules: (modules) => set({ modules }),
  loadModules: async () => {
    try {
      const { data } = await api.get("/modules/getAll");
      set({ modules: data?.data ?? [] });
    } catch (error) {
      console.error("Failed to load modules", error);
    }
  },
  loadRolePermissions: async (roleId: string) => {
    if (!roleId) return;
    try {
      const { data } = await api.get(`/rolesPermissions/getAllRolePermissionsByRoleId/${roleId}`);
      const permissions = (data?.data ?? data) as RolePermission[];
      set({ rolePermissions: permissions });
    } catch (error) {
      console.error("Failed to load role permissions", error);
      set({ rolePermissions: [] });
    }
  },
  canAccess: (moduleName: string, level: number) => {
    const state = get();
    if (state.isGlobalAdmin || state.isAdmin) return true;

    const permissions = state.rolePermissions;
    if (!permissions || permissions.length === 0) return false;

    const targetModule = state.modules.find(m => m.name.toLowerCase() === moduleName.toLowerCase());
    if (!targetModule?.id) return false;

    if (targetModule.status !== true) return false;

    const permission = permissions.find(p => p.moduleId === targetModule.id);
    if (!permission) return false;

    return permission.permissionLevel >= level;
  },
  logout: () => {
    clearAccessToken();
    Cookies.remove('isGlobalAdmin');
    set({
      isGlobalAdmin: null,
      isAdmin: null,
      userId: null,
      companyId: null,
      userData: null,
      rolePermissions: [],
      modules: [],
    });
  },
}));
