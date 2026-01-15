import React, { useEffect, useState, useRef } from "react";
import { LeadCard } from "./LeadCard";
import { getPipelines } from "../../services/pipelineService";
import { getLeads, updateLead } from "../../services/leadService";
import { getSales } from "../../services/salesService";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const LeadBoard = ({ refreshTrigger, selectedPipelineId, setSelectedPipelineId, onLeadClick }) => {
    const [pipelines, setPipelines] = useState([]);
    const [leads, setLeads] = useState([]);
    const [stages, setStages] = useState([]);
    const [salesUsers, setSalesUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollContainerRef = useRef(null);

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };

    // Load pipelines on mount
    useEffect(() => {
        const fetchPipelines = async () => {
            const pipelinesData = await getPipelines();
            const loadedPipelines = pipelinesData.results || pipelinesData || [];
            setPipelines(loadedPipelines);

            // Set default if needed
            if (loadedPipelines.length > 0 && !selectedPipelineId) {
                setSelectedPipelineId(loadedPipelines[0].id);
            }
        };

        const fetchSalesUsers = async () => {
            try {
                const salesData = await getSales();
                setSalesUsers(salesData.results || salesData || []);
            } catch (err) {
                console.error("Failed to load sales users", err);
            }
        };

        fetchPipelines();
        fetchSalesUsers();
    }, []);

    // Load leads when pipeline or trigger changes
    useEffect(() => {
        const fetchLeads = async () => {
            if (!selectedPipelineId) return;

            setLoading(true);
            try {
                const leadsData = await getLeads({ pipeline_id: selectedPipelineId });
                setLeads(leadsData.results || leadsData || []);
            } catch (error) {
                console.error("Error loading leads", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeads();
    }, [selectedPipelineId, refreshTrigger]);

    // Update stages when pipeline selected
    useEffect(() => {
        if (!selectedPipelineId || !pipelines.length) return;

        const activePipeline = pipelines.find(p => p.id == selectedPipelineId);
        if (activePipeline && activePipeline.stages) {
            const sortedStages = [...activePipeline.stages].sort((a, b) => a.order - b.order);
            setStages(sortedStages);
        } else {
            setStages([]);
        }
    }, [selectedPipelineId, pipelines]);

    const handleDragStart = (e, lead) => {
        e.dataTransfer.setData("leadId", lead.id);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = async (e, targetStageName) => {
        e.preventDefault();
        const leadId = e.dataTransfer.getData("leadId");

        // Optimistic update
        const originalLeads = [...leads];
        const updatedLeads = leads.map(l => {
            if (l.id.toString() === leadId) {
                return { ...l, stage: targetStageName };
            }
            return l;
        });
        setLeads(updatedLeads);

        try {
            await updateLead(leadId, { stage: targetStageName });
        } catch (error) {
            console.error("Failed to update stage", error);
            setLeads(originalLeads);
        }
    };

    if (loading) {
        return <div className="p-10 text-center">Loading board...</div>;
    }

    if (!pipelines.length) {
        return (
            <div className="flex flex-col items-center justify-center p-10 h-full">
                <div className="text-center mb-8">
                    <h3 className="text-xl font-semibold mb-2">No active pipeline found</h3>
                    <p className="text-muted-foreground mb-6">Configure your first pipeline to start managing leads.</p>
                    <Link
                        to="/pipeline"
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                    >
                        Manage Pipelines
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] relative group/board">
            {/* Pipeline Selector */}
            <div className="px-4 py-2 flex items-center gap-3">
                <label className="text-sm font-medium text-foreground">Pipeline:</label>
                <select
                    value={selectedPipelineId || ""}
                    onChange={(e) => setSelectedPipelineId(e.target.value)}
                    className="p-2 rounded-md border border-border bg-background text-foreground text-sm focus:ring-1 focus:ring-primary focus:outline-none min-w-[200px]"
                >
                    {pipelines.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>

            {/* Scroll Button Left */}
            <button
                onClick={scrollLeft}
                className="absolute left-1 top-1/2 z-20 p-2 bg-background/80 hover:bg-background shadow-md border border-border rounded-full opacity-0 group-hover/board:opacity-100 transition-opacity disabled:opacity-0"
            >
                <ChevronLeft size={24} />
            </button>

            {/* Scroll Button Right */}
            <button
                onClick={scrollRight}
                className="absolute right-1 top-1/2 z-20 p-2 bg-background/80 hover:bg-background shadow-md border border-border rounded-full opacity-0 group-hover/board:opacity-100 transition-opacity"
            >
                <ChevronRight size={24} />
            </button>


            <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto pb-4 px-4 h-full mt-2 scrollbar-hide scroll-smooth"
            >
                {stages.map((stage, index) => {
                    // Filter leads for this stage
                    const stageLeads = leads.filter(l => {
                        const matchesStage = l.stage === stage.name || l.stage_id === stage.id;
                        // Fallback: If it's the first stage, include leads with no stage defined
                        if (index === 0 && !l.stage && !l.stage_id) return true;
                        return matchesStage;
                    });

                    return (
                        <div
                            key={stage.name}
                            className="flex-shrink-0 w-80 flex flex-col rounded-lg bg-codex-fondo-terciario-variante1 dark:bg-codex-fondo-secondary border border-border h-full max-h-full"
                            style={{ borderTop: `4px solid ${stage.color}` }}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, stage.name)}
                        >
                            {/* Column Header */}
                            <div className="p-3 border-b border-border flex justify-between items-center sticky top-0 bg-inherit rounded-t-lg z-10">
                                <h3 className="font-semibold text-sm">{stage.name}</h3>
                                <span className="bg-codex-fondo-terciario-variante4 text-xs font-medium px-2 py-0.5 rounded-full">
                                    {stageLeads.length}
                                </span>
                            </div>

                            {/* Drop Zone / List */}
                            <div className="flex-1 p-2 overflow-y-auto min-h-[100px]">
                                {stageLeads.map((lead) => (
                                    <LeadCard
                                        key={lead.id}
                                        lead={lead}
                                        salesUsers={salesUsers}
                                        onDragStart={handleDragStart}
                                        onClick={() => onLeadClick && onLeadClick(lead)}
                                    />
                                ))}
                                {stageLeads.length === 0 && (
                                    <div className="text-center text-xs text-muted-foreground mt-10 italic">
                                        Drop items here
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
