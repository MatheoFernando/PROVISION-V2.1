import { z } from "zod";

export const createContainerSchema = z.object({
  cod: z.string().min(1, "Código é obrigatório"),
  capacity: z.number().positive("Capacidade deve ser positiva"),
  companyId: z.string(),
  name: z.string().min(1, "Nome é obrigatório"),
});

