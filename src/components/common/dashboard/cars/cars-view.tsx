"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Car } from "@/infrastructure/schema/schema-cars";

interface CarsViewProps {
  car?: Car;
  isOpen: boolean;
  onClose: () => void;
}

export function CarsView({ car, isOpen, onClose }: CarsViewProps) {
  if (!isOpen) return null;
  if (!car) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Veículo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{car.mark}</h3>
              <p className="text-muted-foreground">Código: {car.cod}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant={car.status ? "default" : "secondary"}>
                {car.status ? "Ativo" : "Inativo"}
              </Badge>
              <Badge variant="outline">
                {car.capacity}L
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
                  <p className="text-base font-mono">{car.cod}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Marca</p>
                  <p className="text-base font-semibold">{car.mark}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Capacidade</p>
                  <p className="text-base font-semibold text-blue-600">{car.capacity} Litros</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={car.status ? "default" : "secondary"}>
                    {car.status ? "Ativo" : "Inativo"}
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
                  <p className="text-sm font-medium text-muted-foreground">ID do Container</p>
                  <p className="text-base">{car.containerId}</p>
                </div>
           
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID da Localização Geográfica</p>
                  <p className="text-base">{car.geoLocationEntityId}</p>
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
                  <p className="text-base">{new Date(car.createdAt).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Atualizado em</p>
                  <p className="text-base">{new Date(car.updatedAt).toLocaleString('pt-BR')}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Identificação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID do Veículo</p>
                  <p className="text-base font-mono">{car.id}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
