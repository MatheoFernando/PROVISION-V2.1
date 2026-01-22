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
                <div className="grid grid-cols-3 gap-3">
                    <button
                        onClick={() => setTheme('light')}
                        className={cn(
                            "group relative flex flex-col items-center gap-2 p-1 rounded-xl border-2 transition-all",
                            theme === 'light'
                                ? "border-[var(--primary)] bg-muted/50"
                                : "border-transparent hover:bg-muted/50"
                        )}
                    >
                        <div className="w-full aspect-[4/3] rounded-lg bg-[#f4f4f5] border border-slate-200 p-2 overflow-hidden shadow-sm">
                            <div className="space-y-2">
                                <div className="space-y-1.5 rounded-md bg-white p-2 shadow-sm border border-slate-100">
                                    <div className="h-1.5 w-1/2 rounded-full bg-slate-200" style={{ backgroundColor: theme === 'light' ? 'var(--primary)' : undefined, opacity: theme === 'light' ? 0.2 : undefined }} />
                                    <div className="h-1.5 w-3/4 rounded-full bg-slate-100" />
                                </div>
                                <div className="flex items-center gap-1.5 rounded-md bg-white p-2 shadow-sm border border-slate-100">
                                    <div className="size-4 rounded-full bg-slate-100" style={{ backgroundColor: theme === 'light' ? 'var(--primary)' : undefined }} />
                                    <div className="h-1.5 w-1/2 rounded-full bg-slate-100" />
                                </div>
                            </div>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{t('Appearance.theme.light')}</span>
                        {theme === 'light' && <Check className="absolute top-2 right-2 size-3.5 text-[var(--primary)]" />}
                    </button>

                    <button
                        onClick={() => setTheme('dark')}
                        className={cn(
                            "group relative flex flex-col items-center gap-2 p-1 rounded-xl border-2 transition-all",
                            theme === 'dark'
                                ? "border-[var(--primary)] bg-muted/50"
                                : "border-transparent hover:bg-muted/50"
                        )}
                    >
                        <div className="w-full aspect-[4/3] rounded-lg bg-slate-950 border border-slate-800 p-2 overflow-hidden shadow-sm">
                            <div className="space-y-2">
                                <div className="space-y-1.5 rounded-md bg-slate-900 p-2 border border-slate-800">
                                    <div className="h-1.5 w-1/2 rounded-full bg-slate-800" style={{ backgroundColor: theme === 'dark' ? 'var(--primary)' : undefined, opacity: theme === 'dark' ? 0.4 : undefined }} />
                                    <div className="h-1.5 w-3/4 rounded-full bg-slate-800" />
                                </div>
                                <div className="flex items-center gap-1.5 rounded-md bg-slate-900 p-2 border border-slate-800">
                                    <div className="size-4 rounded-full bg-slate-800" style={{ backgroundColor: theme === 'dark' ? 'var(--primary)' : undefined }} />
                                    <div className="h-1.5 w-1/2 rounded-full bg-slate-800" />
                                </div>
                            </div>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{t('Appearance.theme.dark')}</span>
                        {theme === 'dark' && <Check className="absolute top-2 right-2 size-3.5 text-[var(--primary)]" />}
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
                    <SelectTrigger className="w-[180px] rounded-lg border-2 border-border bg-background">
                        <SelectValue placeholder={t('Localization.language.title')} />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
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
                <div className="grid grid-cols-6 lg:grid-cols-8 gap-3">
                    {THEME_COLORS.map((color) => (
                        <button
                            key={color.name}
                            onClick={() => updateBranding({ primaryColor: color.value })}
                            className={cn(
                                "group relative aspect-square rounded-full flex items-center justify-center transition-all hover:scale-110",
                                settings.branding.primaryColor === color.value
                                    ? "ring-2 ring-offset-2 ring-[var(--primary)] ring-offset-background"
                                    : "hover:ring-1 hover:ring-border"
                            )}
                        >
                            <span
                                className="size-8 rounded-full shadow-sm border border-black/5 dark:border-white/10"
                                style={{ backgroundColor: color.value }}
                            />
                            {settings.branding.primaryColor === color.value && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-sm">
                                    <Check className="h-2.5 w-2.5" />
                                </span>
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
                            className={cn(
                                "py-2 rounded-lg border text-xs font-medium transition-all relative overflow-hidden",
                                settings.branding.radius === option.value
                                    ? "border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/10"
                                    : "border-border hover:border-[var(--primary)] hover:text-[var(--primary)]"
                            )}
                        >
                            {option.label}
                            {settings.branding.radius === option.value && (
                                <div className="absolute inset-0 bg-current opacity-[0.03]" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}