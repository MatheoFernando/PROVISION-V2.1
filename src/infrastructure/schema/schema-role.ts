import { z } from "zod";

export const roleSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
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

export const ROLES = [
  {
    id: "admin",
    name: "Administrador",
    description: "Acesso total ao sistema",
    permissions: ["read", "write", "delete", "manage_users", "manage_roles"],
  },
  {
    id: "manager",
    name: "Gerente",
    description: "Gerenciamento de equipe e projetos",
    permissions: ["read", "write", "manage_team"],
  },
  {
    id: "employee",
    name: "Funcionário",
    description: "Acesso básico ao sistema",
    permissions: ["read"],
  },
] as const;



