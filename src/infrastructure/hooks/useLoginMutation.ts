import { useMutation } from '@tanstack/react-query';
import { login, LoginRequest, LoginEnvelope } from '@/infrastructure/adapters/auth';

export function useLoginMutation() {
  return useMutation<LoginEnvelope, Error, LoginRequest>({
    mutationFn: (payload) => login(payload),
  });
}


