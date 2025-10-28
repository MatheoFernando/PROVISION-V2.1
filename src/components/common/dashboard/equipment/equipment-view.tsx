"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Equipment } from "@/infrastructure/schema/schema-equipment";

interface EquipmentViewProps {
  equipment?: Equipment;
  isOpen: boolean;
  onClose: () => void;
}

export function EquipmentView({ equipment, isOpen, onClose }: EquipmentViewProps) {
  if (!isOpen) return null;
  if (!equipment) return null;

  const getStatusColor = (status: boolean) => {
    return status ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: boolean) => {
    return status ? "Ativo" : "Inativo";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Equipamento</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{equipment.mark} {equipment.model}</h3>
              <p className="text-muted-foreground">Série: {equipment.serialNumber}</p>
            </div>
            <Badge className={getStatusColor(equipment.status)}>
              {getStatusLabel(equipment.status)}
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Número de Série</p>
                  <p className="text-base font-mono">{equipment.serialNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Marca</p>
                  <p className="text-base">{equipment.mark}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Modelo</p>
                  <p className="text-base">{equipment.model}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(equipment.status)}>
                    {getStatusLabel(equipment.status)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações de Localização</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID do Site</p>
                  <p className="text-base">{equipment.siteId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID dos Sites</p>
                  <p className="text-base">{equipment.sitesId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID da Empresa</p>
                  <p className="text-base">{equipment.companyId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID do Tipo de Equipamento</p>
                  <p className="text-base">{equipment.typeEquipmentId}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações de Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Criado em</p>
                  <p className="text-base">{new Date(equipment.createdAt).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Atualizado em</p>
                  <p className="text-base">{new Date(equipment.updatedAt).toLocaleString('pt-BR')}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Identificação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID do Equipamento</p>
                  <p className="text-base font-mono">{equipment.id}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
