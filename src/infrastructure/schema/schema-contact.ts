import { z } from "zod";


export const phoneNumberSchema = z.object({
  phone: z.string().min(3, "Telefone inválido"),
});


export const contactSchema = z.object({
  id: z.string().optional(),
  phoneNumbers: z
    .array(phoneNumberSchema)
    .min(1, "Informe ao menos um telefone")
    .max(3, "Informe no máximo 3 telefones"),
  email: z
    .string()
    .min(1, "Email é obrigatório"),
  companyId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const contactsSchema = z.array(contactSchema);

export interface PhoneNumberEntity extends z.infer<typeof phoneNumberSchema> {}
export interface ContactEntity extends z.infer<typeof contactSchema> {}


