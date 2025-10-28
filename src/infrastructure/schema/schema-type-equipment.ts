import { z } from "zod";

export const typeEquipmentSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  companyId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createTypeEquipmentSchema = typeEquipmentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateTypeEquipmentSchema = createTypeEquipmentSchema.partial();

export type TypeEquipment = z.infer<typeof typeEquipmentSchema>;
export type CreateTypeEquipment = z.infer<typeof createTypeEquipmentSchema>;
export type UpdateTypeEquipment = z.infer<typeof updateTypeEquipmentSchema>;

export const defaultTypeEquipments: TypeEquipment[] = [
  {
    id: "1",
    name: 'Equipamento de Rede',
    description: 'Equipamento de rede para a empresa',
    companyId: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: 'Equipamento de Telecomunicações',
    description: 'Equipamento de telecomunicações para a empresa',
    companyId: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: 'Equipamento de Segurança',
    description: 'Equipamento de segurança para a empresa',
    companyId: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
