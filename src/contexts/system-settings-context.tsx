"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Cookies from 'js-cookie';

export interface SystemSettings {
    branding: {
        appName: string;
        logoUrl?: string;
        faviconUrl?: string;
        primaryColor: string; 
        radius: number;
    };
    localization: {
        language: string;
        timezone: string;
        dateFormat: string;
    };
    security: {
        passwordMinLength: number;
        sessionTimeout: number; 
    };
    general: {
        maintenanceMode: boolean;
        itemsPerPage: number;
    };
}

const defaultSettings: SystemSettings = {
    branding: {
        appName: "Provision V2",
        primaryColor: "#0f4c81", 
        radius: 0.625,
    },
    localization: {
        language: "pt",
        timezone: "Europe/Lisbon",
        dateFormat: "dd/MM/yyyy",
    },
    security: {
        passwordMinLength: 8,
        sessionTimeout: 60,
    },
    general: {
        maintenanceMode: false,
        itemsPerPage: 10,
    },
};

interface SystemSettingsContextType {
    settings: SystemSettings;
    updateSettings: (newSettings: Partial<SystemSettings>) => void;
    updateBranding: (branding: Partial<SystemSettings["branding"]>) => void;
    resetToDefaults: () => void;
}

const SystemSettingsContext = createContext<SystemSettingsContextType | undefined>(
    undefined
);

export function SystemSettingsProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
    const { setTheme } = useTheme();

    useEffect(() => {
        const savedSettings = localStorage.getItem("system-settings");
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setSettings((prev) => ({
                    ...prev,
                    ...parsed,
                    branding: { ...prev.branding, ...parsed.branding },
                    localization: { ...prev.localization, ...parsed.localization },
                    security: { ...prev.security, ...parsed.security },
                    general: { ...prev.general, ...parsed.general },
                }));
            } catch (e) {
                console.error("Failed to parse system settings", e);
            }
        }
    }, []);

    useEffect(() => {
        const root = document.documentElement;

        if (settings.branding.primaryColor) {
            root.style.setProperty("--primary", settings.branding.primaryColor);
            root.style.setProperty("--sidebar-primary", settings.branding.primaryColor);

            root.style.setProperty("--ring", settings.branding.primaryColor);
        }

        if (settings.branding.radius !== undefined) {
            root.style.setProperty("--radius", `${settings.branding.radius}rem`);
        }

        localStorage.setItem("system-settings", JSON.stringify(settings));

        if (typeof document !== 'undefined') {
            document.title = settings.branding.appName;
        }

    }, [settings]);

    useEffect(() => {
        if (settings.localization.language) {
            const current = Cookies.get('NEXT_LOCALE');
            if (current !== settings.localization.language) {
                Cookies.set('NEXT_LOCALE', settings.localization.language, { expires: 365 });
            }
        }
    }, [settings.localization.language]);

    const updateSettings = (newSettings: Partial<SystemSettings>) => {
        setSettings((prev) => ({
            ...prev,
            ...newSettings,
        }));
    };

    const updateBranding = (branding: Partial<SystemSettings["branding"]>) => {
        setSettings(prev => ({
            ...prev,
            branding: {
                ...prev.branding,
                ...branding
            }
        }))
    }

    const resetToDefaults = () => {
        setSettings(defaultSettings);
    };

    return (
        <SystemSettingsContext.Provider
            value={{ settings, updateSettings, updateBranding, resetToDefaults }}
        >
            {children}
        </SystemSettingsContext.Provider>
    );
}

export function useSystemSettings() {
    const context = useContext(SystemSettingsContext);
    if (context === undefined) {
        throw new Error(
            "useSystemSettings must be used within a SystemSettingsProvider"
        );
    }
    return context;
}
