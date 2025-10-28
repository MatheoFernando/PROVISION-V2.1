import { z } from "zod";

export const containerSchema = z.object({
  id: z.string(),
  cod: z.string().min(1, "Código é obrigatório"),
  mark: z.string().min(1, "Marca é obrigatória"),
  model: z.string().min(1, "Modelo é obrigatório"),
  capacity: z.number().positive("Capacidade deve ser positiva"),
  containerId: z.string().optional(),
  status: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  companyId: z.string(),
  geoLocationEntityId: z.string(),
});

export const createContainerSchema = containerSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateContainerSchema = createContainerSchema.partial();

export type Container = z.infer<typeof containerSchema>;
export type CreateContainer = z.infer<typeof createContainerSchema>;
export type UpdateContainer = z.infer<typeof updateContainerSchema>;

export const defaultContainers: Container[] = [
  {
    id: "1",
    cod: "1234567890",
    mark: "Marca 1",
    model: "Modelo 1",
    capacity: 1000,
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    companyId: "1",
    geoLocationEntityId: "1",
    containerId: "1",
  },
  {
    id: "2",
    cod: "0987654321",
    mark: "Marca 2",
    model: "Modelo 2",
    capacity: 2000,
    status: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    companyId: "1",
    geoLocationEntityId: "1",
    containerId: "2",
  },
];

