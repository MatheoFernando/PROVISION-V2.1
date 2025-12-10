"use client";

import { useParams, useRouter } from "next/navigation";
import {
    Building2,
    ChevronLeft,
    MapPin,
    Users,
    HardHat,
    Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Site, Equipment, Employee } from "@/infrastructure/types/domain";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useSiteById } from "@/infrastructure/hooks/useSites";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { SiteDialog } from "./site-create";
import { EquipmentDialog } from "@/components/common/dashboard/equipment/equipment-create";
import { EmployeeDialog } from "@/components/common/dashboard/employees/employee-create";
import { DataTableGeneric } from "@/components/common/base-ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { DeleteModal } from "@/components/ui/delete-modal";
import { useDeleteEquipment } from "@/infrastructure/hooks/useEquipment";
import { useUpdateEmployee, useEmployees } from "@/infrastructure/hooks/useEmployees";
import { useEquipment } from "@/infrastructure/hooks/useEquipment";
import { useDeleteSite } from "@/infrastructure/hooks/useSites";
import { useAreas } from "@/infrastructure/hooks/useAreas";
import { useZones } from "@/infrastructure/hooks/useZones";
import { useSectors } from "@/infrastructure/hooks/useSectors";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

function getFirstItem<T>(entity: T | T[] | undefined | null): T | undefined {
    if (!entity) return undefined;
    if (Array.isArray(entity)) {
        return entity[0] || (entity as any);
    }
    return entity as T;
}

