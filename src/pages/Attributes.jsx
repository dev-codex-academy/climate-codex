import React, { useEffect, useState } from 'react';
import {
    DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
    SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getAttributes, createAttribute, updateAttribute, deleteAttribute } from '../services/attributeService';
import { AttributeForm } from '../components/attributes/AttributeForm';
import { Plus, Trash, Edit, ChevronLeft, ChevronRight, SlidersHorizontal, GripVertical } from 'lucide-react';
import Swal from 'sweetalert2';

const TYPE_COLORS = {
    text:     { bg: "color-mix(in srgb, var(--c-brand) 10%, transparent)",  border: "color-mix(in srgb, var(--c-brand) 35%, transparent)",  color: "var(--c-brand-strong)" },
    boolean:  { bg: "color-mix(in srgb, var(--c-cta) 12%, transparent)", border: "color-mix(in srgb, var(--c-cta) 40%, transparent)", color: "var(--c-cta-strong)" },
    list:     { bg: "color-mix(in srgb, var(--c-accent) 12%, transparent)", border: "color-mix(in srgb, var(--c-accent) 40%, transparent)", color: "var(--c-brand-strong)" },
    number:   { bg: "rgba(216,210,196,0.4)",  border: "var(--c-border)",               color: "var(--c-muted)" },
    date:     { bg: "rgba(216,210,196,0.4)",  border: "var(--c-border)",               color: "var(--c-muted)" },
};

const TypePill = ({ type }) => {
    const c = TYPE_COLORS[type?.toLowerCase()] || TYPE_COLORS.number;
    return (
        <span
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest"
            style={{ backgroundColor: c.bg, border: `1px solid ${c.border}`, color: c.color }}
        >
            {type}
        </span>
    );
};

const Modal = ({ isOpen, children, onClose }) => {
    if (!isOpen) return null;
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            style={{ backgroundColor: "rgba(30,47,74,0.4)" }}
        >
            <div
                className="w-full max-w-md rounded-xl shadow-2xl p-6 relative"
                style={{ backgroundColor: "var(--c-surface)", border: "1px solid var(--c-border)" }}
                onClick={e => e.stopPropagation()}
            >
                {children}
            </div>
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    );
};

