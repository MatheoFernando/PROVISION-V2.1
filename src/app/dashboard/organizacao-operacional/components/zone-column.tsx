import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { OrgColumn } from "./org-column";

interface ZoneColumnProps {
    zones: any[];
    isLoading: boolean;
    selectedZoneId: string | null;
    parentSelected: boolean;
    onSelect: (id: string) => void;
    onAdd: () => void;
    onEdit: (zone: any) => void;
    onDelete: (e: React.MouseEvent, id: string, name: string) => void;
    getMetrics: (zoneId: string) => { sectors: number; sites: number };
}

export function ZoneColumn({
    zones,
    isLoading,
    selectedZoneId,
    parentSelected,
    onSelect,
    onAdd,
    onEdit,
    onDelete,
    getMetrics
}: ZoneColumnProps) {
    const t = useTranslations("OrganizationalStructure");

    if (!parentSelected) {
        return (
            <OrgColumn
                title={t("columns.zones")}
                icon={<MapPin className="h-4 w-4 text-primary" />}
                isActive={false}
                emptyMessage={t("messages.selectArea")}
            >

                <p className="flex items-center justify-center h-full text-xs font-medium text-muted-foreground/50 p-4 text-center">
                    {t("messages.selectArea")}
                </p>
            </OrgColumn>
        );
    }

    return (
        <OrgColumn
            title={t("columns.zones")}
            icon={<MapPin className="h-4 w-4 text-primary" />}
            count={zones.length}
            onAdd={onAdd}
            isLoading={isLoading}
            emptyMessage={t("messages.noZoneFound")}
            isActive={true}
        >
            {zones.map((zone) => {
                const metrics = getMetrics(zone.id!);
                const isSelected = selectedZoneId === zone.id;

                return (
                    <article
                        key={zone.id}
                        onClick={() => onSelect(zone.id!)}
                        className={cn(
                            "flex flex-col gap-3 p-4 rounded-lg cursor-pointer transition-all border group relative",
                            isSelected
                                ? "bg-background shadow-md shadow-primary/10 border-primary/20 ring-1 ring-primary/10"
                                : "bg-card border-border/40 hover:border-primary/30 hover:shadow-sm"
                        )}
                    >
                        <header className="flex items-center justify-between">
                            <span className={cn(
                                "font-bold text-base truncate",
                                isSelected ? "text-primary" : "text-foreground"
                            )}>{zone.name}</span>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10 hover:text-primary rounded-lg -mr-1"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(zone);
                                    }}
                                >
                                    <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive rounded-lg -mr-1"
                                    onClick={(e) => onDelete(e, zone.id!, zone.name)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </header>

                        <footer className="hidden md:grid grid-cols-2 gap-2 pt-1 border-t border-border/30 mt-1">
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
