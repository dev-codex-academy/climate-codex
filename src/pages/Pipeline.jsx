import React, { useEffect, useState } from "react";
import { getPipelines } from "../services/pipelineService";
import { PipelineForm } from "../components/pipelines/PipelineForm";
import { PipelineModal } from "../components/pipelines/PipelineModal";
import { Plus, Edit2, Columns } from "lucide-react";

const textColorForBg = (hex) => {
    if (!hex) return "#2E2A26";
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.55 ? "#2E2A26" : "#FBF7EF";
};

export const Pipeline = () => {
    const [pipelines, setPipelines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPipeline, setEditingPipeline] = useState(null);

    const fetchPipelines = async () => {
        setLoading(true);
        try {
            const data = await getPipelines();
            setPipelines(data.results || data || []);
        } catch (error) {
            console.error("Error fetching pipelines", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPipelines(); }, []);

    const handleCreateClick = () => { setEditingPipeline(null); setIsModalOpen(true); };
    const handleEditClick = (pipeline) => { setEditingPipeline(pipeline); setIsModalOpen(true); };
    const handleSaved = () => { setIsModalOpen(false); fetchPipelines(); };

    return (
        <div
            className="p-6 h-full flex flex-col"
            style={{ backgroundColor: "#FBF7EF", fontFamily: '"Source Sans 3", Arial, sans-serif' }}
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: "rgba(94,106,67,0.12)", border: "1px solid rgba(94,106,67,0.3)" }}
                    >
                        <Columns className="h-5 w-5" style={{ color: "#5E6A43" }} />
                    </div>
                    <div>
                        <p className="text-base font-semibold" style={{ color: "#2E2A26", fontFamily: '"Source Sans 3", Arial, sans-serif' }}>Pipelines</p>
                        <p className="text-sm" style={{ color: "#9b948e" }}>Manage your sales pipelines and stages</p>
                    </div>
                </div>
                <button
                    onClick={handleCreateClick}
                    className="flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                    style={{ backgroundColor: "#5E6A43", color: "#FBF7EF" }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#4a5535"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "#5E6A43"}
                >
                    <Plus size={16} /> New Pipeline
                </button>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center" style={{ color: "#6b6560" }}>
                    Loading pipelines...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {pipelines.length === 0 ? (
                        <div
                            className="col-span-full text-center py-20 rounded-xl"
                            style={{ border: "1.5px dashed #D8D2C4", color: "#9b948e" }}
                        >
                            <Columns className="h-10 w-10 mx-auto mb-3 opacity-25" />
                            <p className="text-sm">No pipelines found.</p>
                            <p className="text-xs mt-1">Create one to get started.</p>
                        </div>
                    ) : pipelines.map((pipeline) => (
                        <div
                            key={pipeline.id}
                            className="rounded-xl p-5 cursor-pointer group relative transition-all"
                            style={{ backgroundColor: "#FBF7EF", border: "1px solid #D8D2C4" }}
                            onClick={() => handleEditClick(pipeline)}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "#5E6A43"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(94,106,67,0.10)"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "#D8D2C4"; e.currentTarget.style.boxShadow = "none"; }}
                        >
                            {/* Edit icon */}
                            <div className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div
                                    className="h-7 w-7 flex items-center justify-center rounded-full"
                                    style={{ backgroundColor: "rgba(94,106,67,0.10)" }}
                                >
                                    <Edit2 size={13} style={{ color: "#5E6A43" }} />
                                </div>
                            </div>

                            {/* Pipeline title */}
                            <div className="flex items-center gap-3 mb-4">
                                <div
                                    className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
                                    style={{ backgroundColor: "rgba(94,106,67,0.10)", border: "1px solid rgba(94,106,67,0.25)" }}
                                >
                                    <Columns size={18} style={{ color: "#5E6A43" }} />
                                </div>
                                <h3 className="font-semibold text-base leading-tight" style={{ color: "#2E2A26" }}>
                                    {pipeline.name}
                                </h3>
                            </div>

                            {/* Stages */}
                            <div className="space-y-2">
                                <p
                                    className="text-[10px] font-bold uppercase tracking-widest"
                                    style={{ color: "#9b948e" }}
                                >
                                    Stages
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {pipeline.stages?.sort((a, b) => a.order - b.order).map((stage) => {
                                        const bg = stage.color || "#D8D2C4";
                                        const fg = textColorForBg(bg);
                                        return (
                                            <div
                                                key={stage.id || stage.name}
                                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                                                style={{ backgroundColor: bg, color: fg }}
                                            >
                                                {stage.name}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <PipelineModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <PipelineForm initialData={editingPipeline} onPipelineSaved={handleSaved} />
            </PipelineModal>
        </div>
    );
};
