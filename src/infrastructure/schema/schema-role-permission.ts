import { z } from "zod";

export const rolePermissionSchema = z.object({
  id: z.string(),
  roleId: z.string(),
  permissionId: z.string(),
  companyId: z.string(),
  createdAt: z.string(),
});

export const createRolePermissionSchema = rolePermissionSchema.omit({
  id: true,
  createdAt: true,
});

export interface RolePermission extends z.infer<typeof rolePermissionSchema> {}
export interface CreateRolePermission extends z.infer<typeof createRolePermissionSchema> {}



