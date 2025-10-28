import { useMutation } from '@tanstack/react-query';
import { changePassword, ChangePasswordRequest, ChangePasswordEnvelope } from '@/infrastructure/adapters/auth';

export function useChangePasswordMutation() {
  return useMutation<ChangePasswordEnvelope, Error, ChangePasswordRequest>({
    mutationFn: (payload) => changePassword(payload),
  });
}