export function SiteDetailsView() {
    const params = useParams<{ siteId: string }>();
    const router = useRouter();
    const t = useTranslations();
    const { siteId } = params;
    const queryClient = useQueryClient();

    const { data: site, isLoading } = useSiteById(siteId);

    const [isEditSiteOpen, setIsEditSiteOpen] = useState(false);
    const [isEquipmentDialogOpen, setIsEquipmentDialogOpen] = useState(false);

    const client = useMemo(() => {
        return getFirstItem(site?.customer ?? site?.customers);
    }, [site]);

    const supervisor = useMemo(() => {
        if (!site?.employees) return undefined;
        return site.employees.find((e: Employee) =>
            e.function?.toLowerCase().includes('supervisor') ||
            e.function?.toLowerCase().includes('encarregado') ||
            e.function?.toLowerCase().includes('fiscal')
        );
    }, [site]);

    const currentWorkers = site?.employees?.length || 0;
    const maxWorkers = site?.numberWorkersContract || 0;
    const isWorkerLimitReached = currentWorkers >= maxWorkers;

    if (isLoading) {
        return <SiteDetailsSkeleton />;
    }

    if (!site && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
                <div className="p-4 rounded-full bg-muted/30">
                    <Building2 className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold">{t('SiteDetails.notFound')}</h2>
                <Button onClick={() => router.back()} variant="outline">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    {t('Common.back') || "Back"}
                </Button>
            </div>
        )
    }

    const clientPart = client ? `${client.cod} - ${client.name}` : '';
    const headerTitle = clientPart ? `${clientPart} - ${site?.name}` : site?.name || "Site Details";

    return (
        <div className="min-h-screen bg-background/50 pb-20">
            <header className="w-full backdrop-blur-xl bg-background/60 border-b border-border/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className="rounded-full hover:bg-foreground/5 text-muted-foreground hover:text-foreground"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <Building2 className="w-4 h-4" />
                            </div>
                            <h1 className="text-lg font-semibold tracking-tight uppercase truncate max-w-[600px]" title={headerTitle}>
                                {headerTitle}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">

                        <Button
                            size="sm"
                            onClick={() => setIsEditSiteOpen(true)}
                            className="rounded-full bg-foreground text-background hover:bg-foreground/90"
                        >
                            <Pencil className="w-4 h-4 mr-2" />
                            {t('SiteDetails.actions.editSite') || 'Edit Site'}
                        </Button>
                        <DeleteSiteButton site={site} t={t} router={router} />
                    </div>
                </div>
            </header>

            <SiteDialog
                open={isEditSiteOpen}
                onOpenChange={setIsEditSiteOpen}
                siteToEdit={site || undefined}
            />

            <EquipmentDialog
                open={isEquipmentDialogOpen}
                onOpenChange={setIsEquipmentDialogOpen}
                siteId={siteId}
                isSiteLocked={true}
                onSuccess={async () => {
                    await queryClient.invalidateQueries({ queryKey: ["site", siteId] });
                    toast.success("Equipamento adicionado!");
                }}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

                <Tabs defaultValue="overview" className="w-full">
                    <div className="flex items-center justify-between mb-6">
                        <TabsList className="bg-muted/30 p-1 rounded-full h-12 border border-border/20 backdrop-blur-sm">
                            <TabsTrigger value="overview" className="rounded-full px-6 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">{t('SiteDetails.tabs.overview')}</TabsTrigger>
                            <TabsTrigger value="employees" className="rounded-full px-6 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">{t('Sidebar.employees') || "Funcionários"}</TabsTrigger>
                            <TabsTrigger value="tools" className="rounded-full px-6 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">{t('SiteDetails.tabs.tools')}</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="overview" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground/90">
                                    <MapPin className="w-5 h-5 text-indigo-500" />
                                    {t('SiteDetails.sections.locationDetails')}
                                </h3>
                                <div className="space-y-3 pt-2">
                                    <DetailRow label={t("Customers.fields.email") || "Email"} value={getFirstItem(site?.contact ?? site?.contacts)?.email} />
                                    <DetailRow
                                        label={t("Customers.fields.phone") || "Phone"}
                                        value={getFirstItem(site?.contact ?? site?.contacts)?.phoneNumbers?.[0]?.phone || '-'}
                                    />
                                    <DetailRow label={t("Customers.fields.address") || "Address"} value={getFirstItem(site?.address ?? site?.addresses)?.houseHold?.slice(0, 50)} />
                                    <DetailRow label={t("SiteDetails.fields.municipality") || "Municipality"} value={getFirstItem(site?.address ?? site?.addresses)?.municipality} />
                                    <DetailRow label={t("SiteDetails.fields.province") || "Province"} value={getFirstItem(site?.address ?? site?.addresses)?.province} />
                                    <DetailRow label={t("SiteDetails.fields.country") || "Country"} value={getFirstItem(site?.address ?? site?.addresses)?.country} />
                                </div>
                            </div>

                            <div className="bg-card/50 backdrop-blur-sm border border-border/40 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground/90">
                                        <Users className="w-5 h-5 text-indigo-500" />
                                        {t('SiteDetails.sections.operationalInfo')}
                                    </h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <StatBox
                                        label={t("SiteDetails.stats.workers") || "Workers"}
                                        value={`${currentWorkers} / ${maxWorkers}`}
                                        icon={Users}
                                        alert={isWorkerLimitReached && currentWorkers > maxWorkers}
                                    />
                                    <StatBox label={t("SiteDetails.stats.equipments") || "Equipments"} value={site?.equipments?.length || 0} icon={HardHat} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-2">
                                    <DetailRow
                                        label={t("Sidebar.clients") || "Cliente"}
                                        value={client ? `${client.cod} - ${client.name}` : '-'}
                                        className="py-3 text-base"
                                    />
                                    <DetailRow
                                        label={t("Common.supervisor") || "Supervisor"}
                                        value={supervisor?.fullName || '-'}
                                        className="py-3 text-base"
                                    />
                                    <DetailRow label={t("SiteDetails.fields.area") || "Area"} value={getEntityName(site?.areas) || getEntityName(site?.area)} />
                                    <DetailRow label={t("SiteDetails.fields.zone") || "Zone"} value={getEntityName(site?.zones) || getEntityName(site?.zone)} />
                                    <DetailRow label={t("SiteDetails.fields.sector") || "Sector"} value={getEntityName(site?.sectors) || getEntityName(site?.sector)} />
                                    <DetailRow label={t("SiteDetails.fields.createdAt") || "Created At"} value={site?.createdAt ? format(new Date(site.createdAt), 'PP', { locale: ptBR }) : '-'} />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="employees" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                        <EmployeesTabContent site={site} t={t} isLimitReached={isWorkerLimitReached} />
                    </TabsContent>

                    <TabsContent value="tools" className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                        <ToolsTabContent equipments={site?.equipments || []} t={t} onAddEquipment={() => setIsEquipmentDialogOpen(true)} siteId={siteId} />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}

function StatBox({ label, value, icon: Icon, alert }: { label: string, value: string | number, icon: any, alert?: boolean }) {
    return (
        <div className={cn("bg-background/40 p-4 rounded-2xl border flex flex-col items-center justify-center text-center gap-2", alert ? "border-red-500/50 bg-red-500/5 py-4" : "border-border/40")}>
            <Icon className={cn("w-5 h-5", alert ? "text-red-500" : "text-muted-foreground")} />
            <span className={cn("text-2xl font-bold", alert ? "text-red-600" : "text-foreground")}>{value}</span>
            <span className={cn("text-xs uppercase font-medium tracking-wide", alert ? "text-red-500" : "text-muted-foreground/80")}>{label}</span>
        </div>
    )
}

