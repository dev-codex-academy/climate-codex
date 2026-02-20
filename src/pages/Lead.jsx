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
        <div className="h-full flex flex-col w-full max-w-[95vw] bg-codex-fondo-primary-variante1 dark:bg-codex-fondo-secondary-variante5/30 transition-colors duration-300">
            <header className="sticky top-0 z-30 w-full border-b border-codex-bordes-primary-variante2 dark:border-codex-bordes-terciario-variante4 bg-white/70 dark:bg-codex-fondo-secondary/70 backdrop-blur-md px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-codex-texto-secondary dark:text-codex-texto-terciario-variante1">
                        Sales Pipeline
                    </h1>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <span className="flex h-2 w-2 rounded-full bg-codex-primary animate-pulse"></span>
                        Manage your opportunities and move them through stages.
                    </p>
                </div>
                <Button
                    onClick={() => navigate("/lead/new", { state: { pipelineId: selectedPipelineId } })}
                    className="bg-codex-primary hover:bg-codex-fondo-primary-variante3 text-white rounded-full px-5 shadow-lg shadow-codex-primary/20 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus className="mr-2 h-4 w-4" /> New Opportunity
                </Button>
            </header>

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
