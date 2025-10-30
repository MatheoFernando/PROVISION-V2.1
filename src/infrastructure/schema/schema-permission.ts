import { z } from "zod";

export const createPermissionSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(80, "Máximo 80 caracteres"),
  description: z.string().max(200, "Máximo 200 caracteres").optional().or(z.literal("")),
  companyId: z.string(),
});

export type CreatePermissionForm = z.infer<typeof createPermissionSchema>;

