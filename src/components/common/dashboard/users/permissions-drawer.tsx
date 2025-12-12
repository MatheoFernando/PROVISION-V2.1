"use client"

import React from 'react'
import { User } from '@/infrastructure/types/domain'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RoleSelect } from '@/components/common/base-ui/selects/role-select'
import { DepartmentSelect } from '@/components/common/base-ui/selects/department-select'

import { PermissionsMatrix } from './permissions-matrix'

interface ChangePermissionsDrawerProps {
    user: User | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ChangePermissionsDrawer({
    user,
    open,
    onOpenChange,
}: ChangePermissionsDrawerProps) {
    const [selectedRole, setSelectedRole] = React.useState<string>('')
    const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([])
    const [isLoading, setIsLoading] = React.useState(false)
    const [selectedDepartmentId, setSelectedDepartmentId] = React.useState<string>('')

    React.useEffect(() => {
        if (open && user) {
            setSelectedRole(user.roleId || '')
            setSelectedPermissions(user.permissions || [])
            setSelectedDepartmentId(
                user.departmentId || user.employee?.departmentId || ''
            )
        }
    }, [open, user])

    const handlePermissionToggle = (permissionId: string) => {
        setSelectedPermissions((prev) =>
            prev.includes(permissionId)
                ? prev.filter((id) => id !== permissionId)
                : [...prev, permissionId]
        )
    }

    const handleSave = async () => {
        setIsLoading(true)
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            toast.success('Permissões atualizadas com sucesso')
            onOpenChange(false)
        } catch (error) {
            toast.error('Erro ao atualizar permissões')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange} direction="right">
            <DrawerContent className="flex flex-col h-full w-[85vw] max-w-[1000px] sm:w-full">
                <DrawerHeader className="border-b border-gray-200 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <DrawerTitle className="text-xl font-bold">
                                Permissões
                            </DrawerTitle>
                            <p className="text-sm text-gray-500 mt-1">
                                {user?.employee?.fullName || user?.phone}
                            </p>
                        </div>
                        <DrawerClose className="hover:bg-gray-100 rounded-full p-2 transition-colors">
                            <X className="h-5 w-5" />
                        </DrawerClose>
                    </div>
                </DrawerHeader>

                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-6 pr-4">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-gray-700 block">
                                    Função
                                </Label>
                                <RoleSelect
                                    value={selectedRole}
                                    onChange={setSelectedRole}
                                    companyId={user?.companyId}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-gray-700 block">
                                    Departamento
                                </Label>
                                <DepartmentSelect
                                    value={selectedDepartmentId}
                                    onChange={(value) => setSelectedDepartmentId(value)}
                                    companyId={user?.companyId}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>


                        <div>
                            <div className="mb-4 flex items-center justify-between">
                                <Label className="text-sm font-semibold text-gray-700 block">
                                    Matriz de Permissões
                                </Label>
                                <div className="bg-primary/10 rounded-full px-3 py-1 border border-primary/20">
                                    <p className="text-xs text-primary font-medium">
                                        {selectedPermissions.length} selecionadas
                                    </p>
                                </div>
                            </div>

                            <PermissionsMatrix
                                selectedPermissions={selectedPermissions}
                                onToggle={handlePermissionToggle}
                            />
                        </div>
                    </div>
                </ScrollArea>


                <div className="flex justify-end gap-2 w-full  space-y-2 p-6">
                    <Button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="w-fit h-10 font-medium rounded-lg transition-colors"
                    >
                        {isLoading ? 'A guardar...' : 'Salvar Alterações'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="w-fit h-10 border-gray-300 text-gray-700 hover:bg-gray-100 font-medium rounded-lg transition-colors"
                    >
                        Cancelar
                    </Button>
                </div>
            </DrawerContent>
        </Drawer>
    )
}