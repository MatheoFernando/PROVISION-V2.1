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
import { DataTableGeneric } from "@/components/common/base-ui/data-table"
import { SupervisionDialog } from "./supervision-dialog"
import { EditSupervisionModal } from "./supervision-modals"
import { useDeleteSupervisionMutation } from "@/infrastructure/hooks/useSupervisions"
import type { Supervision } from "@/infrastructure/schema/schema-supervision"


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

const mockDepartments = [
  { id: '1', name: 'Produção' },
  { id: '2', name: 'Qualidade' },
  { id: '3', name: 'Manutenção' },
]


function ActionsButtons({ supervision }: { supervision: Supervision }) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const deleteMutation = useDeleteSupervisionMutation()

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir esta supervisão?')) {
      deleteMutation.mutate(supervision.id!)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8 cursor-pointer"
            size="icon"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem className="cursor-pointer" onClick={() => setIsDialogOpen(true)}>
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

      <SupervisionDialog
        supervision={supervision}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      <EditSupervisionModal
        supervision={supervision}
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </>
  )
}


const createSupervisionColumns = (): ColumnDef<Supervision>[] => [
  {
    accessorKey: "cod",
    header: "Código",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.cod}</div>
    ),
  },
  {
    accessorKey: "observation",
    header: "Observação",
    cell: ({ row }) => {
      return <div>{row.original.observation || 'N/A'}</div>
    },
  },
  {
    accessorKey: "desiredNumberWorkers",
    header: "Desejado",
    cell: ({ row }) => (
      <div className="text-center">{row.original.desiredNumberWorkers}</div>
    ),
  },
  {
    accessorKey: "numberWorkerPresent",
    header: "Presente",
    cell: ({ row }) => (
      <div className="text-center">{row.original.numberWorkerPresent}</div>
    ),
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
    accessorKey: "departmentId",
    header: "Departamento",
    cell: ({ row }) => {
      const department = mockDepartments.find(d => d.id === row.original.departmentId)
      return <div>{department?.name || 'N/A'}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.status === 'Ativo'
      return (
        <Badge variant={isActive ? 'default' : 'destructive'} className={isActive ? 'bg-green-500' : 'bg-orange-200 text-red-600'}>
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
      <ActionsButtons supervision={row.original} />
    ),
  },
]

interface SupervisionTableProps {
  data: Supervision[]
  isLoading?: boolean
  onCreateClick?: () => void
}

export function SupervisionTable({ data, isLoading, onCreateClick }: SupervisionTableProps) {
  return (
    <div className="w-full">
      <DataTableGeneric
        data={data}
        columns={createSupervisionColumns()}
        searchKey="cod"
        placeholder="Pesquisar supervisões..."
        enableRowSelection={true}
        includeSelection={true}
        isLoading={isLoading}
        actionButton={{
          label: "Nova Supervisão",
          onClick: onCreateClick || (() => toast.success("Funcionalidade em desenvolvimento")),
        }}
      />
    </div>
  )
}
