"use client";

import { useState } from "react";
import { RondaTable } from "./ronda-table";
import { RondaCreate } from "./ronda-create";
import { RondaViewDrawer } from "./ronda-view";
import { InspectionItemsTable } from "./inspection-items-table";
import { Round } from "@/infrastructure/types/domain";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RondaPage() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [viewRound, setViewRound] = useState<Round | null>(null);
    const router = useRouter();

    return (
        <div className="animate-in fade-in-50 duration-500">
            <Tabs defaultValue="rounds" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="rounds" className="gap-2">
                        <ClipboardList className="w-4 h-4" />
                        Rondas
                    </TabsTrigger>
                    <TabsTrigger value="items" className="gap-2">
                        <Settings className="w-4 h-4" />
                        Itens de Inspeção
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="rounds">
                    <RondaTable
                        onView={(round) => setViewRound(round)}
                        onCreate={() => setIsCreateOpen(true)}
                    />
                </TabsContent>

                <TabsContent value="items">
                    <InspectionItemsTable />
                </TabsContent>
            </Tabs>

            <RondaCreate
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onSuccess={(round) => {
                    if (round) {
                        router.push(`/dashboard/modulos/ronda/${round.id}/checklist`);
                    }
                }}
            />

            {viewRound && (
                <RondaViewDrawer
                    round={viewRound}
                    isOpen={!!viewRound}
                    onOpenChange={(open) => !open && setViewRound(null)}
                />
            )}
        </div>
    );
}
