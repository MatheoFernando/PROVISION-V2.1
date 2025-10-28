"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/infrastructure/utils/api'
import type { ColumnDef } from '@tanstack/react-table'
import {Company } from '@/infrastructure/schema/schema-company'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DataTableGeneric } from '../../base-ui/data-table-generic'
import { Eye, Edit, Trash2 } from 'lucide-react'

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
            <span className="text-sm text-muted-foreground">{company.cod}</span>
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
    cell: ({ getValue }) => {
      const email = getValue<string>()
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
    cell: ({ getValue }) => {
      const country = getValue<string>()
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
    cell: ({ getValue }) => {
      const municipality = getValue<string>()
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

  const mockData: Company[] = [
    {
      id: '1',
      cod: 'EMP001',
      businessName: 'Tech Solutions Ltda',
      taxName: 'Tech Solutions - Tecnologia e Inovação Ltda',
      nif: '123456789',
      status: true,
      photo: null,
      email: 'contato@techsolutions.com',
      country: 'Brasil',
      municipality: 'São Paulo',
    },
    {
      id: '2',
      cod: 'EMP002',
      businessName: 'Global Commerce S.A.',
      taxName: 'Global Commerce - Importação e Exportação S.A.',
      nif: '987654321',
      status: true,
      photo: null,
      email: 'info@globalcommerce.com',
      country: 'Brasil',
      municipality: 'Rio de Janeiro',
    },
    {
      id: '3',
      cod: 'EMP003',
      businessName: 'Digital Marketing Agency',
      taxName: 'Digital Marketing Agency - Comunicação Digital Ltda',
      nif: '456789123',
      status: false,
      photo: null,
      email: 'contato@digitalmarketing.com',
      country: 'Brasil',
      municipality: 'Belo Horizonte',
    },
    {
      id: '4',
      cod: 'EMP004',
      businessName: 'Green Energy Corp',
      taxName: 'Green Energy - Energias Renováveis Corp',
      nif: '789123456',
      status: true,
      photo: null,
      email: 'info@greenenergy.com',
      country: 'Brasil',
      municipality: 'Curitiba',
    },
    {
      id: '5',
      cod: 'EMP005',
      businessName: 'Food & Beverage Group',
      taxName: 'Food & Beverage - Alimentos e Bebidas Group',
      nif: '321654987',
      status: true,
      photo: null,
      email: 'contato@foodbeverage.com',
      country: 'Brasil',
      municipality: 'Porto Alegre',
    },
  ]

  const { data, isLoading, isError } = useQuery({
    queryKey: ['companies'],
    queryFn: async (): Promise<Company[]> => {
      try {
        const { data } = await api.get('/company/GetAll')
        console.log("teste" , data.data)
        return data?.data ?? []
      } catch {
        // Sempre retorna mock quando não há dados da API
        return mockData
      }
    },
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    // Sempre mostra dados mockados imediatamente
    initialData: mockData,
  })

  // Sempre mostra dados mockados quando não há dados da API
  const displayData = data && data.length > 0 ? data : mockData

  const handleView = (company: Company) => {
    console.log('Visualizar empresa:', company)
    router.push(`/dashboard/companies/id=${company.id}`)
  }

  const handleEdit = (company: Company) => {
    console.log('Editar empresa:', company)
    router.push(`/dashboard/company/form?id=${company.id}`)
  }

  const handleDelete = (company: Company) => {
    console.log('Excluir empresa:', company)
  }



  return (
    <div className="space-y-6">
      <DataTableGeneric
        data={displayData}
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
       </div>
  )
}

export default ListCompany
