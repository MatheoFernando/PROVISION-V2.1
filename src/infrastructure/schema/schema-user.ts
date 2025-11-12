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

export const userSchema = baseUserSchema.superRefine((data, ctx) => {
  const isCreate = !data.id;
  const hasPassword = Boolean(data.password && data.password.trim().length >= 6);

  if (isCreate && !hasPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["password"],
      message: "Senha é obrigatória para criar utilizador",
    });
  }
});
