import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { useTranslations } from "next-intl";

interface OrgColumnProps {
    title: string;
    icon: ReactNode;
    count?: number;
    onAdd?: () => void;
    isLoading?: boolean;
    emptyMessage?: string;
    children: ReactNode;
    isActive?: boolean;
    className?: string;
}

export function OrgColumn({
    title,
    icon,
    count,
    onAdd,
    isLoading,
    emptyMessage,
    children,
    isActive = true,
    className
}: OrgColumnProps) {
    const t = useTranslations("OrganizationalStructure");

    const LoadingState = () => (
        <div className="flex items-center justify-center p-8 text-muted-foreground w-full h-full">
            <Loader2 className="h-4 w-4 md:h-6 md:w-6 animate-spin" />
        </div>
    );

    const EmptyState = ({ message, onAction }: { message: string, onAction?: () => void }) => (
        <aside className="flex flex-col items-center justify-center p-6 text-center space-y-3 h-full" aria-live="polite">
            <span className="text-sm text-muted-foreground font-medium">{message}</span>
            {onAction && (
                <Button variant="outline" size="sm" onClick={onAction} className="h-8 text-xs">
                    {t("buttons.createNew")}
                </Button>
            )}
        </aside>
    );

    return (
        <Card className={cn(
            "flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-300",
            "shadow-none border-0 bg-transparent md:shadow-sm md:border md:border-border/40 md:bg-background/40 md:backdrop-blur-sm",
            isActive ? "opacity-100" : "opacity-50 pointer-events-none grayscale",
            className
        )}>
            <CardHeader className="py-3 px-4 border-b border-border/10 bg-muted/20 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                            {icon}
                        </div>
                        <span className="text-base font-bold text-foreground">{title}</span>
                        {count !== undefined && (
                            <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
                                {count}
                            </span>
                        )}
                    </div>
                    {onAdd && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-primary/10 hover:text-primary transition-all rounded-lg"
                            onClick={onAdd}
                            disabled={!isActive}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden min-h-0">
                {isLoading ? (
                    <LoadingState />
                ) : (
                    <ScrollArea className="h-full">
                        <div className="p-3 space-y-3 pb-safe-offset"> {(Array.isArray(children) && children.length === 0) || !children ? (
                            <EmptyState message={emptyMessage || t("messages.noItemsFound")} onAction={onAdd} />
                        ) : (
                            children
                        )}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
}
