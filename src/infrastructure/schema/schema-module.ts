import { z } from "zod";

export const moduleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string(),
  status: z.boolean(),
  companyName: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type ModuleSchema = z.infer<typeof moduleSchema>;

export const modulesListSchema = z.array(moduleSchema);

