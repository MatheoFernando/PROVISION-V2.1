"use client"

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PermissionsMatrix } from './permissions-matrix'
import { DepartmentSelect } from '@/components/common/base-ui/selects/department-select'
import { RoleSelect } from '@/components/common/base-ui/selects/role-select'
import { ModuleSelect } from '@/components/common/base-ui/selects/module-select'
import {  useCreateRolePermission, useRolePermissionsByRoleId } from '@/infrastructure/hooks/useRolePermissions'
import { usePermissions } from '@/infrastructure/hooks/usePermissions'
import { useRolesAll } from '@/infrastructure/hooks/useRoles'
import type { Permission, RolePermission, User, Role } from '@/infrastructure/types/domain'
import { Loader2 } from 'lucide-react'
import { PermissionCreate } from './permissions-create'

interface RolePermissionsModalProps {
    roleId?: string | null
    roleName?: string
    companyId: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function RolePermissionsModal({
    roleId,
    companyId,
    open,
    onOpenChange,
}: RolePermissionsModalProps) {
    const [selectedDepartmentId, setSelectedDepartmentId] = React.useState<string | undefined>(undefined)
    const [selectedRoleId, setSelectedRoleId] = React.useState<string | undefined>(roleId || undefined)
    const [selectedModuleId, setSelectedModuleId] = React.useState<string | undefined>(undefined)

    React.useEffect(() => {
        if (open) {
            setSelectedRoleId(roleId || undefined)
        }
    }, [open, roleId])


    const { data: allRolePermissions, isLoading: isLoadingRolePerms, refetch } = useRolePermissionsByRoleId(selectedRoleId)
   
    const { data: allPermissions } = usePermissions()
    const { data: allRoles } = useRolesAll(companyId)
    
    const { mutateAsync: createRolePermission, isPending: isCreating } = useCreateRolePermission()

    const [currentRolePermissions, setCurrentRolePermissions] = React.useState<RolePermission[]>([])
    const [pendingUpdates, setPendingUpdates] = React.useState<Record<string, number>>({})

    const isLoading = isLoadingRolePerms || isCreating

    React.useEffect(() => {
        if (allRolePermissions) {
            setCurrentRolePermissions(allRolePermissions)
            setPendingUpdates({})
        } else {
             setCurrentRolePermissions([])
        }
    }, [allRolePermissions])

    const handleUpdate = (permissionId: string, level: number) => {
        setPendingUpdates(prev => ({
            ...prev,
            [permissionId]: level
        }))
        
        setCurrentRolePermissions(prev => {
            // Logic to find if we already have an entry for this permission AND module (if selected)
            let existingIndex = -1;
            
            if (selectedModuleId) {
                 existingIndex = prev.findIndex(p => p.permissionId === permissionId && p.moduleId === selectedModuleId);
            } else {
                 existingIndex = prev.findIndex(p => p.permissionId === permissionId && (p.moduleId === permissionId || !p.moduleId));
                 if (existingIndex === -1) existingIndex = prev.findIndex(p => p.permissionId === permissionId);
            }

            if (existingIndex >= 0) {
                const updated = [...prev]
                updated[existingIndex] = { ...updated[existingIndex], permissionLevel: level }
                return updated
            } else {
                 return [...prev, {
                    roleId: selectedRoleId!,
                    permissionId: permissionId, 
                    moduleId: selectedModuleId || permissionId,
                    companyId,
                    permissionLevel: level
                } as RolePermission]
            }
        })
    }

    const handleSave = async () => {
        if (!selectedRoleId) {
            toast.error("Selecione uma função para salvar")
            return
        }
        
        try {
            const roleDef = allRoles?.find((r: Role) => r.id === selectedRoleId)
            const roleName = roleDef?.name || "Unknown Role"

            const promises = Object.entries(pendingUpdates).map(async ([permissionId, level]) => {
                 const permissionDef = allPermissions?.find((p: Permission) => p.id === permissionId)
                 const permissionName = permissionDef?.name || "Unknown Permission"
            
                return createRolePermission({
                    roleId: selectedRoleId,
                    permissionId,
                    moduleId: selectedModuleId || null, 
                    companyId,
                    permissionLevel: level, 
                    permissions: permissionName,
                    roles: roleName,
                } as any)
            })
            
            await Promise.all(promises)
            
            toast.success('Permissões da função atualizadas!')
            refetch()
            onOpenChange(false)
        } catch (error) {
            console.error(error)
            toast.error('Erro ao salvar permissões')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="px-6 py-8 border-b border-gray-100 bg-white dark:bg-slate-900/50 flex-shrink-0 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl font-bold">
                                Gerenciamento de Permissões
                            </DialogTitle>
                            <p className="text-sm text-gray-500 mt-1">
                                Defina os níveis de acesso para as funções do sistema.
                            </p>
                        </div>
                        <PermissionCreate />
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-2">
                         <div className="col-span-1">
                             <DepartmentSelect
                                 value={selectedDepartmentId}
                                 onChange={(val) => {
                                     setSelectedDepartmentId(val)
                                 }}
                                 companyId={companyId}
                             />
                         </div>
                         <div className="col-span-1">
                             <RoleSelect 
                                 value={selectedRoleId}
                                 onChange={setSelectedRoleId}
                                 companyId={companyId}
                                 departmentId={selectedDepartmentId}
                             />
                         </div>
                         <div className="col-span-1">
                             <ModuleSelect
                                value={selectedModuleId}
                                onChange={(val: string) => setSelectedModuleId(val === 'CLEAR_SELECTION' ? undefined : val)}
                                companyId={companyId}
                             />
                         </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6 bg-gray-50/10">
                   {isLoading ? (
                       <div className="flex flex-col items-center justify-center p-12 h-64">
                           <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
                           <p className="text-gray-400 font-medium">Carregando permissões...</p>
                       </div>
                   ) : (
                        <div className="space-y-6">
                            <PermissionsMatrix
                                rolePermissions={currentRolePermissions}
                                allPermissions={allPermissions || []}
                                onUpdate={handleUpdate}
                                readOnly={!selectedRoleId}
                                selectedModuleId={selectedModuleId}
                            />
                        </div>
                   )}

                </ScrollArea>

                <DialogFooter className="p-4 border-t border-gray-100 bg-white dark:bg-slate-900/50 flex-shrink-0 z-10">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded"
                    >
                        Fechar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isLoading || !selectedRoleId || Object.keys(pendingUpdates).length === 0}
                        className="shadow-lg rounded px-6 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {isLoading ? 'A guardar...' : 'Salvar Alterações'}
                    </Button>
                </DialogFooter>
            </DialogContent>
            
           
        </Dialog>
    )
}

export function ChangePermissionsModal({
    user,
    open,
    onOpenChange
}: {
    user: User | null
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    if (!user) return null

    return (
        <RolePermissionsModal
            roleId={user.roleId || null}
            roleName={user.roleId ? "Função do Utilizador" : undefined}
            companyId={user.companyId || ""}
            open={open}
            onOpenChange={onOpenChange}
        />
    )
}
