import { z } from "zod";

export const createContainerSchema = z.object({
  cod: z.string().min(1, "Código é obrigatório"),
  companyId: z.string(),
  name: z.string().min(1, "Nome é obrigatório"),
  capacity: z.coerce.number().optional(),
});

