import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getLeadAttributes, createLead, updateLead, uploadLeadImage, getLead } from "../services/leadService";
import { getSales } from "../services/salesService";
import { useAuth } from "../context/AuthContext";

// UI Components
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Textarea } from "../components/ui/textarea";
import { ArrowLeft } from "lucide-react";

export const LeadDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const isNew = id === "new";
    // Check if we passed state via navigation (e.g. pipelineId for new lead)
    const pipelineId = location.state?.pipelineId;

    const [attributes, setAttributes] = useState([]);
    const [salesUsers, setSalesUsers] = useState([]);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!isNew);
    const [error, setError] = useState(null);

    // Standard static fields for a Lead
    const [name, setName] = useState("");
    const [selectedResponsible, setSelectedResponsible] = useState("");

    // File upload state
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    // Task state
    const [tasks, setTasks] = useState([]);
    const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().split('T')[0]);
    const [newTaskDesc, setNewTaskDesc] = useState("");
    const [newTaskCompleted, setNewTaskCompleted] = useState(false);

    // Notes state
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState("");

    useEffect(() => {
        const init = async () => {
            setFetching(true);
            try {
                await Promise.all([fetchAttributes(), fetchSalesUsers()]);

                if (!isNew) {
                    await fetchLeadData(id);
                } else {
                    // Initialize new lead defaults
                    setName("");
                    if (user?.id) setSelectedResponsible(String(user.id));
                }
            } catch (err) {
                console.error("Initialization error", err);
                setError("Failed to load page data.");
            } finally {
                setFetching(false);
            }
        };
        init();
    }, [id, isNew]);

    const fetchLeadData = async (leadId) => {
        try {
            const data = await getLead(leadId);
            populateForm(data);
        } catch (err) {
            console.error("Error fetching lead", err);
            setError("Failed to load lead details.");
        }
    };

    const populateForm = (leadData) => {
        setName(leadData.name || "");

        // Handle responsible
        const respId = leadData.responsible?.id || leadData.responsible || "";
        setSelectedResponsible(String(respId));

        // Populate dynamic attributes
        // formData state is initialized in fetchAttributes, but we update it here
        setFormData(prev => {
            const updated = { ...prev };
            // We need attributes loaded to know keys, but generally keys match attribute names
            // If attributes aren't loaded yet, this might be partial. 
            // In init(), we await fetchAttributes() first, providing the structure.

            // Map leadData values to formData
            if (leadData.attributes) {
                Object.keys(leadData.attributes).forEach(key => {
                    updated[key] = leadData.attributes[key];
                });
            }
            // Also check root level for attribute keys if needed, dependent on backend response structure
            return updated;
        });

        setImages(leadData.list_of_images || []);
        setTasks(leadData.list_of_tasks || []);
        setNotes(leadData.list_of_notes || leadData.list_of_follow_ups || []);
    };

    const fetchSalesUsers = async () => {
        try {
            const data = await getSales();
            setSalesUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching sales users", err);
        }
    };

    const fetchAttributes = async () => {
        try {
            const data = await getLeadAttributes();

            // Process options
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

            // Initialize form data keys
            const initialData = {};
            processedData.forEach(attr => {
                initialData[attr.name] = "";
            });
            setFormData(initialData);
        } catch (err) {
            console.error("Error fetching attributes", err);
            setError("Failed to load form attributes.");
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
        if (!selectedFile || isNew) return;
        setUploading(true);
        try {
            const res = await uploadLeadImage(id, selectedFile);
            setImages(res.list_of_images || []);
            setSelectedFile(null);
            const fileInput = document.getElementById("file-upload");
            if (fileInput) fileInput.value = "";
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
            task: newTaskDesc,
            completed: newTaskCompleted
        };

        const updatedTasks = [...tasks, newTask];
        setTasks(updatedTasks);
        setNewTaskDesc("");
        setNewTaskCompleted(false);

        if (!isNew) {
            try {
                await updateLead(id, { list_of_tasks: updatedTasks });
            } catch (err) {
                console.error("Error adding task", err);
                setError("Failed to save task immediately.");
            }
        }
    };

    const removeTask = async (index) => {
        const newTasks = tasks.filter((_, i) => i !== index);
        setTasks(newTasks);
        if (!isNew) {
            await updateLead(id, { list_of_tasks: newTasks });
        }
    };

    const toggleTask = async (index) => {
        const newTasks = [...tasks];
        newTasks[index].completed = !newTasks[index].completed;
        setTasks(newTasks);
        if (!isNew) {
            await updateLead(id, { list_of_tasks: newTasks });
        }
    };

    // --- Note Management ---
    const addNote = async () => {
        if (!newNote.trim()) return;

        const newEntry = {
            date: new Date().toISOString(),
            note: newNote,
            // user_id and user_name are handled by backend
        };

        const updatedNotes = [...notes, newEntry];
        setNotes(updatedNotes);
        setNewNote("");

        if (!isNew) {
            try {
                await updateLead(id, { list_of_notes: updatedNotes });
            } catch (err) {
                console.error("Error adding note", err);
                setError("Failed to save note immediately.");
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
                responsible: selectedResponsible
            };

            if (isNew) {
                payload.pipeline = pipelineId;
                // Include initial tasks/notes for creation if needed, typically backend handles empty lists
                // But generally users add tasks/notes AFTER getting an ID.
                // If we want to support adding them during creation, we pass them in payload:
                if (tasks.length) payload.list_of_tasks = tasks;
                if (notes.length) payload.list_of_notes = notes;

                const newLead = await createLead(payload);
                if (selectedFile && newLead && newLead.id) {
                    await uploadLeadImage(newLead.id, selectedFile);
                }
                navigate(-1); // Go back
            } else {
                payload.list_of_tasks = tasks;
                payload.list_of_notes = notes;
                await updateLead(id, payload);
                if (selectedFile) {
                    await uploadLeadImage(id, selectedFile);
                }
                navigate(-1); // Go back
            }
        } catch (err) {
            console.error("Error saving lead", err);
            setError(`Failed to save opportunity. ${err.message || ""}`);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="p-10 flex justify-center">Loading...</div>;
    }

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="border-b px-6 py-4 flex items-center justify-between bg-card">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-semibold">
                            {isNew ? "New Opportunity" : "Edit Opportunity"}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {isNew ? "Create a new sales opportunity" : `Managing details for ${name}`}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading || uploading}>
                        {loading ? "Saving..." : "Save Opportunity"}
                    </Button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full">
                {error && (
                    <div className="p-4 mb-6 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Main Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card p-6 rounded-lg border shadow-sm">
                        {/* Responsible Field */}
                        <div className="space-y-2">
                            <Label htmlFor="responsible">Responsible</Label>
                            <Select
                                value={selectedResponsible}
                                onValueChange={setSelectedResponsible}
                            >
                                <SelectTrigger id="responsible" className="w-full">
                                    <SelectValue placeholder="Select a responsible person" />
                                </SelectTrigger>
                                <SelectContent>
                                    {salesUsers.map(user => (
                                        <SelectItem key={user.id} value={String(user.id)}>
                                            {user.name}
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
                    </div>

                    {/* Dynamic Attributes */}
                    <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4">
                        <h3 className="font-medium text-lg border-b pb-2">Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {attributes.map((attr) => (
                                <div key={attr.name} className="space-y-2">
                                    <Label htmlFor={attr.name}>{attr.label}</Label>
                                    {attr.type === 'list' ? (
                                        <Select
                                            onValueChange={(val) => handleAttributeChange(attr.name, val)}
                                            value={formData[attr.name]}
                                        >
                                            <SelectTrigger className="w-full">
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
                        </div>
                    </div>

                    {/* Tasks & Notes Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Tasks */}
                        <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4">
                            <h3 className="font-medium text-lg border-b pb-2">Tasks</h3>
                            <div className="bg-muted/30 p-3 rounded-md space-y-2">
                                <div className="flex flex-col gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Description</Label>
                                        <Input
                                            value={newTaskDesc}
                                            onChange={(e) => setNewTaskDesc(e.target.value)}
                                            placeholder="Task description..."
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-1/2 space-y-1">
                                            <Label className="text-xs">Date</Label>
                                            <Input
                                                type="date"
                                                value={newTaskDate}
                                                onChange={(e) => setNewTaskDate(e.target.value)}
                                            />
                                        </div>
                                        <div className="w-full flex items-center justify-end gap-2 pt-6">
                                            <Checkbox
                                                id="new-completed"
                                                checked={newTaskCompleted}
                                                onCheckedChange={setNewTaskCompleted}
                                            />
                                            <Label htmlFor="new-completed" className="text-sm">Done</Label>
                                            <Button size="sm" onClick={addTask} disabled={!newTaskDesc}>Add</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {tasks.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic">No tasks added.</p>
                                ) : (
                                    tasks.map((task, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-muted/20 border rounded-md">
                                            <div className="flex items-center gap-3">
                                                <Checkbox
                                                    checked={task.completed}
                                                    onCheckedChange={() => toggleTask(idx)}
                                                    disabled={task.user_id && user?.id && String(task.user_id) !== String(user.id)}
                                                />
                                                <div className={task.completed ? "line-through text-muted-foreground" : ""}>
                                                    <p className="text-sm font-medium">{task.task || task.description}</p>
                                                    <div className="flex gap-2 text-xs text-muted-foreground">
                                                        <span>{task.date}</span>
                                                        {task.user_name && <span>• {task.user_name}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            {(!task.user_id || !user?.id || String(task.user_id) === String(user.id)) && (
                                                <Button variant="ghost" size="sm" onClick={() => removeTask(idx)} className="h-6 w-6 p-0 text-red-500 hover:text-red-700">
                                                    &times;
                                                </Button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4">
                            <h3 className="font-medium text-lg border-b pb-2">Notes</h3>
                            <div className="bg-muted/30 p-3 rounded-md space-y-2">
                                <div className="space-y-2">
                                    <Label className="text-xs">New Note</Label>
                                    <Textarea
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        placeholder="Add a note..."
                                        className="min-h-[80px]"
                                    />
                                    <div className="flex justify-end">
                                        <Button size="sm" onClick={addNote} disabled={!newNote}>Add Note</Button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                {notes.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic">No notes added.</p>
                                ) : (
                                    notes.slice().reverse().map((item, idx) => (
                                        <div key={idx} className="p-3 bg-muted/20 border rounded-md space-y-1">
                                            <p className="text-sm whitespace-pre-wrap">{item.note}</p>
                                            <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                                                <span>{new Date(item.date).toLocaleString()}</span>
                                                {item.user_name && <span>{item.user_name}</span>}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Files Section */}
                    {!isNew && (
                        <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4">
                            <h3 className="font-medium text-lg border-b pb-2">Files & Images</h3>

                            {images.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {images.map((imgUrl, idx) => (
                                        <div key={idx} className="relative aspect-square bg-gray-100 rounded-md overflow-hidden border group">
                                            <img src={imgUrl} alt={`Uploaded ${idx}`} className="w-full h-full object-cover" />
                                            <a href={imgUrl} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                                                View
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">No images uploaded yet.</p>
                            )}

                            <div className="flex items-end gap-4 max-w-md">
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
                    )}
                </div>
            </div>
        </div>
    );
};
