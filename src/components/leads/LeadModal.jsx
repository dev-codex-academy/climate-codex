import React, { useEffect, useState } from "react";
import { Modal } from "../Modal";
import { getLeadAttributes, getLeadClientAttributes, getLeadServiceAttributes, createLead, updateLead, uploadLeadImage } from "../../services/leadService";
import { getSales } from "../../services/salesService";
import { getClients } from "../../services/clientService";
import { useAuth } from "../../context/AuthContext";

// UI Components
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Switch } from "../ui/switch";

export const LeadModal = ({ isOpen, onClose, onLeadCreated, responsibleId, pipelineId, leadToEdit = null }) => {
    const [attributes, setAttributes] = useState([]);
    const [clientAttributes, setClientAttributes] = useState([]);
    const [serviceAttributes, setServiceAttributes] = useState([]);
    const [salesUsers, setSalesUsers] = useState([]);
    const [formData, setFormData] = useState({});
    const [clientInfoData, setClientInfoData] = useState({});
    const [serviceInfoList, setServiceInfoList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Standard static fields for a Lead
    const [name, setName] = useState("");
    const [selectedResponsible, setSelectedResponsible] = useState("");
    const [possibleClient, setPossibleClient] = useState("");
    const [moodleCourseId, setMoodleCourseId] = useState("");
    const [clients, setClients] = useState([]);

    // File upload state (Edit Mode Only)
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    // Task state (Edit Mode Only)
    const [tasks, setTasks] = useState([]);
    const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().split('T')[0]);
    const [newTaskDesc, setNewTaskDesc] = useState("");
    const [newTaskCompleted, setNewTaskCompleted] = useState(false);

    // Notes state (formerly Follow-ups)
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState("");
    const { user } = useAuth();

    useEffect(() => {
        if (isOpen) {
            fetchAttributes();
            fetchSalesUsers();
            fetchClients();
            setError(null);

            if (leadToEdit) {
                // Edit Mode
                setName(leadToEdit.name || "");
                // Handle responsible - check if it's an object (id/name) or just ID
                const respId = leadToEdit.responsible?.id || leadToEdit.responsible || "";
                setSelectedResponsible(String(respId));

                // Handle possible client
                const clientId = leadToEdit.possible_client?.id || leadToEdit.possible_client || "";
                setPossibleClient(String(clientId));

                // Handle Moodle Course ID
                setMoodleCourseId(leadToEdit.moodle_course_id || "");

                // Assuming attributes might be at root or in 'attributes' object
                // We will populate formData after fetching attributes to ensure we catch all fields
                setClientInfoData(leadToEdit.client_attributes || leadToEdit.client_info || {});
                setServiceInfoList(leadToEdit.service_attributes || leadToEdit.service_info || []);
                setImages(leadToEdit.list_of_images || []);
                setTasks(leadToEdit.list_of_tasks || []);
                setNotes(leadToEdit.list_of_notes || leadToEdit.list_of_follow_ups || []);
            } else {
                // Create Mode
                setName("");
                setSelectedResponsible(String(responsibleId || ""));
                setPossibleClient("");
                setMoodleCourseId("");
                setFormData({});
                setImages([]);
                setTasks([]);
                setNewTaskDate(new Date().toISOString().split('T')[0]);
                setNewTaskDesc("");
                setNewTaskCompleted(false);
                setClientInfoData({});
                setServiceInfoList([]);
                setNotes([]);
                setNewNote("");
            }
        }
    }, [isOpen, leadToEdit]);

    const fetchClients = async () => {
        try {
            const data = await getClients();
            setClients(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching clients", err);
        }
    };

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
            const [leadAttrs, clientAttrs, serviceAttrs] = await Promise.all([
                getLeadAttributes(),
                getLeadClientAttributes(),
                getLeadServiceAttributes()
            ]);

            // Helper to process options
            const processAttrs = (attrs) => attrs.map(attr => {
                let options = attr.options;
                if (!options && attr.list_values) {
                    options = typeof attr.list_values === 'string'
                        ? JSON.parse(attr.list_values)
                        : attr.list_values;
                }
                return { ...attr, options };
            });

            const processedLeadAttrs = processAttrs(leadAttrs);
            const processedClientAttrs = processAttrs(clientAttrs);
            const processedServiceAttrs = processAttrs(serviceAttrs);

            setAttributes(processedLeadAttrs);
            setClientAttributes(processedClientAttrs);
            setServiceAttributes(processedServiceAttrs);

            // Initialize form data based on attributes
            const initialData = {};
            const initialClientData = {};

            if (leadToEdit) {
                processedLeadAttrs.forEach(attr => {
                    let val = leadToEdit[attr.name] !== undefined ? leadToEdit[attr.name] : (leadToEdit.attributes?.[attr.name]);
                    if (val === undefined || val === null) {
                        val = attr.type === 'boolean' ? false : "";
                    }
                    initialData[attr.name] = val;
                });

                // client_info is usually a direct JSON object
                const clientInfoSource = leadToEdit.client_attributes || leadToEdit.client_info || {};
                processedClientAttrs.forEach(attr => {
                    let val = clientInfoSource[attr.name];
                    if (val === undefined || val === null) {
                        val = attr.type === 'boolean' ? false : "";
                    }
                    initialClientData[attr.name] = val;
                });
            } else {
                processedLeadAttrs.forEach(attr => {
                    initialData[attr.name] = attr.type === 'boolean' ? false : "";
                });
                processedClientAttrs.forEach(attr => {
                    initialClientData[attr.name] = attr.type === 'boolean' ? false : "";
                });
            }
            setFormData(initialData);
            // If we are editing, we might have setClientInfoData in useEffect, 
            // but we need to ensure all keys exist. 
            // If useEffect ran first, it set value from leadToEdit. 
            // Let's just merge or ensure defaults.
            setClientInfoData(prev => ({ ...initialClientData, ...prev }));

        } catch (err) {
            console.error("Error fetching attributes", err);
            setError("Failed to load attributes.");
        }
    };

    const handleAttributeChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleClientAttributeChange = (name, value) => {
        setClientInfoData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Service List Management
    const addService = () => {
        const newService = {};
        serviceAttributes.forEach(attr => {
            newService[attr.name] = "";
        });
        setServiceInfoList([...serviceInfoList, newService]);
    };

    const removeService = (index) => {
        setServiceInfoList(serviceInfoList.filter((_, i) => i !== index));
    };

    const handleServiceAttributeChange = (index, name, value) => {
        const updatedList = [...serviceInfoList];
        updatedList[index] = { ...updatedList[index], [name]: value };
        setServiceInfoList(updatedList);
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
            description: newTaskDesc, // Using description to map to 'task' field in backend usually, or we adapt payload
            // Doc says: "task": "Description of the task"
            task: newTaskDesc,
            completed: newTaskCompleted
        };
        // Backend expects 'task' key, frontend used 'description' before? 
        // Let's stick to 'task' for the object we save, but maybe display uses description?
        // Old code used 'description'. I'll support both or map it.
        // Doc: "list_of_tasks": [{ "task": "...", "date": "...", "completed": ... }]

        const updatedTasks = [...tasks, newTask];
        setTasks(updatedTasks);
        setNewTaskDesc("");
        setNewTaskCompleted(false);

        if (leadToEdit) {
            try {
                await updateLead(leadToEdit.id, { list_of_tasks: updatedTasks });
            } catch (err) {
                console.error("Error adding task", err);
                setError("Failed to save task immediately.");
            }
        }
    };

    const removeTask = async (index) => {
        const newTasks = tasks.filter((_, i) => i !== index);
        setTasks(newTasks);
        if (leadToEdit) {
            await updateLead(leadToEdit.id, { list_of_tasks: newTasks });
        }
    };

    const toggleTask = async (index) => {
        const newTasks = [...tasks];
        newTasks[index].completed = !newTasks[index].completed;
        setTasks(newTasks);
        if (leadToEdit) {
            await updateLead(leadToEdit.id, { list_of_tasks: newTasks });
        }
    };

    // --- Note Management ---
    const addNote = async () => {
        if (!newNote.trim()) return;

        const newEntry = {
            date: new Date().toISOString(),
            note: newNote,
            user_id: user?.id
        };

        const updatedNotes = [...notes, newEntry];
        setNotes(updatedNotes);
        setNewNote("");

        // Auto-save notes if editing
        if (leadToEdit) {
            try {
                await updateLead(leadToEdit.id, { list_of_notes: updatedNotes });
            } catch (err) {
                console.error("Error adding note", err);
                setError("Failed to save note immediately. It will be saved on form submit.");
            }
        }
    };


    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            // Helper to format values based on attribute type
            const formatAttributes = (data, attrs) => {
                const formatted = { ...data };
                attrs.forEach(attr => {
                    if (attr.type === 'number' && formatted[attr.name]) {
                        formatted[attr.name] = Number(formatted[attr.name]);
                    }
                });
                return formatted;
            };

            const formattedAttributes = formatAttributes(formData, attributes);
            const formattedClientAttributes = formatAttributes(clientInfoData, clientAttributes);
            const formattedServiceAttributes = serviceInfoList.map(service => formatAttributes(service, serviceAttributes));

            const payload = {
                name,
                attributes: formattedAttributes,
                client_attributes: formattedClientAttributes,
                service_attributes: formattedServiceAttributes,
                responsible: selectedResponsible, // Include responsible in payload
                possible_client: (possibleClient === "new_client" || !possibleClient) ? null : possibleClient,
                moodle_course_id: moodleCourseId || ""
            };

            console.log("LEAD PAYLOAD:", payload);

            // Only send static fields if creating, or if they changed. 
            // For now, we always send them.
            if (!leadToEdit) {
                payload.pipeline = pipelineId;
            } else {
                // On edit, include tasks and notes
                payload.list_of_tasks = tasks;
                payload.list_of_notes = notes;
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
            widthClass="sm:w-[1000px] max-w-[95vw]"
        >
            <div className="space-y-4 max-h-[80vh] overflow-y-auto p-1">
                {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                    {/* Possible Client Field */}
                    <div className="space-y-2">
                        <Label htmlFor="possible-client">Possible Client</Label>
                        <Select
                            value={possibleClient}
                            onValueChange={setPossibleClient}
                        >
                            <SelectTrigger id="possible-client" className="w-full">
                                <SelectValue placeholder="Select a client (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="new_client">+ New Client</SelectItem>
                                {clients.map(client => (
                                    <SelectItem key={client.id} value={String(client.id)}>
                                        {client.name}
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

                    {/* Moodle Course ID */}
                    <div className="space-y-2">
                        <Label htmlFor="moodle-id">Moodle Course ID</Label>
                        <Input
                            id="moodle-id"
                            placeholder="e.g. 123456"
                            value={moodleCourseId}
                            onChange={(e) => setMoodleCourseId(e.target.value)}
                        />
                    </div>
                </div>

                {/* Dynamic Attributes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            ) : attr.type === 'boolean' ? (
                                <div className="flex items-center space-x-2 h-10">
                                    <Switch
                                        id={attr.name}
                                        checked={!!formData[attr.name]}
                                        onCheckedChange={(checked) => handleAttributeChange(attr.name, checked)}
                                    />
                                    <Label htmlFor={attr.name} className="cursor-pointer font-normal text-muted-foreground">
                                        {formData[attr.name] ? 'Yes' : 'No'}
                                    </Label>
                                </div>
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

                {/* Client Info Section - Conditional: Only if 'new_client' is selected or no client is selected (default for new) */}
                {
                    clientAttributes.length > 0 && (!possibleClient || possibleClient === 'new_client') && (
                        <div className="border-t pt-4 space-y-4">
                            <h4 className="font-medium text-sm text-muted-foreground">Client Details</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {clientAttributes.map((attr) => (
                                    <div key={attr.name} className="space-y-2">
                                        <Label htmlFor={`client-${attr.name}`}>{attr.label}</Label>
                                        {attr.type === 'list' ? (
                                            <Select
                                                onValueChange={(val) => handleClientAttributeChange(attr.name, val)}
                                                value={clientInfoData[attr.name]}
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
                                        ) : attr.type === 'boolean' ? (
                                            <div className="flex items-center space-x-2 h-10">
                                                <Switch
                                                    id={`client-${attr.name}`}
                                                    checked={!!clientInfoData[attr.name]}
                                                    onCheckedChange={(checked) => handleClientAttributeChange(attr.name, checked)}
                                                />
                                                <Label htmlFor={`client-${attr.name}`} className="cursor-pointer font-normal text-muted-foreground">
                                                    {clientInfoData[attr.name] ? 'Yes' : 'No'}
                                                </Label>
                                            </div>
                                        ) : (
                                            <Input
                                                id={`client-${attr.name}`}
                                                type={attr.type === 'number' ? 'number' : attr.type === 'date' ? 'date' : 'text'}
                                                placeholder={attr.label}
                                                value={clientInfoData[attr.name] || ""}
                                                onChange={(e) => handleClientAttributeChange(attr.name, e.target.value)}
                                            />
                                        )}
                                    </div>
                                ))
                                }
                            </div >
                        </div >
                    )}

                {/* Service Info Section */}
                {
                    serviceAttributes.length > 0 && (
                        <div className="border-t pt-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm text-muted-foreground">Services of Interest</h4>
                                <Button size="sm" type="button" onClick={addService} variant="outline">
                                    + Add Service
                                </Button>
                            </div>

                            {serviceInfoList.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">No services added.</p>
                            ) : (
                                <div className="border rounded-md">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                {serviceAttributes.map((attr) => (
                                                    <TableHead key={attr.name}>{attr.label}</TableHead>
                                                ))}
                                                <TableHead className="w-[50px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {serviceInfoList.map((service, index) => (
                                                <TableRow key={index}>
                                                    {serviceAttributes.map((attr) => (
                                                        <TableCell key={`${index}-${attr.name}`} className="p-2">
                                                            {attr.type === 'list' ? (
                                                                <Select
                                                                    onValueChange={(val) => handleServiceAttributeChange(index, attr.name, val)}
                                                                    value={service[attr.name]}
                                                                >
                                                                    <SelectTrigger className="h-8 w-full min-w-[120px]">
                                                                        <SelectValue placeholder="Select" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {attr.options?.map((opt) => (
                                                                            <SelectItem key={opt.value || opt} value={opt.value || opt}>
                                                                                {opt.label || opt}
                                                                            </SelectItem>
                                                                        )) || <SelectItem value="no-options">No options</SelectItem>}
                                                                    </SelectContent>
                                                                </Select>
                                                            ) : (
                                                                <Input
                                                                    type={attr.type === 'number' ? 'number' : attr.type === 'date' ? 'date' : 'text'}
                                                                    value={service[attr.name] || ""}
                                                                    onChange={(e) => handleServiceAttributeChange(index, attr.name, e.target.value)}
                                                                    className="h-8 min-w-[100px]"
                                                                />
                                                            )}
                                                        </TableCell>
                                                    ))}
                                                    <TableCell className="p-2 text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                                            onClick={() => removeService(index)}
                                                        >
                                                            &times;
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    )
                }

                {/* --- EDIT MODE ONLY SECTIONS --- */}
                {
                    leadToEdit && (
                        <>
                            <div className="border-t pt-4 space-y-4">
                                <h4 className="font-medium text-sm text-muted-foreground">Tasks</h4>
                                <div className="bg-muted/30 p-3 rounded-md space-y-2">
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1">
                                            <Label className="text-xs">Task</Label>
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
                                                        <p className="text-sm font-medium">{task.task || task.description}</p>
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
                                <h4 className="font-medium text-sm text-muted-foreground">Notes</h4>

                                <div className="bg-muted/30 p-3 rounded-md space-y-2">
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1">
                                            <Label className="text-xs">Note</Label>
                                            <Textarea
                                                value={newNote}
                                                onChange={(e) => setNewNote(e.target.value)}
                                                placeholder="Add a new note..."
                                                className="h-20 min-h-[80px] text-sm"
                                            />
                                        </div>
                                        <Button size="sm" type="button" onClick={addNote} disabled={!newNote}>Add Note</Button>
                                    </div>
                                </div>

                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {notes.length === 0 ? (
                                        <p className="text-sm text-muted-foreground italic">No notes added.</p>
                                    ) : (
                                        notes.slice().reverse().map((item, idx) => (
                                            <div key={idx} className="p-3 bg-card border rounded-md space-y-1">
                                                <p className="text-sm">{item.note}</p>
                                                <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                                                    <span>{new Date(item.date).toLocaleString()}</span>
                                                    {item.user_id && <span>User ID: {item.user_id}</span>}
                                                </div>
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
                    )
                }

                <div className="flex justify-end pt-4 gap-2 border-t mt-4">
                    <Button variant="outline" onClick={onClose} disabled={loading || uploading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || uploading}>
                        {loading ? "Saving..." : leadToEdit ? "Save Changes" : "Create Opportunity"}
                    </Button>
                </div>
            </div >
        </Modal >
    );
};
