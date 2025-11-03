import { z } from "zod";

export const typeEquipmentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  companyId: z.string(),

});

export const createTypeEquipmentSchema = typeEquipmentSchema.pick({
  name: true,
  description: true,
  companyId: true,
});
