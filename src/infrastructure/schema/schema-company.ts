import { z } from "zod";

const addressSchema = z.object({
  houseHold: z.string().min(1, "Endereço é obrigatório"),
  commune: z.string().optional(),
  municipality: z.string().optional(),
  province: z.string().optional(),
  country: z.string().optional(),
});

const contactSchema = z.object({
  email: z
    .union([z.string().trim().email(), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  phoneNumbers: z
    .array(
      z
        .object({
          phone: z.string().min(9, "Telefone é obrigatório").regex(/^\d+$/, "Telefone deve conter apenas números"),
        })
        .or(z.object({ phone: z.literal("") }))
    )
    .optional()
    .transform((arr) => (arr ? arr.filter((p) => p.phone !== "") : undefined)),
});

export const companySchema = z.object({
  id: z.string().optional(),
  cod: z.string(),
  taxName: z.string().min(1, "Nome fiscal é obrigatório"),
  businessName: z.string().min(1, "Nome empresarial é obrigatório"),
  nif: z.string().min(9, "NIF deve ter pelo menos 9 caracteres"),
  photo: z.string().optional(),
  status: z.boolean().default(true),
  hasExistedSince: z.string().min(1, "Data de existência é obrigatória"),
  contactId: z.string().optional(),
  addressId: z.string().optional(),
  address: addressSchema,
  contact: contactSchema,
});




