"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createEquipmentSchema } from "@/infrastructure/schema/schema-equipment";
import { Equipment } from "@/types/domain";
import { useCreateEquipment, useUpdateEquipment } from "@/infrastructure/hooks/useEquipment";
import { useTypeEquipment } from "@/infrastructure/hooks/useTypeEquipment";
import { useSites } from "@/infrastructure/hooks/useSites";
import { toast } from "sonner";

interface EquipmentCreateProps {
  equipment?: any;
  isOpen: boolean;
  onClose: () => void;
}

export function EquipmentCreate({ equipment, isOpen, onClose }: EquipmentCreateProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createEquipment = useCreateEquipment();
  const updateEquipment = useUpdateEquipment();
  const { data: typeEquipment = [] } = useTypeEquipment();
  const { data: sites = [] } = useSites();

  const form = useForm<Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>>({
    resolver: zodResolver(createEquipmentSchema),
    defaultValues: equipment || {
      serialNumber: "",
      status: "active",
      mark: "",
      model: "",
      siteId: "",
      typeEquipmentId: "",
      companyId: "",
      sitesId: "",
    },
  });

  const onSubmit = async (data: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsSubmitting(true);
      
      if (equipment) {
        await updateEquipment.mutateAsync({ id: equipment.id, data });
        toast.success("Equipamento atualizado com sucesso!");
      } else {
        await createEquipment.mutateAsync(data);
        toast.success("Equipamento criado com sucesso!");
      }
      
      onClose();
      form.reset();
    } catch (error) {
      toast.error("Erro ao salvar equipamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {equipment ? "Editar Equipamento" : "Novo Equipamento"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Número de Série *</Label>
              <Input
                id="serialNumber"
                {...form.register("serialNumber")}
                placeholder="Digite o número de série"
              />
              {form.formState.errors.serialNumber && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.serialNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) => form.setValue("status", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                  <SelectItem value="retired">Aposentado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mark">Marca *</Label>
              <Input
                id="mark"
                {...form.register("mark")}
                placeholder="Digite a marca"
              />
              {form.formState.errors.mark && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.mark.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Modelo *</Label>
              <Input
                id="model"
                {...form.register("model")}
                placeholder="Digite o modelo"
              />
              {form.formState.errors.model && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.model.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="typeEquipmentId">Tipo de Equipamento *</Label>
              <Select
                value={form.watch("typeEquipmentId")}
                onValueChange={(value) => form.setValue("typeEquipmentId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {typeEquipment.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteId">Site *</Label>
              <Select
                value={form.watch("siteId")}
                onValueChange={(value) => form.setValue("siteId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : equipment ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}



