import { z } from "zod";

export const zoneSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  employeeId: z.string().optional(),
  companyId: z.string(),
  areaId: z.string(),

});

export const zonesSchema = z.array(zoneSchema);

export interface ZoneEntity extends z.infer<typeof zoneSchema> {}


