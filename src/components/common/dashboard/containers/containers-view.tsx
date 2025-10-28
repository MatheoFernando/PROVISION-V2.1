"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Container } from "@/infrastructure/schema/schema-containers";

interface ContainersViewProps {
  container?: Container;
  isOpen: boolean;
  onClose: () => void;
}

export function ContainersView({ container, isOpen, onClose }: ContainersViewProps) {
  if (!isOpen) return null;
  if (!container) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Container</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{container.mark} {container.model}</h3>
              <p className="text-muted-foreground">Código: {container.cod}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant={container.status ? "default" : "secondary"}>
                {container.status ? "Ativo" : "Inativo"}
              </Badge>
              <Badge variant="outline">
                {container.capacity}L
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Código</p>
                  <p className="text-base font-mono">{container.cod}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Marca</p>
                  <p className="text-base font-semibold">{container.mark}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Modelo</p>
                  <p className="text-base font-semibold">{container.model}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Capacidade</p>
                  <p className="text-base font-semibold text-blue-600">{container.capacity} Litros</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={container.status ? "default" : "secondary"}>
                    {container.status ? "Ativo" : "Inativo"}
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
                  <p className="text-sm font-medium text-muted-foreground">ID da Localização Geográfica</p>
                  <p className="text-base">{container.geoLocationEntityId}</p>
                </div>
                {container.containerId && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ID do Container Pai</p>
                    <p className="text-base">{container.containerId}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações de Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Criado em</p>
                  <p className="text-base">{new Date(container.createdAt).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Atualizado em</p>
                  <p className="text-base">{new Date(container.updatedAt).toLocaleString('pt-BR')}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Identificação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID do Container</p>
                  <p className="text-base font-mono">{container.id}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
