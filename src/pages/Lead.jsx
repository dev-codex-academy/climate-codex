import React, { useState } from "react";
import { LeadBoard } from "../components/leads/LeadBoard";
import { LeadModal } from "../components/leads/LeadModal";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Lead = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshBoard, setRefreshBoard] = useState(0);
    const [selectedPipelineId, setSelectedPipelineId] = useState(null);
    const { user } = useAuth(); // To get responsible ID

    const handleLeadCreated = () => {
        setRefreshBoard(prev => prev + 1);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 px-2">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-codex-texto-primary dark:text-codex-texto-dark-primary">
                        Sales (Kanban)
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Drag cards to change stage.
                    </p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Opportunity
                </Button>
            </div>

            <div className="flex-1 min-h-0">
                <LeadBoard
                    refreshTrigger={refreshBoard}
                    selectedPipelineId={selectedPipelineId}
                    setSelectedPipelineId={setSelectedPipelineId}
                />
            </div>

            <LeadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onLeadCreated={handleLeadCreated}
                responsibleId={user?.id}
                pipelineId={selectedPipelineId}
            />
        </div>
    );
};
