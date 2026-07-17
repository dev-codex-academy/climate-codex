import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { createPipeline, updatePipeline } from "../../services/pipelineService";
import { Plus, Trash2, Save, GripVertical } from "lucide-react";
import {
    DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import {
    SortableContext, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// "Won" and "Lost" are system-managed stages (see PipeLineSerializer.create/update
// on the backend) — always present, fixed order, re-appended server-side. They're
// excluded here so the user only ever edits the custom stages.
const isSystemStage = (stage) => ["new", "won", "lost"].includes((stage?.name || "").trim().toLowerCase());

const SortableStageRow = ({ field, index, register, errors, onRemove }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : undefined,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 bg-muted/30 rounded-md border border-border group">
            <button
                type="button"
                {...attributes}
                {...listeners}
                className="text-muted-foreground cursor-grab active:cursor-grabbing p-1"
                style={{ touchAction: "none" }}
                title="Drag to reorder"
            >
                <GripVertical size={16} />
            </button>

            <div className="flex-1">
                <input
                    {...register(`stages.${index}.name`, {
                        required: "Stage name is required",
                        validate: (value) => {
                            const lower = value.toLowerCase();
                            if (['new', 'won', 'lost'].includes(lower)) {
                                return "Stage name cannot be 'New', 'Won' or 'Lost'";
                            }
                            return true;
                        }
                    })}
                    placeholder="Stage Name"
                    className="w-full p-1.5 text-sm bg-transparent border-b border-transparent focus:border-primary focus:outline-none transition-colors"
                />
                {errors.stages?.[index]?.name && <span className="text-red-500 text-[10px]">{errors.stages[index].name.message}</span>}
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="color"
                    {...register(`stages.${index}.color`)}
                    className="w-8 h-8 rounded cursor-pointer border-none bg-transparent"
                    title="Stage Color"
                />
                <button
                    type="button"
                    onClick={onRemove}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    title="Remove Stage"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};

export const PipelineForm = ({ onPipelineSaved, initialData = null }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            name: "",
            stages: [
                { name: "Prospecting", color: "#6c6f73" },
                { name: "Negotiation", color: "#007bff" }
            ]
        }
    });

    useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name,
                stages: (initialData.stages || []).filter((s) => !isSystemStage(s))
            });
        }
    }, [initialData, reset]);

    const { fields, append, remove, move } = useFieldArray({
        control,
        name: "stages"
    });

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = fields.findIndex((f) => f.id === active.id);
        const newIndex = fields.findIndex((f) => f.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) move(oldIndex, newIndex);
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            const formattedData = {
                ...data,
                // The model's JSONField validator requires each stage to have
                // *exactly* {name, color, order} — 'id' is server-assigned
                // (see PipeLine.save()) and must never be sent back.
                stages: data.stages.map((stage, index) => {
                    const { id: _id, ...rest } = stage;
                    return { ...rest, order: index + 1 };
                })
            };

            if (initialData && initialData.id) {
                await updatePipeline(initialData.id, formattedData);
            } else {
                await createPipeline(formattedData);
            }

            if (onPipelineSaved) onPipelineSaved();
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to save pipeline");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">
            <h2 className="text-xl font-bold mb-4 text-foreground">{initialData ? "Edit Pipeline" : "Create New Pipeline"}</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-1 text-muted-foreground">Pipeline Name</label>
                    <input
                        {...register("name", { required: "Pipeline name is required" })}
                        className="w-full p-2 rounded-md border border-input bg-background text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                        placeholder="e.g. B2B Sales"
                    />
                    {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>}
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Stages</label>
                            <p className="text-[11px] text-muted-foreground/70">"New", "Won" and "Lost" are added automatically and aren't shown here.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => append({ name: "", color: "#000000" })}
                            className="flex items-center text-xs bg-secondary text-secondary-foreground px-3 py-1 rounded-md hover:bg-secondary/80 transition-colors"
                        >
                            <Plus size={14} className="mr-1" /> Add Stage
                        </button>
                    </div>

                    <div className="space-y-2">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                                {fields.map((field, index) => (
                                    <SortableStageRow
                                        key={field.id}
                                        field={field}
                                        index={index}
                                        register={register}
                                        errors={errors}
                                        onRemove={() => remove(index)}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>
                </div>

                {error && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">{error}</div>}

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {isLoading
                            ? (initialData ? "Saving..." : "Creating...")
                            : <><Save size={18} /> {initialData ? "Save Changes" : "Create Pipeline"}</>}
                    </button>
                </div>
            </form>
        </div>
    );
};
