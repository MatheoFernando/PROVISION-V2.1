"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { toast } from "sonner"
import { z } from "zod"
import { Eye, Edit, Trash2, User, Building, Settings, Building2, MoreHorizontal, Shield, UserX } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { DataTableGeneric } from "@/components/common/base-ui/data-table-generic"
import { IconDotsVertical } from "@tabler/icons-react"

// Schemas para diferentes tipos de dados
export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
  status: z.string(),
  lastLogin: z.string(),
  department: z.string(),
})

export const companySchema = z.object({
  id: z.number(),
  name: z.string(),
  industry: z.string(),
  employees: z.number(),
  status: z.string(),
  location: z.string(),
  revenue: z.string(),
})

type User = z.infer<typeof userSchema>
type Company = z.infer<typeof companySchema>


// Componente para ações com dropdown
function ActionsButtons({ 
  item, 
  tabType 
}: { 
  item: User | Company
  tabType: 'users' | 'companies'
}) {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)

  const handleAction = (action: string) => {
    const itemName = item.name
    
    switch (action) {
      case 'permissions':
        setIsDrawerOpen(true)
        break
      case 'remove':
        toast.success(`Removendo ${itemName}`)
        break
      case 'disable':
        const actionText = tabType === 'users' ? 'desabilitando usuário' : 'desabilitando empresa'
        toast.success(`${actionText} ${itemName}`)
        break
      default:
        break
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => handleAction('permissions')}>
            <Shield className="size-4 mr-2" />
            Permissões
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction('disable')}>
            {tabType === 'users' ? <UserX className="size-4 mr-2" /> : <Building className="size-4 mr-2" />}
            Desabilitar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            variant="destructive" 
            onClick={() => handleAction('remove')}
          >
            <Trash2 className="size-4 mr-2" />
            Remover
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PermissionsDrawer
        item={item}
        tabType={tabType}
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </>
  )
}

