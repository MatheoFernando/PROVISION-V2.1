"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createEmployeeSchema, CreateEmployee } from "@/infrastructure/schema/schema-employees";
import { useCreateEmployee, useUpdateEmployee } from "@/infrastructure/hooks/useEmployees";
import { useSites } from "@/infrastructure/hooks/useSites";
import { toast } from "sonner";

interface EmployeesCreateProps {
  employee?: any;
  isOpen: boolean;
  onClose: () => void;
}

export function EmployeesCreate({ employee, isOpen, onClose }: EmployeesCreateProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const { data: sites = [] } = useSites();

  const form = useForm<CreateEmployee>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: employee || {
      companyId: "",
      fullName: "",
      photo: "",
      contactId: "",
      siteId: "",
      sitesId: "",
      departmentId: "",
      userId: "",
      functionEntityId: "",
      rolesEntityId: "",
    },
  });

  const onSubmit = async (data: CreateEmployee) => {
    try {
      setIsSubmitting(true);
      
      if (employee) {
        await updateEmployee.mutateAsync({ id: employee.id, data });
        toast.success("Funcionário atualizado com sucesso!");
      } else {
        await createEmployee.mutateAsync(data);
        toast.success("Funcionário criado com sucesso!");
      }
      
      onClose();
      form.reset();
    } catch (error) {
      toast.error("Erro ao salvar funcionário");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {employee ? "Editar Funcionário" : "Novo Funcionário"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo *</Label>
              <Input
                id="fullName"
                {...form.register("fullName")}
                placeholder="Digite o nome completo"
              />
              {form.formState.errors.fullName && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">URL da Foto</Label>
              <Input
                id="photo"
                {...form.register("photo")}
                placeholder="Digite a URL da foto"
              />
              {form.formState.errors.photo && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.photo.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyId">ID da Empresa *</Label>
              <Input
                id="companyId"
                {...form.register("companyId")}
                placeholder="Digite o ID da empresa"
              />
              {form.formState.errors.companyId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.companyId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactId">ID do Contato *</Label>
              <Input
                id="contactId"
                {...form.register("contactId")}
                placeholder="Digite o ID do contato"
              />
              {form.formState.errors.contactId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.contactId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteId">ID do Site *</Label>
              <Input
                id="siteId"
                {...form.register("siteId")}
                placeholder="Digite o ID do site"
              />
              {form.formState.errors.siteId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.siteId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sitesId">ID dos Sites *</Label>
              <Input
                id="sitesId"
                {...form.register("sitesId")}
                placeholder="Digite o ID dos sites"
              />
              {form.formState.errors.sitesId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.sitesId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="departmentId">ID do Departamento *</Label>
              <Input
                id="departmentId"
                {...form.register("departmentId")}
                placeholder="Digite o ID do departamento"
              />
              {form.formState.errors.departmentId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.departmentId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="userId">ID do Usuário *</Label>
              <Input
                id="userId"
                {...form.register("userId")}
                placeholder="Digite o ID do usuário"
              />
              {form.formState.errors.userId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.userId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="functionEntityId">ID da Função *</Label>
              <Input
                id="functionEntityId"
                {...form.register("functionEntityId")}
                placeholder="Digite o ID da função"
              />
              {form.formState.errors.functionEntityId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.functionEntityId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rolesEntityId">ID do Papel *</Label>
              <Input
                id="rolesEntityId"
                {...form.register("rolesEntityId")}
                placeholder="Digite o ID do papel"
              />
              {form.formState.errors.rolesEntityId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.rolesEntityId.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : employee ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}



