"use client";

import { useState } from "react";
import * as React from "react";
import { Eye, PencilSimple, Trash } from "phosphor-react";
import { DataTableGeneric } from "@/components/common/base-ui/data-table";
import {
  useDeleteSite,
  useCreateGrossSite,
  useSitesByCompanyAndCustomer,
  useSites,
} from "@/infrastructure/hooks/useSites";
import { useEmployees } from "@/infrastructure/hooks/useEmployees";
import { useEquipment } from "@/infrastructure/hooks/useEquipment";
import { Site } from "@/infrastructure/types/domain";
import { ColumnDef } from "@tanstack/react-table";
import { DeleteModal } from "@/components/ui/delete-modal";
import { toast } from "sonner";
import { SiteDialog } from "./site-create";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BulkImportDialog } from "@/components/common/base-ui/bulk-import";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  createGrossSiteSchema,
  type CreateGrossSitePayload,
} from "@/infrastructure/schema/schema-sites";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";

const columns: ColumnDef<Site>[] = [
  {
    accessorKey: "cod",
    header: "Código",
    size: 50,
    cell: ({ row }) => {
      const cod = row.getValue("cod") as string;
      return <div>{cod}</div>;
    },
  },
  {
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return <div>{name}</div>;
    },
  },

  {
    accessorKey: "customerId",
    header: "Cliente",
    cell: ({ row }) => {
      const original = row.original as Site;
      const customer = Array.isArray(original.customers)
        ? original.customers.find((c) => c && (c as any).name)
        : (original.customers as any) || (original as any).customer;
      const name = customer?.name ?? "-";
      return <div>{name}</div>;
    },
  },
  {
    accessorKey: "areaId",
    header: "Área",
    cell: ({ row }) => {
      const original = row.original as Site;
      const area = Array.isArray(original.areas)
        ? original.areas.find((a) => a && (a as any).name)
        : (original.areas as any) || (original as any).area;
      const name = area?.name ?? "-";
      return <div>{name}</div>;
    },
  },
  {
    accessorKey: "zoneId",
    header: "Zona",
    cell: ({ row }) => {
      const original = row.original as Site;
      const zone = Array.isArray(original.zones)
        ? original.zones.find((z) => z && (z as any).name)
        : (original.zones as any) || (original as any).zone;
      const name = zone?.name ?? "-";
      return <div>{name}</div>;
    },
  },

  {
    accessorKey: "sectorId",
    header: "Setor",
    cell: ({ row }) => {
      const original = row.original as Site;
      const sector = Array.isArray(original.sectors)
        ? original.sectors.find((s) => s && (s as any).name)
        : (original.sectors as any) || (original as any).sector;
      const name = sector?.name ?? "-";
      return <div>{name}</div>;
    },
  },
  {
    accessorKey: "contactId",
    header: "Contato",
    cell: ({ row }) => {
      const original = row.original as Site;
      const contact = Array.isArray(original.contacts)
        ? original.contacts.find((c) => c && ((c as any).email || (c as any).phoneNumbers?.length))
        : (original.contacts as any) || (original as any).contact;

      const email = contact?.email || "";
      const phone = contact?.phoneNumbers?.[0]?.phone || "";

      if (!email && !phone) return <div className="text-muted-foreground">-</div>;

      return (
        <div className="flex flex-col">
          {email && <span className="truncate max-w-[200px]" title={email}>{email}</span>}
          {phone && <span className="text-xs text-muted-foreground">{phone}</span>}
        </div>
      );
    },
  },

  {
    accessorKey: "numberWorkersContract",
    header: "Trabalhadores",
    cell: ({ row }) => {
      const numberWorkersContract = row.getValue("numberWorkersContract") as number;
      return <div>{numberWorkersContract}</div>;
    },
  },

];

interface SitesTableProps {
  openCreateOnLoad?: boolean;
  shouldNavigateBack?: boolean;
  customerId?: string;
  companyId?: string;
  data?: Site[];
  isLoadingOverride?: boolean;
}


function parseWorkersCount(rawValue: string | undefined) {
  if (!rawValue) return 0;
  const normalized = rawValue.replace(/[^\d]/g, "");
  if (!normalized) return 0;
  return Number.parseInt(normalized, 10);
}

