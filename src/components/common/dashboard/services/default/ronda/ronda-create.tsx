"use client";

import * as React from "react";
import { type Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateRoundMutation, useUpdateRoundMutation } from "@/infrastructure/hooks/useRounds";
import { AreaSelect } from "@/components/common/base-ui/selects/area-select";
import { ZoneSelect } from "@/components/common/base-ui/selects/zone-select";
import { SectorSelect } from "@/components/common/base-ui/selects/sector-select";
import { CarSelect } from "@/components/common/base-ui/selects/car-select";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { Loader2, Clock2Icon } from "lucide-react";

const schema = z.object({
    position: z.string().min(1, "Obrigatório"),
    numberOfRounds: z.coerce.number().min(1, "Obrigatório"),
    kmStart: z.string().min(1, "Obrigatório"),
    kmEnd: z.string().optional(),
    timeStart: z.string().min(1, "Obrigatório"),
    timeEnd: z.string().optional(),
    numberOfCartFrota: z.coerce.number().min(1, "Obrigatório"),
    carId: z.string().min(1, "Obrigatório"),
    areaId: z.string().min(1, "Obrigatório"),
    zoneId: z.string().optional(),
    sectorId: z.string().min(1, "Obrigatório"),
    checkListRoundGroupId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const timeFormatter: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
};

const toInputTime = (value?: string) => {
    if (!value) return "";
    if (value.includes("T")) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value.slice(11, 16);
        return date.toLocaleTimeString("pt-BR", timeFormatter).replace(".", ":");
    }
    return value.slice(0, 5);
};

const toIsoFromTime = (value: string) => {
    if (!value) return "";
    if (value.includes("T") && !Number.isNaN(Date.parse(value))) return value;
    const normalized = value.length === 5 ? `${value}:00` : value;
    const today = new Date();
    const currentDate = today.toISOString().slice(0, 10);
    const composed = new Date(`${currentDate}T${normalized}`);
    if (Number.isNaN(composed.getTime())) return value;
    return composed.toISOString();
};

interface RondaCreateProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: any; 
    onSuccess?: (round: any) => void;
}