// Componente para permissões de configuração
function PermissionsDrawer({ 
  item, 
  tabType,
  isOpen,
  onOpenChange
}: { 
  item: User | Company
  tabType: 'users' | 'companies'
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  const isMobile = useIsMobile()
  const itemName = item.name
  
  // Estado para os dados editáveis
  const [permissions, setPermissions] = React.useState("read")
  const [status, setStatus] = React.useState("active")
  const [modules, setModules] = React.useState({
    dashboard: true,
    users: true,
    companies: true,
    settings: false
  })

  // Carregar dados específicos do item
  React.useEffect(() => {
    if (isOpen && item) {
      // Simular carregamento de dados específicos baseado no ID
      console.log(`Carregando dados para ${tabType} ID: ${item.id}`)
      
      // Aqui você faria uma requisição para buscar os dados específicos
      // Por exemplo: fetch(`/api/${tabType}/${item.id}/permissions`)
      
      // Por enquanto, vamos usar dados baseados no tipo
      if (tabType === 'users') {
        const user = item as User
        setStatus(user.status === "Ativo" ? "active" : "inactive")
        setPermissions(user.role === "Admin" ? "admin" : "read")
      } else {
        const company = item as Company
        setStatus(company.status === "Ativa" ? "active" : "inactive")
        setPermissions("read")
      }
    }
  }, [isOpen, item, tabType])

  const handleSave = () => {
    // Aqui você salvaria as alterações
    console.log(`Salvando permissões para ${tabType} ID: ${item.id}`, {
      permissions,
      status,
      modules
    })
    
    toast.success(`Permissões salvas para ${itemName}`)
    onOpenChange(false)
  }

  const handleModuleChange = (module: keyof typeof modules) => {
    setModules(prev => ({
      ...prev,
      [module]: !prev[module]
    }))
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} direction={isMobile ? "bottom" : "right"}>
      <DrawerContent className={isMobile ? "h-[85vh]" : "h-[100vh] w-[400px] max-w-[90vw]"}>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Permissões de Configuração</DrawerTitle>
          <DrawerDescription>
            Configure as permissões para {tabType === 'users' ? 'o usuário' : 'a empresa'}: <strong>{itemName}</strong>
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="permissions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="permissions" className="flex items-center gap-2">
                <Shield className="size-4" />
                Permissões
              </TabsTrigger>
              <TabsTrigger value="modules" className="flex items-center gap-2">
                <Settings className="size-4" />
                Módulos
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="permissions" className="p-4 space-y-4">
              <form className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="entity-name">Nome</Label>
                  <Input id="entity-name" value={itemName} disabled />
                </div>
                
                <div className="flex flex-col gap-3">
                  <Label htmlFor="permissions">Permissões</Label>
                  <Select value={permissions} onValueChange={setPermissions}>
                    <SelectTrigger id="permissions" className="w-full">
                      <SelectValue placeholder="Selecione as permissões" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">Apenas Leitura</SelectItem>
                      <SelectItem value="write">Leitura e Escrita</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="none">Sem Acesso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-3">
                  <Label htmlFor="status">Status de Acesso</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                      <SelectItem value="suspended">Suspenso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="modules" className="p-4 space-y-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="modules">Módulos Acessíveis</Label>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="dashboard" 
                      checked={modules.dashboard}
                      onChange={() => handleModuleChange('dashboard')}
                    />
                    <Label htmlFor="dashboard">Dashboard</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="users" 
                      checked={modules.users}
                      onChange={() => handleModuleChange('users')}
                    />
                    <Label htmlFor="users">Usuários</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="companies" 
                      checked={modules.companies}
                      onChange={() => handleModuleChange('companies')}
                    />
                    <Label htmlFor="companies">Empresas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="settings" 
                      checked={modules.settings}
                      onChange={() => handleModuleChange('settings')}
                    />
                    <Label htmlFor="settings">Configurações</Label>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <DrawerFooter>
          <Button onClick={handleSave}>Salvar Permissões</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

// Definições das colunas para cada tipo
const createUserColumns = (): ColumnDef<User>[] => [
  {
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Função",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.role}</Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.status === "Ativo"
      return (
        <Badge variant={isActive ? 'default' : 'destructive'} className={isActive ? 'bg-green-500' : 'bg-orange-200 text-red-600'}>
          {row.original.status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "lastLogin",
    header: "Último Login",
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => (
      <ActionsButtons
        item={row.original}
        tabType="users"
      />
    ),
  },
]

const createCompanyColumns = (): ColumnDef<Company>[] => [
  {
    accessorKey: "name",
    header: "Nome da Empresa",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "industry",
    header: "Indústria",
  },
  {
    accessorKey: "employees",
    header: "Funcionários",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.status === "Ativa"
      return (
        <Badge variant={isActive ? 'default' : 'destructive'} className={isActive ? 'bg-green-500' : 'bg-orange-200 text-red-600'}>
          {row.original.status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "location",
    header: "Localização",
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => (
      <ActionsButtons
        item={row.original}
        tabType="companies"
      />
    ),
  },
]


// Dados de exemplo
const usersData: User[] = [
  {
    id: 1,
    name: "João Silva",
    email: "joao@empresa.com",
    role: "Admin",
    status: "Ativo",
    lastLogin: "2024-01-15",
    department: "TI",
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria@empresa.com",
    role: "User",
    status: "Ativo",
    lastLogin: "2024-01-14",
    department: "Vendas",
  },
  {
    id: 3,
    name: "Pedro Costa",
    email: "pedro@empresa.com",
    role: "Manager",
    status: "Inativo",
    lastLogin: "2024-01-10",
    department: "Marketing",
  },
]

const companiesData: Company[] = [
  {
    id: 1,
    name: "TechCorp Solutions",
    industry: "Tecnologia",
    employees: 150,
    status: "Ativa",
    location: "São Paulo",
    revenue: "R$ 2.5M",
  },
  {
    id: 2,
    name: "InnovaTech",
    industry: "Software",
    employees: 75,
    status: "Ativa",
    location: "Rio de Janeiro",
    revenue: "R$ 1.2M",
  },
  {
    id: 3,
    name: "DataFlow Systems",
    industry: "Consultoria",
    employees: 200,
    status: "Pendente",
    location: "Belo Horizonte",
    revenue: "R$ 3.8M",
  },
]


function Management() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Gerenciamento</h1>
        <p className="text-muted-foreground">
          Gerencie utilizadores, empresas e configurações do sistema
        </p>
      </div>
      
      <Tabs defaultValue="users" className="w-full space-y-6">
        <TabsList className="max-m-3xl">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <User className="size-4" />
            Utilizadores
          </TabsTrigger>
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building2 className="size-4" />
            Empresas
          </TabsTrigger>
        
        </TabsList>
        
        <TabsContent value="users" className="mt-6">
          <DataTableGeneric
            data={usersData}
            columns={createUserColumns()}
            searchKey="name"
            placeholder="Pesquisar usuários..."
            enableRowSelection={true}
            includeSelection={true}
            actionButton={{
              label: "Adicionar Utilizador",
              onClick: () => toast.success("Funcionalidade em desenvolvimento"),
            }}
          />
        </TabsContent>
        
        <TabsContent value="companies" className="mt-6">
          <DataTableGeneric
            data={companiesData}
            columns={createCompanyColumns()}
            searchKey="name"
            placeholder="Pesquisar empresas..."
            enableRowSelection={true}
            includeSelection={true}
            actionButton={{
              label: "Adicionar Empresa",
              onClick: () => toast.success("Funcionalidade em desenvolvimento"),
            }}
          />
        </TabsContent>
 
      </Tabs>
    </div>
  )
}

export default Management