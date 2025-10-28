import { z } from 'zod';

export const companyModuleSchema = z.object({
  id: z.string().optional(),
  companyId: z.string().min(1, 'ID da empresa é obrigatório'),
  moduleId: z.string().min(1, 'ID do módulo é obrigatório'),
  isActive: z.boolean().default(true),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const createCompanyModuleSchema = z.object({
  companyId: z.string().min(1, 'ID da empresa é obrigatório'),
  moduleId: z.string().min(1, 'ID do módulo é obrigatório'),
  status: z.boolean(),
});

export const updateCompanyModuleSchema = companyModuleSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export interface CompanyModule extends z.infer<typeof companyModuleSchema> {}
export interface CreateCompanyModule extends z.infer<typeof createCompanyModuleSchema> {}
export interface UpdateCompanyModule extends z.infer<typeof updateCompanyModuleSchema> {}

export interface CompanyModuleWithDetails extends CompanyModule {
  company?: {
    id: string;
    name: string;
    email?: string;
  };
  module?: {
    id: string;
    name: string;
    description?: string;
  };
}


