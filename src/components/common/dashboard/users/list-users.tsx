"use client"

import React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { type User } from '@/infrastructure/schema/schema-user'
import { Badge } from '@/components/ui/badge'
import { DataTableGeneric } from '../../base-ui/data-table-generic'
import CreateUserDialog from './create-users'
import { Edit, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUsers } from '../../../../infrastructure/hooks/useUsers'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const columns: ColumnDef<User, unknown>[] = [
  {
    accessorKey: 'businessName',
    header: 'Empresa',
    cell: ({ row }) => {
      const company = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 rounded-sm">
            <AvatarImage src={undefined} alt="teste" className='rounded-sm'/>
            <AvatarFallback className="bg-blue-100 text-blue-600 font-medium text-base rounded-sm">
              f
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">teste</span>
          </div>
        </div>
      )
    }
  },
  { accessorKey: 'phone', header: 'Telefone' },
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

function ListUsers() {
  const router = useRouter()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  const mockData: User[] = [
    {
      id: '1',
      
      phone: '923456789',
      status: true,
      companyId: '1',
      isGlobalAdmin: true,
    },
    {
      id: '2',
      phone: '987654321',
      status: true,
      companyId: '1',
      isGlobalAdmin: false,
    },
    {
      id: '3',
      phone: '945678123',
      status: false,
      companyId: '2',
      isGlobalAdmin: false,
    },
    {
      id: '4',
      phone: '978912345',
      status: true,
      companyId: '2',
      isGlobalAdmin: false,
    },
    {
      id: '5',
      phone: '912345678',
      status: true,
      companyId: '3',
      isGlobalAdmin: true,
    },
  ]

  const { users, isLoading, isError, deleteUser, isDeleting } = useUsers()

  // Sempre mostra dados mockados quando não há dados da API
  const displayData = users.length > 0 ? users : mockData

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsEditDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedUser) return
    try {
      await deleteUser(selectedUser.id)
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
        data={displayData}
        columns={columns}
        searchKey="phone"
        placeholder="Pesquisar por telefone..."
        isLoading={isLoading}
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
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ListUsers
