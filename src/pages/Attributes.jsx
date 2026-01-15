import React, { useEffect, useState } from 'react';
import { getAttributes, createAttribute, deleteAttribute } from '../services/attributeService';
import { AttributeForm } from '../components/attributes/AttributeForm';
import { Button } from '../components/ui/button';
import { Plus, Trash, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';

// Simple Modal Component
const Modal = ({ isOpen, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-background border border-border rounded-lg shadow-lg p-6 w-full max-w-md">
                {children}
            </div>
        </div>
    );
};

export const Attributes = () => {
    const [entities] = useState(['client', 'lead', 'service']);
    const [attributesData, setAttributesData] = useState({ client: [], lead: [], service: [] });
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
            const newData = {
                client: results[0].results || results[0] || [],
                lead: results[1].results || results[1] || [],
                service: results[2].results || results[2] || [],
            };
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
        <div className="p-4 md:p-8 space-y-8">
            <h1 className="text-3xl font-bold text-foreground">Core Attributes Management</h1>
            <p className="text-muted-foreground">Define custom fields for your core entities.</p>

            {/* Horizontal Scroll Container */}
            <div className="relative group/board">
                {/* Scroll Button Left */}
                <button
                    onClick={() => document.getElementById('attr-scroll-container').scrollBy({ left: -300, behavior: 'smooth' })}
                    className="absolute left-0 top-1/2 z-20 p-2 bg-background/80 hover:bg-background shadow-md border border-border rounded-full opacity-0 group-hover/board:opacity-100 transition-opacity -translate-x-1/2 hidden md:block"
                >
                    <ChevronLeft size={24} />
                </button>

                {/* Scroll Button Right */}
                <button
                    onClick={() => document.getElementById('attr-scroll-container').scrollBy({ left: 300, behavior: 'smooth' })}
                    className="absolute right-0 top-1/2 z-20 p-2 bg-background/80 hover:bg-background shadow-md border border-border rounded-full opacity-0 group-hover/board:opacity-100 transition-opacity translate-x-1/2 hidden md:block"
                >
                    <ChevronRight size={24} />
                </button>

                <div
                    id="attr-scroll-container"
                    className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
                >
                    {entities.map(entity => (
                        <div key={entity} className="flex-shrink-0 w-[85vw] md:w-[400px] bg-card text-card-foreground rounded-xl border border-border shadow-sm flex flex-col h-full bg-codex-cards-cuaternario dark:bg-codex-cards-secondary snap-center">
                            <div className="p-6 pb-2 flex justify-between items-center border-b border-border/50">
                                <h2 className="text-xl font-semibold capitalize">{entity === 'service' ? 'Student (Service)' : entity}</h2>
                                <Button size="sm" onClick={() => handleAddClick(entity)}>
                                    <Plus size={16} className="mr-1" /> Add
                                </Button>
                            </div>

                            <div className="p-6 flex-1 overflow-y-auto max-h-[500px]">
                                {attributesData[entity] && attributesData[entity].length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic">No custom attributes defined.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {(attributesData[entity] || []).map(attr => (
                                            <div key={attr.id || attr.name} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                                                <div>
                                                    <p className="font-medium text-sm">{attr.label}</p>
                                                    <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                                                        <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase text-[10px]">{attr.type}</span>
                                                        <span className="font-mono">{attr.name}</span>
                                                        {attr.is_required && <span className="text-red-500 font-bold">*</span>}
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    {/* Edit not implemented in requirements fully but usually desirable */}

                                                    <button
                                                        onClick={() => handleDelete(entity, attr.id)}
                                                        className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash size={16} />
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

            <Modal isOpen={isModalOpen}>
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
