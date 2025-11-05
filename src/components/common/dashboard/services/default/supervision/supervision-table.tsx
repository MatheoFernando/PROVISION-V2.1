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
import { SupervisionDialog } from "./supervision-dialog"
import { useDeleteSupervisionMutation } from "@/infrastructure/hooks/useSupervisions"
import { useEmployees } from "@/infrastructure/hooks/useEmployees"
import { useEquipment } from "@/infrastructure/hooks/useEquipment"
import { useSites } from "@/infrastructure/hooks/useSites"
import { useDepartments } from "@/infrastructure/hooks/useDepartments"
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore"
import { useRouter } from "next/navigation"
import { Supervision } from "@/infrastructure/types/domain"

interface ActionsButtonsProps {
  supervision: Supervision
}

function ActionsButtons({ supervision }: ActionsButtonsProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const deleteMutation = useDeleteSupervisionMutation()
  const router = useRouter()

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
          <DropdownMenuItem onClick={() => router.push(`/dashboard/service/supervision/create?id=${supervision.id}`)} className="cursor-pointer">
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
    header: "Código",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.cod}</div>
    ),
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
      const name = maps.equipmentById[row.original.equipmentId || ""]
      return <div>{name || 'N/A'}</div>
    },
  },
  {
    accessorKey: "employeeId",
    header: "Funcionário",
    cell: ({ row }) => {
      const name = maps.employeeById[row.original.employeeId || ""]
      return <div>{name || 'N/A'}</div>
    },
  },
  {
    accessorKey: "siteId",
    header: "Site",
    cell: ({ row }) => {
      const name = maps.siteById[row.original.siteId || ""]
      return <div>{name || 'N/A'}</div>
    },
  },
  {
    accessorKey: "time",
    header: "Horário",
    cell: ({ row }) => {
      const t = row.original.time || ""
      const hhmm = t.includes("T") ? t.slice(11, 16) : t.slice(0, 5)
      return <div className="text-center">{hhmm}</div>
    },
  },
  {
    accessorKey: "departmentId",
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

export function SupervisionTable({ data, isLoading }: SupervisionTableProps) {
  const companyId = useAuthStore((s) => s.companyId || undefined)
  const { data: employees = [] } = useEmployees(companyId)
  const { data: equipments = [] } = useEquipment()
  const { data: sites = [] } = useSites()
  const { data: departments = [] } = useDepartments()
  const router = useRouter()

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
        placeholder="Pesquisar supervisões..."
        enableRowSelection={true}
        includeSelection={true}
        isLoading={isLoading}
        actionButton={{
          label: "Nova Supervisão",
          onClick: () => router.push('/dashboard/service/supervision/create'),
        }}
      />
    </div>
  )
}
