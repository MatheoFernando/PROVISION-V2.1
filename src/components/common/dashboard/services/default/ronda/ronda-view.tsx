"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Round } from "@/infrastructure/types/domain";
import {
    Clock,
    MapPin,
    Car,
    Hash,
    Route,
    Building,
    Eye,
    Calendar,
    Gauge
} from "lucide-react";

import { useRouter } from "next/navigation";

interface RondaViewDrawerProps {
    round: Round;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RondaViewDrawer({ round, isOpen, onOpenChange }: RondaViewDrawerProps) {
    const router = useRouter();

    const [activeTab, setActiveTab] = useState("details");

 
    const isFinished = round.status === "Finalizada";
    const statusClass = isFinished
        ? "bg-green-500 text-white border-green-600"
        : "bg-orange-200 text-orange-700 border-orange-300";

    const formatTime = (timeString?: string) => {
        if (!timeString) return "--";
        try {
            return new Date(timeString).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit"
            });
        } catch {
            return timeString;
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "--";
        try {
            return new Date(dateString).toLocaleDateString("pt-BR");
        } catch {
            return dateString;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl p-0 overflow-hidden bg-white dark:bg-slate-950 shadow-2xl border-none">

                <DialogHeader className="px-6 py-6 border-b border-gray-100 dark:border-slate-900/50 bg-gray-50/50 dark:bg-slate-900/20">
                    <div className="flex items-start justify-between pr-6">
                        <div className="space-y-1">
                            <DialogTitle className="flex items-center gap-3 text-2xl font-semibold text-slate-900 dark:text-gray-100">
                                <Eye className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                                Ronda #{round.numberOfRounds}
                            </DialogTitle>
                            <DialogDescription className="flex items-center gap-2">
                                <span>Estado da ronda:</span>
                                <Badge variant={isFinished ? 'default' : 'outline'} className={`text-xs px-3 py-1 ${statusClass}`}>
                                    {isFinished ? "Finalizada" : "Em Andamento"}
                                </Badge>
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-0">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="px-6 pt-4">
                            <TabsList className="grid w-full grid-cols-3 bg-gray-100/50 dark:bg-slate-900/50 p-1 rounded-xl">
                                <TabsTrigger
                                    value="details"
                                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-500 data-[state=active]:shadow-sm transition-all duration-200"
                                >
                                    Detalhes
                                </TabsTrigger>
                                <TabsTrigger
                                    value="route"
                                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-500 data-[state=active]:shadow-sm transition-all duration-200"
                                >
                                    Percurso
                                </TabsTrigger>
                                <TabsTrigger
                                    value="location"
                                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-500 data-[state=active]:shadow-sm transition-all duration-200"
                                >
                                    Localização
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="p-6 h-[400px] overflow-y-auto custom-scrollbar">
                            <TabsContent value="details" className="mt-0 space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50/50 dark:bg-blue-600/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/20">
                                        <div className="flex items-center gap-2 mb-2 text-blue-500 dark:text-blue-400">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-xs font-semibold uppercase">Hora Início</span>
                                        </div>
                                        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                            {formatTime(round.timeStart)}
                                        </p>
                                    </div>
                                    <div className="bg-blue-50/50 dark:bg-blue-600/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/20">
                                        <div className="flex items-center gap-2 mb-2 text-blue-500 dark:text-blue-400">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-xs font-semibold uppercase">Data</span>
                                        </div>
                                        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                            {formatDate(round.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                <section className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Hash className="h-4 w-4 text-slate-500" />
                                        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                                            Informações
                                        </h3>
                                    </div>
                                    <div className="space-y-3">
                                        <DetailRow label="Posição" value={round.position} />
                                        <DetailRow label="Ciclo" value={round.numberOfRounds} />
                                        <DetailRow label="Frota" value={round.numberOfCartFrota} />
                                    </div>
                                </section>
                            </TabsContent>

                            <TabsContent value="route" className="mt-0 space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                                <Section icon={Gauge} title="Quilometragem">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 dark:bg-slate-900/30 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                                            <DetailBox label="Km Inicial" value={round.kmStart} icon={Route} />
                                        </div>
                                        <div className="bg-gray-50 dark:bg-slate-900/30 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                                            <DetailBox label="Km Final" value={round.kmEnd} icon={Route} />
                                        </div>
                                    </div>
                                </Section>

                                <Section icon={Car} title="Viatura">
                                    <div className="bg-gray-50 dark:bg-slate-900/30 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                                        <DetailBox
                                            label="Viatura"
                                            value={round.car ? `${round.car.cod} - ${round.car.mark} ${round.car.model}` : round.carId}
                                            icon={Car}
                                        />
                                    </div>
                                </Section>
                            </TabsContent>

                            <TabsContent value="location" className="mt-0 space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                                <Section icon={Building} title="Localização">
                                    <div className="space-y-3 grid grid-cols-2 gap-2">
                                        <div className="bg-gray-50 dark:bg-slate-900/30 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                                            <DetailBox label="Área" value={round.area?.name || round.areaId} icon={MapPin} />
                                        </div>
                                        <div className="bg-gray-50 dark:bg-slate-900/30 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                                            <DetailBox label="Setor" value={round.sector?.name || round.sectorId} icon={MapPin} />
                                        </div>
                                    </div>
                                </Section>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>


                <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-900/50 bg-gray-50/50 dark:bg-slate-900/20">
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                            Fechar
                        </Button>
                        {!isFinished && (
                            <Button
                                onClick={() => router.push(`/dashboard/modulos/ronda/${round.id}/checklist`)}
                                className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer rounded-xl shadow-lg shadow-blue-500/20"
                            >
                                Finalizar Ronda
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function DetailRow({ label, value }: { label: string; value?: string | number }) {
    return (
        <div className="flex justify-between items-center text-sm py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
            <span className="text-slate-500">{label}</span>
            <span className="font-medium text-slate-900 dark:text-gray-100">{value || "—"}</span>
        </div>
    );
}

function DetailBox({ label, value, icon: Icon }: { label: string; value?: string; icon?: any }) {
    return (
        <div className="bg-white dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                {Icon && <Icon className="w-3 h-3" />}
                {label}
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-gray-100 truncate" title={value}>
                {value || "—"}
            </div>
        </div>
    );
}

function Section({
    icon: Icon,
    title,
    children,
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-slate-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h4>
            </div>
            <div>{children}</div>
        </div>
    );
}
