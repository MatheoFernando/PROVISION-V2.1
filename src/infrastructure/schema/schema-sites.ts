import { z } from "zod";

export const createSiteSchema = z.object({
  cod: z.string().min(1, "Código é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  numberWorkersContract: z
    .number()
    .int("Informe um número inteiro")
    .nonnegative("Deve ser zero ou positivo"),
  customerId: z.string().min(1, "Cliente é obrigatório"),
  areaId: z.string().min(1, "Área é obrigatória"),
  contactId: z.string().min(1, "Contato é obrigatório"),
  addressId: z.string().min(1, "Endereço é obrigatório"),
  sectorId: z.string().min(1, "Setor é obrigatório"),
  zoneId: z.string().default(""),
  companyId: z.string().default(""),
  geoLocationId: z.string().nullable().optional(),
});

const grossSiteContactSchema = z.object({
  phoneNumbers: z
    .array(
      z.object({
        phone: z.string().min(1, "Telefone é obrigatório"),
      }),
    )
    .optional(),
  email: z.string().optional(),
  companyId: z.string().min(1, "Empresa do contato é obrigatória"),
});

const grossSiteAddressSchema = z.object({
  houseHold: z.string().min(1, "Morada é obrigatória"),
  commune: z.string().min(1, "Comuna é obrigatória"),
  municipality: z.string().min(1, "Município é obrigatório"),
  province: z.string().min(1, "Província é obrigatória"),
  country: z.string().min(1, "País é obrigatório"),
  companyId: z.string().min(1, "Empresa do endereço é obrigatória"),
});

const grossSiteCoreSchema = z.object({
  cod: z.string().min(1, "Código é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  numberWorkersContract: z.number().nonnegative("Informe um número válido"),
  companyId: z.string().min(1, "Empresa é obrigatória"),
});

export const createGrossSiteSchema = grossSiteCoreSchema.extend({
  nameArea: z.string().min(1, "Área é obrigatória"),
  codCustomer: z.string().min(1, "Código do cliente é obrigatório"),
  contact: grossSiteContactSchema,
  address: grossSiteAddressSchema,
  nameZone: z.string().min(1, "Zona é obrigatória"),
  nameSector: z.string().min(1, "Setor é obrigatório"),
});

export type CreateSite = z.infer<typeof createSiteSchema>;
export type CreateGrossSitePayload = z.infer<typeof createGrossSiteSchema>;
