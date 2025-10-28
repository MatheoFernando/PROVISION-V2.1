"use client";

import { useState, useMemo } from "react";
import { Edit, Trash2, Eye, Building2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTableGeneric } from "@/components/common/base-ui/data-table-generic";
import { EditService } from "./edit-service";
import { AssociateServiceCompany } from "./associate-service-company";
import { Service } from "@/infrastructure/schema/schema-service";
import { useUpdateServiceMutation, useDeleteServiceMutation } from "@/infrastructure/hooks/useServices";
import { useCompaniesQuery } from "@/infrastructure/hooks/useCompanies";
import { useUsersQuery } from "@/infrastructure/hooks/useUsers";

interface ListServicesProps {
  services: Service[];
  isGlobalAdmin: boolean;
}

export function ListServices({ services, isGlobalAdmin }: ListServicesProps) {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [associateService, setAssociateService] = useState<Service | null>(
    null
  );
  const updateServiceMutation = useUpdateServiceMutation();
  const deleteServiceMutation = useDeleteServiceMutation();

  function handleToggleActive(service: Service) {
    updateServiceMutation.mutate({
      id: service.id!,
      data: { status: !service.status },
    });
  }

  function handleDelete(service: Service) {
    if (confirm("Tem certeza que deseja excluir este serviço?")) {
      deleteServiceMutation.mutate(service.id!);
    }
  }

  const columns = useMemo<ColumnDef<Service>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Nome",
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "description",
        header: "Descrição",
        cell: ({ row }) => (
          <div className="max-w-[200px] truncate">
            {row.getValue("description") || "-"}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as boolean;
          return (
            <Badge
              variant={status ? "default" : "destructive"}
            >
              {status ? "Ativo" : "Inativo"}
            </Badge>
          );
        },
      },
     
    ],
    []
  );

  const rowActions = useMemo(() => {
    if (!isGlobalAdmin) return [];

    return [
      {
        label: "Atribuir a empresa",
        icon: <Building2 className="h-3 w-3" />,
        onClick: (service: Service) => setAssociateService(service),
        variant: "ghost" as const,
      },
      {
        label: "Editar",
        icon: <Edit className="h-3 w-3" />,
        onClick: (service: Service) => setEditingService(service),
        variant: "ghost" as const,
      },
      {
        label: "Excluir",
        icon: <Trash2 className="h-3 w-3" />,
        onClick: handleDelete,
        variant: "ghost" as const,
      },
    ];
  }, [isGlobalAdmin]);

  if (services.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Serviços</CardTitle>
          <CardDescription>
            {isGlobalAdmin
              ? "Nenhum serviço foi criado ainda."
              : "Nenhum serviço personalizado foi criado para sua empresa."}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div>
      <div>
        <DataTableGeneric
          data={services}
          columns={columns}
          searchKey="name"
          placeholder="Pesquisar serviços..."
          rowActions={rowActions}
        />
      </div>
      {editingService && (
        <EditService
          service={editingService}
          open={!!editingService}
          onOpenChange={(open) => !open && setEditingService(null)}
        />
      )}
      {associateService && (
        <AssociateServiceCompany
          open={!!associateService}
          onOpenChange={(open) => !open && setAssociateService(null)}
          moduleId={associateService.id!}
          moduleName={associateService.name}
        />
      )}
    </div>
  );
}
