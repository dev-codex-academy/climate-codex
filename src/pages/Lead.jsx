import React, { useState } from "react";
import { LeadBoard } from "../components/leads/LeadBoard";
import { Plus, TrendingUp } from "lucide-react";
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
        <div
            className="h-full flex flex-col w-full"
            style={{ backgroundColor: "#FBF7EF", fontFamily: '"Source Sans 3", Arial, sans-serif' }}
        >
            {/* Page header — same pattern as Attributes */}
            <div
                className="shrink-0 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                style={{ borderBottom: "1px solid #D8D2C4", backgroundColor: "#F2EBDD" }}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: "rgba(94,106,67,0.12)", border: "1px solid rgba(94,106,67,0.3)" }}
                    >
                        <TrendingUp className="h-5 w-5" style={{ color: "#5E6A43" }} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-base font-semibold truncate" style={{ color: "#2E2A26", fontFamily: '"Source Sans 3", Arial, sans-serif' }}>
                            Sales Pipeline
                        </p>
                        <p className="text-xs flex items-center gap-1.5 mt-0.5" style={{ color: "#9b948e" }}>
                            <span className="h-1.5 w-1.5 rounded-full animate-pulse inline-block shrink-0" style={{ backgroundColor: "#5E6A43" }} />
                            Manage your opportunities and move them through stages.
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => navigate("/lead/new", { state: { pipelineId: selectedPipelineId } })}
                    className="flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-semibold transition-colors cursor-pointer shrink-0"
                    style={{ backgroundColor: "#5E6A43", color: "#FBF7EF" }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#4a5535"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "#5E6A43"}
                >
                    <Plus className="h-4 w-4" />
                    New Opportunity
                </button>
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
