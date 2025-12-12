
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useCreateArea, useUpdateArea } from "@/infrastructure/hooks/useAreas";
import { useCreateZone, useUpdateZone } from "@/infrastructure/hooks/useZones";
import { useCreateSector, useUpdateSector } from "@/infrastructure/hooks/useSectors";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { AreaSelect } from "@/components/common/base-ui/selects/area-select";
import { ZoneSelect } from "@/components/common/base-ui/selects/zone-select";
import { EmployeeSelect } from "@/components/common/base-ui/selects/employee-select";
import { cn } from "@/lib/utils";

type OrgType = "AREA" | "ZONE" | "SECTOR";

const createFormSchema = (t: (key: string) => string) =>
    z.object({
        type: z.enum(["AREA", "ZONE", "SECTOR"]),
        id: z.string().optional(),
        name: z.string().min(1, t("validation.nameRequired")),
        employeeId: z.string().optional(),
        areaId: z.string().optional(),
        zoneId: z.string().optional(),
    }).superRefine((data, ctx) => {
        if (data.type === "ZONE" && !data.areaId) {
            ctx.addIssue({
                code: "custom",
                message: t("validation.selectArea"),
                path: ["areaId"],
            });
        }
        if (data.type === "SECTOR") {
            if (!data.areaId) {
                ctx.addIssue({
                    code: "custom",
                    message: t("validation.selectArea"),
                    path: ["areaId"],
                });
            }
            if (!data.zoneId) {
                ctx.addIssue({
                    code: "custom",
                    message: t("validation.selectZone"),
                    path: ["zoneId"],
                });
            }
        }
    });

type FormValues = z.infer<ReturnType<typeof createFormSchema>>;

interface UnifiedOrgModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    initialValues?: Partial<FormValues>;
    trigger?: React.ReactNode;
}

