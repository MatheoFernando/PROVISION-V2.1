import { z } from "zod";

export const createContainerSchema = z.object({
  cod: z.string().min(1, "Código é obrigatório"),
  mark: z.string().min(1, "Marca é obrigatória"),
  model: z.string().min(1, "Modelo é obrigatório"),
  capacity: z.number().positive("Capacidade deve ser positiva"),
  containerId: z.string().optional(),
  status: z.boolean(),
  companyId: z.string(),
  geoLocationEntityId: z.string(),
});

