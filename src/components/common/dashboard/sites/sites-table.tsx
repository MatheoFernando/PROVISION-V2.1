"use client";

import { useState } from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import { DataTableGeneric } from "@/components/common/base-ui/data-table";
import { useSites } from "@/infrastructure/hooks/useSites";
import { Site } from "@/infrastructure/types/domain";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SitesView } from "./sites-view";
import { DeleteModal } from "@/components/ui/delete-modal";
import { useDeleteSite } from "@/infrastructure/hooks/useSites";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import SitesCreatePage from "./site-create";

const columns: ColumnDef<Site>[] = [
  {
    accessorKey: "cod",
    header: "Nº Mec",
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
  {
    accessorKey: "addressId",
    header: "Endereço",
    cell: ({ row }) => {
      const original = row.original as Site;
      const address = Array.isArray(original.addresses)
        ? original.addresses.find((a) => a && (a as any).country)
        : (original.addresses as any) || (original as any).address;
      if (!address) return <div>-</div>;
      const parts = [address.houseHold, address.commune, address.municipality, address.province, address.country]
        .filter(Boolean)
        .join(", ");
      return <div className="truncate max-w-[220px]" title={parts}>{parts || '-'}</div>;
    },
  },

  {
    accessorKey: "geoLocationId",
    header: "Localização",
    cell: ({ row }) => {
      const geoLocationId = row.getValue("geoLocationId") as string | null | undefined;
      return <div>{geoLocationId || "-"}</div>;
    },
  },
  
];

export function SitesTable() {
  const { data: sites = [], isLoading } = useSites();
  const deleteSite = useDeleteSite();
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | undefined>();


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

  return (
    <div className="space-y-4">
      <DataTableGeneric
        columns={columns}
        data={sites}
        isLoading={isLoading}
        searchKey="cod"
        actionButton={{
          label: "Novo Site",
          onClick: () => {
            setSelectedSite(undefined);
            setIsCreateOpen(true);
          },
        }}
        enableRowSelection={true}
        includeSelection={true}
        dateKey="createdAt"
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
        onClose={() => setIsViewOpen(false)}
      />

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <SitesCreatePage
            id={selectedSite?.id}
            initialData={selectedSite as any}
            onSuccess={() => { setIsCreateOpen(false); setSelectedSite(undefined); }}
            onCancel={() => { setIsCreateOpen(false); setSelectedSite(undefined); }}
          />
        </DialogContent>
      </Dialog>

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
    </div>
  );
}
