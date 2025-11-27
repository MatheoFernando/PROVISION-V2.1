"use client"

import React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { type User, type Company } from '@/infrastructure/types/domain'
import { Badge } from '@/components/ui/badge'
import { DataTableGeneric } from '../../base-ui/data-table'
import CreateUserDialog from './users-create'
import { Edit, Trash2 } from 'lucide-react'
import { DeleteModal } from '@/components/ui/delete-modal'
import { useUsers } from '../../../../infrastructure/hooks/useUsers'
import { useCompaniesQuery } from '@/infrastructure/hooks/useCompanies'
import { useAuthStore } from '@/infrastructure/hooks/useAuthStore'

function buildColumns(companyById: Record<string, Company | undefined>): ColumnDef<User, unknown>[] {
  return [

    {
      accessorKey: 'phone', header: 'Telefone', cell: ({ row }) => {
        const phone = row.getValue('phone') as string
        return <div>{phone}</div>
      }
    },
    {
      accessorKey: 'isGlobalAdmin',
      header: 'Função',
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
      header: 'Estado',
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
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null)
  const [usersToDelete, setUsersToDelete] = React.useState<User[]>([])
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const companyId = useAuthStore((state) => state.companyId) || ""
  const { users, isLoading, deleteUser, isDeleting } = useUsers(companyId)
  const companiesQuery = useCompaniesQuery()

  const companyById = React.useMemo<Record<string, Company | undefined>>(() => {
    const map: Record<string, Company | undefined> = {}
    for (const c of companiesQuery.data ?? []) {
      if (c.id) map[c.id] = c
    }
    return map
  }, [companiesQuery.data])

  const columns = React.useMemo(() => buildColumns(companyById), [companyById])

  const resetDeletionState = React.useCallback(() => {
    setUsersToDelete([])
    setIsDeleteDialogOpen(false)
    setSelectedUser(null)
  }, [])

  const executeDeletion = React.useCallback(
    async (targets: User[]) => {
      for (const target of targets) {
        if (!target?.id) continue
        try {
          await deleteUser(target.id)
        } catch (error) {
          continue
        }
      }
    },
    [deleteUser]
  )

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsEditDialogOpen(true)
  }

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user)
    setUsersToDelete([user])
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (usersToDelete.length === 0) {
      resetDeletionState()
      return
    }

    await executeDeletion(usersToDelete)
    resetDeletionState()
  }

  const handleBulkDelete = React.useCallback(
    async (selected: User[]) => {
      if (!selected.length) return
      await executeDeletion(selected)
    },
    [executeDeletion]
  )

  const deleteTitle =
    usersToDelete.length > 1 ? 'Excluir utilizadores' : 'Excluir utilizador'
  const deleteTargetLabel =
    usersToDelete[0]?.employee?.fullName ?? usersToDelete[0]?.phone ?? 'este utilizador'
  const deleteMessage =
    usersToDelete.length > 1
      ? `Tem certeza que deseja excluir ${usersToDelete.length} utilizadores selecionados? Esta ação não pode ser desfeita.`
      : `Tem certeza que deseja excluir ${deleteTargetLabel}? Esta ação não pode ser desfeita.`

  return (
    <div className="space-y-6">
      <DataTableGeneric
        data={users}
        columns={columns}
        searchKey="phone"
        placeholder="Pesquisar por telefone..."
        enableRowSelection
        includeSelection
        dateKey="createdAt"
        onBulkDelete={handleBulkDelete}
        isLoading={isLoading || companiesQuery.isLoading}
        actionButton={{
          label: 'Novo Utilizador',
          component: <CreateUserDialog />
        }}
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
        isEdit
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        children={null}
      />
      <DeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={resetDeletionState}
        onConfirm={handleConfirmDelete}
        title={deleteTitle}
        message={deleteMessage}
        isLoading={isDeleting}
      />
    </div>
  )
}

export default ListUsers
