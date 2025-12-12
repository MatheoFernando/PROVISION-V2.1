"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Save, CheckCircle2, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useItemInspectionRounds } from "@/infrastructure/hooks/useItemInspectionRounds";
import { useCheckListRoundGroups, useCreateCheckListRoundGroupMutation } from "@/infrastructure/hooks/useCheckListRoundGroups";
import { useAuthStore } from "@/infrastructure/hooks/useAuthStore";
import { ItemInspectionRound, CheckListRoundGroup } from "@/infrastructure/types/domain";
import { ChecklistManager } from "./checklist-manager";

const evaluationSchema = z.object({
    assessment: z.coerce.number().min(0).max(5),
    applicable: z.boolean(),
    quantity: z.coerce.number().min(0),
    observation: z.string().optional(),
});

type EvaluationFormValues = z.infer<typeof evaluationSchema>;

interface RoundChecklistProps {
    roundId: string;
}

export function RoundChecklist({ roundId }: RoundChecklistProps) {
    const t = useTranslations("Ronda.Checklist");
    const router = useRouter();
    const companyId = useAuthStore((state) => state.companyId || "");
    const [isManagerOpen, setIsManagerOpen] = useState(false);

    const { data: items = [], isLoading: isLoadingItems } = useItemInspectionRounds();
    const { data: existingGroups = [], isLoading: isLoadingGroups, refetch: refetchGroups } = useCheckListRoundGroups(roundId);

    const totalItems = items.length;
    const completedItems = existingGroups.length;
    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    const isComplete = progress === 100 && totalItems > 0;

    const handleBack = () => {
        router.back();
    };

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] md:h-full bg-gray-50/50 dark:bg-slate-950">
            <header className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shrink-0 sticky top-0 z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <div className="space-y-1">
                            <h1 className="text-xl font-semibold">Checklist de Inspeção</h1>
                            <p className="text-sm text-muted-foreground">
                                Avalie cada item abaixo para completar a ronda.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="text-right w-full md:w-auto">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 block">
                                {completedItems} de {totalItems} itens
                            </span>
                            <div className="w-full md:w-32 h-2 bg-gray-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <ScrollArea className="flex-1 px-4 md:px-6 py-6">
                {isLoadingItems || isLoadingGroups ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <div className="space-y-6 max-w-4xl mx-auto pb-20">
                        {items.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <p className="mb-4">Nenhum item de inspeção configurado.</p>
                                <Button onClick={() => setIsManagerOpen(true)} variant="outline" className="cursor-pointer">
                                    Criar Itens
                                </Button>
                            </div>
                        ) : (
                            items.map((item) => {
                                const existingGroup = existingGroups.find(
                                    (g) => g.itemInspectionRoundId === item.id || g.itemInspectionRound?.id === item.id
                                );

                                return (
                                    <ChecklistItemCard
                                        key={item.id}
                                        item={item}
                                        roundId={roundId}
                                        companyId={companyId}
                                        existingEvaluation={existingGroup}
                                        onSaved={refetchGroups}
                                    />
                                );
                            })
                        )}
                    </div>
                )}
            </ScrollArea>

            <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shrink-0 flex justify-end gap-3 sticky bottom-0 z-10">
                <Button
                    variant="ghost"
                    onClick={handleBack}
                >
                    Voltar
                </Button>
                <Button
                    disabled={!isComplete}
                    className="bg-green-600 hover:bg-green-700 text-white gap-2"
                    onClick={() => {
                        toast.success("Checklist concluído com sucesso!");
                        handleBack();
                    }}
                >
                    <CheckCircle2 className="w-4 h-4" />
                    Concluir Checklist
                </Button>
            </div>


            <ChecklistManager
                open={isManagerOpen}
                onOpenChange={setIsManagerOpen}
                defaultOpenForm={true}
            />
        </div >
    );
}

interface ChecklistItemCardProps {
    item: ItemInspectionRound;
    roundId: string;
    companyId: string;
    existingEvaluation?: CheckListRoundGroup;
    onSaved: () => void;
}

