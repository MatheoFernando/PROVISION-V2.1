"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TypeEquipment } from "@/infrastructure/schema/schema-type-equipment";

interface TypeEquipmentViewProps {
  typeEquipment?: TypeEquipment;
  isOpen: boolean;
  onClose: () => void;
}

export function TypeEquipmentView({ typeEquipment, isOpen, onClose }: TypeEquipmentViewProps) {
  if (!isOpen) return null;
  if (!typeEquipment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Tipo de Equipamento</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{typeEquipment.name}</h3>
              <p className="text-muted-foreground">ID: {typeEquipment.id}</p>
            </div>
            <Badge variant="outline">
              Tipo de Equipamento
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
                  <p className="text-sm font-medium text-muted-foreground">Nome</p>
                  <p className="text-base font-semibold">{typeEquipment.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Descrição</p>
                  <p className="text-base">{typeEquipment.description || "Sem descrição"}</p>
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
                  <p className="text-base">{new Date(typeEquipment.createdAt).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Atualizado em</p>
                  <p className="text-base">{new Date(typeEquipment.updatedAt).toLocaleString('pt-BR')}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Identificação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID do Tipo de Equipamento</p>
                  <p className="text-base font-mono">{typeEquipment.id}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
