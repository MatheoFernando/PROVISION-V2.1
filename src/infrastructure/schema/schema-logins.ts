import { z } from 'zod';

export const loginSchema = z.object({
  phone: z.string().min(9, { message: 'Telefone é obrigatório' }).regex(/^\d+$/, { message: 'Telefone deve conter apenas números' }),
  password: z.string().min(1, { message: 'Senha é obrigatória' }).min(6, { message: 'Senha muito curta' })
});
export interface LoginSchema extends z.infer<typeof loginSchema> {}

export const changePasswordSchema = z.object({
  phone: z
    .string()
    .min(7, "Telefone inválido")
    .max(20, "Telefone inválido"),
  currentPassword: z.string().min(6, "Senha atual muito curta"),
  newPassword: z
    .string()
    .min(6, "Nova senha muito curta")
    .refine((val) => /[A-Za-z]/.test(val) && /\d/.test(val), {
      message: "A nova senha deve conter letras e números",
    }),
});

export interface ChangePasswordSchema extends z.infer<typeof changePasswordSchema> {}




