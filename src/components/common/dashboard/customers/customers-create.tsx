"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createCustomerSchema, Customer } from "@/infrastructure/schema/schema-customers";
import { useCreateCustomer, useUpdateCustomer } from "@/infrastructure/hooks/useCustomers";
import { toast } from "sonner";

interface CustomersCreateProps {
  customer?: any;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomersCreate({ customer, isOpen, onClose }: CustomersCreateProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  const form = useForm<CreateCustomer>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: customer || {
      cod: "",
      name: "",
      taxName: "",
      contactId: "",
      addressId: "",
      nif: "",
      companyId: "",
      status: true,
      photo: "",
    },
  });

  const onSubmit = async (data: CreateCustomer) => {
    try {
      setIsSubmitting(true);
      
      if (customer) {
        await updateCustomer.mutateAsync({ id: customer.id, data });
        toast.success("Cliente atualizado com sucesso!");
      } else {
        await createCustomer.mutateAsync(data);
        toast.success("Cliente criado com sucesso!");
      }
      
      onClose();
      form.reset();
    } catch (error) {
      toast.error("Erro ao salvar cliente");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {customer ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cod">Código *</Label>
              <Input
                id="cod"
                {...form.register("cod")}
                placeholder="Digite o código"
              />
              {form.formState.errors.cod && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.cod.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Digite o nome"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxName">Nome Fiscal *</Label>
              <Input
                id="taxName"
                {...form.register("taxName")}
                placeholder="Digite o nome fiscal"
              />
              {form.formState.errors.taxName && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.taxName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nif">NIF *</Label>
              <Input
                id="nif"
                {...form.register("nif")}
                placeholder="Digite o NIF"
              />
              {form.formState.errors.nif && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.nif.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="status"
                  checked={form.watch("status")}
                  onCheckedChange={(checked) => form.setValue("status", checked)}
                />
                <Label htmlFor="status" className="cursor-pointer">
                  {form.watch("status") ? "Ativo" : "Inativo"}
                </Label>
              </div>
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
              <Label htmlFor="addressId">ID do Endereço *</Label>
              <Input
                id="addressId"
                {...form.register("addressId")}
                placeholder="Digite o ID do endereço"
              />
              {form.formState.errors.addressId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.addressId.message}
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
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : customer ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
