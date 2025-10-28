import { z } from "zod";

export const equipmentSchema = z.object({
  id: z.string(),
  serialNumber: z.string().min(1, "Número de série é obrigatório"),
  status: z.boolean(),
  mark: z.string().min(1, "Marca é obrigatória"),
  model: z.string().min(1, "Modelo é obrigatório"),
  siteId: z.string(),
  typeEquipmentId: z.string(),
  companyId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  sitesId: z.string(),
});

export const createEquipmentSchema = equipmentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateEquipmentSchema = createEquipmentSchema.partial();

export type Equipment = z.infer<typeof equipmentSchema>;
export type CreateEquipment = z.infer<typeof createEquipmentSchema>;
export type UpdateEquipment = z.infer<typeof updateEquipmentSchema>;

export const mockEquipments: Equipment[] = [
  {
    id: "1",
    serialNumber: "1234567890",
    status: true,
    mark: "Apple",
    model: "MacBook Pro 2025",
    siteId: "1",
    typeEquipmentId: "1",
    companyId: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
    sitesId: "1",
  },
  {
    id: "2",
    serialNumber: "0987654321",
    status: false,
    mark: "Dell",
    model: "XPS 15",
    siteId: "1",
    typeEquipmentId: "1",
    companyId: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
    sitesId: "1",
  }
 ]