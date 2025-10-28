"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createSiteSchema, CreateSite } from "@/infrastructure/schema/schema-sites";
import { useCreateSite, useUpdateSite } from "@/infrastructure/hooks/useSites";
import { toast } from "sonner";

interface SitesCreateProps {
  site?: any;
  isOpen: boolean;
  onClose: () => void;
}

export function SitesCreate({ site, isOpen, onClose }: SitesCreateProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createSite = useCreateSite();
  const updateSite = useUpdateSite();

  const form = useForm<CreateSite>({
    resolver: zodResolver(createSiteSchema),
    defaultValues: site || {
      cod: "",
      name: "",
      numberWorkersContract: 0,
      customerId: "",
      areaId: "",
      contactId: "",
      addressId: "",
      sectorId: "",
      status: true,
      siteEntityId: "",
      geoLocationEntityId: "",
    },
  });

  const onSubmit = async (data: CreateSite) => {
    try {
      setIsSubmitting(true);
      
      if (site) {
        await updateSite.mutateAsync({ id: site.id, data });
        toast.success("Site atualizado com sucesso!");
      } else {
        await createSite.mutateAsync(data);
        toast.success("Site criado com sucesso!");
      }
      
      onClose();
      form.reset();
    } catch (error) {
      toast.error("Erro ao salvar site");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {site ? "Editar Site" : "Novo Site"}
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
              <Label htmlFor="numberWorkersContract">Número de Trabalhadores *</Label>
              <Input
                id="numberWorkersContract"
                type="number"
                {...form.register("numberWorkersContract", { valueAsNumber: true })}
                placeholder="Digite o número de trabalhadores"
              />
              {form.formState.errors.numberWorkersContract && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.numberWorkersContract.message}
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
              <Label htmlFor="customerId">ID do Cliente *</Label>
              <Input
                id="customerId"
                {...form.register("customerId")}
                placeholder="Digite o ID do cliente"
              />
              {form.formState.errors.customerId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.customerId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="areaId">ID da Área *</Label>
              <Input
                id="areaId"
                {...form.register("areaId")}
                placeholder="Digite o ID da área"
              />
              {form.formState.errors.areaId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.areaId.message}
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
              <Label htmlFor="sectorId">ID do Setor *</Label>
              <Input
                id="sectorId"
                {...form.register("sectorId")}
                placeholder="Digite o ID do setor"
              />
              {form.formState.errors.sectorId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.sectorId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteEntityId">ID do Site *</Label>
              <Input
                id="siteEntityId"
                {...form.register("siteEntityId")}
                placeholder="Digite o ID do site"
              />
              {form.formState.errors.siteEntityId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.siteEntityId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="geoLocationEntityId">ID da Localização Geográfica *</Label>
              <Input
                id="geoLocationEntityId"
                {...form.register("geoLocationEntityId")}
                placeholder="Digite o ID da localização"
              />
              {form.formState.errors.geoLocationEntityId && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.geoLocationEntityId.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : site ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

