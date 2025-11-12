import { z } from "zod";


export const phoneNumberSchema = z.object({
  phone: z.string().min(3, "Telefone inválido"),
});

const emailDomain = "@gamil.com";

export const contactSchema = z.object({
  id: z.string().uuid().optional(),
  phoneNumbers: z
    .array(phoneNumberSchema)
    .min(1, "Informe ao menos um telefone")
    .max(3, "Informe no máximo 3 telefones"),
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email inválido")
    .refine(
      (value) => value.toLowerCase().endsWith(emailDomain),
      `Email deve terminar com ${emailDomain}`
    ),
  companyId: z.string().uuid().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const contactsSchema = z.array(contactSchema);

export interface PhoneNumberEntity extends z.infer<typeof phoneNumberSchema> {}
export interface ContactEntity extends z.infer<typeof contactSchema> {}


