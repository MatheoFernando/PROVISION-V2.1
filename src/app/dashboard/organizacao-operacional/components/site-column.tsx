import { Hash, Map, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { OrgColumn } from "./org-column";

interface SiteColumnProps {
    sites: any[];
    isLoading: boolean;
    parentSelected: boolean;
}

export function SiteColumn({
    sites,
    isLoading,
    parentSelected
}: SiteColumnProps) {
    const t = useTranslations("OrganizationalStructure");

    if (!parentSelected) {
        return (
            <OrgColumn
                title={t("columns.posts")}
                icon={<Map className="h-4 w-4 text-primary" />}
                isActive={false}
                emptyMessage={t("messages.selectHierarchy")}
            >
                <p className="flex items-center justify-center h-full text-xs font-medium text-muted-foreground/50 p-4 text-center">
                    {t("messages.selectHierarchy")}
                </p>
            </OrgColumn>
        );
    }

    return (
        <OrgColumn
            title={t("columns.posts")}
            icon={<Map className="h-4 w-4 text-primary" />}
            count={sites.length}
            isLoading={isLoading}
            emptyMessage={t("messages.noPostFound")}
            isActive={true}
        >
            {sites.map((site) => (
                <article
                    key={site.id}
                    className="p-4 rounded-xl bg-card border border-border/40 hover:border-primary/30 hover:shadow-sm transition-all group relative cursor-default space-y-3"
                >
                    <header className="flex items-start">
                        <span className="font-bold text-sm truncate text-foreground"> {site.name}</span>
                    </header>

                    <footer className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium">
                        <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1.5 rounded-lg border border-border/20">
                            <Hash className="h-3 w-3 text-primary/70" />
                            <span className="font-mono text-foreground">{site.cod}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1.5 rounded-lg border border-border/20">
                            <Users className="h-3 w-3 text-primary/70" />
                            <span className="text-foreground">{site.numberWorkersContract || 0} {t("metrics.workers")}.</span>
                        </div>
                    </footer>
                </article>
            ))}
        </OrgColumn>
    );
}