export function UnifiedOrgModal({ open: controlledOpen, onOpenChange: controlledOnOpenChange, initialValues, trigger }: UnifiedOrgModalProps) {
    const t = useTranslations("OrganizationalStructure.Modal");
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;
    const formSchema = createFormSchema(t);

    const { companyId } = useAuthStore();
    const queryClient = useQueryClient();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: "AREA",
            name: "",
            employeeId: "",
            areaId: "",
            zoneId: "",
            ...initialValues,
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                type: "AREA",
                name: "",
                employeeId: "",
                areaId: "",
                zoneId: "",
                ...initialValues,
            });
        }
    }, [open, initialValues, form]);

    const type = form.watch("type") as OrgType;
    const selectedAreaId = form.watch("areaId");

    const createArea = useCreateArea();
    const updateArea = useUpdateArea();
    const createZone = useCreateZone();
    const updateZone = useUpdateZone();
    const createSector = useCreateSector();
    const updateSector = useUpdateSector();

    const isSubmitting =
        createArea.status === "pending" ||
        updateArea.status === "pending" ||
        createZone.status === "pending" ||
        updateZone.status === "pending" ||
        createSector.status === "pending" ||
        updateSector.status === "pending";

    const onSubmit = (data: FormValues) => {
        if (!companyId) return;

        const commonPayload = {
            name: data.name,
            companyId,
            employeeId: data.employeeId || null,
        };

        const callbacks = {
            onSuccess: () => {
                toast.success(t("toasts.success"));


                if (data.type === "AREA") {
                    queryClient.invalidateQueries({ queryKey: ['areas'] });
                    queryClient.invalidateQueries({ queryKey: ['zones'] });
                    queryClient.invalidateQueries({ queryKey: ['sectors'] });
                    queryClient.invalidateQueries({ queryKey: ['sites'] });
                } else if (data.type === "ZONE") {
                    queryClient.invalidateQueries({ queryKey: ['zones'] });
                    queryClient.invalidateQueries({ queryKey: ['sectors'] });
                    queryClient.invalidateQueries({ queryKey: ['sites'] });
                } else if (data.type === "SECTOR") {
                    queryClient.invalidateQueries({ queryKey: ['sectors'] });
                    queryClient.invalidateQueries({ queryKey: ['sites'] });
                }

                setOpen(false);
                form.reset({
                    type: data.type,
                    name: "",
                    employeeId: "",
                    areaId: data.areaId,
                    zoneId: "",
                });
            },
            onError: () => toast.error(t("toasts.error")),
        };

        const mutations = {
            AREA: { create: createArea, update: updateArea },
            ZONE: { create: createZone, update: updateZone },
            SECTOR: { create: createSector, update: updateSector },
        };

        const mutation = mutations[data.type];
        const payload = {
            ...commonPayload,
            ...(data.type === "ZONE" && { areaId: data.areaId! }),
            ...(data.type === "SECTOR" && { zoneId: data.zoneId! }),
            ...(data.id && { id: data.id }),
        };

        if (data.id) {
            // @ts-ignore
            mutation.update.mutate(payload, callbacks);
        } else {
            // @ts-ignore
            mutation.create.mutate(payload, callbacks);
        }
    };


    useEffect(() => {
        if (type === "AREA") {
            form.setValue("areaId", "");
            form.setValue("zoneId", "");
        } else if (type === "ZONE") {
            form.setValue("zoneId", "");
        }
    }, [type, form]);

    useEffect(() => {
        if (initialValues?.areaId && selectedAreaId === initialValues.areaId) return;
        form.setValue("zoneId", "");
    }, [selectedAreaId, form, initialValues]);


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger ? (
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
            ) : (
                !isControlled && (
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                            <Plus className="h-4 w-4" />
                            {t("title.newItem")}
                        </Button>
                    </DialogTrigger>
                )
            )}
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-2xl border-none shadow-2xl bg-white dark:bg-slate-950">
                <DialogHeader className="px-6 pt-6 pb-2">
                    <DialogTitle className="text-xl font-semibold tracking-tight">{t(`title.${type}`)}</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 mt-4">

                    <section className="px-6 py-4 space-y-6">
                        <div className="grid grid-cols-2 gap-5">
                            {(type === "ZONE" || type === "SECTOR") && (
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("labels.area")}</Label>
                                    <div >
                                        <AreaSelect
                                            value={form.watch("areaId")}
                                            onChange={(val) => form.setValue("areaId", val)}
                                            companyId={companyId || ""}
                                        />
                                    </div>
                                    {form.formState.errors.areaId && (
                                        <span className="text-destructive text-xs ml-1">{form.formState.errors.areaId.message}</span>
                                    )}
                                </div>
                            )}

                            {type === "SECTOR" && (
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("labels.zone")}</Label>
                                    <div >
                                        <ZoneSelect
                                            value={form.watch("zoneId")}
                                            onChange={(val) => form.setValue("zoneId", val)}
                                            companyId={companyId || ""}
                                            areaId={selectedAreaId}
                                        />
                                    </div>
                                    {form.formState.errors.zoneId && (
                                        <span className="text-destructive text-xs ml-1">{form.formState.errors.zoneId.message}</span>
                                    )}
                                </div>
                            )}

                            <div className={cn("space-y-1.5", type === "ZONE" ? "col-span-1" : "col-span-2")}>
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("labels.name")}</Label>
                                <Input
                                    {...form.register("name")}
                                    placeholder={t(type === "AREA" ? "placeholders.nameArea" : type === "ZONE" ? "placeholders.nameZone" : "placeholders.nameSector")}
                                    className=" h-9.5"
                                />
                                {form.formState.errors.name && (
                                    <span className="text-destructive text-xs ml-1">{form.formState.errors.name.message}</span>
                                )}
                            </div>

                            <div className="space-y-1.5 col-span-2">
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("labels.responsible")}</Label>
                                <div >
                                    <EmployeeSelect
                                        value={form.watch("employeeId") || ""}
                                        onChange={(val) => form.setValue("employeeId", val)}
                                        companyId={companyId || ""}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <footer className="flex justify-end gap-3 px-6 py-5 bg-muted/20 border-t border-border/20">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="h-10 rounded-xl hover:bg-muted/50 font-medium text-muted-foreground hover:text-foreground"
                        >
                            {t("buttons.cancel")}
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-10 px-6 rounded-xl bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30 transition-all"
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t("buttons.save")}
                        </Button>
                    </footer>

                </form>
            </DialogContent>
        </Dialog>
    );
}
