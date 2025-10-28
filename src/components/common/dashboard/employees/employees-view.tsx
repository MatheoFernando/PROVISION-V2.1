"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Employee } from "@/infrastructure/schema/schema-employees";

interface EmployeesViewProps {
  employee?: Employee;
  isOpen: boolean;
  onClose: () => void;
}

export function EmployeesView({ employee, isOpen, onClose }: EmployeesViewProps) {
  if (!isOpen) return null;
  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Funcionário</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {employee.photo && (
                <img
                  src={employee.photo}
                  alt={employee.fullName}
                  className="w-20 h-20 rounded-full object-cover border-2 border-border"
                />
              )}
              <div>
                <h3 className="text-2xl font-bold">{employee.fullName}</h3>
                <p className="text-muted-foreground">ID: {employee.id}</p>
              </div>
            </div>
            <Badge variant={employee.status ? "default" : "secondary"}>
              {employee.status ? "Ativo" : "Inativo"}
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nome Completo</p>
                  <p className="text-base font-semibold">{employee.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={employee.status ? "default" : "secondary"}>
                    {employee.status ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações da Empresa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID da Empresa</p>
                  <p className="text-base font-mono">{employee.companyId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID do Contato</p>
                  <p className="text-base font-mono">{employee.contactId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID do Site</p>
                  <p className="text-base font-mono">{employee.siteId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID dos Sites</p>
                  <p className="text-base font-mono">{employee.sitesId}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Organizacionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID do Departamento</p>
                  <p className="text-base font-mono">{employee.departmentId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID do Usuário</p>
                  <p className="text-base font-mono">{employee.userId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID da Função</p>
                  <p className="text-base font-mono">{employee.functionEntityId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID do Papel</p>
                  <p className="text-base font-mono">{employee.rolesEntityId}</p>
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
                  <p className="text-base">{new Date(employee.createdAt).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Atualizado em</p>
                  <p className="text-base">{new Date(employee.updatedAt).toLocaleString('pt-BR')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

