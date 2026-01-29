import { z } from "zod";

export interface AuthCredentials {
  phone: string;
  password: string;
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
  id: z.string(),
  phone: z.string(),
  status: z.boolean(),
  role: z.string(),
  permissions: z.array(z.string()),
  companyId: z.string(),
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

export const meResponseSchema = z.object({
  id: z.string(),
  phone: z.string(),
  status: z.boolean(),
  role: z.string().nullable(),
  companyId: z.string().nullable(),
  isGlobalAdmin: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
  departmentId: z.string().nullable(),
  roleId: z.string().nullable(),
  fullName: z.string().nullable(),
  email: z.string().nullable(),
  companyName: z.string().nullable(),
  departmentName: z.string().nullable(),
  companyStatus: z.boolean().nullable(),
  companyStatusMessage: z.string().nullable(),
  hasCompany: z.boolean(),
  isAdmin: z.boolean(), 
  phoneNumber: z.string().optional(),
  permissions: z.array(z.string()).optional().default([]), 
});

export type MeResponseEntity = z.infer<typeof meResponseSchema>;




