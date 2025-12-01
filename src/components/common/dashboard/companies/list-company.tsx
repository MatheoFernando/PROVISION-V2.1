 "use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  useCompaniesQuery,
  useDeleteCompanyMutation,
  useCreateCompanyModuleMutation,
} from "@/infrastructure/hooks/useCompanies";
import type { ColumnDef } from "@tanstack/react-table";
import type { Company } from "@/infrastructure/types/domain";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTableGeneric } from "../../base-ui/data-table";
import { Eye, Edit, Trash2, Link2 } from "lucide-react";
import { DeleteModal } from "@/components/ui/delete-modal";
import { CompanyView } from "./company-view";
import { useModules } from "@/infrastructure/hooks/useModules";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

function getPrimaryAddress(company: any) {
  return company?.address ?? company?.addresses?.[0] ?? undefined;
}

function getPrimaryContact(company: any) {
  return company?.contact ?? company?.contacts?.[0] ?? undefined;
}

const columns: ColumnDef<Company, unknown>[] = [
  {
    accessorKey: "businessName",
    header: "Empresa",
    cell: ({ row }) => {
      const company = row.original;
      return (
        <div className="flex items-center gap-3 py-1">
          <Avatar className="h-8 w-8 rounded-sm">
            <AvatarImage
              src={company.photo || undefined}
              alt={company.businessName}
              className="rounded-sm"
            />
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-base rounded-sm">
              {company.businessName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm text-foreground font-medium leading-none">
              {company.businessName}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "taxName",
    header: "Nome Fiscal",
    cell: ({ getValue }) => (
      <span className="text-sm text-foreground whitespace-nowrap">
        {getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: "nif",
    header: "NIF",
    cell: ({ getValue }) => (
      <span className="text-sm text-foreground whitespace-nowrap">
        {getValue<string>()}
      </span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const c: any = row.original as any;
      const email: string | undefined = getPrimaryContact(c)?.email;
      return email ? (
        <span className="text-sm text-gray-700 whitespace-nowrap">
          {email}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "country",
    header: "País",
    cell: ({ row }) => {
      const c: any = row.original as any;
      const country: string | undefined = getPrimaryAddress(c)?.country;
      return country ? (
        <span className="text-sm text-gray-700 whitespace-nowrap">
          {country}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "municipality",
    header: "Município",
    cell: ({ row }) => {
      const c: any = row.original as any;
      const municipality: string | undefined =
        getPrimaryAddress(c)?.municipality;
      return municipality ? (
        <span className="text-sm text-gray-700 whitespace-nowrap">
          {municipality}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      );
    },
  },
];

function ListCompany() {
  const router = useRouter();
  const { data, isLoading, refetch } = useCompaniesQuery();
  const { mutateAsync: deleteAsync } = useDeleteCompanyMutation();
  const { data: modules = [] } = useModules();
  const createCompanyModule = useCreateCompanyModuleMutation();

  const [viewOpen, setViewOpen] = React.useState(false);
  const [selectedCompany, setSelectedCompany] = React.useState<Company | null>(
    null,
  );
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [associateOpen, setAssociateOpen] = React.useState(false);
  const [moduleId, setModuleId] = React.useState<string>("");
  const [isActive, setIsActive] = React.useState(true);

  const handleView = (company: Company) => {
    setSelectedCompany(company);
    setViewOpen(true);
  };

  const handleEdit = (company: Company) => {
    router.push(`/dashboard/companies/create?id=${company.id}`);
  };

  const handleDelete = async (company: Company) => {
    setSelectedCompany(company);
    setDeleteOpen(true);
  };

  const handleAssociate = (company: Company) => {
    setSelectedCompany(company);
    setModuleId("");
    setIsActive(true);
    setAssociateOpen(true);
  };

  const handleConfirmAssociate = async () => {
    if (!selectedCompany?.id || !moduleId) return;
    await createCompanyModule.mutateAsync({
      companyId: selectedCompany.id,
      moduleId,
      status: isActive,
    });
    setAssociateOpen(false);
    setSelectedCompany(null);
    setModuleId("");
    void refetch();
  };

  return (
    <div className="space-y-6">
      <DataTableGeneric
        data={data ?? []}
        columns={columns}
        onRefetch={refetch}
        searchKey="businessName"
        placeholder="Pesquisar empresa..."
        isLoading={isLoading}
        actionButton={{
          label: "Nova Empresa",
          onClick: () => router.push("/dashboard/companies/create"),
        }}
        rowActions={[
          {
            label: "Visualizar",
            icon: (
              <Eye className="h-2.5 w-2.5 text-gray-600 dark:text-gray-100" />
            ),
            onClick: handleView,
            variant: "ghost",
          },
          {
            label: "Editar",
            icon: (
              <Edit className="h-2.5 w-2.5 text-gray-600 dark:text-gray-100" />
            ),
            onClick: handleEdit,
            variant: "ghost",
          },
          {
            label: "Associar serviço",
            icon: (
              <Link2 className="h-2.5 w-2.5 text-gray-600 dark:text-gray-100" />
            ),
            onClick: handleAssociate,
            variant: "ghost",
          },
          {
            label: "Excluir",
            icon: (
              <Trash2 className="h-2.5 w-2.5 text-gray-600 dark:text-gray-100" />
            ),
            onClick: handleDelete,
            variant: "ghost",
          },
        ]}
      />

      <CompanyView
        open={viewOpen}
        company={selectedCompany}
        onClose={() => {
          setViewOpen(false);
          setSelectedCompany(null);
        }}
        onEdit={(company) => {
          setViewOpen(false);
          handleEdit(company);
        }}
      />

      <DeleteModal
        isOpen={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedCompany(null);
        }}
        onConfirm={async () => {
          if (!selectedCompany?.id) return;
          try {
            await deleteAsync(selectedCompany.id);
          } finally {
            setDeleteOpen(false);
            setSelectedCompany(null);
          }
        }}
        title="Excluir empresa"
        message={`Tem certeza que deseja excluir a empresa ${
          selectedCompany?.businessName ?? ""
        } ? Esta ação não pode ser desfeita.`}
      />

      <Dialog open={associateOpen} onOpenChange={setAssociateOpen}>
        <DialogContent>
          <DialogHeader className="py-4">
            <DialogTitle>
              Associar serviço à empresa{" "}
              <span className="font-semibold">
                {selectedCompany?.businessName ?? ""}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="module">Serviço / Módulo</Label>
              <Select
                value={moduleId}
                onValueChange={(value) => setModuleId(value)}
              >
                <SelectTrigger id="module" className="w-full">
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((module) =>
                    module.id ? (
                      <SelectItem key={module.id} value={module.id}>
                        {module.name}
                      </SelectItem>
                    ) : null,
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="status" className="mr-4">
                Ativo
              </Label>
              <Switch
                className=" cursor-pointer data-[state=checked]:bg-green-600"
                id="status"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAssociateOpen(false);
                setSelectedCompany(null);
                setModuleId("");
              }}
            >
              Cancelar
            </Button>
            <Button
              disabled={!moduleId || createCompanyModule.isPending}
              onClick={handleConfirmAssociate}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white"
            >
              {createCompanyModule.isPending ? "Salvando..." : "Associar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ListCompany
