"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  useCompaniesQuery,
  useDeleteCompanyMutation,
} from "@/infrastructure/hooks/useCompanies";
import { getFileUrl } from "@/infrastructure/utils/file-utils";
import type { ColumnDef } from "@tanstack/react-table";
import type { Company } from "@/infrastructure/types/domain";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTableGeneric } from "../../base-ui/data-table";
import { Eye, Edit, Trash2 } from "lucide-react";
import { DeleteModal } from "@/components/ui/delete-modal";
import { CompanyView } from "./company-view";


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
              src={getFileUrl(company.photo)}
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

  const [viewOpen, setViewOpen] = React.useState(false);
  const [selectedCompany, setSelectedCompany] = React.useState<Company | null>(
    null,
  );
  const [deleteOpen, setDeleteOpen] = React.useState(false);


  const handleView = (company: Company) => {
    setSelectedCompany(company);
    setViewOpen(true);
  };

  const handleEdit = (company: Company) => {
    router.push(`/dashboard/empresa/create?id=${company.id}`);
  };

  const handleDelete = async (company: Company) => {
    setSelectedCompany(company);
    setDeleteOpen(true);
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
          onClick: () => router.push("/dashboard/empresa/create"),
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
            label: "Eliminar",
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
        title="Eliminar empresa"
        message={`Tem certeza que deseja excluir a empresa ${selectedCompany?.businessName ?? ""
          } ? Esta ação não pode ser desfeita.`}
      />


    </div>
  );
}

export default ListCompany
