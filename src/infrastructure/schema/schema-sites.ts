import { z } from "zod";

export const createSiteSchema = z.object({
  cod: z.string().min(1, "Código é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  numberWorkersContract: z.number().int().positive("Número de trabalhadores deve ser positivo"),
  customerId: z.string(),
  areaId: z.string().min(1, "Área é obrigatória"),
  contactId: z.string().min(1, "Contato é obrigatório"),
  addressId: z.string().min(1, "Endereço é obrigatório"),
  sectorId: z.string().min(1, "Setor é obrigatório"),
  zoneId: z.string().min(1, "Zona é obrigatória"),
  status: z.boolean(),
  companyId: z.string().min(1, "Empresa é obrigatória"),
  siteEntityId: z.string().min(1, "Site é obrigatório"),
  geoLocationEntityId: z.string().min(1, "Localização é obrigatória"),
});