function DetailRow({ label, value, className }: { label: string, value?: string, className?: string }) {
    if (!value) return null;
    return (
        <div className={cn("flex items-center justify-between py-2 border-b border-border/40 last:border-0", className)}>
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-medium text-foreground text-right">{value}</span>
        </div>
    )
}

function SiteDetailsSkeleton() {
    return (
        <div className="min-h-screen bg-background/50 pb-20">
            <div className="w-full bg-background/60 border-b border-border/40 h-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-6 w-48 rounded" />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                <div className="w-full h-12 rounded-full bg-muted/30 border border-border/20 flex items-center p-1 gap-2">
                    <Skeleton className="h-10 w-32 rounded-full" />
                    <Skeleton className="h-10 w-32 rounded-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-64 w-full rounded-3xl" />
                    <Skeleton className="h-64 w-full rounded-3xl" />
                </div>
            </div>
        </div>
    )
}

function getEntityName(entity: any | any[] | undefined | null): string | undefined {
    if (!entity) return undefined;
    if (Array.isArray(entity)) {
        return entity[0]?.name;
    }
    return entity?.name;
}


function ToolsTabContent({ equipments, t, onAddEquipment, siteId }: { equipments: Equipment[], t: (key: string) => string, onAddEquipment: () => void, siteId: string }) {
    const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(null);
    const deleteEquipment = useDeleteEquipment();
    const queryClient = useQueryClient();

    const handleDelete = async () => {
        if (!equipmentToDelete?.id) return;
        try {
            await deleteEquipment.mutateAsync(equipmentToDelete.id);
            await queryClient.invalidateQueries({ queryKey: ["site", siteId] });
            setEquipmentToDelete(null);
        } catch (error) {
            console.error(error);
        }
    }

    const columns: ColumnDef<Equipment>[] = [
        {
            accessorKey: "mark",
            header: t("SiteDetails.fields.equipment.mark") || "Mark",
        },
        {
            accessorKey: "model",
            header: t("SiteDetails.fields.equipment.model") || "Model",
        },

        {
            accessorKey: "serialNumber",
            header: t("SiteDetails.fields.equipment.serial") || "Serial Number",
        },
        {
            accessorKey: "status",
            header: t("SiteDetails.fields.equipment.status") || "Status",
            cell: ({ row }) => {
                const status = row.original.status;
                return (
                    <Badge variant="outline" className={cn(
                        "font-normal",
                        status ? "text-emerald-600 border-emerald-200 bg-emerald-50" : "text-muted-foreground"
                    )}>
                        {status ? "Operational" : "Maintenance"}
                    </Badge>
                )
            }
        },
    ];

    const rowActions = [
        {
            label: t("Common.delete") || "Delete",
            icon: <Trash className="w-4 h-4" />,
            variant: "destructive" as const,
            onClick: (row: Equipment) => setEquipmentToDelete(row),
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold tracking-tight">{t('SiteDetails.sections.equipmentsAndTools')}</h3>
            </div>

            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
                <DataTableGeneric
                    data={equipments}
                    columns={columns}
                    rowActions={rowActions}
                    placeholder={t('SiteDetails.placeholders.searchTools') || "Search tools..."}
                    actionButton={{
                        label: t('SiteDetails.actions.addEquipment') || "Add Equipment",
                        component: (
                            <Button
                                size="sm"
                                onClick={onAddEquipment}
                                className="rounded-full gap-2 pl-3 pr-4 shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                {t('SiteDetails.actions.addEquipment') || "Add Equipment"}
                            </Button>
                        )
                    }}
                />
            </div>

            <DeleteModal
                isOpen={!!equipmentToDelete}
                onClose={() => setEquipmentToDelete(null)}
                onConfirm={handleDelete}
                title={t('Components.DeleteModal.title')}
                message={t('Components.DeleteModal.message')}
                isLoading={deleteEquipment.isPending}
            />
        </div>
    )
}


function EmployeesTabContent({ site, t, isLimitReached }: { site: Site | null | undefined, t: (key: string) => string, isLimitReached: boolean }) {
    const [isCreateEmployeeOpen, setIsCreateEmployeeOpen] = useState(false);
    const [employeeToDissociate, setEmployeeToDissociate] = useState<any | null>(null);
    const updateEmployee = useUpdateEmployee();
    const queryClient = useQueryClient();

    const { data: areas = [] } = useAreas();
    const { data: zones = [] } = useZones();
    const { data: sectors = [] } = useSectors();

    const employeesWithDependencies = useMemo(() => {
        if (!site) return new Set<string>();
        const ids = new Set<string>();

        areas.forEach((a) => a.employeeId && ids.add(a.employeeId));
        zones.forEach((z) => z.employeeId && ids.add(z.employeeId));
        sectors.forEach((s) => s.employeeId && ids.add(s.employeeId));
        return ids;
    }, [areas, zones, sectors, site]);

    const employees = useMemo(() => {
        return site?.employees || [];
    }, [site]);

    const handleDissociate = async () => {
        if (!employeeToDissociate?.id) return;
        try {
            await updateEmployee.mutateAsync({
                id: employeeToDissociate.id,
                siteId: null as any
            });
            await queryClient.invalidateQueries({ queryKey: ["site", site?.id] });
            setEmployeeToDissociate(null);
            toast.success("Funcionário removido do site com sucesso");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao remover funcionário");
        }
    }

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "cod",
            header: t("Employees.fields.cod") || "Code",
        },
        {
            accessorKey: "fullName",
            header: t("Employees.fields.fullName") || "Name",
        },
        {
            accessorKey: "function",
            header: t("Employees.fields.function") || "Role",
        },
        {
            accessorKey: "contact.email",
            header: "Email",
            cell: ({ row }) => row.original.contact?.email || "-"
        }
    ];



    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold tracking-tight">{t('Sidebar.employees')}</h3>
            </div>

            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
                <DataTableGeneric
                    data={employees}
                    columns={columns}
                    placeholder={t('Employees.placeholders.search') || "Search employees..."}
                    actionButton={{
                        label: t('Common.create') || "Create",
                        component: (
                            <Button
                                size="sm"
                                onClick={() => setIsCreateEmployeeOpen(true)}
                                className="rounded-full gap-2 pl-3 pr-4 shadow-sm"
                                disabled={isLimitReached}
                            >
                                <Plus className="w-4 h-4" />
                                {t('Common.create') || "Create"}
                            </Button>
                        )
                    }}
                />
            </div>

            <EmployeeDialog
                open={isCreateEmployeeOpen}
                onOpenChange={setIsCreateEmployeeOpen}
                siteId={site?.id}
                isSiteLocked={true}
                onSuccess={async () => {
                    await queryClient.invalidateQueries({ queryKey: ["site", site?.id] });
                }}
            />

            <DeleteModal
                isOpen={!!employeeToDissociate}
                onClose={() => setEmployeeToDissociate(null)}
                onConfirm={handleDissociate}
                title={t('Components.DeleteModal.title')}
                message={t('Components.DeleteModal.message')}
                isLoading={updateEmployee.isPending}
            />
        </div>
    )
}

