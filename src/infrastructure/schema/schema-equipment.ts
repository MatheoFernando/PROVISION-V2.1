import { z } from "zod";

export const createEquipmentSchema = z.object({
  cod: z.string().min(1, "Código é obrigatório"),
  serialNumber: z.string().min(1, "Número de série é obrigatório"),
  mark: z.string().min(1, "Marca é obrigatória"),
  model: z.string().min(1, "Modelo é obrigatório"),
  status: z.boolean(),
  siteId: z.string(),
  typeEquipmentId: z.string(),
  companyId: z.string(),
});