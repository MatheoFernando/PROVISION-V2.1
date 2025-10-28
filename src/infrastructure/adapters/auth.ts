import api, { setAccessToken } from '@/infrastructure/utils/api';
import { useAuthStore } from '@/infrastructure/hooks/useAuthStore';

export type LoginRequest = {
  phone: string;
  password: string;
};

export type LoginData = {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: {
    id: string;
    phone: string;
    status: boolean;
    companyId: string;
    isGlobalAdmin: boolean;
  };
};

export type LoginEnvelope = {
  data: LoginData;
  success: boolean;
};

export async function login(request: LoginRequest): Promise<LoginEnvelope> {
  const { data } = await api.post<LoginEnvelope>('/authentication/login', request);
  if (data?.data?.accessToken) {
    setAccessToken(data.data.accessToken);
    
      try {
        const user = data?.data?.user;
        const payload = {
          isGlobalAdmin: Boolean(user?.isGlobalAdmin),
        };
        window.localStorage.setItem('user', JSON.stringify(payload));
        
        // Atualizar o store
        useAuthStore.getState().setIsGlobalAdmin(Boolean(user?.isGlobalAdmin));
      } catch {
        // ignore storage errors
      }
    }
 
  return data;
}

export interface ChangePasswordRequest {
  phone: string;
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordEnvelope {
  success: boolean;
  message?: string;
}

export async function changePassword(request: ChangePasswordRequest): Promise<ChangePasswordEnvelope> {
  const { data } = await api.post<ChangePasswordEnvelope>('/authentication/change-password', request);
  return data;
}


