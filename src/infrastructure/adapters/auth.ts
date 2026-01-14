import api, { setAccessToken } from '@/infrastructure/utils/api';
import Cookies from 'js-cookie';
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
  statusCode?: number;
};

export async function login(request: LoginRequest): Promise<LoginEnvelope> {
  const { data } = await api.post<LoginEnvelope>('/authentication/login', request);
  if (data?.data?.accessToken) {
    setAccessToken(data.data.accessToken);
  }
  if (data?.data?.refreshToken) {
    Cookies.set('refreshToken', data.data.refreshToken);
  }

  if (data?.data?.user) {
    const { id, companyId, isGlobalAdmin } = data.data.user;

    useAuthStore.getState().setSession({
      token: data.data.accessToken,
      userId: id,
      companyId,
      isGlobalAdmin,
    });
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


