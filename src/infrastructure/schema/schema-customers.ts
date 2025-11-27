import { z } from "zod";

const phoneNumberSchema = z.object({
  phone: z.string().min(1, "Telefone é obrigatório"),
});

const contactDetailsSchema = z.object({
  id: z.string().optional(),
  email: z.string().optional(),
  phoneNumbers: z
    .array(phoneNumberSchema)
    .min(1, "Informe ao menos um telefone"),
  companyId: z.string().min(1, "Empresa é obrigatória"),
});

const addressDetailsSchema = z.object({
  id: z.string().optional(),
  houseHold: z.string().min(1, "Morada é obrigatória"),
  commune: z.string().min(1, "Comuna é obrigatória"),
  municipality: z.string().min(1, "Município é obrigatório"),
  province: z.string().min(1, "Província é obrigatória"),
  country: z.string().min(1, "País é obrigatório"),
  companyId: z.string().min(1, "Empresa é obrigatória"),
});

const grossCustomerDetailsSchema = z.object({
  cod: z.string().min(1, "Código é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  taxName: z.string().min(1, "Nome fiscal é obrigatório"),
  nif: z.string().min(14, "NIF deve ter pelo menos 14 caracteres"),
  photo: z.string().optional().default(""),
  companyId: z.string().min(1, "Empresa é obrigatória"),
});

export const createCustomerSchema = z.object({
  cod: z.string().min(1, "Código é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  taxName: z.string().min(1, "Nome fiscal é obrigatório"),
  nif: z.string().min(14, "NIF deve ter pelo menos 14 caracteres"),
  photo: z.string().optional().default(""),
  contactId: z.string().optional(),
  addressId: z.string().optional(),
  companyId: z.string().min(1, "Empresa é obrigatória"),

});

export const createGrossCustomerSchema = grossCustomerDetailsSchema.extend({
  customer: grossCustomerDetailsSchema,
  contact: contactDetailsSchema,
  address: addressDetailsSchema,
});

export type CreateCustomerPayload = z.infer<typeof createCustomerSchema>;
export type CreateGrossCustomerPayload = z.infer<typeof createGrossCustomerSchema>;
