"use client";

import { useState } from "react";
import { OperationalView } from "./components/coverbe-view";
import { UnifiedOrgModal } from "./components/coverbe-modal";

export default function OperationalOrgPage() {


    const [modalOpen, setModalOpen] = useState(false);
    const [modalInitialValues, setModalInitialValues] = useState<any>({});

    const handleOpenModal = (initialValues: any = {}) => {
        setModalInitialValues(initialValues);
        setModalOpen(true);
    };

    return (
        <main className="flex flex-col h-full space-y-6 ">

            <div className="flex items-center gap-3">
                <UnifiedOrgModal
                    open={modalOpen}
                    onOpenChange={setModalOpen}
                    initialValues={modalInitialValues}
                />
            </div>
            <section className="flex-1 min-h-0 animate-in fade-in-50 duration-300 slide-in-from-bottom-2">
                <OperationalView onAdd={handleOpenModal} />
            </section>
        </main>

    );
}
