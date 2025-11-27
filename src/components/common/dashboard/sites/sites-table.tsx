"use client";

import { useState } from "react";
import * as React from "react";
import { Eye, Edit, Trash2, X } from "lucide-react";
import { DataTableGeneric } from "@/components/common/base-ui/data-table";
import {
  useSites,
  useDeleteSite,
  useCreateGrossSite,
} from "@/infrastructure/hooks/useSites";
import { Site } from "@/infrastructure/types/domain";
import { ColumnDef } from "@tanstack/react-table";
import { SitesView } from "./sites-view";
import { DeleteModal } from "@/components/ui/delete-modal";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import SitesCreatePage from "./site-create";
import { useRouter } from "next/navigation";
import { BulkImportDialog } from "@/components/common/base-ui/bulk-import";
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
    accessorKey: "numberWorkersContract",
    header: "Trabalhadores",
    cell: ({ row }) => {
      const numberWorkersContract = row.getValue("numberWorkersContract") as number;
      return <div>{numberWorkersContract}</div>;
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
      const display = contact?.email ?? contact?.phoneNumbers?.[0]?.phone ?? "-";
      return <div>{display}</div>;
    },
  },

  
];

interface SitesTableProps {
  openCreateOnLoad?: boolean;
  shouldNavigateBack?: boolean;
  customerId?: string;
  data?: Site[];
  isLoadingOverride?: boolean;
}

interface StatusCodeError extends Error {
  statusCode: number;
}

function throwMissingStatusCodeError(elementKey: string): never {
  const error = new Error(
    `O elemento ${elementKey} falta statusCode: 404`,
  ) as StatusCodeError;
  error.statusCode = 404;
  throw error;
}

function parseWorkersCount(rawValue: string | undefined) {
  if (!rawValue) return 0;
  const normalized = rawValue.replace(/[^\d]/g, "");
  if (!normalized) return 0;
  return Number.parseInt(normalized, 10);
}

export function SitesTable({
  openCreateOnLoad = false,
  shouldNavigateBack = false,
  customerId,
  data,
  isLoadingOverride,
}: SitesTableProps = {}) {
  const router = useRouter();
  const shouldFetch = !data;
  const { data: sites = [], isLoading } = useSites(customerId, { enabled: shouldFetch });
  const deleteSite = useDeleteSite();
  const createGrossSite = useCreateGrossSite();
  const companyId = useAuthStore((state) => state.companyId) || "";
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(openCreateOnLoad);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | undefined>();
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  const resetCreateState = () => {
    setIsCreateOpen(false);
    setSelectedSite(undefined);
  };

  const handleReturn = () => {
    if (shouldNavigateBack) router.back();
  };

  const handleCreateCancel = () => {
    resetCreateState();
    handleReturn();
  };

  const handleCreateSuccess = () => {
    resetCreateState();
    handleReturn();
  };

  const handleCreateDialogChange = (open: boolean) => {
    if (open) {
      setIsCreateOpen(true);
      return;
    }
    handleCreateCancel();
  };

  const handleView = (site: Site) => {
    setSelectedSite(site);
    setIsViewOpen(true);
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
      toast.error("Erro ao excluir site");
    }
  };

  const resolvedData = data ?? sites;
  const resolvedIsLoading = isLoadingOverride ?? isLoading;

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
        enableRowSelection={true}
        includeSelection={true}
        dateKey={"createdAt" as keyof Site}
        rowActions={[
          {
            label: "Visualizar",
            icon: <Eye className="h-4 w-4 mr-2" />,
            onClick: (site) => handleView(site),
          },
          {
            label: "Editar",
            icon: <Edit className="h-4 w-4 mr-2" />,
            onClick: (site) => handleEdit(site),
          },
          {
            label: "Excluir",
            icon: <Trash2 className="h-4 w-4 mr-2" />,
            onClick: (site) => handleDelete(site),
          },
        ]}
      />

      <SitesView
        site={selectedSite}
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedSite(undefined);
        }}
      />

      <Drawer
        open={isCreateOpen}
        onOpenChange={handleCreateDialogChange}
        direction="right"
      >
        <DrawerContent className="h-full w-full sm:max-w-xl">
          <div className="flex h-full flex-col">
            <DrawerHeader className="border-b border-border px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <DrawerTitle className="text-2xl font-bold text-foreground">
                    {selectedSite ? "Editar Site" : "Novo Site"}
                  </DrawerTitle>
                </div>
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </div>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <SitesCreatePage
                id={selectedSite?.id}
                initialData={selectedSite as any}
                customerId={customerId}
                onSuccess={handleCreateSuccess}
                onCancel={handleCreateCancel}
              />
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedSite(undefined);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir Site"
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
