import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Building2, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { OrgColumn } from "./org-column";

interface SectorColumnProps {
    sectors: any[];
    isLoading: boolean;
    selectedSectorId: string | null;
    parentSelected: boolean;
    onSelect: (id: string) => void;
    onAdd: () => void;
    onEdit: (sector: any) => void;
    onDelete: (e: React.MouseEvent, id: string, name: string) => void;
    getMetrics: (sectorId: string) => { sites: number };
}

export function SectorColumn({
    sectors,
    isLoading,
    selectedSectorId,
    parentSelected,
    onSelect,
    onAdd,
    onEdit,
    onDelete,
    getMetrics
}: SectorColumnProps) {
    const t = useTranslations("OrganizationalStructure");

    if (!parentSelected) {
        return (
            <OrgColumn
                title={t("columns.sectors")}
                icon={<Building2 className="h-4 w-4 text-primary" />}
                isActive={false}
                emptyMessage={t("messages.selectZone")}
            >
                <p className="flex items-center justify-center h-full text-xs font-medium text-muted-foreground/50 p-4 text-center">
                    {t("messages.selectZone")}
                </p>
            </OrgColumn>
        );
    }

    return (
        <OrgColumn
            title={t("columns.sectors")}
            icon={<Building2 className="h-4 w-4 text-primary" />}
            count={sectors.length}
            onAdd={onAdd}
            isLoading={isLoading}
            emptyMessage={t("messages.noSectorFound")}
            isActive={true}
        >
            {sectors.map((sector) => {
                const metrics = getMetrics(sector.id!);
                const isSelected = selectedSectorId === sector.id;

                return (
                    <article
                        key={sector.id}
                        onClick={() => onSelect(sector.id!)}
                        className={cn(
                            "flex flex-col gap-3 p-4 rounded-lg cursor-pointer transition-all border group relative",
                            isSelected
                                ? "bg-background shadow-md shadow-primary/10 border-primary/20 ring-1 ring-primary/10"
                                : "bg-card border-border/40 hover:border-primary/30 hover:shadow-sm"
                        )}
                    >
                        <header className="flex items-center justify-between">
                            <span className={cn(
                                "font-bold text-sm truncate",
                                isSelected ? "text-primary" : "text-foreground"
                            )}>{sector.name}</span>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10 hover:text-primary rounded-lg -mr-1"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(sector);
                                    }}
                                >
                                    <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive rounded-lg -mr-1"
                                    onClick={(e) => onDelete(e, sector.id!, sector.name)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </header>

                        <footer className="grid grid-cols-1 gap-2 pt-1 border-t border-border/30 mt-1">
                            <div className="flex gap-2 items-center justify-center p-1.5 rounded-lg bg-muted/30">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground/70">{t("metrics.posts")}</span>
                                <span className="text-xs font-bold text-foreground">{metrics.sites}</span>
                            </div>
                        </footer>
                    </article>
                );
            })}
        </OrgColumn>
    );
}
