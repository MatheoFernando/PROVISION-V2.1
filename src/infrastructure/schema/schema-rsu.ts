import { z } from "zod";

export const rsuSchema = z.object({
  id: z.string().optional(),
  cod: z.string().min(1, "Código é obrigatório"),
  containerId: z.string().min(1, "Contentor é obrigatório"),
  companyId: z.string().min(1, "Empresa é obrigatória"),
  quantity: z.number().nonnegative("Quantidade deve ser positiva"),
  comment: z.string().optional(),
  dataStart: z.string().optional(),
  clientTime: z.string().optional(),
  employeeId: z.string().min(1, "Funcionário é obrigatório"),
  siteId: z.string().min(1, "Site é obrigatório"),
  status: z.string().min(1, "Estado é obrigatório"),
  carId: z.string().min(1, "Viatura é obrigatória"),
  customerSignature: z.string().min(1, "Assinatura é obrigatória"),
});

