import React, { useEffect, useState } from "react";
import { getPipelines } from "../services/pipelineService";
import { PipelineForm } from "../components/pipelines/PipelineForm";
import { PipelineModal } from "../components/pipelines/PipelineModal";
import { Plus, Edit2, Columns } from "lucide-react";

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

    useEffect(() => {
        fetchPipelines();
    }, []);

    const handleCreateClick = () => {
        setEditingPipeline(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (pipeline) => {
        setEditingPipeline(pipeline);
        setIsModalOpen(true);
    };

    const handleSaved = () => {
        setIsModalOpen(false);
        fetchPipelines();
    };

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Pipelines</h1>
                    <p className="text-muted-foreground text-sm">Manage your sales pipelines and stages</p>
                </div>
                <button
                    onClick={handleCreateClick}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                >
                    <Plus size={18} /> New Pipeline
                </button>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">Loading pipelines...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pipelines.length === 0 ? (
                        <div className="col-span-full text-center py-20 text-muted-foreground border border-dashed border-border rounded-lg">
                            No pipelines found. Create one to get started.
                        </div>
                    ) : (
                        pipelines.map((pipeline) => (
                            <div
                                key={pipeline.id}
                                className="bg-white dark:bg-codex-fondo-secondary border border-border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative"
                                onClick={() => handleEditClick(pipeline)}
                            >
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="p-2 bg-secondary rounded-full hover:bg-secondary/80">
                                        <Edit2 size={14} className="text-foreground" />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-primary/10 rounded-md">
                                        <Columns className="text-primary" size={24} />
                                    </div>
                                    <h3 className="font-semibold text-lg">{pipeline.name}</h3>
                                </div>

                                <div className="space-y-3">
                                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stages</div>
                                    <div className="flex flex-wrap gap-2">
                                        {pipeline.stages?.sort((a, b) => a.order - b.order).map((stage) => (
                                            <div
                                                key={stage.id || stage.name}
                                                className="flex items-center gap-1.5 px-2 py-1 rounded bg-secondary/50 text-xs border border-border"
                                            >
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: stage.color }}
                                                />
                                                <span className="font-medium">{stage.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <PipelineModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <PipelineForm
                    initialData={editingPipeline}
                    onPipelineSaved={handleSaved}
                />
            </PipelineModal>
        </div>
    );
};
