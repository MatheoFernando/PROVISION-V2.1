"use client";

import { useCurrentUser } from "@/infrastructure/hooks/useCurrentUser";
import { useCompanyByIdQuery } from "@/infrastructure/hooks/useCompanies";

export function Footer() {
    const { companyId, isGlobalAdmin } = useCurrentUser();
    const { data: company } = useCompanyByIdQuery(companyId ?? undefined);
    return (
        <footer className="bg-background p-1.5 border-t border-slate-200 dark:border-border/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                {!isGlobalAdmin && (
                    <div className="flex items-center gap-2">
                        {company ? (
                            <>
                                <span className="text-sm px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                    {company.cod}
                                </span>
                                -
                                <span className="text-sm font-medium text-foreground">{company.taxName}</span>
                            </>
                        ) : (
                            <div className="flex items-center gap-2 animate-pulse">
                                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                                <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
                            </div>
                        )}
                    </div>
                )}
                <div className={`text-sm font-medium ${isGlobalAdmin ? 'ml-auto' : ''}`}>
                  &copy;  Provision {new Date().getFullYear()} 
                </div>
            </div>
        </footer>
    );
}
