"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Site } from "@/infrastructure/types/domain";

interface SitesViewProps {
  site?: Site;
  isOpen: boolean;
  onClose: () => void;
}

export function SitesView({ site, isOpen, onClose }: SitesViewProps) {
  if (!isOpen) return null;
  if (!site) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Site</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{site.name}</h3>
              <p className="text-muted-foreground">Código: {site.cod}</p>
            </div>
            <Badge variant={site.status ? "default" : "secondary"}>
              {site.status ? "Ativo" : "Inativo"}
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
                  <p className="text-sm font-medium text-muted-foreground">Código</p>
                  <p className="text-base font-mono">{site.cod}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nome</p>
                  <p className="text-base font-semibold">{site.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Trabalhadores</p>
                  <p className="text-base font-semibold text-blue-600">{site.numberWorkersContract}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={site.status ? "default" : "secondary"}>
                    {site.status ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações de Relacionamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID do Cliente</p>
                  <p className="text-base font-mono">{site.customerId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID do Contato</p>
                  <p className="text-base font-mono">{site.contactId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID do Endereço</p>
                  <p className="text-base font-mono">{site.addressId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID do Setor</p>
                  <p className="text-base font-mono">{site.sectorId}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações de Localização</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID da Área</p>
                  <p className="text-base font-mono">{site.areaId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID do Site</p>
                  <p className="text-base font-mono">{site.siteEntityId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID da Localização Geográfica</p>
                  <p className="text-base font-mono">{site.geoLocationEntityId}</p>
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
                  <p className="text-base">{new Date(site.createdAt).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Atualizado em</p>
                  <p className="text-base">{new Date(site.updatedAt).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID do Site</p>
                  <p className="text-base font-mono">{site.id}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
