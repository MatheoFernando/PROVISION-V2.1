import { z } from "zod";

export const createCustomerSchema = z.object({
  cod: z.string().min(1, "Código é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  taxName: z.string().min(1, "Nome fiscal é obrigatório"),
  nif: z.string().min(9, "NIF deve ter pelo menos 9 caracteres"),
  photo: z.string().optional().default(""),
  contactId: z.string().min(1, "Contato é obrigatório").optional(),
  addressId: z.string().min(1, "Endereço é obrigatório").optional(),
  companyId: z.string().min(1, "Empresa é obrigatória"),
});

export type CreateCustomerPayload = z.infer<typeof createCustomerSchema>;
