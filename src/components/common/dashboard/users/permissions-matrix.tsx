"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { PERMISSION_MODULES, COMMON_ACTIONS } from '@/config/permissions-config'
import { Switch } from '@/components/ui/switch'

interface PermissionsMatrixProps {
    selectedPermissions: string[]
    onToggle: (permissionId: string) => void
    readOnly?: boolean
}

export function PermissionsMatrix({
    selectedPermissions,
    onToggle,
    readOnly = false,
}: PermissionsMatrixProps) {

    const isSelected = (moduleId: string, actionValue: string) => {
        return selectedPermissions.includes(`${moduleId}.${actionValue}`)
    }

    const handleToggle = (moduleId: string, actionValue: string) => {
        if (readOnly) return
        onToggle(`${moduleId}.${actionValue}`)
    }

    const rowVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.03, duration: 0.3 },
        }),
    }

    return (
        <div className="w-full rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] border-collapse text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/30 dark:border-gray-800 dark:bg-gray-900/20">
                            <th className="px-6 py-5 text-left font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                                Módulo
                            </th>
                            {COMMON_ACTIONS.map((action) => (
                                <th
                                    key={action.value}
                                    className="px-6 py-5 text-center font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider"
                                >
                                    {action.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {PERMISSION_MODULES.map((module, i) => (
                            <motion.tr
                                key={module.id}
                                custom={i}
                                initial="hidden"
                                animate="visible"
                                variants={rowVariants}
                                className="group border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors dark:border-gray-800/50 dark:hover:bg-gray-900/50"
                            >
                                <td className="px-6 py-5">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                            {module.label}
                                        </span>
                                    </div>
                                </td>
                                {COMMON_ACTIONS.map((action) => {
                                    const isActionSupported = module.actions.some(
                                        (a) => a.value === action.value
                                    )
                                    const isActive = isSelected(module.id, action.value)

                                    if (!isActionSupported) {
                                        return (
                                            <td key={action.value} className="p-4 text-center">
                                                <div className="mx-auto h-1 w-4 rounded-full bg-gray-100 dark:bg-gray-800 opacity-50" />
                                            </td>
                                        )
                                    }

                                    return (
                                        <td key={action.value} className="p-4 text-center align-middle">
                                            <div className="flex justify-center">
                                                <Switch
                                                    checked={isActive}
                                                    onCheckedChange={() => handleToggle(module.id, action.value)}
                                                    disabled={readOnly}
                                                    className={cn(
                                                        "data-[state=checked]:bg-green-500", // Apple green style
                                                        "transition-all duration-300"
                                                    )}
                                                />
                                            </div>
                                        </td>
                                    )
                                })}
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
