"use client";

import { RoundChecklist } from "@/components/common/dashboard/services/default/ronda/round-checklist";
import { use } from "react";

export default function ChecklistPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    return <RoundChecklist roundId={resolvedParams.id} />;
}
