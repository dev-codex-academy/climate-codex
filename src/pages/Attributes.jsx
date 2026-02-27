import React, { useEffect, useState } from 'react';
import { getAttributes, createAttribute, deleteAttribute } from '../services/attributeService';
import { AttributeForm } from '../components/attributes/AttributeForm';
import { Button } from '../components/ui/button';
import { Plus, Trash, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';

// Simple Modern Modal Component
const Modal = ({ isOpen, children, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-codex-fondo-secondary/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="bg-white dark:bg-codex-fondo-secondary border border-codex-bordes-primary-variante2/30 dark:border-codex-bordes-terciario-variante4/30 rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-300 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-1 rounded-full hover:bg-muted transition-colors text-muted-foreground"
                >
                    <Plus className="rotate-45 size-5" />
                </button> */}
                {children}
            </div>
            <div className="absolute inset-0 -z-10" onClick={onClose}></div>
        </div>
    );
};

export const Attributes = () => {
    const [entities] = useState([
        'client', 'contact', 'lead', 'lead_client_info', 'lead_service_info', 'service',
        'category', 'catalogue_item', 'invoice', 'followup', 'inventory'
    ]);
    const [attributesData, setAttributesData] = useState({});
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEntity, setCurrentEntity] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        fetchAllAttributes();
    }, []);

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
        setIsModalOpen(true);
    };

    const handleCreate = async (data) => {
        setFormLoading(true);
        try {
            await createAttribute(currentEntity, data);

            // Refresh specifics
            const updatedList = await getAttributes(currentEntity);
            setAttributesData(prev => ({ ...prev, [currentEntity]: updatedList }));

            setIsModalOpen(false);
            Swal.fire({
                icon: 'success',
                title: 'Attribute Created',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message
            });
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (entity, id) => {
        // Confirmation
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await deleteAttribute(entity, id);
                // Refresh
                const updatedList = await getAttributes(entity);
                setAttributesData(prev => ({ ...prev, [entity]: updatedList }));

                Swal.fire(
                    'Deleted!',
                    'Your attribute has been deleted.',
                    'success'
                )
            } catch (error) {
                Swal.fire(
                    'Error!',
                    'Failed to delete attribute.',
                    'error'
                )
            }
        }
    };

    if (loading) return <div className="p-8">Loading Attributes...</div>;

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-codex-fondo-primary-variante1 dark:bg-codex-fondo-secondary-variante5/30 transition-colors duration-300 overflow-hidden w-full max-w-[95vw]">
            <header className="shrink-0 z-30 w-full border-b border-codex-bordes-primary-variante2 dark:border-codex-bordes-terciario-variante4 bg-white/70 dark:bg-codex-fondo-secondary/70 backdrop-blur-md px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl font-bold tracking-tight text-codex-texto-primary dark:text-codex-texto-terciario-variante1 uppercase">
                        Core Attributes Management
                    </h1>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 truncate">
                        <span className="shrink-0 flex h-2 w-2 rounded-full bg-codex-primary animate-pulse"></span>
                        Define and customize fields for your core system entities.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center -space-x-2 overflow-hidden">
                        {/* {entities.slice(0, 1).map((e, i) => (
                            <div key={i} className="h-7 w-7 rounded-full ring-2 ring-white dark:ring-codex-fondo-secondary bg-codex-fondo-primary-variante2 flex items-center justify-center text-[8px] font-bold uppercase transition-transform hover:-translate-y-0.5 cursor-help" title={e}>
                                {e.charAt(0)}
                            </div>
                        ))} */}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{entities.length} Modules</span>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 min-h-0 overflow-hidden p-6 relative group/board">
                {/* Scroll Nav Controls */}
                <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-codex-fondo-primary-variante1/30 dark:from-[#1e242a]/30 to-transparent pointer-events-none z-10 opacity-0 group-hover/board:opacity-100 transition-opacity"></div>
                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-codex-fondo-primary-variante1/30 dark:from-[#1e242a]/30 to-transparent pointer-events-none z-10 opacity-0 group-hover/board:opacity-100 transition-opacity"></div>

                {/* Scroll Button Left */}
                <button
                    onClick={() => document.getElementById('attr-scroll-container').scrollBy({ left: -400, behavior: 'smooth' })}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/80 dark:bg-codex-fondo-secondary shadow-xl border border-codex-bordes-primary-variante2 dark:border-codex-bordes-terciario-variante4 rounded-full opacity-0 group-hover/board:opacity-100 transition-all hover:scale-110 active:scale-95 hidden md:block"
                >
                    <ChevronLeft size={16} className="text-codex-primary" />
                </button>

                {/* Scroll Button Right */}
                <button
                    onClick={() => document.getElementById('attr-scroll-container').scrollBy({ left: 400, behavior: 'smooth' })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/80 dark:bg-codex-fondo-secondary shadow-xl border border-codex-bordes-primary-variante2 dark:border-codex-bordes-terciario-variante4 rounded-full opacity-0 group-hover/board:opacity-100 transition-all hover:scale-110 active:scale-95 hidden md:block"
                >
                    <ChevronRight size={16} className="text-codex-primary" />
                </button>

                <div
                    id="attr-scroll-container"
                    className="flex gap-8 overflow-x-auto pb-8 h-full snap-x snap-mandatory scrollbar-hide scroll-smooth"
                >
                    {entities.map(entity => (
                        <div key={entity} className="flex-shrink-0 w-[85vw] md:w-[450px] flex flex-col rounded-2xl bg-white/50 dark:bg-codex-fondo-secondary/40 border border-codex-bordes-primary-variante2/50 dark:border-codex-bordes-terciario-variante4/50 h-full max-h-full shadow-sm backdrop-blur-sm transition-all hover:shadow-md snap-center">
                            {/* Column Header */}
                            <div className="p-5 flex justify-between items-center sticky top-0 bg-white/80 dark:bg-codex-fondo-secondary/80 rounded-t-2xl z-10 backdrop-blur-sm border-b border-codex-bordes-primary-variante2/30 dark:border-codex-bordes-terciario-variante4/30">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-codex-fondo-primary-variante1 dark:bg-codex-fondo-terciario-variante5 flex items-center justify-center text-codex-primary font-bold shadow-inner">
                                        {entity === 'service' ? 'S' : entity.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <h2 className="text-sm font-black uppercase tracking-widest text-codex-texto-secondary dark:text-codex-texto-terciario-variante1 leading-none">
                                            {entity === 'service' ? 'Service'
                                                : entity === 'lead_client_info' ? 'Client Info'
                                                    : entity === 'lead_service_info' ? 'Service Info'
                                                        : entity.replace('_', ' ')}
                                        </h2>
                                        <span className="text-[10px] text-muted-foreground font-medium mt-1">Entity Module</span>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => handleAddClick(entity)}
                                    className="bg-codex-primary hover:bg-codex-primary/90 text-white rounded-full px-4 h-8 text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105"
                                >
                                    <Plus size={14} className="mr-1" /> New
                                </Button>
                            </div>

                            <div className="p-5 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                                {attributesData[entity] && attributesData[entity].length === 0 ? (
                                    <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-codex-bordes-primary-variante2/30 dark:border-codex-bordes-terciario-variante4/30 rounded-2xl m-2 bg-muted/20">
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">No Attributes</div>
                                        <div className="text-[9px] text-muted-foreground/60 mt-1 italic">Start by adding one</div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {(attributesData[entity] || []).map(attr => (
                                            <div key={attr.id || attr.name} className="group/item flex items-center justify-between p-4 rounded-xl bg-white dark:bg-codex-fondo-secondary border border-codex-bordes-primary-variante2/20 dark:border-codex-bordes-terciario-variante4/20 hover:border-codex-primary/40 transition-all hover:shadow-sm">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-xs text-codex-texto-secondary dark:text-white truncate uppercase tracking-tight">{attr.label}</p>
                                                        {attr.is_required && <span className="text-[10px] text-red-500 font-bold" title="Required">●</span>}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        <span className="bg-codex-fondo-primary-variante1 dark:bg-codex-fondo-terciario-variante5 text-codex-primary dark:text-codex-texto-terciario-variante1 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">{attr.type}</span>
                                                        <span className="font-mono text-[9px] text-muted-foreground truncate opacity-70">#{attr.name}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleDelete(entity, attr.id)}
                                                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-all hover:scale-110 active:scale-90"
                                                        title="Delete Attribute"
                                                    >
                                                        <Trash size={15} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                <AttributeForm
                    entity={currentEntity}
                    onSubmit={handleCreate}
                    onCancel={() => setIsModalOpen(false)}
                    isLoading={formLoading}
                />
            </Modal>
        </div>
    );
};