const SortableAttrCard = ({ attr, onEdit, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: attr.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.45 : 1,
        zIndex: isDragging ? 50 : undefined,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group/item flex items-center justify-between p-3 rounded-lg transition-all"
            onMouseEnter={e => {
                if (!isDragging) {
                    e.currentTarget.style.borderColor = "var(--c-brand)";
                    e.currentTarget.style.backgroundColor = "var(--c-surface-2)";
                }
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = "var(--c-border)";
                e.currentTarget.style.backgroundColor = "var(--c-surface-2)";
            }}
        >
            {/* Drag handle */}
            <button
                {...attributes}
                {...listeners}
                className="flex items-center justify-center mr-2 shrink-0 cursor-grab active:cursor-grabbing"
                style={{ color: "var(--c-border)", touchAction: "none" }}
                title="Drag to reorder"
            >
                <GripVertical size={14} />
            </button>

            {/* Order badge */}
            <span
                className="shrink-0 mr-2 text-[9px] font-black tabular-nums flex items-center justify-center rounded"
                style={{
                    minWidth: "18px", height: "18px",
                    backgroundColor: "color-mix(in srgb, var(--c-brand) 12%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--c-brand) 25%, transparent)",
                    color: "var(--c-brand)",
                    padding: "0 3px",
                }}
            >
                {attr.order ?? 0}
            </span>

            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                    <p className="font-bold text-xs uppercase tracking-tight truncate" style={{ color: "var(--c-ink)" }}>
                        {attr.label}
                    </p>
                    {attr.is_required && (
                        <span className="text-[9px] font-bold" style={{ color: "#c0392b" }} title="Required">●</span>
                    )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <TypePill type={attr.type} />
                    <span className="font-mono text-[9px] truncate opacity-60" style={{ color: "var(--c-muted)" }}>#{attr.name}</span>
                </div>
            </div>

            <div className="flex gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0 ml-2">
                <button
                    onClick={() => onEdit(attr)}
                    className="flex h-7 w-7 items-center justify-center rounded-md transition-colors cursor-pointer"
                    style={{ color: "var(--c-brand)" }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "color-mix(in srgb, var(--c-brand) 10%, transparent)"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                    title="Edit"
                >
                    <Edit size={13} />
                </button>
                <button
                    onClick={() => onDelete(attr.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-md transition-colors cursor-pointer"
                    style={{ color: "#c0392b" }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(192,57,43,0.08)"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                    title="Delete"
                >
                    <Trash size={13} />
                </button>
            </div>
        </div>
    );
};

export const Attributes = () => {
    const [entities] = useState([
        'client', 'contact', 'lead', 'service',
        'category', 'catalogue_item', 'invoice', 'followup', 'inventory', 'asset', 'asset_assignment'
    ]);
    const [attributesData, setAttributesData] = useState({});
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEntity, setCurrentEntity] = useState(null);
    const [editingAttribute, setEditingAttribute] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    useEffect(() => { fetchAllAttributes(); }, []);

    const fetchAllAttributes = async () => {
        setLoading(true);
        try {
            const results = await Promise.all(entities.map(e => getAttributes(e)));
            const newData = {};
            entities.forEach((entity, index) => {
                newData[entity] = results[index].results || results[index] || [];
            });
            setAttributesData(newData);
        } catch (error) {
            console.error("Error fetching all attributes", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddClick = (entity) => {
        setCurrentEntity(entity);
        setEditingAttribute(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (entity, attribute) => {
        setCurrentEntity(entity);
        setEditingAttribute(attribute);
        setIsModalOpen(true);
    };

    const handleCreateOrUpdate = async (data) => {
        setFormLoading(true);
        try {
            if (editingAttribute) {
                await updateAttribute(editingAttribute.id, data);
            } else {
                await createAttribute(currentEntity, data);
            }
            const updatedList = await getAttributes(currentEntity);
            setAttributesData(prev => ({ ...prev, [currentEntity]: updatedList }));
            setIsModalOpen(false);
            setEditingAttribute(null);
            Swal.fire({ icon: 'success', title: editingAttribute ? 'Attribute Updated' : 'Attribute Created', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error', text: error.message });
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (entity, id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--c-brand)',
            cancelButtonColor: 'var(--c-hint)',
            confirmButtonText: 'Yes, delete it!'
        });
        if (!result.isConfirmed) return;
        try {
            await deleteAttribute(entity, id);
            const updatedList = await getAttributes(entity);
            setAttributesData(prev => ({ ...prev, [entity]: updatedList }));
            Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Attribute deleted.', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
        } catch {
            Swal.fire({ icon: 'error', title: 'Error!', text: 'Failed to delete attribute.' });
        }
    };

    const handleDragEnd = async (entity, event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const items = attributesData[entity] || [];
        const oldIndex = items.findIndex(a => a.id === active.id);
        const newIndex = items.findIndex(a => a.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);

        // Optimistic UI update
        setAttributesData(prev => ({ ...prev, [entity]: reordered }));

        // Persist new order values (1-based)
        try {
            await Promise.all(
                reordered.map((attr, idx) =>
                    attr.order !== idx + 1
                        ? updateAttribute(attr.id, { order: idx + 1 })
                        : Promise.resolve()
                )
            );
            // Sync from server to get updated order values
            const updated = await getAttributes(entity);
            setAttributesData(prev => ({ ...prev, [entity]: updated }));
        } catch {
            // Revert on failure
            setAttributesData(prev => ({ ...prev, [entity]: items }));
            Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to save new order.', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center" style={{ color: "var(--c-muted)", fontFamily: 'var(--font-body)' }}>
                Loading Attributes...
            </div>
        );
    }

    return (
        <div
            className="flex-1 flex flex-col min-h-0 overflow-hidden w-full"
            style={{ backgroundColor: "var(--c-surface)", fontFamily: 'var(--font-body)' }}
        >
            {/* Page header */}
            <div
                className="shrink-0 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                style={{ borderBottom: "1px solid var(--c-border)", backgroundColor: "var(--c-surface-2)" }}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: "color-mix(in srgb, var(--c-brand) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--c-brand) 30%, transparent)" }}
                    >
                        <SlidersHorizontal className="h-5 w-5" style={{ color: "var(--c-brand)" }} />
                    </div>
                    <div>
                        <p className="text-base font-semibold uppercase tracking-wide" style={{ color: "var(--c-ink)", fontFamily: 'var(--font-body)' }}>
                            Core Attributes Management
                        </p>
                        <p className="text-xs flex items-center gap-1.5 mt-0.5" style={{ color: "var(--c-hint)" }}>
                            <span className="h-1.5 w-1.5 rounded-full animate-pulse inline-block" style={{ backgroundColor: "var(--c-brand)" }} />
                            Define and customize fields for your core system entities. Drag cards to reorder.
                        </p>
                    </div>
                </div>
                <span
                    className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
                    style={{ backgroundColor: "color-mix(in srgb, var(--c-brand) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--c-brand) 30%, transparent)", color: "var(--c-brand)" }}
                >
                    {entities.length} Modules
                </span>
            </div>

            {/* Kanban board */}
            <div className="flex-1 min-h-0 overflow-hidden p-5 relative group/board">
                {/* Scroll fade overlays */}
                <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[var(--c-surface)] to-transparent pointer-events-none z-10 opacity-0 group-hover/board:opacity-100 transition-opacity" />
                <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[var(--c-surface)] to-transparent pointer-events-none z-10 opacity-0 group-hover/board:opacity-100 transition-opacity" />

                {/* Scroll left */}
                <button
                    onClick={() => document.getElementById('attr-scroll-container').scrollBy({ left: -420, behavior: 'smooth' })}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 flex items-center justify-center rounded-full opacity-0 group-hover/board:opacity-100 transition-all hover:scale-105 hidden md:flex"
                    style={{ backgroundColor: "var(--c-surface)", border: "1px solid var(--c-border)", color: "var(--c-brand)", boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}
                >
                    <ChevronLeft size={16} />
                </button>

                {/* Scroll right */}
                <button
                    onClick={() => document.getElementById('attr-scroll-container').scrollBy({ left: 420, behavior: 'smooth' })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-9 w-9 flex items-center justify-center rounded-full opacity-0 group-hover/board:opacity-100 transition-all hover:scale-105 hidden md:flex"
                    style={{ backgroundColor: "var(--c-surface)", border: "1px solid var(--c-border)", color: "var(--c-brand)", boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}
                >
                    <ChevronRight size={16} />
                </button>

                <div
                    id="attr-scroll-container"
                    className="flex gap-5 overflow-x-auto pb-4 h-full scroll-smooth"
                    style={{ scrollbarWidth: "thin", scrollbarColor: "var(--c-border) transparent" }}
                >
                    {entities.map(entity => {
                        const label = entity === 'catalogue_item' ? 'Catalogue Item'
                            : entity === 'asset_assignment' ? 'Asset Assignment'
                            : entity.replace('_', ' ');
                        const attrs = attributesData[entity] || [];
                        const attrIds = attrs.map(a => a.id);

                        return (
                            <div
                                key={entity}
                                className="flex-shrink-0 w-[85vw] md:w-[360px] flex flex-col rounded-xl h-full"
                                style={{ border: "1px solid var(--c-border)", backgroundColor: "var(--c-surface)", overflow: "hidden" }}
                            >
                                {/* Column header */}
                                <div
                                    className="px-4 py-3 flex justify-between items-center shrink-0"
                                    style={{ backgroundColor: "var(--c-brand)", borderBottom: "1px solid var(--c-brand-strong)" }}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold uppercase"
                                            style={{ backgroundColor: "color-mix(in srgb, var(--c-surface) 15%, transparent)", color: "var(--c-on-dark)" }}
                                        >
                                            {entity.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest leading-none" style={{ color: "var(--c-on-dark)" }}>
                                                {label}
                                            </p>
                                            <span className="text-[9px] font-medium" style={{ color: "color-mix(in srgb, var(--c-surface) 60%, transparent)" }}>
                                                {attrs.length} {attrs.length === 1 ? 'attribute' : 'attributes'}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAddClick(entity)}
                                        className="flex items-center gap-1 px-3 h-7 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                                        style={{ backgroundColor: "color-mix(in srgb, var(--c-surface) 15%, transparent)", color: "var(--c-on-dark)", border: "1px solid color-mix(in srgb, var(--c-surface) 25%, transparent)" }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "color-mix(in srgb, var(--c-surface) 25%, transparent)"}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "color-mix(in srgb, var(--c-surface) 15%, transparent)"}
                                    >
                                        <Plus size={11} /> New
                                    </button>
                                </div>

                                {/* Attribute list with drag-and-drop */}
                                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                    {attrs.length === 0 ? (
                                        <div
                                            className="h-24 flex flex-col items-center justify-center rounded-lg m-1"
                                            style={{ border: "1.5px dashed var(--c-border)", color: "var(--c-hint)" }}
                                        >
                                            <p className="text-[10px] uppercase tracking-widest font-bold">No Attributes</p>
                                            <p className="text-[9px] mt-0.5 opacity-60 italic">Start by adding one</p>
                                        </div>
                                    ) : (
                                        <DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragEnd={(e) => handleDragEnd(entity, e)}
                                        >
                                            <SortableContext items={attrIds} strategy={verticalListSortingStrategy}>
                                                {attrs.map(attr => (
                                                    <SortableAttrCard
                                                        key={attr.id}
                                                        attr={attr}
                                                        onEdit={(a) => handleEditClick(entity, a)}
                                                        onDelete={(id) => handleDelete(entity, id)}
                                                    />
                                                ))}
                                            </SortableContext>
                                        </DndContext>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingAttribute(null); }}>
                <AttributeForm
                    entity={currentEntity}
                    onSubmit={handleCreateOrUpdate}
                    onCancel={() => { setIsModalOpen(false); setEditingAttribute(null); }}
                    isLoading={formLoading}
                    initialData={editingAttribute}
                    defaultOrder={(attributesData[currentEntity]?.length ?? 0) + 1}
                />
            </Modal>
        </div>
    );
};
