import { z } from "zod";

export const areaSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  employeeId: z.string().optional(),
  companyId: z.string(),

});

export const areasSchema = z.array(areaSchema);

export interface AreaEntity extends z.infer<typeof areaSchema> {}


