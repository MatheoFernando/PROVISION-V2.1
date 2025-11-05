import { z } from "zod";

export const zoneSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  employeeId: z.string().min(1, "Funcionário é obrigatório"),
  companyId: z.string(),
  areaId: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const zonesSchema = z.array(zoneSchema);

export interface ZoneEntity extends z.infer<typeof zoneSchema> {}


