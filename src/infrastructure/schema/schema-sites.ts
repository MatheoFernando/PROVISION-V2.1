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
  geoLocationId:  z.string().nullable().optional()
});

export type CreateSite = z.infer<typeof createSiteSchema>;
