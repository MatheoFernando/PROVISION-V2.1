import { z } from "zod";

export const permissionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  companyId: z.string().min(1, "Empresa é obrigatória"),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createPermissionSchema = permissionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updatePermissionSchema = createPermissionSchema.partial();

export interface Permission extends z.infer<typeof permissionSchema> {}
export interface CreatePermission extends z.infer<typeof createPermissionSchema> {}
export interface UpdatePermission extends z.infer<typeof updatePermissionSchema> {}

export const PERMISSIONS = [
  {
    id: "read",
    name: "Ler",
    description: "Visualizar dados",
  },
  {
    id: "write",
    name: "Escrever",
    description: "Criar e editar dados",
  },
  {
    id: "delete",
    name: "Excluir",
    description: "Remover dados",
  },
  {
    id: "manage_users",
    name: "Gerenciar Utilizadores",
    description: "Criar, editar e excluir utilizadores",
  },
  {
    id: "manage_roles",
    name: "Gerenciar Papéis",
    description: "Criar, editar e excluir papéis",
  },
  {
    id: "manage_team",
    name: "Gerenciar Equipe",
    description: "Gerenciar membros da equipe",
  },
] as const;



