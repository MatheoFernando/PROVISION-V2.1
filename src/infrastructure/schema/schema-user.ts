import { z } from "zod";

export const userSchema = z.object({
  id: z.string().uuid(),
  phone: z.string(),
  status: z.boolean(),
  companyId: z.string(),
  isGlobalAdmin: z.boolean(),
});

export const usersSchema = z.array(userSchema);

export interface User extends z.infer<typeof userSchema> {}

export const userCreateSchema = z.object({
  phone: z.string().min(9, 'Telefone é obrigatório').regex(/^\d+$/, 'Telefone deve conter apenas números'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  isGlobalAdmin: z.boolean().default(false),
  status: z.boolean().default(true),
});

export interface CreateUserPayload extends z.infer<typeof userCreateSchema> {}

export const userUpdateSchema = userCreateSchema.partial().extend({
  id: z.string().uuid(),
});

export interface UpdateUserPayload extends z.infer<typeof userUpdateSchema> {}
