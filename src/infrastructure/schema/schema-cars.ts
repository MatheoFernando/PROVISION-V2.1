import { z } from "zod";

export const createCarSchema = z.object({
  cod: z.string().min(1, "Código é obrigatório"),
  mark: z.string().min(1, "Marca é obrigatória"),
  capacity: z.coerce.number().min(1, "Capacidade é obrigatória"),
  companyId: z.string(),
  model: z.string().min(1, "Modelo é obrigatório"),
  geoLocationId: z.string().optional().nullable(),
});

export const createGrossCarSchema = z.object({
  cod: z.string().min(1, "Código é obrigatório"),
  mark: z.string().min(1, "Marca é obrigatória"),
  model: z.string().min(1, "Modelo é obrigatório"),
  capacity: z
    .number({
      error: "Capacidade é obrigatória",
    })
    .nonnegative("Capacidade deve ser positiva"),
});

export type CreateGrossCarPayload = z.infer<typeof createGrossCarSchema>;