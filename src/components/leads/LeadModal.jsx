import React, { useEffect, useState } from "react";
import { Modal } from "../Modal";
import { getLeadAttributes, createLead, updateLead, uploadLeadImage } from "../../services/leadService";
import { getSales } from "../../services/salesService";

// UI Components
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";

export const LeadModal = ({ isOpen, onClose, onLeadCreated, responsibleId, pipelineId, leadToEdit = null }) => {
    const [attributes, setAttributes] = useState([]);
    const [salesUsers, setSalesUsers] = useState([]);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Standard static fields for a Lead
    const [name, setName] = useState("");
    const [selectedResponsible, setSelectedResponsible] = useState("");

    // File upload state (Edit Mode Only)
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    // Task state (Edit Mode Only)
    const [tasks, setTasks] = useState([]);
    const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().split('T')[0]);
    const [newTaskDesc, setNewTaskDesc] = useState("");
    const [newTaskCompleted, setNewTaskCompleted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchAttributes();
            fetchSalesUsers();
            setError(null);

            if (leadToEdit) {
                // Edit Mode
                setName(leadToEdit.name || "");
                // Handle responsible - check if it's an object (id/name) or just ID
                const respId = leadToEdit.responsible?.id || leadToEdit.responsible || "";
                setSelectedResponsible(String(respId));

                // Assuming attributes might be at root or in 'attributes' object
                // We will populate formData after fetching attributes to ensure we catch all fields
                setImages(leadToEdit.list_of_images || []);
                setTasks(leadToEdit.list_of_tasks || []);
            } else {
                // Create Mode
                setName("");
                setSelectedResponsible(String(responsibleId || ""));
                setFormData({});
                setImages([]);
                setTasks([]);
                setNewTaskDesc("");
                setNewTaskCompleted(false);
            }
        }
    }, [isOpen, leadToEdit]);

    const fetchSalesUsers = async () => {
        try {
            const data = await getSales();
            setSalesUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching sales users", err);
            // Don't block modal, just log error
        }
    };

    const fetchAttributes = async () => {
        try {
            const data = await getLeadAttributes();

            // Map list_values to options if options is missing
            const processedData = data.map(attr => {
                let options = attr.options;
                if (!options && attr.list_values) {
                    options = typeof attr.list_values === 'string'
                        ? JSON.parse(attr.list_values)
                        : attr.list_values;
                }
                return { ...attr, options };
            });

            setAttributes(processedData);

            // Initialize form data based on attributes
            const initialData = {};

            if (leadToEdit) {
                data.forEach(attr => {
                    const val = leadToEdit[attr.name] !== undefined ? leadToEdit[attr.name] : (leadToEdit.attributes?.[attr.name] || "");
                    initialData[attr.name] = val;
                });
            } else {
                data.forEach(attr => {
                    initialData[attr.name] = "";
                });
            }
            setFormData(initialData);
        } catch (err) {
            console.error("Error fetching attributes", err);
            setError("Failed to load lead attributes.");
        }
    };

    const handleAttributeChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // --- File Management ---
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !leadToEdit) return;
        setUploading(true);
        try {
            const res = await uploadLeadImage(leadToEdit.id, selectedFile);
            setImages(res.list_of_images || []);
            setSelectedFile(null);
            const fileInput = document.getElementById("file-upload");
            if (fileInput) fileInput.value = "";
            if (onLeadCreated) onLeadCreated(); // Refresh parent to show updated data if needed
        } catch (err) {
            setError(`Failed to upload image. ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    // --- Task Management ---
    const addTask = async () => {
        if (!newTaskDesc.trim()) return;
        const newTask = {
            date: newTaskDate,
            description: newTaskDesc,
            completed: newTaskCompleted
        };
        const updatedTasks = [...tasks, newTask];
        setTasks(updatedTasks);
        setNewTaskDesc("");
        setNewTaskCompleted(false);

        // Auto-save tasks if editing
        if (leadToEdit) {
            try {
                await updateLead(leadToEdit.id, { list_of_tasks: updatedTasks });
            } catch (err) {
                console.error("Error adding task", err);
                setError("Failed to save task immediately. It will be saved on form submit.");
            }
        }
    };

    const removeTask = async (index) => {
        const newTasks = tasks.filter((_, i) => i !== index);
        setTasks(newTasks);

        if (leadToEdit) {
            try {
                await updateLead(leadToEdit.id, { list_of_tasks: newTasks });
            } catch (err) {
                console.error("Error removing task", err);
                setError("Failed to remove task immediately.");
            }
        }
    };

    const toggleTask = async (index) => {
        const newTasks = [...tasks];
        newTasks[index].completed = !newTasks[index].completed;
        setTasks(newTasks);

        if (leadToEdit) {
            try {
                await updateLead(leadToEdit.id, { list_of_tasks: newTasks });
            } catch (err) {
                console.error("Error toggling task", err);
                setError("Failed to update task state immediately.");
            }
        }
    };


    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const payload = {
                name,
                attributes: formData,
                responsible: selectedResponsible // Include responsible in payload
            };

            // Only send static fields if creating, or if they changed. 
            // For now, we always send them.
            if (!leadToEdit) {
                payload.pipeline = pipelineId;
            } else {
                // On edit, include tasks
                payload.list_of_tasks = tasks;
            }

            if (leadToEdit) {
                await updateLead(leadToEdit.id, payload);

                // Handle pending file upload if any
                if (selectedFile) {
                    await uploadLeadImage(leadToEdit.id, selectedFile);
                }
            } else {
                const newLead = await createLead(payload);
                // Handle pending file upload if any for new lead
                if (selectedFile && newLead && newLead.id) {
                    await uploadLeadImage(newLead.id, selectedFile);
                }
            }

            if (onLeadCreated) onLeadCreated();
            onClose();
        } catch (err) {
            console.error("Error saving lead", err);
            setError(`Failed to save opportunity. ${err.message || ""}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={leadToEdit ? "Edit Opportunity" : "New Opportunity"}
            showFooter={false}
            widthClass="sm:w-[700px]"
        >
            <div className="space-y-4 max-h-[80vh] overflow-y-auto p-1">
                {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                        {error}
                    </div>
                )}

                {/* Responsible Field */}
                <div className="space-y-2">
                    <Label htmlFor="responsible">Responsible</Label>
                    <Select
                        value={selectedResponsible}
                        onValueChange={setSelectedResponsible}
                    >
                        <SelectTrigger id="responsible">
                            <SelectValue placeholder="Select a responsible person" />
                        </SelectTrigger>
                        <SelectContent>
                            {salesUsers.map(user => (
                                <SelectItem key={user.id} value={String(user.id)}>
                                    {user.first_name} {user.last_name} ({user.username})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Static Name Field */}
                <div className="space-y-2">
                    <Label htmlFor="lead-name">Opportunity Name</Label>
                    <Input
                        id="lead-name"
                        placeholder="e.g. Acme Corp Deal"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                {/* Dynamic Attributes */}
                {attributes.map((attr) => (
                    <div key={attr.name} className="space-y-2">
                        <Label htmlFor={attr.name}>{attr.label}</Label>

                        {attr.type === 'list' ? (
                            <Select
                                onValueChange={(val) => handleAttributeChange(attr.name, val)}
                                value={formData[attr.name]}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={`Select ${attr.label}`} />
                                </SelectTrigger>
                                <SelectContent>
                                    {attr.options?.map((opt) => (
                                        <SelectItem key={opt.value || opt} value={opt.value || opt}>
                                            {opt.label || opt}
                                        </SelectItem>
                                    )) || <SelectItem value="no-options">No options available</SelectItem>}
                                </SelectContent>
                            </Select>
                        ) : (
                            <Input
                                id={attr.name}
                                type={attr.type === 'number' ? 'number' : attr.type === 'date' ? 'date' : 'text'}
                                placeholder={attr.label}
                                value={formData[attr.name] || ""}
                                onChange={(e) => handleAttributeChange(attr.name, e.target.value)}
                            />
                        )}
                    </div>
                ))}

                {/* --- EDIT MODE ONLY SECTIONS --- */}
                {leadToEdit && (
                    <>
                        <div className="border-t pt-4 space-y-4">
                            <h4 className="font-medium text-sm text-muted-foreground">Tasks</h4>

                            <div className="bg-muted/30 p-3 rounded-md space-y-2">
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <Label className="text-xs">Description</Label>
                                        <Input
                                            value={newTaskDesc}
                                            onChange={(e) => setNewTaskDesc(e.target.value)}
                                            placeholder="Task description..."
                                            className="h-8"
                                        />
                                    </div>
                                    <div className="w-32">
                                        <Label className="text-xs">Date</Label>
                                        <Input
                                            type="date"
                                            value={newTaskDate}
                                            onChange={(e) => setNewTaskDate(e.target.value)}
                                            className="h-8"
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2 pb-2">
                                        <Checkbox
                                            id="new-completed"
                                            checked={newTaskCompleted}
                                            onCheckedChange={setNewTaskCompleted}
                                        />
                                        <label htmlFor="new-completed" className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Done
                                        </label>
                                    </div>
                                    <Button size="sm" type="button" onClick={addTask} disabled={!newTaskDesc}>Add</Button>
                                </div>
                            </div>

                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {tasks.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic">No tasks added.</p>
                                ) : (
                                    tasks.map((task, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 bg-card border rounded-md">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={task.completed}
                                                    onCheckedChange={() => toggleTask(idx)}
                                                />
                                                <div className={task.completed ? "line-through text-muted-foreground" : ""}>
                                                    <p className="text-sm font-medium">{task.description}</p>
                                                    <p className="text-xs text-muted-foreground">{task.date}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" type="button" onClick={() => removeTask(idx)} className="h-6 w-6 p-0 text-red-500">
                                                &times;
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="border-t pt-4 space-y-4">
                            <h4 className="font-medium text-sm text-muted-foreground">Files & Images</h4>

                            {images.length > 0 ? (
                                <div className="grid grid-cols-4 gap-2">
                                    {images.map((imgUrl, idx) => (
                                        <div key={idx} className="relative aspect-square bg-gray-100 rounded-md overflow-hidden border group">
                                            <img src={imgUrl} alt={`Uploaded ${idx}`} className="w-full h-full object-cover" />
                                            <a href={imgUrl} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs">
                                                View
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">No images uploaded yet.</p>
                            )}

                            <div className="flex gap-2 items-end">
                                <div className="w-full space-y-2">
                                    <Label htmlFor="file-upload">Upload New Image</Label>
                                    <Input
                                        id="file-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <Button
                                    type="button"
                                    onClick={handleUpload}
                                    disabled={!selectedFile || uploading}
                                    variant="secondary"
                                >
                                    {uploading ? "..." : "Upload"}
                                </Button>
                            </div>
                        </div>
                    </>
                )}

                <div className="flex justify-end pt-4 gap-2 border-t mt-4">
                    <Button variant="outline" onClick={onClose} disabled={loading || uploading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || uploading}>
                        {loading ? "Saving..." : leadToEdit ? "Save Changes" : "Create Opportunity"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
