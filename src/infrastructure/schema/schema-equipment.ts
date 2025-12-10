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
  employeeId: z.string().optional(),
});

const statusLiterals = z.union([z.literal("ACTIVE"), z.literal("INACTIVE")]);

export const createGrossEquipmentSchema = z.object({
  cod: z.string().min(1, "Código é obrigatório"),
  serialNumber: z.string().min(1, "Número de série é obrigatório"),
  status: statusLiterals.default("ACTIVE"),
  mark: z.string().min(1, "Marca é obrigatória"),
  model: z.string().min(1, "Modelo é obrigatório"),
  nameSite: z.string().min(1, "Site é obrigatório"),
  nameTypeEquipment: z.string().min(1, "Tipo de equipamento é obrigatório"),

});

export type CreateGrossEquipmentPayload = z.infer<typeof createGrossEquipmentSchema>;