"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CustomersViewProps {
  customer?: string;
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
        

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
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
          

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
