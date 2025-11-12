"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
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
import type { DateRange } from "react-day-picker"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { SupervisionCreate } from "./supervision-create"
import { useDeleteSupervisionMutation } from "@/infrastructure/hooks/useSupervisions"
import { useEmployees } from "@/infrastructure/hooks/useEmployees"
import { useEquipment } from "@/infrastructure/hooks/useEquipment"
import { useSites } from "@/infrastructure/hooks/useSites"
import { useDepartments } from "@/infrastructure/hooks/useDepartments"
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore"
import { Supervision } from "@/infrastructure/types/domain"
import { DeleteModal } from "@/components/ui/delete-modal"
import { SupervisionDrawer } from "./supervision-dialog"

interface ActionsButtonsProps {
  supervision: Supervision
  equipmentCode?: string
}

function ActionsButtons({ supervision }: ActionsButtonsProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const deleteMutation = useDeleteSupervisionMutation()
 
  const handleConfirmDelete = () => {
    deleteMutation.mutate(supervision.id!, {
      onSuccess: () => setIsDeleteOpen(false),
    })
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
            onClick={() => setIsDeleteOpen(true)}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="size-4 mr-2" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SupervisionDrawer
        supervision={supervision}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <SupervisionCreate id={supervision.id} initialData={supervision} onSuccess={() => setIsEditOpen(false)} onCancel={() => setIsEditOpen(false)} />
        </DialogContent>
      </Dialog>

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
        title="Excluir Supervisão"
        message={`Tem certeza que deseja excluir a supervisão do equipamento ?`}
      />
    </>
  )
}


const createSupervisionColumns = (
  maps: {
    employeeById: Record<string, string>
    equipmentById: Record<string, string>
    siteById: Record<string, string>
    departmentById: Record<string, string>
  }
): ColumnDef<Supervision>[] => [
  {
    accessorKey: "cod",
    header: "Nº Mec",
    size: 50,
    cell: ({ row }) => (
      <div className="font-medium">{row.original.cod}</div>
    ),
  },
  {
    accessorKey: "desiredNumberWorkers",
    header: "Desejado",
    size: 20,
    cell: ({ row }) => (
      <div >{row.original.desiredNumberWorkers}</div>
    ),
  },
  {
    accessorKey: "numberWorkerPresent",
    header: "Presente",
    size: 20,
    cell: ({ row }) => (
      <div >{row.original.numberWorkerPresent}</div>
    ),
  },
  {
    accessorFn: (row) => maps.equipmentById[row.equipmentId || ""] || 'N/A',
    id: "equipment",
    header: `Equipamentos`,
    cell: ({ row }) => {
      const equipment = maps.equipmentById[row.original.equipmentId] || ""
      return <div>{equipment || 'N/A'}</div>
    },
  },
  {
    accessorFn: (row) => maps.employeeById[row.employeeId || ""] || 'N/A',
    id: "employee",
    header: "Funcionário",
    cell: ({ row }) => {
      const name = maps.employeeById[row.original.employeeId || ""]
      return <div>{name || 'N/A'}</div>
    },
  },
  {
    accessorFn: (row) => maps.siteById[row.siteId || ""] || 'N/A',
    id: "site",
    header: "Site",
    cell: ({ row }) => {
      const name = maps.siteById[row.original.siteId || ""]
      return <div>{name || 'N/A'}</div>
    },
  },
  {
    accessorFn: (row) => {
      const t = row.time || ""
      return t.includes("T") ? t.slice(11, 16) : t.slice(0, 5)
    },
    id: "time",
    header: "Horário",
    size: 20,
    cell: ({ row }) => {
      const t = row.original.time || ""
      const hhmm = t.includes("T") ? t.slice(11, 16) : t.slice(0, 5)
      return <div>{hhmm}</div>
    },
  },
  {
    accessorFn: (row) => maps.departmentById[row.departmentId || ""] || 'N/A',
    id: "department",
    header: "Departamento",
    cell: ({ row }) => {
      const name = maps.departmentById[row.original.departmentId || ""]
      return <div>{name || 'N/A'}</div>
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
    id: "actions",
    header: "Ações",
    size: 50,
    cell: ({ row }) => (
      <ActionsButtons supervision={row.original} equipmentCode={maps.equipmentById[row.original.equipmentId || ""]} />
    ),
  },
]

interface SupervisionTableProps {
  data: Supervision[]
  isLoading?: boolean
  onCreateClick?: () => void
  onDateRangeChange?: (range?: DateRange) => void
  onBulkDelete?: (selected: Supervision[]) => void
}

export function SupervisionTable({ data, isLoading, onDateRangeChange }: SupervisionTableProps) {
  const companyId = useAuthStore((s) => s.companyId || undefined)
  const { data: employees = [] } = useEmployees(companyId)
  const { data: equipments = [] } = useEquipment()
  const { data: sites = [] } = useSites()
  const { data: departments = [] } = useDepartments()
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)

  const employeeById = React.useMemo(() => {
    const map: Record<string, string> = {}
    ;(employees as any[]).forEach((e: any) => {
      if (e?.id) map[e.id] = e.fullName || e.name || ""
    })
    return map
  }, [employees])

  const equipmentById = React.useMemo(() => {
    const map: Record<string, string> = {}
    ;(equipments as any[]).forEach((e: any) => {
      if (e?.id) map[e.id] = e.cod || e.model || e.mark || ""
    })
    return map
  }, [equipments])

  const siteById = React.useMemo(() => {
    const map: Record<string, string> = {}
    ;(sites as any[]).forEach((s: any) => {
      if (s?.id) map[s.id] = s.name || ""
    })
    return map
  }, [sites])

  const departmentById = React.useMemo(() => {
    const map: Record<string, string> = {}
    ;(departments as any[]).forEach((d: any) => {
      if (d?.id) map[d.id] = d.name || ""
    })
    return map
  }, [departments])

  return (
    <div className="w-full">
      <DataTableGeneric
        data={data}
        columns={createSupervisionColumns({
          employeeById,
          equipmentById,
          siteById,
          departmentById,
        })}
        searchKey="cod"
        placeholder="Pesquisar..."
        enableRowSelection={true}
        includeSelection={true}
        isLoading={isLoading}
        dateKey="createdAt"
        onDateRangeChange={onDateRangeChange}
        actionButton={{
          label: "Nova Supervisão",
          onClick: () => setIsCreateOpen(true),
        }}
      />

      <Dialog open={isCreateOpen} onOpenChange={(open) => { if (open) setIsCreateOpen(true) }}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <SupervisionCreate onSuccess={() => setIsCreateOpen(false)} onCancel={() => setIsCreateOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
