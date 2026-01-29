import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ShieldCheck } from 'lucide-react'

import { Checkbox } from '@/components/ui/checkbox'
import { RolePermission, Permission } from '@/infrastructure/types/domain'

interface PermissionsMatrixProps {
    rolePermissions: RolePermission[]
    allPermissions: Permission[]
    onUpdate: (permissionId: string, level: number) => void
    readOnly?: boolean
    selectedIds?: string[]
    onSelectionChange?: (ids: string[]) => void
    selectedModuleId?: string | undefined
}

const LEVELS = [
    { value: 1, label: 'Visualizar' },
    { value: 2, label: 'Criar' },
    { value: 3, label: 'Editar' },
    { value: 4, label: 'Eliminar' },
    { value: 5, label: 'Gerir' },
]

export function PermissionsMatrix({
    rolePermissions,
    allPermissions,
    onUpdate,
    readOnly = false,
    selectedIds = [],
    onSelectionChange,
    selectedModuleId,
}: PermissionsMatrixProps) {

    const getLevel = (permissionId: string) => {
     
        let perm;
        if (selectedModuleId) {
             perm = rolePermissions.find(p => p.permissionId === permissionId && p.moduleId === selectedModuleId);
        } else {
             perm = rolePermissions.find(p => p.permissionId === permissionId);
        }
        
        return perm?.permissionLevel ?? 0;
    }

    const rowVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.03, duration: 0.3 },
        }),
    }
    
    const handleSelectAll = (checked: boolean) => {
        if (onSelectionChange) {
            if (checked) {
                onSelectionChange(allPermissions.map(p => p.id!).filter(Boolean))
            } else {
                onSelectionChange([])
            }
        }
    }

    const handleSelectOne = (id: string, checked: boolean) => {
        if (onSelectionChange) {
            if (checked) {
                onSelectionChange([...selectedIds, id])
            } else {
                onSelectionChange(selectedIds.filter(selectedId => selectedId !== id))
            }
        }
    }

    const allSelected = allPermissions.length > 0 && selectedIds.length === allPermissions.length

    if (allPermissions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center border rounded-2xl bg-gray-50 border-gray-100 dark:bg-gray-900/50 dark:border-gray-800">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-sm mb-3">
                     <ShieldCheck className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Não há permissões</h3>
                <p className="text-xs text-gray-500 max-w-xs mt-1">
                    Não existem permissões definidas no sistema. Crie uma nova permissão para começar.
                </p>
            </div>
        )
    }

    return (
        <div className="w-full  border border-gray-100 bg-white  dark:border-gray-800 dark:bg-gray-950">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] border-collapse text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/30 dark:border-gray-800 dark:bg-gray-900/20">
                            {onSelectionChange && (
                                <th className="px-4 py-5 w-12 text-center">
                                    <Checkbox 
                                        checked={allSelected}
                                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                    />
                                </th>
                            )}
                            <th className="px-6 py-5 text-left font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                                Módulo / Permissão
                            </th>
                            {LEVELS.map((level) => (
                                <th
                                    key={level.value}
                                    className="px-6 py-5 text-center font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider"
                                >
                                    {level.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {allPermissions.map((permission, i) => {
                            if (!permission.id) return null;
                            const currentLevel = getLevel(permission.id);
                            const isSelected = selectedIds.includes(permission.id);
                            
                            return (
                                <motion.tr
                                    key={permission.id}
                                    custom={i}
                                    initial="hidden"
                                    animate="visible"
                                    variants={rowVariants}
                                    className={cn(
                                        "group border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors dark:border-gray-800/50 dark:hover:bg-gray-900/50",
                                        isSelected && "bg-blue-50/30 hover:bg-blue-50/50 dark:bg-blue-900/10"
                                    )}
                                >
                                    {onSelectionChange && (
                                        <td className="px-4 py-5 text-center align-middle">
                                            <div className="flex justify-center">
                                                <Checkbox 
                                                    checked={isSelected}
                                                    onCheckedChange={(checked) => permission.id && handleSelectOne(permission.id, !!checked)}
                                                />
                                            </div>
                                        </td>
                                    )}
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900 dark:text-gray-100 text-base">
                                                {permission.name || permission.code}
                                            </span>
                                            {permission.description && (
                                                <span className="text-gray-400 text-xs mt-0.5">
                                                    {permission.description}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    {LEVELS.map((level) => {
                                        const isChecked = currentLevel >= level.value;
                                        
                                        return (
                                            <td key={level.value} className="p-4 text-center align-middle">
                                                <div className="flex justify-center">
                                                    <Checkbox
                                                        checked={isChecked}
                                                        onCheckedChange={(checked) => permission.id && onUpdate(permission.id, checked ? level.value : level.value - 1)}
                                                        disabled={readOnly}
                                                        className={cn(
                                                            "h-5 w-5 border-2 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-gray-300", 
                                                            "transition-all duration-200"
                                                        )}
                                                    />
                                                </div>
                                            </td>
                                        )
                                    })}
                                </motion.tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
