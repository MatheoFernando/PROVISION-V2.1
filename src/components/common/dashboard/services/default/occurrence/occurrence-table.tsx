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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableGeneric } from "@/components/common/base-ui/data-table-generic"
import { OccurrenceDialog } from "./occurrence-dialog"
import { EditOccurrenceModal } from "./occurrence-modals"
import { useDeleteOccurrenceMutation } from "@/infrastructure/hooks/useOccurrences"
import { useTypeOccurrences } from "@/infrastructure/hooks/useTypeOccurrences"
import type { Occurrence } from "@/infrastructure/schema/schema-occurrence"
import type { TypeOccurrence } from "@/infrastructure/schema/schema-type-occurrence"

const mockCompanies = [
  { id: '1', name: 'TechCorp Solutions' },
  { id: '2', name: 'InnovaTech' },
  { id: '3', name: 'DataFlow Systems' },
]

const mockEmployees = [
  { id: '1', name: 'João Silva' },
  { id: '2', name: 'Maria Santos' },
  { id: '3', name: 'Pedro Costa' },
]

const mockEquipments = [
  { id: '1', name: 'Equipamento A' },
  { id: '2', name: 'Equipamento B' },
  { id: '3', name: 'Equipamento C' },
]

const mockSites = [
  { id: '1', name: 'Site Central' },
  { id: '2', name: 'Site Norte' },
  { id: '3', name: 'Site Sul' },
]

function ActionsButtons({ occurrence }: { occurrence: Occurrence }) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const deleteMutation = useDeleteOccurrenceMutation()

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir esta ocorrência?')) {
      deleteMutation.mutate(occurrence.id!)
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
          <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="cursor-pointer">
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

      <OccurrenceDialog
        occurrence={occurrence}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      <EditOccurrenceModal
        occurrence={occurrence}
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </>
  )
}

const createOccurrenceColumns = (typeOccurrences: TypeOccurrence[]): ColumnDef<Occurrence>[] => [
  {
    accessorKey: "cod",
    header: "Código",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.cod}</div>
    ),
  },

  {
    accessorKey: "description",
    header: "Descrição",
    cell: ({ row }) => {
      return <div>{row.original.description || 'N/A'}</div>
    },
  },
  {
    accessorKey: "typeOccurrenceId",
    header: "Tipo",
    cell: ({ row }) => {
      const type = typeOccurrences?.find(t => t.id === row.original.typeOccurrenceId)
      return <div>{type?.description || 'N/A'}</div>
    },
  },
  {
    accessorKey: "equipmentId",
    header: "Equipamento",
    cell: ({ row }) => {
      const equipment = mockEquipments.find(e => e.id === row.original.equipmentId)
      return <div>{equipment?.name || 'N/A'}</div>
    },
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
    accessorKey: "siteId",
    header: "Site",
    cell: ({ row }) => {
      const site = mockSites.find(s => s.id === row.original.siteId)
      return <div>{site?.name || 'N/A'}</div>
    },
  },
  {
    accessorKey: "time",
    header: "Horário",
    cell: ({ row }) => (
      <div className="text-center">{row.original.time}</div>
    ),
  },
  {
    accessorKey: "correctiveAction",
    header: "Ação Corretiva",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate" title={row.original.correctiveAction}>
        {row.original.correctiveAction}
      </div>
    ),
  },
  {
    accessorKey: "gravity",
    header: "Gravidade",
    cell: ({ row }) => {
      const gravity = row.original.gravity
      const variant = gravity === 'Alta' ? 'destructive' : gravity === 'Média' ? 'default' : 'secondary'
      return (
        <Badge variant={variant} className={variant === 'destructive' ? 'bg-red-500 text-white' : variant === 'default' ? 'bg-green-500 text-white' : 'bg-orange-200 text-red-500'}>
          {gravity}
        </Badge>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const isOpen = row.original.status === 'Aberto'
      return (
        <Badge variant={isOpen ? 'default' : 'secondary'} className={isOpen ? 'bg-green-500 text-white' : 'bg-orange-200 text-red-500'}>
          {row.original.status}
        </Badge>
      )
    },
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
    id: "actions",
    header: "Ações",
    cell: ({ row }) => (
      <ActionsButtons occurrence={row.original} />
    ),
  },
]

interface OccurrenceTableProps {
  data: Occurrence[]
  isLoading?: boolean
  onCreateClick?: () => void
}

export function OccurrenceTable({ data, isLoading, onCreateClick }: OccurrenceTableProps) {
  const { data: typeOccurrences } = useTypeOccurrences()
  
  return (
    <div className="w-full">
      <DataTableGeneric
        data={data}
        columns={createOccurrenceColumns(typeOccurrences ?? [])}
        searchKey="cod"
        placeholder="Pesquisar ocorrências..."
        enableRowSelection={true}
        includeSelection={true}
        isLoading={isLoading}
        actionButton={{
          label: "Nova Ocorrência",
          onClick: onCreateClick || (() => toast.success("Funcionalidade em desenvolvimento")),
        }}
      />
    </div>
  )
}