function DeleteSiteButton({ site, t, router }: { site: Site | null | undefined, t: any, router: any }) {
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const deleteSite = useDeleteSite();

    const { data: allEmployees = [] } = useEmployees(site?.companyId, { enabled: !!site?.companyId });
    const { data: allEquipment = [] } = useEquipment(undefined, { enabled: !!site?.companyId, companyId: site?.companyId });

    if (!site) return null;

    // Check actual dependencies for THIS site
    const hasEmployees = allEmployees.some(emp => emp.siteId === site.id);
    const hasEquipment = allEquipment.some(eq => eq.siteId === site.id);
    const isDisabled = hasEmployees || hasEquipment;

    const handleDelete = async () => {
        try {
            await deleteSite.mutateAsync(site.id as string);
            toast.success("Site excluído com sucesso!");
            router.push("/dashboard/sites");
        } catch (error) {
            toast.error("Erro ao excluir site");
        }
    };

    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span tabIndex={0} className="inline-flex">
                            <Button
                                size="sm"
                                variant="destructive"
                                className={cn(
                                    "rounded-full",
                                    isDisabled ? "opacity-50 cursor-not-allowed" : ""
                                )}
                                onClick={(e) => {
                                    if (isDisabled) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    } else {
                                        setIsDeleteOpen(true);
                                    }
                                }}
                            >
                                <Trash className="w-4 h-4 mr-2" />
                                {t('Common.delete') || 'Delete'}
                            </Button>
                        </span>
                    </TooltipTrigger>
                    {isDisabled && (
                        <TooltipContent>
                            <p>
                                {hasEmployees && hasEquipment
                                    ? "Não pode excluir site com funcionários e equipamentos associados"
                                    : hasEmployees
                                        ? "Não pode excluir site com funcionários associados"
                                        : "Não pode excluir site com equipamentos associados"}
                            </p>
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>

            <DeleteModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
                title="Excluir Site"
                message="Tem certeza que deseja excluir este site? Esta ação não pode ser desfeita."
                isLoading={deleteSite.isPending}
            />
        </>
    );
}
