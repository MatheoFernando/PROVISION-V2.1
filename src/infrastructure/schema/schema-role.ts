import { z } from "zod";

export const roleSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  departmentId: z.string().optional(),
  companyId: z.string().min(1, "Empresa é obrigatória"),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createRoleSchema = roleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateRoleSchema = createRoleSchema.partial();

export interface Role extends z.infer<typeof roleSchema> {}
export interface CreateRole extends z.infer<typeof createRoleSchema> {}
export interface UpdateRole extends z.infer<typeof updateRoleSchema> {}



