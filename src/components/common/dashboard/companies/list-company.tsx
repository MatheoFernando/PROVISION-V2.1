"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { useCompaniesQuery, useDeleteCompanyMutation } from '@/infrastructure/hooks/useCompanies'
import type { ColumnDef } from '@tanstack/react-table'
import type { Company } from '@/types/domain'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DataTableGeneric } from '../../base-ui/data-table'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DeleteModal } from '@/components/ui/delete-modal'

function getPrimaryAddress(company: any) {
  return company?.address ?? company?.addresses?.[0] ?? undefined
}

function getPrimaryContact(company: any) {
  return company?.contact ?? company?.contacts?.[0] ?? undefined
}

const columns: ColumnDef<Company, unknown>[] = [
  {
    accessorKey: 'businessName',
    header: 'Empresa',
    cell: ({ row }) => {
      const company = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 rounded-sm">
            <AvatarImage src={company.photo || undefined} alt={company.businessName} className='rounded-sm'/>
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-base rounded-sm">
              {company.businessName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm text-foreground font-medium leading-none">{company.businessName}</span>
          </div>
        </div>
      )
    }
  },
  { 
    accessorKey: 'taxName', 
    header: 'Nome Fiscal',
    cell: ({ getValue }) => (
      <span className="text-sm text-foreground whitespace-nowrap">{getValue<string>()}</span>
    )
  },
  { 
    accessorKey: 'nif', 
    header: 'NIF',
    cell: ({ getValue }) => (
      <span className="text-sm text-foreground whitespace-nowrap">{getValue<string>()}</span>
    )
  },
  { 
    accessorKey: 'email', 
    header: 'Email',
    cell: ({ row }) => {
      const c: any = row.original as any
      const email: string | undefined = getPrimaryContact(c)?.email
      return email ? (
        <span className="text-sm text-gray-700 whitespace-nowrap">{email}</span>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      )
    }
  },
  { 
    accessorKey: 'country', 
    header: 'País',
    cell: ({ row }) => {
      const c: any = row.original as any
      const country: string | undefined = getPrimaryAddress(c)?.country
      return country ? (
        <span className="text-sm text-gray-700 whitespace-nowrap">{country}</span>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      )
    }
  },
  { 
    accessorKey: 'municipality', 
    header: 'Município',
    cell: ({ row }) => {
      const c: any = row.original as any
      const municipality: string | undefined = getPrimaryAddress(c)?.municipality
      return municipality ? (
        <span className="text-sm text-gray-700 whitespace-nowrap">{municipality}</span>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      )
    }
  },

]

function ListCompany() {
  const router = useRouter()
  const { data, isLoading, isError } = useCompaniesQuery()
  const { mutateAsync: deleteAsync } = useDeleteCompanyMutation()

  const [viewOpen, setViewOpen] = React.useState(false)
  const [selectedCompany, setSelectedCompany] = React.useState<Company | null>(null)
  const [deleteOpen, setDeleteOpen] = React.useState(false)

  const handleView = (company: Company) => {
    setSelectedCompany(company)
    setViewOpen(true)
  }

  const handleEdit = (company: Company) => {
    router.push(`/dashboard/companies/create?id=${company.id}`)
  }

  const handleDelete = async (company: Company) => {
    setSelectedCompany(company)
    setDeleteOpen(true)
  }



  return (
    <div className="space-y-6">
      <DataTableGeneric
        data={data ?? []}
        columns={columns}
        searchKey="businessName"
        placeholder="Pesquisar empresa..."
        enableRowSelection={true}
        includeSelection={true}
        isLoading={isLoading}
        actionButton={{
          label: 'Nova Empresa',
          onClick: () => router.push('/dashboard/companies/create'),
        }}
        rowActions={[
          {
            label: 'Visualizar',
            icon: <Eye className="h-2.5 w-2.5 text-gray-600 dark:text-gray-100" />,
            onClick: handleView,
            variant: 'ghost'
          },
          {
            label: 'Editar',
            icon: <Edit className="h-2.5 w-2.5 text-gray-600 dark:text-gray-100" />,
            onClick: handleEdit,
            variant: 'ghost'
          },
          {
            label: 'Excluir',
            icon: <Trash2 className="h-2.5 w-2.5 text-gray-600 dark:text-gray-100" />,
            onClick: handleDelete,
            variant: 'ghost'
          }
        ]}
      />

  
      <Dialog open={viewOpen} onOpenChange={(o) => { if (!o) { setViewOpen(false); setSelectedCompany(null) } }}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedCompany && (
                <>
                  <Avatar className="h-10 w-10 rounded-sm">
                    <AvatarImage src={selectedCompany.photo || undefined} alt={selectedCompany.businessName} className='rounded-sm'/>
                    <AvatarFallback className="rounded-sm">
                      {selectedCompany.businessName?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{selectedCompany.businessName}</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>Informações da empresa</DialogDescription>
          </DialogHeader>
          {selectedCompany && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="text-muted-foreground">Código</div>
                  <div className="text-foreground font-medium">{selectedCompany.cod}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">NIF</div>
                  <div className="text-foreground font-medium">{selectedCompany.nif}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Nome Fiscal</div>
                  <div className="text-foreground">{selectedCompany.taxName}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Email</div>
                  <div className="text-foreground">{getPrimaryContact(selectedCompany as any)?.email ?? '-'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">País</div>
                  <div className="text-foreground">{getPrimaryAddress(selectedCompany as any)?.country ?? '-'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Município</div>
                  <div className="text-foreground">{getPrimaryAddress(selectedCompany as any)?.municipality ?? '-'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Estado</div>
                  <div className="text-foreground">{selectedCompany.status ? 'Ativa' : 'Inativa'}</div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => { setViewOpen(false); setSelectedCompany(null) }} className="cursor-pointer">Fechar</Button>
                <Button onClick={() => { setViewOpen(false); if (selectedCompany?.id) router.push(`/dashboard/companies/create?id=${selectedCompany.id}`) }} className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">Editar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

  
      <DeleteModal
        isOpen={deleteOpen}
        onClose={() => { setDeleteOpen(false); setSelectedCompany(null) }}
        onConfirm={async () => {
          if (!selectedCompany?.id) return
          try {
            await deleteAsync(selectedCompany.id)
          } finally {
            setDeleteOpen(false)
            setSelectedCompany(null)
          }
        }}
        title="Excluir empresa"
        message={`Tem certeza que deseja excluir a empresa ${selectedCompany?.businessName ?? ''} ? Esta ação não pode ser desfeita.`}
      />
       </div>
  )
}

export default ListCompany
