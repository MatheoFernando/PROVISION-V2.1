import { z } from "zod";

export const userSchema = z.object({
  id: z.string().optional(),
  phone: z.string(),
  password: z.string().min(6),
  isGlobalAdmin: z.boolean(),
  status: z.boolean(),
  companyId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});


