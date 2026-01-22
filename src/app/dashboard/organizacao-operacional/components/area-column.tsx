import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {  Layers, Pencil, Trash2, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { OrgColumn } from "./org-column";

interface AreaColumnProps {
    areas: any[];
    isLoading: boolean;
    selectedAreaId: string | null;
    onSelect: (id: string) => void;
    onAdd: () => void;
    onEdit: (area: any) => void;
    onDelete: (e: React.MouseEvent, id: string, name: string) => void;
    getMetrics: (areaId: string, employeeId?: string) => { zones: number; sectors: number; sites: number; responsible: string };
}

export function AreaColumn({
    areas,
    isLoading,
    selectedAreaId,
    onSelect,
    onAdd,
    onEdit,
    onDelete,
    getMetrics
}: AreaColumnProps) {
    const t = useTranslations("OrganizationalStructure");

    return (
        <OrgColumn
            title={t("columns.areas")}
            icon={<Layers className="h-4 w-4 text-primary" />}
            count={areas.length}
            onAdd={onAdd}
            isLoading={isLoading}
            emptyMessage={t("messages.noAreaFound")}
        >
            {areas.map((area) => {
                const metrics = getMetrics(area.id!, area.employeeId);
                const isSelected = selectedAreaId === area.id;

                return (
                    <article
                        key={area.id}
                        onClick={() => onSelect(area.id!)}
                        className={cn(
                            "flex flex-col gap-3 p-4 rounded-md cursor-pointer transition-all border group relative",
                            isSelected
                                ? "bg-background shadow-md shadow-primary/10 border-primary/20 ring-1 ring-primary/10"
                                : "bg-card border-border/40 hover:border-primary/30 hover:shadow-sm"
                        )}
                    >
                        <header className="flex items-center justify-between">
                            <span className={cn(
                                "font-bold text-sm truncate",
                                isSelected ? "text-primary" : "text-foreground"
                            )}>{area.name}</span>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10 hover:text-primary rounded-lg -mr-1"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(area);
                                    }}
                                >
                                    <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive rounded-lg -mr-1"
                                    onClick={(e) => onDelete(e, area.id!, area.name)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                             
                            </div>
                        </header>

                        <p className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
                            <User className="h-4 w-4 text-primary/60" />
                            <span className="truncate max-w-[180px] text-sm">{metrics.responsible}</span>
                        </p>

                        <footer className="hidden md:grid grid-cols-3 gap-2 pt-1 border-t border-border/30 mt-1">
                            <div className="flex gap-2 items-center justify-center p-1.5 rounded-lg bg-muted/30">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground/70">{t("metrics.zones")}</span>
                                <span className="text-xs font-bold text-foreground">{metrics.zones}</span>
                            </div>
                            <div className="flex gap-2 items-center justify-center p-1.5 rounded-lg bg-muted/30">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground/70">{t("metrics.sectors")}</span>
                                <span className="text-xs font-bold text-foreground">{metrics.sectors}</span>
                            </div>
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