export function RondaCreate({ open, onOpenChange, initialData, onSuccess }: RondaCreateProps) {
    const t = useTranslations("Ronda");
    const { mutateAsync: createRound, isPending: isCreating } = useCreateRoundMutation();
    const { mutateAsync: updateRound, isPending: isUpdating } = useUpdateRoundMutation();
    const companyId = useAuthStore((state) => state.companyId || "");

    const isEditMode = !!initialData;
    const isPending = isCreating || isUpdating;

    const defaultValues = React.useMemo<FormValues>(
        () => ({
            position: "",
            numberOfRounds: 0,
            kmStart: "",
            kmEnd: "",
            timeStart: "",
            timeEnd: "",
            numberOfCartFrota: 0,
            carId: "",
            areaId: "",
            zoneId: "",
            sectorId: "",
            checkListRoundGroupId: "",
        }),
        []
    );

    const form = useForm<FormValues>({
        resolver: zodResolver(schema) as Resolver<FormValues>,
        mode: "onSubmit",
        reValidateMode: "onSubmit",
        defaultValues,
    });

    const timeStartValue = form.watch("timeStart") ?? "";
    const timeEndValue = form.watch("timeEnd") ?? "";
    const areaId = form.watch("areaId");
    const zoneId = form.watch("zoneId");


    React.useEffect(() => {
        if (initialData && open) {

            form.reset({
                position: initialData.position || "",
                numberOfRounds: initialData.numberOfRounds || 0,
                kmStart: initialData.kmStart || "",
                kmEnd: initialData.kmEnd || "",
                timeStart: toInputTime(initialData.timeStart),
                timeEnd: toInputTime(initialData.timeEnd),
                numberOfCartFrota: initialData.numberOfCartFrota || 0,
                carId: initialData.carId || "",
                areaId: initialData.areaId || "",
                zoneId: initialData.zoneId || "",
                sectorId: initialData.sectorId || "",
                checkListRoundGroupId: initialData.checkListRoundGroupId || "",
            });
        } else if (open) {

            form.reset({
                ...defaultValues,
                timeStart: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            });
        }
    }, [initialData, open, form, defaultValues]);

    const onSubmit = async (values: FormValues) => {
        try {
            if (!companyId) {
                toast.error("Empresa não identificada");
                return;
            }

            const payload = {
                position: values.position,
                numberOfRounds: values.numberOfRounds,
                kmStart: values.kmStart,
                kmEnd: values.kmEnd || undefined,
                timeStart: toIsoFromTime(values.timeStart),
                timeEnd: values.timeEnd ? toIsoFromTime(values.timeEnd) : undefined,
                numberOfCartFrota: values.numberOfCartFrota,
                carId: values.carId,
                areaId: values.areaId,
                sectorId: values.sectorId,
                checkListRoundGroupId: values.checkListRoundGroupId || undefined,
                companyId,
            };

            if (isEditMode && initialData?.id) {
                await updateRound({ ...payload, id: initialData.id });
                onSuccess?.(initialData); 
            } else {
                const newRound = await createRound(payload);
                onSuccess?.(newRound);
            }
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden dark:bg-slate-950">
                <DialogHeader className="pt-6 px-6 pb-2 border-b border-gray-100 bg-white dark:bg-slate-900/50">
                    <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {isEditMode ? "Editar Ronda" : " Nova Ronda"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
                    <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-medium">Área *</Label>
                                <AreaSelect
                                    value={form.watch("areaId")}
                                    onChange={(v) => {
                                        form.setValue("areaId", v);
                                        form.setValue("zoneId", "");
                                        form.setValue("sectorId", "");
                                    }}
                                    companyId={companyId}
                                />
                                {form.formState.errors.areaId && (
                                    <p className="text-sm text-red-500 font-medium">
                                        {form.formState.errors.areaId.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 font-medium">Zona</Label>
                                <ZoneSelect
                                    value={form.watch("zoneId")}
                                    onChange={(v) => {
                                        form.setValue("zoneId", v);
                                        form.setValue("sectorId", "");
                                    }}
                                    companyId={companyId}
                                    areaId={areaId}
                                />
                                {form.formState.errors.zoneId && (
                                    <p className="text-sm text-red-500 font-medium">
                                        {form.formState.errors.zoneId.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 font-medium">Setor *</Label>
                                <SectorSelect
                                    value={form.watch("sectorId")}
                                    onChange={(v) => form.setValue("sectorId", v)}
                                    companyId={companyId}
                                    zoneId={zoneId}
                                />
                                {form.formState.errors.sectorId && (
                                    <p className="text-sm text-red-500 font-medium">
                                        {form.formState.errors.sectorId.message}
                                    </p>
                                )}
                            </div>
                        </div>


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="position" className="text-slate-700 font-medium">
                                    Posição *
                                </Label>
                                <Input
                                    id="position"
                                    placeholder="Ex: Norte"
                                    className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                                    {...form.register("position")}
                                />
                                {form.formState.errors.position && (
                                    <p className="text-sm text-red-500 font-medium">
                                        {form.formState.errors.position.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="numberOfRounds" className="text-slate-700 font-medium">
                                    Número de Rondas *
                                </Label>
                                <Input
                                    id="numberOfRounds"
                                    type="number"
                                    min="1"
                                    placeholder="1"
                                    className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                                    {...form.register("numberOfRounds", { valueAsNumber: true })}
                                />
                                {form.formState.errors.numberOfRounds && (
                                    <p className="text-sm text-red-500 font-medium">
                                        {form.formState.errors.numberOfRounds.message}
                                    </p>
                                )}
                            </div>
                        </div>


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="timeStart" className="text-slate-700 font-medium">
                                    Hora Início *
                                </Label>
                                <div className="relative flex w-full items-center gap-2">
                                    <Clock2Icon className="text-muted-foreground pointer-events-none absolute left-2.5 size-4 select-none" />
                                    <Input
                                        id="timeStart"
                                        type="time"
                                        step="60"
                                        className="appearance-none pl-8 rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                        value={timeStartValue}
                                        onClick={(event) => {
                                            const target = event.currentTarget as HTMLInputElement & { showPicker?: () => void };
                                            if (typeof target.showPicker === "function") target.showPicker();
                                        }}
                                        {...form.register("timeStart")}
                                    />
                                </div>
                                {form.formState.errors.timeStart && (
                                    <p className="text-sm text-red-500 font-medium">
                                        {form.formState.errors.timeStart.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="timeEnd" className="text-slate-700 font-medium">
                                    Hora Fim
                                </Label>
                                <div className="relative flex w-full items-center gap-2">
                                    <Clock2Icon className="text-muted-foreground pointer-events-none absolute left-2.5 size-4 select-none" />
                                    <Input
                                        id="timeEnd"
                                        type="time"
                                        step="60"
                                        className="appearance-none pl-8 rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                        value={timeEndValue}
                                        onClick={(event) => {
                                            const target = event.currentTarget as HTMLInputElement & { showPicker?: () => void };
                                            if (typeof target.showPicker === "function") target.showPicker();
                                        }}
                                        {...form.register("timeEnd")}
                                    />
                                </div>
                                {form.formState.errors.timeEnd && (
                                    <p className="text-sm text-red-500 font-medium">
                                        {form.formState.errors.timeEnd.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="kmStart" className="text-slate-700 font-medium">
                                    Km Inicial *
                                </Label>
                                <Input
                                    id="kmStart"
                                    type="text"
                                    placeholder="0"
                                    className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                                    {...form.register("kmStart")}
                                />
                                {form.formState.errors.kmStart && (
                                    <p className="text-sm text-red-500 font-medium">
                                        {form.formState.errors.kmStart.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="kmEnd" className="text-slate-700 font-medium">
                                    Km Final
                                </Label>
                                <Input
                                    id="kmEnd"
                                    type="text"
                                    placeholder="0"
                                    className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                                    {...form.register("kmEnd")}
                                />
                                {form.formState.errors.kmEnd && (
                                    <p className="text-sm text-red-500 font-medium">
                                        {form.formState.errors.kmEnd.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-medium">Viatura *</Label>
                                <CarSelect
                                    value={form.watch("carId")}
                                    onChange={(v) => form.setValue("carId", v)}
                                    companyId={companyId}
                                />
                                {form.formState.errors.carId && (
                                    <p className="text-sm text-red-500 font-medium">
                                        {form.formState.errors.carId.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="numberOfCartFrota" className="text-slate-700 font-medium">
                                    Nº Frota *
                                </Label>
                                <Input
                                    id="numberOfCartFrota"
                                    type="number"
                                    min="1"
                                    placeholder="1"
                                    className="rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                                    {...form.register("numberOfCartFrota", { valueAsNumber: true })}
                                />
                                {form.formState.errors.numberOfCartFrota && (
                                    <p className="text-sm text-red-500 font-medium">
                                        {form.formState.errors.numberOfCartFrota.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-4 border-t border-gray-100 bg-gray-50/50 dark:bg-slate-900/50">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                            className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {isEditMode ? "A atualizar..." : "A criar..."}
                                </>
                            ) : (
                                isEditMode ? "Atualizar" : "Criar"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
