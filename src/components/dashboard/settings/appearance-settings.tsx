"use client";

import React from 'react';
import { useSystemSettings } from '@/contexts/system-settings-context';
import { useTheme } from 'next-themes';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from 'next-intl';

const THEME_COLORS = [
    { name: 'Zinc', value: 'oklch(0.205 0 0)', class: 'bg-zinc-950' },
    { name: 'Red', value: 'oklch(0.627 0.265 30.347)', class: 'bg-red-600' },
    { name: 'Orange', value: 'oklch(0.646 0.222 41.116)', class: 'bg-orange-600' },
    { name: 'Amber', value: 'oklch(0.769 0.188 70.08)', class: 'bg-amber-600' },
    { name: 'Green', value: 'oklch(0.627 0.194 149.214)', class: 'bg-green-600' },
    { name: 'Teal', value: 'oklch(0.6 0.118 184.704)', class: 'bg-teal-600' },
    { name: 'Cyan', value: 'oklch(0.589 0.158 206.513)', class: 'bg-cyan-600' },
    { name: 'Blue', value: 'oklch(0.552 0.231 251.365)', class: 'bg-blue-600' },
    { name: 'Indigo', value: 'oklch(0.536 0.238 274.624)', class: 'bg-indigo-600' },
    { name: 'Purple', value: 'oklch(0.55 0.22 290)', class: 'bg-purple-600' },
    { name: 'Fuchsia', value: 'oklch(0.58 0.25 310)', class: 'bg-fuchsia-600' },
    { name: 'Rose', value: 'oklch(0.605 0.227 15.421)', class: 'bg-rose-600' },
];

const RADIUS_OPTIONS = [
    { value: 0, label: '0.0' },
    { value: 0.3, label: '0.3' },
    { value: 0.5, label: '0.5' },
    { value: 0.75, label: '0.75' },
    { value: 1.0, label: '1.0' },
];

export default function AppearanceSettings() {
    const { settings, updateBranding, updateSettings } = useSystemSettings();
    const { theme, setTheme } = useTheme();
    const t = useTranslations();

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-8">
            <div className="space-y-3">
                <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('Appearance.theme.title')}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('Appearance.theme.description')}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setTheme('light')}
                        className={`flex-1 p-3 rounded-xl border-2 transition-all ${theme === 'light'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                    >
                        <div className="space-y-2 rounded-lg bg-[#ecedef] p-2">
                            <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                                <div className="h-1.5 w-16 rounded-lg bg-[#ecedef]" />
                                <div className="h-1.5 w-20 rounded-lg bg-[#ecedef]" />
                            </div>
                            <div className="flex items-center gap-2 rounded-md bg-white p-2 shadow-sm">
                                <div className="h-3 w-3 rounded-full bg-[#ecedef]" />
                                <div className="h-1.5 w-20 rounded-lg bg-[#ecedef]" />
                            </div>
                        </div>
                    </button>
                    <button
                        onClick={() => setTheme('dark')}
                        className={`flex-1 p-3 rounded-xl border-2 transition-all ${theme === 'dark'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                    >
                        <div className="space-y-2 rounded-lg bg-slate-950 p-2">
                            <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                <div className="h-1.5 w-16 rounded-lg bg-slate-400" />
                                <div className="h-1.5 w-20 rounded-lg bg-slate-400" />
                            </div>
                            <div className="flex items-center gap-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                <div className="h-3 w-3 rounded-full bg-slate-400" />
                                <div className="h-1.5 w-20 rounded-lg bg-slate-400" />
                            </div>
                        </div>
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('Localization.language.title')}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('Localization.language.description')}</p>
                </div>
                <Select
                    value={settings.localization.language}
                    onValueChange={(val) => {
                        updateSettings({
                            localization: { ...settings.localization, language: val }
                        });
                        setTimeout(() => window.location.reload(), 500);
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={t('Localization.language.title')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pt">Português</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-3">
                <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('Appearance.primaryColor.title')}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('Appearance.primaryColor.description')}</p>
                </div>
                <div className="grid grid-cols-6 gap-2">
                    {THEME_COLORS.map((color) => (
                        <button
                            key={color.name}
                            onClick={() => updateBranding({ primaryColor: color.value })}
                            className={`relative aspect-square rounded-xl border-2 transition-all hover:scale-105 ${settings.branding.primaryColor === color.value
                                    ? 'border-blue-500 shadow-md'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                        >
                            <span className={cn("absolute inset-1 rounded-lg", color.class)} />
                            {settings.branding.primaryColor === color.value && (
                                <Check className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-white z-10" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('Appearance.radius.title')}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('Appearance.radius.description')}</p>
                </div>
                <div className="grid grid-cols-5 gap-2">
                    {RADIUS_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => updateBranding({ radius: option.value })}
                            className={`py-2.5 rounded-xl border-2 transition-all text-sm font-medium ${settings.branding.radius === option.value
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}