export function SitesTable({
  openCreateOnLoad = false,
  customerId,
  companyId: companyIdProp,
  data,
  isLoadingOverride,
}: SitesTableProps = {}) {
  const router = useRouter();
  const shouldFetch = !data;
  const authCompanyId = useAuthStore((state) => state.companyId);
  const companyId = companyIdProp || authCompanyId || "";
  const deleteSite = useDeleteSite();
  const createGrossSite = useCreateGrossSite();
const { data: sites = [] } = useSites(undefined, { enabled: !!companyId, companyId }); 
  const { data: sitesByCompanyAndCustomer = [], isLoading: isLoadingByCompanyAndCustomer } = useSitesByCompanyAndCustomer(
    companyId,
    customerId,
    { enabled: shouldFetch && !!companyId && !!customerId }
  );

  const finalSites = companyId && customerId ? sitesByCompanyAndCustomer : sites;
  const finalIsLoading = isLoadingByCompanyAndCustomer;
  const [isCreateOpen, setIsCreateOpen] = useState(openCreateOnLoad);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | undefined>();
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  const handleView = (site: Site) => {
    if (site.id) {
      router.push(`/dashboard/sites/${site.id}`);
    }
  };

  const handleEdit = (site: Site) => {
    setSelectedSite(site);
    setIsCreateOpen(true);
  };

  const handleDelete = (site: Site) => {
    setSelectedSite(site);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSite || !selectedSite.id) return;

    try {
      await deleteSite.mutateAsync(selectedSite.id as string);
      toast.success("Site excluído com sucesso!");
      setIsDeleteOpen(false);
      setSelectedSite(undefined);
    } catch (error) {
      toast.error("Erro ao eliminar site");
    }
  };

  const resolvedData = data ?? finalSites;
  const resolvedIsLoading = isLoadingOverride ?? finalIsLoading;


  const { data: allEmployees = [] } = useEmployees(companyId, {
    enabled: !!companyId,
  });
  const { data: allEquipment = [] } = useEquipment(undefined, {
    enabled: true,
    companyId,
  });

  const sitesWithEmployees = new Set(allEmployees.map((emp) => emp.siteId).filter(Boolean));
  const sitesWithEquipment = new Set(allEquipment.map((eq) => eq.siteId).filter(Boolean));

  return (
    <div className="space-y-4">
      <DataTableGeneric
        columns={columns}
        data={resolvedData}
        isLoading={resolvedIsLoading}
        searchKey="cod"
        actionButton={{
          label: "Novo Site",
          onClick: () => {
            setSelectedSite(undefined);
            setIsCreateOpen(true);
          },
        }}
        bulkImportButton={{
          label: "Importar sites",
          onClick: () => setIsBulkOpen(true),
        }}

        dateKey={"createdAt" as keyof Site}
        rowActions={[
          {
            label: "Visualizar",
            icon: <Eye className="h-4 w-4 mr-2" />,
            onClick: (site) => handleView(site),
          },
          {
            label: "Editar",
            icon: <PencilSimple className="h-4 w-4 mr-2" />,
            onClick: (site) => handleEdit(site),
          },
          {
            label: "Eliminar",
            icon: <Trash className="h-4 w-4 mr-2" />,
            onClick: (site) => handleDelete(site),
            render: (site, action) => {
              const hasEmployees = sitesWithEmployees.has(site.id as string);
              const hasEquipment = sitesWithEquipment.has(site.id as string);
              const isDisabled = hasEmployees || hasEquipment;

              return (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0} className="w-full outline-none">
                        <DropdownMenuItem
                          className={`w-full cursor-pointer ${isDisabled ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          onClick={(e) => {
                            if (isDisabled) {
                              e.preventDefault();
                              e.stopPropagation();
                            } else {
                              action.onClick(site);
                            }
                          }}
                        >
                          {action.icon && <span className="mr-2">{action.icon}</span>}
                          {action.label}
                        </DropdownMenuItem>
                      </span>
                    </TooltipTrigger>
                    {isDisabled && (
                      <TooltipContent>
                        <p>
                          {hasEmployees && hasEquipment
                            ? "Não pode excluir site com funcionários e equipamentos associados"
                            : hasEmployees
                              ? "Não pode excluir site com funcionários associados"
                              : "Não pode excluir site com equipamentos associados"}
                        </p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              );
            },
          },
        ]}
      />



      <SiteDialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setSelectedSite(undefined);
          } else {
            setIsCreateOpen(true);
          }
        }}
        siteToEdit={selectedSite ?? undefined}
        customerId={customerId}
        companyId={companyId}
      />

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedSite(undefined);
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar Site"
        message="Tem certeza que deseja excluir este site? Esta ação não pode ser desfeita."
        isLoading={deleteSite.isPending}
      />

      <BulkImportDialog<CreateGrossSitePayload>
        isOpen={isBulkOpen}
        onOpenChange={setIsBulkOpen}
        title="Importação em massa de sites"
        columns={[
          { key: "cod", label: "Código", required: true },
          { key: "name", label: "Nome do Site", required: true },
          { key: "numberWorkersContract", label: "Trabalhadores", required: true },
          { key: "codCustomer", label: "Código do Cliente registrado", required: true },
          { key: "nameArea", label: "Área registrada", required: true },
          { key: "nameZone", label: "Zona registrada", required: true },
          { key: "nameSector", label: "Setor registrado", required: true },
          { key: "contactEmail", label: "Email", required: false },
          { key: "contactPhones", label: "Telefone", required: false },
          { key: "addressHouseHold", label: "Morada", required: true },
          { key: "addressCommune", label: "Comuna", required: true },
          { key: "addressMunicipality", label: "Município", required: true },
          { key: "addressProvince", label: "Província", required: true },
          { key: "addressCountry", label: "País", required: true },

        ]}
        templateFilename="modelo-sites.csv"
        schema={createGrossSiteSchema}
        shouldValidate={false}
        mapRawToInput={(raw) => {
          const phoneNumbers = (raw.contactPhones ?? "")
            .split(/[;,]/)
            .map((phone) => phone.trim())
            .filter(Boolean)
            .map((phone) => ({ phone }));
          const numberWorkersContract = parseWorkersCount(raw.numberWorkersContract);

          return {
            cod: raw.cod ?? "",
            name: raw.name ?? "",
            numberWorkersContract,
            nameArea: raw.nameArea ?? "",
            codCustomer: raw.codCustomer ?? "",
            contact: {
              phoneNumbers: phoneNumbers.length ? phoneNumbers : undefined,
              email: raw.contactEmail || undefined,
              companyId,
            },
            address: {
              houseHold: raw.addressHouseHold ?? "",
              commune: raw.addressCommune ?? "",
              municipality: raw.addressMunicipality ?? "",
              province: raw.addressProvince ?? "",
              country: raw.addressCountry ?? "",
              companyId,
            },
            nameZone: raw.nameZone ?? "",
            nameSector: raw.nameSector ?? "",
            companyId,
          };
        }}
        onCreate={async (payload) => {
          await createGrossSite.mutateAsync(payload);
        }}
      />
    </div>
  );
}
