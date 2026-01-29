import { z } from "zod";



export const departmentSchema = z.object({
  id: z.string().optional(),
  cod: z.string().optional(), // Optional in schema for partial updates, but backend might strictly require it for create
  name: z.string().min(1, "Nome é obrigatório"),
  companyId: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const departmentsSchema = z.array(departmentSchema);

export interface DepartmentEntity extends z.infer<typeof departmentSchema> {}


