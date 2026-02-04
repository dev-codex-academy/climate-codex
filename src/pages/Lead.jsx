import React, { useState } from "react";
import { LeadBoard } from "../components/leads/LeadBoard";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const Lead = () => {
    const [refreshBoard, setRefreshBoard] = useState(0);
    const [selectedPipelineId, setSelectedPipelineId] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleLeadClick = (lead) => {
        navigate(`/lead/${lead.id}`);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 px-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-codex-texto-primary dark:text-codex-texto-dark-primary">
                        Sales (Kanban)
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Drag cards to change stage.
                    </p>
                </div>
                <Button onClick={() => navigate("/lead/new", { state: { pipelineId: selectedPipelineId } })}>
                    <Plus className="mr-2 h-4 w-4" /> New Opportunity
                </Button>
            </div>

            <div className="flex-1 min-h-0">
                <LeadBoard
                    refreshTrigger={refreshBoard}
                    selectedPipelineId={selectedPipelineId}
                    setSelectedPipelineId={setSelectedPipelineId}
                    onLeadClick={handleLeadClick}
                />
            </div>
        </div>
    );
};
