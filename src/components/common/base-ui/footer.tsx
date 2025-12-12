"use client";

import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { useCompanyByIdQuery } from "@/infrastructure/hooks/useCompanies";

export function Footer() {
    const { companyId } = useAuthStore();
    const { data: company } = useCompanyByIdQuery(companyId || undefined);

    return (
        <footer className="bg-background p-3 border-t border-slate-200 dark:border-border/50">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    {company ? (
                        <>
                            <span className="text-base px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                {company.cod}
                            </span>
                            -
                            <span className="text-base font-medium text-foreground">{company.businessName}</span>
                        </>
                    ) : (
                        <div className="flex items-center gap-2 animate-pulse">
                            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                            <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
                        </div>
                    )}
                </div>
                <div className="text-base font-medium">
                    &copy; {new Date().getFullYear()} Provision
                </div>
            </div>
        </footer>
    );
}
