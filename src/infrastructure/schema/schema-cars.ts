import { z } from "zod";

export const carSchema = z.object({
  id: z.string(),
  cod: z.string().min(1, "Código é obrigatório"),
  mark: z.string().min(1, "Marca é obrigatória"),
  capacity: z.number().positive("Capacidade deve ser positiva"),
  containerId: z.string(),
  status: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  companyId: z.string(),
  geoLocationEntityId: z.string(),
});

export const createCarSchema = carSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCarSchema = createCarSchema.partial();

export type Car = z.infer<typeof carSchema>;
export type CreateCar = z.infer<typeof createCarSchema>;
export type UpdateCar = z.infer<typeof updateCarSchema>;

export const defaultCars: Car[] = [
  {
    id: "1",
    cod: "1234567890",
    mark: "Marca 1",
    capacity: 1000,
    containerId: "1",
    status: true,
    companyId: "1",
    geoLocationEntityId: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    cod: "0987654321",
    mark: "Marca 2",
    capacity: 2000,
    containerId: "2",
    status: false,
    companyId: "1",
    geoLocationEntityId: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];