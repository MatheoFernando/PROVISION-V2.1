import { z } from "zod";

export const createCarSchema = z.object({
  cod: z.string().min(1, "Código é obrigatório"),
  mark: z.string().min(1, "Marca é obrigatória"),
  capacity: z.string().min(1, "Capacidade é obrigatória"),
  companyId: z.string(),
  model:z.string().min(1, "Modelo é obrigatório"),
  geoLocationId: z.string().optional().nullable(),
});