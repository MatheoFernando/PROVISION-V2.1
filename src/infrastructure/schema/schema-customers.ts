import { z } from "zod";

export const createCustomerSchema = z.object({
  cod: z.string().min(1, "Código é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  taxName: z.string().min(1, "Nome fiscal é obrigatório"),
  contactId: z.string(),
  addressId: z.string(),
  nif: z.string().min(9, "NIF deve ter pelo menos 9 caracteres"),
  companyId: z.string(),
  status: z.boolean(),
  photo: z.string(),
  Address:z.string()
});

export type CreateCustomerPayload = z.infer<typeof createCustomerSchema>;
