import { z } from "zod";

const baseUserSchema = z.object({
  id: z.string().optional(),
  phone: z.string(),
  password: z.string().min(6).optional(),
  isGlobalAdmin: z.boolean(),
  status: z.boolean(),
  companyId: z.string().optional(),
  departmentId: z.string().optional(),
  roleId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const userSchema = baseUserSchema;
