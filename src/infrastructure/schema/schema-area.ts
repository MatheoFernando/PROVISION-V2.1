import { z } from "zod";

export const areaSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  employeeId: z.string().min(1, "Funcionário é obrigatório"),
  companyId: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const areasSchema = z.array(areaSchema);

export interface AreaEntity extends z.infer<typeof areaSchema> {}


