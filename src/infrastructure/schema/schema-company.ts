import { z } from "zod";

export const companySchema = z.object({
  id: z.string().uuid(),
  cod: z.string(),
  taxName: z.string(),
  businessName: z.string(),
  nif: z.string(),
  photo: z.string().nullable().optional(),
  status: z.boolean(),
  email: z.string().email().optional().nullable(),
  country: z.string().optional().nullable(),
  municipality: z.string().optional().nullable(),
  userCount: z.number().optional(),
  createdAt: z.string().optional(),
});

export const companiesSchema = z.array(companySchema);

export interface Company extends z.infer<typeof companySchema> {}

export const companyCreateSchema = z.object({
  cod: z.string().min(1, 'Código é obrigatório'),
  taxName: z.string().min(1, 'Nome fiscal é obrigatório'),
  businessName: z.string().min(1, 'Nome da empresa é obrigatória'),
  nif: z.string().min(1, 'NIF é obrigatório'),
  photo: z.string().url('URL inválida').optional().nullable(),
  status: z.boolean(),
  address: z
    .object({
      houseHold: z.string().min(1, 'Endereço é obrigatório'),
      commune: z.string().min(1, 'Comuna é obrigatória'),
      municipality: z.string().min(1, 'Município é obrigatório'),
      province: z.string().min(1, 'Província é obrigatória'),
      country: z.string().min(1, 'País é obrigatório'),
    })
    .optional(),
  contact: z
    .object({
      phoneNumbers: z
        .array(
          z.object({
            phone: z.string().min(3, 'Telefone inválido'),
          })
        )
        .nonempty('Informe ao menos um telefone'),
      email: z.string().email('Email inválido').optional(),
    })
    .optional(),
});

export interface CreateCompanyPayload extends z.infer<typeof companyCreateSchema> {}

export const companyUpdateSchema = z.object({
  id: z.string().uuid(),
  taxName: z.string().min(1, 'Nome fiscal é obrigatório'),
  businessName: z.string().min(1, 'Razão social é obrigatória'),
  nif: z.string().min(1, 'NIF é obrigatório'),
  photo: z.string().url('URL inválida').optional().nullable(),
  contactId: z.string().uuid().optional(),
  addressId: z.string().uuid().optional(),
  status: z.boolean(),
  hasExistedSince: z.string().datetime().optional(),
});

export interface UpdateCompanyPayload extends z.infer<typeof companyUpdateSchema> {}

export const companyUpsertSchema = companyCreateSchema
  .extend({
    id: z.string().uuid().optional(),
    contactId: z.string().uuid().optional(),
    addressId: z.string().uuid().optional(),
    hasExistedSince: z.string().datetime().optional(),
  })
  .partial({
    contact: true,
    address: true,
  })

export interface UpsertCompanyFormData extends z.infer<typeof companyUpsertSchema> {}



