"use client"

import React from 'react'
import { User } from '@/infrastructure/types/domain'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { X, Download } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ViewActivityDrawerProps {
    user: User | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

// Mock activity data - replace with actual API call
interface Activity {
    id: string
    type: string
    description: string
    timestamp: Date
    status: 'success' | 'warning' | 'error'
}

const MOCK_ACTIVITIES: Activity[] = [
    {
        id: '1',
        type: 'login',
        description: 'Login realizado com sucesso',
        timestamp: new Date(2025, 10, 28, 10, 30),
        status: 'success',
    },
    {
        id: '2',
        type: 'create',
        description: 'Criou novo cliente: Empresa XYZ',
        timestamp: new Date(2025, 10, 28, 9, 15),
        status: 'success',
    },
    {
        id: '3',
        type: 'edit',
        description: 'Editou dados do local: Armazém Central',
        timestamp: new Date(2025, 10, 27, 16, 45),
        status: 'success',
    },
    {
        id: '4',
        type: 'delete',
        description: 'Tentou excluir equipamento sem permissão',
        timestamp: new Date(2025, 10, 27, 14, 20),
        status: 'error',
    },
    {
        id: '5',
        type: 'export',
        description: 'Exportou relatório de supervisões',
        timestamp: new Date(2025, 10, 26, 11, 0),
        status: 'success',
    },
]

const ACTIVITY_TYPES = [
    { value: 'all', label: 'Todas as Atividades' },
    { value: 'login', label: 'Login' },
    { value: 'create', label: 'Criação' },
    { value: 'edit', label: 'Edição' },
    { value: 'delete', label: 'Exclusão' },
    { value: 'export', label: 'Exportação' },
]

export function ViewActivityDrawer({
    user,
    open,
    onOpenChange,
}: ViewActivityDrawerProps) {
    const [activityType, setActivityType] = React.useState('all')
    const [activities, setActivities] = React.useState<Activity[]>([])
    const [isLoading, setIsLoading] = React.useState(false)

    React.useEffect(() => {
        if (open && user) {
            loadActivities()
        }
    }, [open, user])

    const loadActivities = async () => {
        setIsLoading(true)
        try {
          
            await new Promise((resolve) => setTimeout(resolve, 500))
            setActivities(MOCK_ACTIVITIES)
        } catch (error) {
            console.error('Error loading activities:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const filteredActivities =
        activityType === 'all'
            ? activities
            : activities.filter((activity) => activity.type === activityType)



    const getStatusColor = (status: Activity['status']) => {
        switch (status) {
            case 'success':
                return 'bg-green-500'
            case 'warning':
                return 'bg-yellow-500'
            case 'error':
                return 'bg-red-500'
            default:
                return 'bg-gray-500'
        }
    }

    const getStatusLabel = (status: Activity['status']) => {
        switch (status) {
            case 'success':
                return 'Sucesso'
            case 'warning':
                return 'Aviso'
            case 'error':
                return 'Erro'
            default:
                return 'Desconhecido'
        }
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange} direction="right">
            <DrawerContent>
                <DrawerHeader className="border-b">
                    <div className="flex items-center justify-between">
                        <div>
                            <DrawerTitle>Ver Atividade do Utilizador</DrawerTitle>
                            <DrawerDescription>
                                Histórico de atividades de {user?.employee?.fullName || user?.phone}
                            </DrawerDescription>
                        </div>
                        <DrawerClose>
                            <X className="h-4 w-4" />
                        </DrawerClose>
                    </div>
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <Select value={activityType} onValueChange={setActivityType}>
                                <SelectTrigger id="activity-type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ACTIVITY_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                      
                    </div>

                    <ScrollArea className="h-[500px]">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-32">
                                <p className="text-muted-foreground">Carregando atividades...</p>
                            </div>
                        ) : filteredActivities.length === 0 ? (
                            <div className="flex items-center justify-center h-32">
                                <p className="text-muted-foreground">
                                    Nenhuma atividade encontrada
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredActivities.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="border rounded-lg p-4 space-y-2"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">
                                                    {activity.description}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {format(activity.timestamp, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                                                        locale: ptBR,
                                                    })}
                                                </p>
                                            </div>
                                            <Badge
                                                variant="default"
                                                className={getStatusColor(activity.status)}
                                            >
                                                {getStatusLabel(activity.status)}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                
                </div>

               
            </DrawerContent>
        </Drawer>
    )
}
