import { z } from "zod";


export const sectorSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  employeeId: z.string().optional(),
  zoneId: z.string(),
  companyId: z.string(),

});

export const sectorsSchema = z.array(sectorSchema);

export interface SectorEntity extends z.infer<typeof sectorSchema> {}


