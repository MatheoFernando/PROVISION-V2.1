"use client"

import React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { type User, type Company } from '@/infrastructure/types/domain'
import { Badge } from '@/components/ui/badge'
import { DataTableGeneric } from '../../base-ui/data-table'
import CreateUserDialog from './create-users'
import { Edit, Trash2 } from 'lucide-react'
import { useUsers } from '../../../../infrastructure/hooks/useUsers'
import { useCompaniesQuery } from '@/infrastructure/hooks/useCompanies'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useAuthStore } from '@/infrastructure/hooks/useAuthStore'

function buildColumns(companyById: Record<string, Company | undefined>): ColumnDef<User, unknown>[] {
  return [
   
    {
      accessorKey: 'businessName',
      header: 'Empresa',
      cell: ({ row }) => {
        const user = row.original
        const company = user.companyId ? companyById[user.companyId] : undefined
        return <span className="text-sm text-foreground whitespace-nowrap">{company?.businessName ?? '-'}</span>
      }
    },
    {
      accessorKey: 'cod',
      header: 'Código',
      cell: ({ row }) => {
        const user = row.original
        const company = user.companyId ? companyById[user.companyId] : undefined
        return <span className="text-sm text-foreground whitespace-nowrap">{company?.cod ?? '-'}</span>
      }
    },
    
    { accessorKey: 'phone', header: 'Telefone', cell: ({ row }) => {
      const phone = row.getValue('phone') as string
      return <div>{phone}</div>
    } },
    { 
      accessorKey: 'isGlobalAdmin', 
      header: 'Tipo', 
      cell: ({ getValue }) => {
        const isGlobalAdmin = getValue<boolean>()
        return (
          <Badge variant={isGlobalAdmin ? 'default' : 'secondary'} className={isGlobalAdmin ? 'bg-blue-500' : 'bg-gray-200 text-gray-700'}>
            {isGlobalAdmin ? 'Super Admin' : 'Admin'}
          </Badge>
        )
      }
    },
    { 
      accessorKey: 'status', 
      header: 'Status', 
      cell: ({ getValue }) => {
        const status = getValue<boolean>()
        return (
          <Badge variant={status ? 'default' : 'destructive'} className={status ? 'bg-green-500' : 'bg-orange-200 text-red-600'}>
            {status ? 'Ativo' : 'Inativo'}
          </Badge>
        )
      }
    },
  ]
}

function ListUsers() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const companyId = useAuthStore((state) => state.companyId) || "";
  const { users, isLoading, isError, deleteUser, isDeleting } = useUsers(companyId)
  const companiesQuery = useCompaniesQuery()

  const companyById = React.useMemo<Record<string, Company | undefined>>(() => {
    const map: Record<string, Company | undefined> = {}
    for (const c of (companiesQuery.data ?? [])) {
      if (c.id) map[c.id] = c
    }
    return map
  }, [companiesQuery.data])

  const columns = React.useMemo(() => buildColumns(companyById), [companyById])

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsEditDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedUser) return
    try {
      await deleteUser(selectedUser.id!)
      setIsDeleteDialogOpen(false)
      setSelectedUser(null)
    } catch (error) {
    }
  }

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
    
        <DataTableGeneric
          data={users}
          columns={columns}
          searchKey="phone"
          placeholder="Pesquisar por telefone..."
          isLoading={isLoading || companiesQuery.isLoading}
          actionButton={{
            label: 'Novo Utilizador',
            component: <CreateUserDialog />
          } as any}
          rowActions={[
            {
              label: 'Editar',
              icon: <Edit className="h-2.5 w-2.5 text-gray-600 dark:text-gray-100" />,
              onClick: handleEdit,
              variant: 'ghost'
            },
            {
              label: 'Excluir',
              icon: <Trash2 className="h-2.5 w-2.5 text-gray-600 dark:text-gray-100" />,
              onClick: handleDeleteClick,
              variant: 'ghost'
            }
          ]}
        />
   
      <CreateUserDialog
        user={selectedUser}
        isEdit={true}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        children={null}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o utilizador <strong>{selectedUser?.phone}</strong>? 
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="bg-red-500 hover:bg-red-600 text-white cursor-pointer"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ListUsers
