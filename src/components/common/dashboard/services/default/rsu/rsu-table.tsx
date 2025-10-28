"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableGeneric } from "@/components/common/base-ui/data-table-generic"
import { RsuDialog } from "./rsu-dialog"
import { EditRsuModal } from "./rsu-modals"
import { useDeleteRsuMutation } from "@/infrastructure/hooks/useRsu"
import type { Rsu } from "@/infrastructure/schema/schema-rsu"
import { mockContainers, mockSites, mockEmployees, mockCompanies } from "@/infrastructure/schema/schema-rsu"

function ActionsButtons({ rsu }: { rsu: Rsu }) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const deleteMutation = useDeleteRsuMutation()

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir este RSU?')) {
      deleteMutation.mutate(rsu.id!)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => setIsDialogOpen(true)} className="cursor-pointer">
            <Eye className="size-4 mr-2" />
            Visualizar
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={() => setIsEditOpen(true)}>
            <Edit className="size-4 mr-2" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="cursor-pointer"
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="size-4 mr-2" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RsuDialog
        rsu={rsu}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      <EditRsuModal
        rsu={rsu}
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </>
  )
}

const createRsuColumns = (): ColumnDef<Rsu>[] => [
  {
    accessorKey: "cod",
    header: "Código",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.cod}</div>
    ),
  },
  {
    accessorKey: "containerId",
    header: "Container",
    cell: ({ row }) => {
      const container = mockContainers.find(c => c.id === row.original.containerId)
      return <div>{container?.name || 'N/A'}</div>
    },
  },
  {
    accessorKey: "quantity",
    header: "Quantidade",
    cell: ({ row }) => (
      <div className="text-center">{row.original.quantity}</div>
    ),
  },
  {
    accessorKey: "comment",
    header: "Comentário",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate" title={row.original.comment || ''}>
        {row.original.comment || 'N/A'}
      </div>
    ),
  },
  {
    accessorKey: "employeeId",
    header: "Funcionário",
    cell: ({ row }) => {
      const employee = mockEmployees.find(e => e.id === row.original.employeeId)
      return <div>{employee?.name || 'N/A'}</div>
    },
  },
  {
    accessorKey: "clientTime",
    header: "Tempo Cliente",
    cell: ({ row }) => (
      <div className="text-center">{row.original.clientTime}</div>
    ),
  },
  {
    accessorKey: "totalTime",
    header: "Tempo Total",
    cell: ({ row }) => (
      <div className="text-center">{row.original.totalTime}</div>
    ),
  },
  {
    accessorKey: "siteId",
    header: "Local",
    cell: ({ row }) => {
      const site = mockSites.find(s => s.id === row.original.siteId)
      return <div>{site?.name || 'N/A'}</div>
    },
  },
  {
    accessorKey: "cardId",
    header: "Cartão",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.cardId}</div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Criado em",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {new Date(row.original.createdAt || '').toLocaleDateString('pt-BR')}
      </div>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: "Atualizado em",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {new Date(row.original.updatedAt || '').toLocaleDateString('pt-BR')}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => (
      <ActionsButtons rsu={row.original} />
    ),
  },
]

interface RsuTableProps {
  data: Rsu[]
  isLoading?: boolean
  onCreateClick?: () => void
}

export function RsuTable({ data, isLoading, onCreateClick }: RsuTableProps) {
  return (
    <div >
      <DataTableGeneric
        data={data}
        columns={createRsuColumns()}
        searchKey="cod"
        placeholder="Pesquisar RSU..."
        enableRowSelection={true}
        includeSelection={true}
        isLoading={isLoading}
        actionButton={{
          label: "Novo RSU",
          onClick: onCreateClick || (() => toast.success("Funcionalidade em desenvolvimento")),
        }}
      />
    </div>
  )
}
