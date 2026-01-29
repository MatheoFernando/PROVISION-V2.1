import { z } from "zod";

const baseUserSchema = z.object({
  id: z.string().optional(),
  phone: z.string(),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }).optional(),
  isGlobalAdmin: z.boolean(),
  isAdmin: z.boolean(),
  status: z.boolean(),
  companyId: z.string().optional(),
  departmentId: z.string().optional(),
  roleId: z.string().optional(),
  employeeId: z.string().optional(),
  customerId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const userSchema = baseUserSchema;