function ChecklistItemCard({ item, roundId, companyId, existingEvaluation, onSaved }: ChecklistItemCardProps) {
    const { mutateAsync: createGroup, isPending } = useCreateCheckListRoundGroupMutation();
    const [isExpanded, setIsExpanded] = useState(!existingEvaluation);

    const form = useForm<EvaluationFormValues>({
        resolver: zodResolver(evaluationSchema) as any,
        defaultValues: {
            assessment: existingEvaluation?.assessment ?? 0,
            applicable: existingEvaluation?.applicable ?? true,
            quantity: existingEvaluation?.quantity ?? 0,
            observation: existingEvaluation?.observation ?? "",
        },
    });

    const onSubmit = async (values: EvaluationFormValues) => {
        if (existingEvaluation) {
            toast.info("Item já avaliado.");
            return;
        }

        try {
            await createGroup({
                ...values,
                itemInspectionRoundId: item.id!,
                roundId,
                companyId,
            });
            onSaved();
            setIsExpanded(false);
        } catch (error) {
            console.error(error);
        }
    };

    const isDone = !!existingEvaluation;

    const StarRating = ({ value, onChange, readonly }: { value: number, onChange?: (val: number) => void, readonly?: boolean }) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        disabled={readonly}
                        onClick={() => !readonly && onChange?.(star)}
                        className={`text-2xl transition-colors ${star <= value ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
                            } ${!readonly ? "hover:scale-110" : "cursor-default"}`}
                    >
                        ★
                    </button>
                ))}
            </div>
        );
    };

    if (isDone && !isExpanded) {
        return (
            <Card className="border border-green-200 dark:border-green-900/30 bg-green-50/30 dark:bg-green-900/10">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full">
                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{item.description}</p>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span className="font-medium text-slate-700 dark:text-slate-300">{item.category}</span>
                                <span>•</span>
                                <StarRating value={existingEvaluation.assessment} readonly />
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setIsExpanded(true)}>
                        Ver Detalhes
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`border transition-all duration-300 ${isDone ? 'border-green-200 dark:border-green-900' : 'border-gray-200 dark:border-slate-800'}`}>
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <Badge variant="outline" className="mb-2 uppercase tracking-wide text-[10px]">{item.category}</Badge>
                        <CardTitle className="text-lg">{item.description}</CardTitle>
                    </div>
                    {isDone && (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Salvo</Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
                    <div className="space-y-3">
                        <Label className="text-base font-medium">Avaliação</Label>
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col gap-1">
                                <StarRating
                                    value={form.watch("assessment")}
                                    onChange={(v) => form.setValue("assessment", v)}
                                    readonly={isDone}
                                />
                                {form.formState.errors.assessment && (
                                    <p className="text-xs text-red-500 font-medium">Selecione uma avaliação</p>
                                )}
                            </div>

                            <div className="h-8 w-px bg-gray-200 dark:bg-slate-700 mx-2" />

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id={`app-${item.id}`}
                                    checked={form.watch("applicable")}
                                    onCheckedChange={(c) => form.setValue("applicable", c as boolean)}
                                    disabled={isDone}
                                />
                                <Label htmlFor={`app-${item.id}`} className="cursor-pointer font-normal text-slate-600 dark:text-slate-400">
                                    Aplicável
                                </Label>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor={`qty-${item.id}`}>Quantidade</Label>
                            <Input
                                id={`qty-${item.id}`}
                                type="number"
                                min="0"
                                placeholder="0"
                                {...form.register("quantity", { valueAsNumber: true })}
                                disabled={isDone}
                                className="bg-white dark:bg-slate-900"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`obs-${item.id}`}>Observação</Label>
                            <Textarea
                                id={`obs-${item.id}`}
                                placeholder="Adicione detalhes sobre a inspeção..."
                                {...form.register("observation")}
                                disabled={isDone}
                                className="bg-white dark:bg-slate-900 resize-none"
                            />
                        </div>
                    </div>

                    {!isDone && (
                        <div className="flex justify-end pt-2">
                            <Button
                                type="submit"
                                disabled={isPending}
                            >
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                Salvar Item
                            </Button>
                        </div>
                    )}
                </form>

                {isDone && (
                    <div className="flex justify-end pt-2">
                        <p className="text-xs text-slate-400 italic">
                            Este item já foi avaliado em {new Date(existingEvaluation.createdAt!).toLocaleTimeString()}.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
