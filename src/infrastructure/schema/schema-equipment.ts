import { z } from "zod";

export const createEquipmentSchema = z.object({
  serialNumber: z.string().min(1, "Número de série é obrigatório"),
  status: z.boolean(),
  mark: z.string().min(1, "Marca é obrigatória"),
  model: z.string().min(1, "Modelo é obrigatório"),
  siteId: z.string(),
  typeEquipmentId: z.string(),
  companyId: z.string(),
  sitesId: z.string(),
});