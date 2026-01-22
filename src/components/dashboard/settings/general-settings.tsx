"use client";

import React from 'react';
import { useSystemSettings } from '@/contexts/system-settings-context';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SecurityGeneralSettings() {
    const { settings, updateSettings, updateBranding } = useSystemSettings();

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-8">
            <div className="space-y-3">
                <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Identidade da Aplicação</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Configure o nome e informações básicas do sistema</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="appName" className="text-xs text-gray-600 dark:text-gray-400">Nome da Aplicação</Label>
                    <Input
                        id="appName"
                        value={settings.branding.appName}
                        onChange={(e) => updateBranding({ appName: e.target.value })}
                        className="rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 transition-colors"
                    />
                </div>
            </div>

            <div className="space-y-3">
                <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Políticas de Senha</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Defina os requisitos mínimos de segurança para senhas</p>
                </div>
                <div className="space-y-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">Comprimento Mínimo</Label>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {settings.security.passwordMinLength} caracteres
                        </span>
                    </div>
                    <Slider
                        id="minLength"
                        min={6}
                        max={32}
                        step={1}
                        value={[settings.security.passwordMinLength]}
                        onValueChange={(vals) => updateSettings({
                            security: { ...settings.security, passwordMinLength: vals[0] }
                        })}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>6</span>
                        <span>32</span>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Sessão</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Controle o tempo de expiração das sessões de utilizador</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="sessionTimeout" className="text-xs text-gray-600 dark:text-gray-400">
                        Tempo limite de sessão (minutos)
                    </Label>
                    <Input
                        id="sessionTimeout"
                        type="number"
                        min="5"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSettings({
                            security: { ...settings.security, sessionTimeout: parseInt(e.target.value) || 60 }
                        })}
                        className="rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 transition-colors"
                    />
                </div>
            </div>

            <div className="space-y-3">
                <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Operacional</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Configurações de funcionamento do sistema</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="itemsPerPage" className="text-xs text-gray-600 dark:text-gray-400">
                        Itens por Página (Padrão)
                    </Label>
                    <Select
                        value={settings.general.itemsPerPage.toString()}
                        onValueChange={(val) => updateSettings({
                            general: { ...settings.general, itemsPerPage: parseInt(val) }
                        })}
                    >
                        <SelectTrigger id="itemsPerPage" className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-950">
                            <SelectValue placeholder="Selecione a quantidade" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-950 border-gray-200 dark:border-gray-700">
                            <SelectItem value="10">10 itens</SelectItem>
                            <SelectItem value="20">20 itens</SelectItem>
                            <SelectItem value="50">50 itens</SelectItem>
                            <SelectItem value="100">100 itens</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}