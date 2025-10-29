import { z } from "zod";

export interface AuthCredentials {
  phone: string;
  password: string;
}

export interface AuthResponse {
  id: string;
  phone: string;
  status: boolean;
  role: string;
  permissions: string[];
  companyId: string;
  isGlobalAdmin: boolean;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export const authCredentialsSchema = z.object({
  phone: z
    .string()
    .min(9, { message: "Telefone é obrigatório" })
    .regex(/^\d+$/, { message: "Telefone deve conter apenas números" }),
  password: z.string().min(6, { message: "Senha muito curta" }),
});

export const authResponseSchema = z.object({
  id: z.string().uuid(),
  phone: z.string(),
  status: z.boolean(),
  role: z.string(),
  permissions: z.array(z.string()),
  companyId: z.string().uuid(),
  isGlobalAdmin: z.boolean(),
});

export const changePasswordRequestSchema = z.object({
  oldPassword: z.string().min(6, "Senha atual muito curta"),
  newPassword: z
    .string()
    .min(6, "Nova senha muito curta")
    .refine((val) => /[A-Za-z]/.test(val) && /\d/.test(val), {
      message: "A nova senha deve conter letras e números",
    }),
});

export interface AuthCredentialsEntity extends z.infer<typeof authCredentialsSchema> {}
export interface AuthResponseEntity extends z.infer<typeof authResponseSchema> {}
export interface ChangePasswordRequestEntity extends z.infer<typeof changePasswordRequestSchema> {}



