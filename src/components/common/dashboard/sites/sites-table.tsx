"use client";

import { useState } from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import { DataTableGeneric } from "@/components/common/base-ui/data-table";
import { useSites } from "@/infrastructure/hooks/useSites";
import { Site } from "@/types/domain";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SitesView } from "./sites-view";
import { DeleteModal } from "@/components/ui/delete-modal";
import { useDeleteSite } from "@/infrastructure/hooks/useSites";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const columns: ColumnDef<Site>[] = [
  {
    accessorKey: "cod",
    header: "Código",
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as boolean;
      return status ? (
        <Badge variant="default">Ativo</Badge>
      ) : (
        <Badge variant="secondary">Inativo</Badge>
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
  {
    accessorKey: "customerId",
    header: "Cliente",
    cell: ({ row }) => {
      const customerId = row.getValue("customerId") as string;
      return <div>{customerId}</div>;
    },
  },
  {
    accessorKey: "zoneId",
    header: "Zona",
    cell: ({ row }) => {
      const zoneId = row.getValue("zoneId") as string;
      return <div>{zoneId}</div>;
    },
  },
  {
    accessorKey: "areaId",
    header: "Área",
    cell: ({ row }) => {
      const areaId = row.getValue("areaId") as string;
      return <div>{areaId}</div>;
    },
  },
  {
    accessorKey: "sectorId",
    header: "Setor",
    cell: ({ row }) => {
      const sectorId = row.getValue("sectorId") as string;
      return <div>{sectorId}</div>;
    },
  },
  {
    accessorKey: "contactId",
    header: "Contato",
    cell: ({ row }) => {
      const contactId = row.getValue("contactId") as string;
      return <div>{contactId}</div>;
    },
  },
  {
    accessorKey: "addressId",
    header: "Endereço",
    cell: ({ row }) => {
      const addressId = row.getValue("addressId") as string;
      return <div>{addressId}</div>;
    },
  },
  {
    accessorKey: "siteEntityId",
    header: "Site",
    cell: ({ row }) => {
      const siteEntityId = row.getValue("siteEntityId") as string;
      return <div>{siteEntityId}</div>;
    },
  },
  {
    accessorKey: "geoLocationEntityId",
    header: "Localização",
    cell: ({ row }) => {
      const geoLocationEntityId = row.getValue("geoLocationEntityId") as string;
      return <div>{geoLocationEntityId}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Data de Criação",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt");
      
      if (!createdAt) {
        return <div>-</div>;
      }
      
      const date = createdAt instanceof Date ? createdAt : new Date(createdAt as string);
      
      if (isNaN(date.getTime())) {
        return <div>-</div>;
      }
      
      return <div>{format(date, "dd/MM/yyyy", { locale: ptBR })}</div>;
    },
  },
];

export function SitesTable() {
  const { data: sites = [], isLoading } = useSites();
  const router = useRouter();
  const deleteSite = useDeleteSite();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
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

  const handleCreate = () => {
    setSelectedSite(undefined);
    setIsCreateOpen(true);
  };

  return (
    <div className="space-y-4">
      <DataTableGeneric
        columns={columns}
        data={sites}
        isLoading={isLoading}
        searchKey="name"
        actionButton={{
          label: "Novo Site",
          onClick: () => router.push("/dashboard/sites/create"),
        }}
        enableRowSelection={true}
        includeSelection={true}
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
