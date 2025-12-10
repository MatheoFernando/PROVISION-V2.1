import { z } from "zod";

export const sectorSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Nome é obrigatório"),
    employeeId: z.string().optional(),
    companyId: z.string(),
    zoneId: z.string(),
});

export const sectorsSchema = z.array(sectorSchema);

export type SectorEntity = z.infer<typeof sectorSchema>;
