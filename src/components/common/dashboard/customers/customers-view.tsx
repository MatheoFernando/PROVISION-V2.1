"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Customer } from "@/infrastructure/schema/schema-customers";

interface CustomersViewProps {
  customer?: Customer;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomersView({ customer, isOpen, onClose }: CustomersViewProps) {
  if (!isOpen) return null;
  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Cliente</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {customer.photo && (
                <Avatar className="h-20 w-20 rounded-sm border-2 border-border">
                  <AvatarImage src={customer.photo} alt={customer.name} className="rounded-sm" />
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-medium text-2xl rounded-sm">
                    {customer.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <h3 className="text-2xl font-bold">{customer.name}</h3>
                <p className="text-muted-foreground">Código: {customer.cod}</p>
              </div>
            </div>
            <Badge variant={customer.status ? "default" : "secondary"}>
              {customer.status ? "Ativo" : "Inativo"}
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
                  <p className="text-base font-mono">{customer.cod}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nome</p>
                  <p className="text-base font-semibold">{customer.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nome Fiscal</p>
                  <p className="text-base font-semibold">{customer.taxName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">NIF</p>
                  <p className="text-base font-mono">{customer.nif}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={customer.status ? "default" : "secondary"}>
                    {customer.status ? "Ativo" : "Inativo"}
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
                  <p className="text-sm font-medium text-muted-foreground">ID do Contato</p>
                  <p className="text-base font-mono">{customer.contactId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID do Endereço</p>
                  <p className="text-base font-mono">{customer.addressId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID da Empresa</p>
                  <p className="text-base font-mono">{customer.companyId}</p>
                </div>
                {customer.photo && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Foto</p>
                    <Avatar className="h-16 w-16 rounded-sm border">
                      <AvatarImage src={customer.photo} alt={customer.name} className="rounded-sm" />
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-medium text-lg rounded-sm">
                        {customer.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
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
                  <p className="text-base">{new Date(customer.createdAt).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Atualizado em</p>
                  <p className="text-base">{new Date(customer.updatedAt).toLocaleString('pt-BR')}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Identificação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID do Cliente</p>
                  <p className="text-base font-mono">{customer.id}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
