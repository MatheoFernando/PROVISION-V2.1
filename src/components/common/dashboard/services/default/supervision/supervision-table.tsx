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
import { SupervisionCreate } from "./supervision-create"
import { useDeleteSupervisionMutation } from "@/infrastructure/hooks/useSupervisions"
import { useEmployees } from "@/infrastructure/hooks/useEmployees"
import { useEquipment } from "@/infrastructure/hooks/useEquipment"
import { useSites } from "@/infrastructure/hooks/useSites"
import { useDepartments } from "@/infrastructure/hooks/useDepartments"
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore"
import { useCompaniesQuery } from "@/infrastructure/hooks/useCompanies"
import { Supervision } from "@/infrastructure/types/domain"
import { DeleteModal } from "@/components/ui/delete-modal"
import { SupervisionDrawer } from "./supervision-view"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer"
interface ActionsButtonsProps {
  supervision: Supervision
  equipmentCode?: string
  onEdit?: (supervision: Supervision) => void
}

function ActionsButtons({ supervision, onEdit }: ActionsButtonsProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
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
            <DotsThree className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem className="cursor-pointer" onClick={() => setIsDialogOpen(true)}>
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
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SupervisionDrawer
        supervision={supervision}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />


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
  maps: {
    employeeById: Record<string, string>
    equipmentById: Record<string, string>
    siteById: Record<string, string>
    departmentById: Record<string, string>
    companyById?: Record<string, string>
    isGlobalAdmin?: boolean
    onEdit?: (supervision: Supervision) => void
  }
): ColumnDef<Supervision>[] => [
  {
    accessorKey: "cod",
    header: "Código",
    size: 50,
    cell: ({ row }: CellContext<Supervision, unknown>) => (
      <div className="font-medium">{row.original.cod}</div>
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
    accessorFn: (row: Supervision) => maps.equipmentById[row.equipmentId || ""] || 'N/A',
    id: "equipment",
    header: `Equipamentos`,
    cell: ({ row }: CellContext<Supervision, unknown>) => {
      const equipment = maps.equipmentById[row.original.equipmentId || ""] || ""
      return <div>{equipment || 'N/A'}</div>
    },
  },
  {
    accessorFn: (row: Supervision) => maps.employeeById[row.employeeId || ""] || 'N/A',
    id: "employee",
    header: "Funcionário",
    cell: ({ row }: CellContext<Supervision, unknown>) => {
      const name = maps.employeeById[row.original.employeeId || ""]
      return <div>{name || 'N/A'}</div>
    },
  },
  {
    accessorFn: (row: Supervision) => maps.siteById[row.siteId || ""] || 'N/A',
    id: "site",
    header: "Site",
    cell: ({ row }: CellContext<Supervision, unknown>) => {
      const name = maps.siteById[row.original.siteId || ""]
      return <div>{name || 'N/A'}</div>
    },
  },
  maps.isGlobalAdmin && maps.companyById
    ? {
      accessorFn: (row: Supervision) => maps.companyById?.[row.companyId || ""] || "N/A",
      id: "company",
      header: "Empresa",
      cell: ({ row }: CellContext<Supervision, unknown>) => {
        const name = maps.companyById?.[row.original.companyId || ""]
        return <div>{name || "N/A"}</div>
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
    accessorFn: (row: Supervision) => maps.departmentById[row.departmentId || ""] || 'N/A',
    id: "department",
    header: "Departamento",
    cell: ({ row }: CellContext<Supervision, unknown>) => {
      const name = maps.departmentById[row.original.departmentId || ""]
      return <div>{name || 'N/A'}</div>
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
    cell: ({ row }: CellContext<Supervision, unknown>) => (
      <ActionsButtons
        supervision={row.original}
        equipmentCode={maps.equipmentById[row.original.equipmentId || ""]}
        onEdit={maps.onEdit}
      />
    ),
  },
].filter(Boolean) as ColumnDef<Supervision>[]

interface SupervisionTableProps {
  data: Supervision[]
  isLoading?: boolean
  onCreateClick?: () => void
  onDateRangeChange?: (range?: DateRange) => void
  onBulkDelete?: (selected: Supervision[]) => void
}

export function SupervisionTable({ data, isLoading, onDateRangeChange }: SupervisionTableProps) {
  const companyId = useAuthStore((s) => s.companyId || undefined)
  const isGlobalAdmin = useAuthStore((s) => s.isGlobalAdmin)
  const { data: employees = [] } = useEmployees(companyId)
  const { data: equipments = [] } = useEquipment()
  const { data: sites = [] } = useSites()
  const { data: departments = [] } = useDepartments()
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  const [selectedSupervision, setSelectedSupervision] = React.useState<Supervision | null>(null)

  const employeeById = React.useMemo(() => {
    const map: Record<string, string> = {}
      ; (employees as any[]).forEach((e: any) => {
        if (e?.id) map[e.id] = e.fullName || e.name || ""
      })
    return map
  }, [employees])

  const equipmentById = React.useMemo(() => {
    const map: Record<string, string> = {}
      ; (equipments as any[]).forEach((e: any) => {
        if (e?.id) map[e.id] = e.cod || e.model || e.mark || ""
      })
    return map
  }, [equipments])

  const siteById = React.useMemo(() => {
    const map: Record<string, string> = {}
      ; (sites as any[]).forEach((s: any) => {
        if (s?.id) map[s.id] = s.name || ""
      })
    return map
  }, [sites])

  const departmentById = React.useMemo(() => {
    const map: Record<string, string> = {}
      ; (departments as any[]).forEach((d: any) => {
        if (d?.id) map[d.id] = d.name || ""
      })
    return map
  }, [departments])



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
          employeeById,
          equipmentById,
          siteById,
          departmentById,
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
      />

      <Drawer open={isFormOpen} onOpenChange={(open) => (open ? setIsFormOpen(true) : handleCloseForm())} direction="right">
        <DrawerContent className="h-full w-full sm:max-w-xl">
          <div className="flex h-full flex-col">
            <DrawerHeader className="border-b border-border px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <DrawerTitle className="text-2xl font-bold text-foreground">
                    {selectedSupervision ? "Editar Supervisão" : "Nova Supervisão"}
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
              <SupervisionCreate
                id={selectedSupervision?.id}
                initialData={selectedSupervision ?? undefined}
                onSuccess={handleCloseForm}
                onCancel={handleCloseForm}
              />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
