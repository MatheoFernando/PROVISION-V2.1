"use client"

import React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { type User, type Company } from '@/infrastructure/types/domain'
import { Badge } from '@/components/ui/badge'
import { DataTableGeneric } from '../../base-ui/data-table'
import CreateUserDialog from './users-create'
import {  Bell, ChartLine, PencilSimple, ShieldCheck, Trash,  } from "phosphor-react";
import { DeleteModal } from '@/components/ui/delete-modal'
import { useUsers } from '../../../../infrastructure/hooks/useUsers'
import { useCompaniesQuery } from '@/infrastructure/hooks/useCompanies'
import { useAuthStore } from '@/infrastructure/hooks/useAuthStore'
import { SendNotificationDrawer } from './send-notification-drawer'
import { ChangePermissionsDrawer } from './permissions-drawer'
import { ViewActivityDrawer } from './view-activity-drawer'
import { Send } from 'lucide-react'

const resolveName = (value: unknown) => {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value !== null && 'name' in value) {
    const name = (value as { name?: unknown }).name
    if (typeof name === 'string') return name
  }
  return ''
}

function buildColumns(companyById: Record<string, Company | undefined>): ColumnDef<User, unknown>[] {
  return [

    {
      accessorKey: 'phone', header: 'Telefone', cell: ({ row }) => {
        const phone = row.getValue('phone') as string
        return <div>{phone}</div>
      }
    },
    {
      accessorKey: 'role',
      header: 'Função',
      cell: ({ row }) => {
        const roleValue = row.getValue('role')
        const roleLabel = resolveName(roleValue)
        return <div>{roleLabel || 'N/A'}</div>
      }
    },
    {
      accessorKey: 'department',
      header: 'Departamento',
      cell: ({ row }) => {
        const departmentValue = row.getValue('department')
        const departmentLabel = resolveName(departmentValue)
        return <div>{departmentLabel || 'N/A'}</div>
      }
    },
    {
      accessorKey: 'company',
      header: 'Empresa',
      cell: ({ row }) => {
        const company = row.getValue('company') as Company
        return <div>{company?.name || 'N/A'}</div>
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
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = React.useState(false)
  const [isPermissionsDrawerOpen, setIsPermissionsDrawerOpen] = React.useState(false)
  const [isActivityDrawerOpen, setIsActivityDrawerOpen] = React.useState(false)

  const companyId = useAuthStore((state) => state.companyId) || ""
  const isGlobalAdmin = useAuthStore((state) => state.isGlobalAdmin)
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

  const handleSendNotification = (user: User) => {
    setSelectedUser(user)
    setIsNotificationDrawerOpen(true)
  }

  const handleChangePermissions = (user: User) => {
    setSelectedUser(user)
    setIsPermissionsDrawerOpen(true)
  }

  const handleViewActivity = (user: User) => {
    setSelectedUser(user)
    setIsActivityDrawerOpen(true)
  }


  const rowActions = React.useMemo(() => {
    const actions = [
      {
        label: 'Editar',
        icon: <PencilSimple className="h-2.5 w-2.5 text-gray-600 dark:text-gray-100" />,
        onClick: handleEdit,
        variant: 'ghost' as const
      },
      {
        label: 'Excluir',
        icon: <Trash className="h-2.5 w-2.5 text-gray-600 dark:text-gray-100" />,
        onClick: handleDeleteClick,
        variant: 'ghost' as const
      }
    ]

    if (isGlobalAdmin) {
      actions.push(
        {
          label: 'Alterar permissões',
          icon: <ShieldCheck className="h-2.5 w-2.5 text-gray-600 dark:text-gray-100" />,
          onClick: handleChangePermissions,
          variant: 'ghost' as const
        },
        {
          label: 'Enviar notificação',
          icon: <Send className="h-2.5 w-2.5 text-gray-600 dark:text-gray-100" />,
          onClick: handleSendNotification,
          variant: 'ghost' as const
        }
  
      )
    } else {
     
      actions.push(
        {
          label: 'Enviar notificação ',
          icon: <Send className="h-2.5 w-2.5 text-gray-600 dark:text-gray-100" />,
          onClick: handleSendNotification,
          variant: 'ghost' as const
        },
        {
          label: 'Ver atividade dos seus utilizadores',
          icon: <ChartLine className="h-2.5 w-2.5 text-gray-600 dark:text-gray-100" />,
          onClick: handleViewActivity,
          variant: 'ghost' as const
        }
      )
    }

    return actions
  }, [isGlobalAdmin])

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
        rowActions={rowActions}
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

      <SendNotificationDrawer
        user={selectedUser}
        open={isNotificationDrawerOpen}
        onOpenChange={setIsNotificationDrawerOpen}
      />
      <ChangePermissionsDrawer
        user={selectedUser}
        open={isPermissionsDrawerOpen}
        onOpenChange={setIsPermissionsDrawerOpen}
      />
      <ViewActivityDrawer
        user={selectedUser}
        open={isActivityDrawerOpen}
        onOpenChange={setIsActivityDrawerOpen}
      />
  
    </div>
  )
}

export default ListUsers
