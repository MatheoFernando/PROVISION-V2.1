"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  useCompaniesQuery,
  useDeleteCompanyMutation,
  useCompaniesByNameQuery,
  useCompanyByCodQuery,
  useUpdateCompanyMutation,
} from "@/infrastructure/hooks/useCompanies";
import { useCurrentUser } from "@/infrastructure/hooks/useCurrentUser";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFileUrl } from "@/infrastructure/utils/file-utils";
import type { ColumnDef } from "@tanstack/react-table";
import type { Company } from "@/infrastructure/types/domain";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTableGeneric } from "../../base-ui/data-table";
import { Eye, Edit, Trash2, Ban, Power } from "lucide-react";
import { DeleteModal } from "@/components/ui/delete-modal";


function getPrimaryAddress(company: Company) {
  return company?.address || company?.addresses?.[0];
}

function getPrimaryContact(company: Company) {
  return company?.contact || company?.contacts?.[0];
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
              className="rounded-sm object-contain"
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
  const { isGlobalAdmin } = useCurrentUser();
  const [searchType, setSearchType] = React.useState<"businessName" | "cod">("businessName");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: allData, isLoading: isLoadingAll, refetch: refetchAll } = useCompaniesQuery({
    enabled: !debouncedSearchTerm
  });

  const { data: nameData, isLoading: isLoadingName } = useCompaniesByNameQuery(debouncedSearchTerm);
  
  const { data: codData, isLoading: isLoadingCod } = useCompanyByCodQuery(debouncedSearchTerm);

  const data = React.useMemo(() => {
    if (!debouncedSearchTerm) return allData ?? [];
    if (searchType === "businessName") return nameData ?? [];
    if (searchType === "cod") return codData ? [codData] : [];
    return [];
  }, [debouncedSearchTerm, searchType, allData, nameData, codData]);

  const isLoading = !debouncedSearchTerm ? isLoadingAll : (searchType === "businessName" ? isLoadingName : isLoadingCod);
  const refetch = !debouncedSearchTerm ? refetchAll : () => {};

  const { mutateAsync: deleteAsync } = useDeleteCompanyMutation();
  const { mutateAsync: updateCompany } = useUpdateCompanyMutation({ showToast: false });

  const [selectedCompany, setSelectedCompany] = React.useState<Company | null>(
    null,
  );
  const [deleteOpen, setDeleteOpen] = React.useState(false);


  const slugify = (text: string): string => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleView = (company: Company) => {
    if (company.businessName) {
        const slug = slugify(company.businessName);
        router.push(`/dashboard/empresa/${slug}`);
    }
  };

  const handleEdit = (company: Company) => {
    router.push(`/dashboard/empresa/create?id=${company.id}`);
  };

  const handleDelete = async (company: Company) => {
    setSelectedCompany(company);
    setDeleteOpen(true);
  };

  const handleToggleStatus = async (company: Company) => {
      if (!company.id) return;
      try {
        await updateCompany({
            id: company.id,
            businessName: company.businessName,
            taxName: company.taxName,
            status: !company.status,
        });
        toast.success(
          !company.status
            ? "Empresa ativada com sucesso"
            : "Empresa desativada com sucesso"
        );
        refetch();
      } catch (error) {
        console.error("Failed to toggle status", error);
      }
  };



  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder={searchType === "businessName" ? "Pesquisar por nome..." : "Pesquisar por código..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10"
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <Select
            value={searchType}
            onValueChange={(value: "businessName" | "cod") => {
              setSearchType(value);
              setSearchTerm(""); 
            }}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Tipo de filtro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="businessName">Nome</SelectItem>
              <SelectItem value="cod">Código</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTableGeneric
        data={data ?? []}
        columns={columns}
        onRefetch={refetch}
        isLoading={isLoading}
        getRowClassName={(row) => !row.status ? "opacity-50 grayscale" : ""}
        
        actionButton={
          isGlobalAdmin
            ? {
                label: "Nova Empresa",
                onClick: () => router.push("/dashboard/empresa/create"),
              }
            : undefined
        }
        rowActions={[
          {
            label: "Visualizar",
            icon: (
              <Eye className="h-2.5 w-2.5 text-gray-600 dark:text-gray-100" />
            ),
            onClick: handleView,
            variant: "ghost",
            disabled: (company) => !company.status,
          },
          {
            label: "Editar",
            icon: (
              <Edit className="h-2.5 w-2.5 text-gray-600 dark:text-gray-100" />
            ),
            onClick: handleEdit,
            variant: "ghost",
            disabled: (company) => !company.status,
          },
          {
            label: (company) => (company.status ? "Desativar" : "Ativar"),
            icon: (company) =>
              company.status ? (
                <Ban className="h-2.5 w-2.5 text-rose-600 dark:text-rose-100" />
              ) : (
                <Power className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-100" />
              ),
            onClick: handleToggleStatus,
            variant: "ghost",
          },

          {
            label: "Eliminar",
            icon: (
              <Trash2 className="h-2.5 w-2.5 text-gray-600 dark:text-gray-100" />
            ),
            onClick: handleDelete,
            variant: "ghost",
            disabled: (company) => !company.status,
          },
        ]}
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
