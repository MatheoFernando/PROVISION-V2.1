import { z } from "zod";


export const phoneNumberSchema = z.object({
  phone: z.string().min(3, "Telefone inválido"),
});

export const contactSchema = z.object({
  id: z.string().uuid().optional(),
  phoneNumbers: z.array(phoneNumberSchema).nonempty("Informe ao menos um telefone"),
  email: z.string().min(1, "Email é obrigatório"),
  companyId: z.string().uuid().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const contactsSchema = z.array(contactSchema);

export interface PhoneNumberEntity extends z.infer<typeof phoneNumberSchema> {}
export interface ContactEntity extends z.infer<typeof contactSchema> {}


