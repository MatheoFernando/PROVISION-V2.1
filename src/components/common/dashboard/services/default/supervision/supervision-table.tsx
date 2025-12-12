"use client"

import * as React from "react"
import { ColumnDef, CellContext } from "@tanstack/react-table"
import { Eye, PencilSimple, Trash, DotsThree, X } from "phosphor-react"
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
import { SupervisionDialog } from "./supervision-create"
import { useDeleteSupervisionMutation } from "@/infrastructure/hooks/useSupervisions"
import { Supervision } from "@/infrastructure/types/domain"
import { DeleteModal } from "@/components/ui/delete-modal"
import { SupervisionDrawer } from "./supervision-view"

interface ActionsButtonsProps {
  supervision: Supervision
  equipmentCode?: string
  onEdit?: (supervision: Supervision) => void
}

function ActionsButtons({ supervision, onEdit }: ActionsButtonsProps) {
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [isViewOpen, setIsViewOpen] = React.useState(false)
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
            <DotsThree className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => setIsViewOpen(true)}
          >
            <Eye className="size-4 mr-2" />
            Visualizar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onEdit?.(supervision)}
            className="cursor-pointer"
          >
            <PencilSimple className="size-4 mr-2" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            variant="destructive"
            onClick={() => setIsDeleteOpen(true)}
            disabled={deleteMutation.isPending}
          >
            <Trash className="size-4 mr-2" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SupervisionDrawer
        supervision={supervision}
        isOpen={isViewOpen}
        onOpenChange={setIsViewOpen}
        onEdit={(sup) => {
          setIsViewOpen(false);
          onEdit?.(sup);
        }}
      />

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
        title="Eliminar Supervisão"
        message={`Tem certeza que deseja excluir a supervisão do equipamento ?`}
      />
    </>
  )
}


const formatHour = (value?: string) => {
  if (!value) return "--"
  if (value.includes("T") && Number.isNaN(Date.parse(value))) {
    const fallback = value.includes(":") ? value : `${value}:00`
    return fallback.slice(0, 5)
  }
  const date = value.includes("T")
    ? new Date(value)
    : new Date(`${new Date().toISOString().slice(0, 10)}T${value}`)
  if (Number.isNaN(date.getTime())) {
    const fallback = value.includes(":") ? value : `${value}:00`
    return fallback.slice(0, 5)
  }
  return date
    .toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit", hour12: false })
    .replace(".", ":")
}

const createSupervisionColumns = (
  options: {
    isGlobalAdmin?: boolean
    onEdit?: (supervision: Supervision) => void
  }
): ColumnDef<Supervision>[] => [
  {
    accessorKey: "cod",
    header: "Código",
    size: 50,
    cell: ({ row }: CellContext<Supervision, unknown>) => (
      <div>{row.original.cod}</div>
    ),
  },
  {
    accessorKey: "desiredNumberWorkers",
    header: "Desejado",
    size: 20,
    cell: ({ row }: CellContext<Supervision, unknown>) => (
      <div>{row.original.desiredNumberWorkers}</div>
    ),
  },
  {
    accessorKey: "numberWorkerPresent",
    header: "Presente",
    size: 20,
    cell: ({ row }: CellContext<Supervision, unknown>) => {
      const present = Number(row.original.numberWorkerPresent) || 0
      const desired = Number(row.original.desiredNumberWorkers) || 0
      const isEqual = present === desired
      const isLess = present < desired
      const difference = present - desired

      return (
        <div className={isEqual ? 'text-green-600 font-medium' : isLess ? 'text-red-600 font-medium' : ''}>
          {isLess ? `${difference}` : present}
        </div>
      )
    },
  },
  {
    accessorFn: (row: Supervision) => {
        const eq = row.equipments;
        return eq ? `${eq.mark || ''} ${eq.model || ''}`.trim() || 'N/A' : 'N/A';
    },
    id: "equipment",
    header: `Equipamentos`,
    cell: ({ row }: CellContext<Supervision, unknown>) => {
        const eq = row.original.equipments;
        const name = eq ? `${eq.cod || ''}`.trim() : 'N/A';
        return <div>{name || 'N/A'}</div>
    },
  },
  {
    accessorFn: (row: Supervision) => row.employees?.fullName || 'N/A',
    id: "employee",
    header: "Funcionário",
    cell: ({ row }: CellContext<Supervision, unknown>) => {
      return <div>{row.original.employees?.fullName || 'N/A'}</div>
    },
  },
  {
    accessorFn: (row: Supervision) => row.sites?.name || 'N/A',
    id: "site",
    header: "Site",
    cell: ({ row }: CellContext<Supervision, unknown>) => {
      return <div>{row.original.sites?.name || 'N/A'}</div>
    },
  },
  options.isGlobalAdmin
    ? {
      accessorFn: (row: Supervision) => row.company?.businessName || "N/A",
      id: "company",
      header: "Empresa",
      cell: ({ row }: CellContext<Supervision, unknown>) => {
        return <div>{row.original.company?.businessName || "N/A"}</div>
      },
    }
    : null,
  {
    accessorFn: (row: Supervision) => formatHour(row.time),
    id: "time",
    header: "Horário",
    size: 20,
    cell: ({ row }: CellContext<Supervision, unknown>) => {
      const hhmm = formatHour(row.original.time)
      return <div>{hhmm}</div>
    },
  },
  {
    accessorFn: (row: Supervision) => row.department?.name || 'N/A',
    id: "department",
    header: "Departamento",
    cell: ({ row }: CellContext<Supervision, unknown>) => {
      return <div>{row.original.departments?.name || 'N/A'}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }: CellContext<Supervision, unknown>) => {
      const isActive = row.original.status === 'Finalizado'
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
    cell: ({ row }: CellContext<Supervision, unknown>) => {
      return (
        <ActionsButtons
          supervision={row.original}
          equipmentCode={row.original.equipments?.cod}
          onEdit={options.onEdit}
        />
      )
    },
  },
].filter(Boolean) as ColumnDef<Supervision>[]

interface SupervisionTableProps {
  data: Supervision[]
  isLoading?: boolean
  onCreateClick?: () => void
  onDateRangeChange?: (range?: DateRange) => void
  onBulkDelete?: (selected: Supervision[]) => void
  statusFilter?: string
  onStatusFilterChange?: (status?: string) => void
}

export function SupervisionTable({
  data,
  isLoading,
  onDateRangeChange,
  statusFilter,
  onStatusFilterChange,
}: SupervisionTableProps) {

  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [selectedSupervision, setSelectedSupervision] = React.useState<Supervision | null>(null)

  

  const handleCreate = () => {
    setSelectedSupervision(null)
    setIsFormOpen(true)
  }

  const handleEdit = (supervision: Supervision) => {
    setSelectedSupervision(supervision)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setSelectedSupervision(null)
  }

  return (
    <div className="w-full">
      <DataTableGeneric
        data={data}
        columns={createSupervisionColumns({
          onEdit: handleEdit,
        })}

        searchKey="cod"
        placeholder="Pesquisar..."
        isLoading={isLoading}
        dateKey="createdAt"
        onDateRangeChange={onDateRangeChange}
        actionButton={{
          label: "Nova Supervisão",
          onClick: handleCreate,
        }}
        statusOptions={[
          { label: "Pendente", value: "Pendente" },
          { label: "Finalizado", value: "Finalizado" },
        ]}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
      />

      <SupervisionDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseForm()
          } else {
            setIsFormOpen(true)
          }
        }}
        supervisionToEdit={selectedSupervision ?? undefined}
      />
    </div>
  )
}
