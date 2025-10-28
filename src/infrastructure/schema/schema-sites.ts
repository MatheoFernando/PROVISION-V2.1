import { z } from "zod";

export const siteSchema = z.object({
  id: z.string(),
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
  createdAt: z.date(),
  updatedAt: z.date(),
  companyId: z.string().min(1, "Empresa é obrigatória"),
  siteEntityId: z.string().min(1, "Site é obrigatório"),
  geoLocationEntityId: z.string().min(1, "Localização é obrigatória"),
});

export const createSiteSchema = siteSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateSiteSchema = createSiteSchema.partial();

export type Site = z.infer<typeof siteSchema>;
export type CreateSite = z.infer<typeof createSiteSchema>;
export type UpdateSite = z.infer<typeof updateSiteSchema>;

export const siteTableSchema = siteSchema.pick({
  id: true,
  cod: true,
  name: true,
  numberWorkersContract: true,
  customerId: true,
  contactId: true,
  addressId: true,
  sectorId: true,
  companyId: true,
  areaId: true,
  siteEntityId: true,
  geoLocationEntityId: true,
  status: true,
  zoneId: true,
});

export type SiteTable = z.infer<typeof siteTableSchema>;
export const defaultSites: SiteTable[] = [
  {
    id: "1",
    cod: "1234567890",
    name: "Site 1",
    numberWorkersContract: 10,
    customerId: "1",
    contactId: "1",
    addressId: "1",
    sectorId: "1",
    areaId: "1",
    zoneId: "1",
    siteEntityId: "1",
    geoLocationEntityId: "1",
    status: true,
    companyId: "1",
  },
  {
    id: "2",
    cod: "0987654321",
    name: "Site 2",
    numberWorkersContract: 20,
    customerId: "2",
    contactId: "2",
    addressId: "2",
    siteEntityId: "2",
    geoLocationEntityId: "2",
    sectorId: "2",
    zoneId: "2",
    status: false,
    companyId: "2",
    areaId: "2",
  },
];
