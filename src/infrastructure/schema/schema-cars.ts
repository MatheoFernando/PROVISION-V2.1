import { z } from "zod";

export const createCarSchema = z.object({
  cod: z.string().min(1, "Código é obrigatório"),
  mark: z.string().min(1, "Marca é obrigatória"),
  capacity: z.number().positive("Capacidade deve ser positiva"),
  containerId: z.string(),
  status: z.boolean(),
  companyId: z.string(),
  geoLocationEntityId: z.string(),
});