import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createClient, updateClient, uploadClientImage, getClientById, getClientAttributes } from "../services/clientService";
import { useAuth } from "../context/AuthContext";
import { getServices } from "../services/serviceService";
import { getContacts } from "../services/contactService";
import { getCohorts } from "../services/cohortService";

// UI Components
import { Input } from "../components/ui/input";
import { DateInput } from "../components/ui/date-input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Textarea } from "../components/ui/textarea";
import { ArrowLeft, Plus, Search, Mail, Phone, Star, GraduationCap } from "lucide-react";
import { Switch } from "../components/ui/switch";

// One row-card list for the Services and Contacts tabs: searchable, each row opens its own detail page.
const RelatedList = ({ title, empty, rows, search, onSearch, addLabel, onAdd }) => {
    const needle = search.trim().toLowerCase();
    const visible = needle ? rows.filter(r => r.haystack.some(v => String(v || "").toLowerCase().includes(needle))) : rows;
    return (
        <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                <p className="font-medium text-lg">{title} <span className="text-sm text-muted-foreground">({rows.length})</span></p>
                <div className="flex flex-wrap items-center gap-2">
                    {rows.length > 4 && (
                        <div style={{ position: "relative", width: 240 }}>
                            <Search className="h-4 w-4" style={{ position: "absolute", left: 10, top: 10, color: "var(--c-hint)" }} />
                            <input value={search} onChange={e => onSearch(e.target.value)} placeholder={`Search ${title.toLowerCase()}`} aria-label={`Search ${title.toLowerCase()}`}
                                style={{ width: "100%", height: 36, padding: "0 10px 0 32px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-card)", color: "var(--c-ink)", fontSize: 14 }} />
                        </div>
                    )}
                    <Button size="sm" onClick={onAdd}><Plus className="mr-1 h-4 w-4" /> {addLabel}</Button>
                </div>
            </div>
            {visible.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">{rows.length === 0 ? empty : "Nothing matches your search."}</p>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                    {visible.map(r => (
                        <article key={r.id} role="link" tabIndex={0} aria-label={`Open ${r.title}`} onClick={r.onOpen} onKeyDown={e => { if (e.key === "Enter") r.onOpen(); }}
                            style={{ cursor: "pointer", display: "grid", gap: 6, padding: 14, borderRadius: 12, background: "var(--c-surface-2)", border: "1px solid var(--c-border)" }}>
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                                <p style={{ margin: 0, fontWeight: 700, color: "var(--c-ink)", wordBreak: "break-word" }}>{r.title}</p>
                                {r.badge && (
                                    <span style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, textTransform: "uppercase", background: "var(--c-brand-pale)", color: "var(--c-brand)" }}>
                                        {r.badge === "primary" && <Star className="h-3 w-3" />}{r.badge}
                                    </span>
                                )}
                            </div>
                            {r.subtitle && <p style={{ margin: 0, fontSize: 13, color: "var(--c-muted)" }}>{r.subtitle}</p>}
                            {r.lines.filter(([, v]) => v).map(([Icon, v], i) => (
                                <p key={i} style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--c-muted)", minWidth: 0 }}>
                                    <Icon className="h-3.5 w-3.5" style={{ flexShrink: 0 }} />
                                    <span style={{ color: "var(--c-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</span>
                                </p>
                            ))}
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
};

export const ClientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isNew = id === 'new';

    const [attributes, setAttributes] = useState([]);
    const [name, setName] = useState("");
    const [dynamicData, setDynamicData] = useState({});

    // UI state
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!isNew);
    const [error, setError] = useState(null);

    // File upload state
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    // Sub-tabs (only for an existing client): its own data, services, contacts, tasks & notes.
    const [tab, setTab] = useState("details");
    const [clientServices, setClientServices] = useState([]);
    const [clientContacts, setClientContacts] = useState([]);
    const [cohortsById, setCohortsById] = useState({});
    const [relatedSearch, setRelatedSearch] = useState("");

    // Task & Note state
    const [tasks, setTasks] = useState([]);
    const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().split('T')[0]);
    const [newTaskDesc, setNewTaskDesc] = useState("");
    const [newTaskCompleted, setNewTaskCompleted] = useState(false);
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState("");

    useEffect(() => {
        const init = async () => {
            setFetching(true);
            try {
                await fetchAttributes();

                if (!isNew) {
                    await fetchClientData(id);
                    fetchRelated(id);
                } else {
                    setName("");
                    setDynamicData({});
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

    // The tab counts need both lists up front. A failure only leaves the tabs empty, the client still opens.
    const fetchRelated = async (clientId) => {
        try {
            const [services, contacts, cohorts] = await Promise.all([
                getServices({ client: clientId }),
                getContacts({ client: clientId }),
                getCohorts().catch(() => []),
            ]);
            setClientServices(services);
            setClientContacts(contacts);
            const list = Array.isArray(cohorts) ? cohorts : (cohorts.results || []);
            setCohortsById(Object.fromEntries(list.map(c => [String(c.id), c.name])));
        } catch (err) {
            console.error("Error fetching the client's services and contacts", err);
        }
    };

    const fetchAttributes = async () => {
        try {
            const data = await getClientAttributes();
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

            // Init default dynamic data
            const initialDynamic = {};
            processedData.forEach(attr => {
                initialDynamic[attr.name] = attr.type === 'boolean' ? false : "";
            });
            setDynamicData(initialDynamic);

        } catch (err) {
            console.error("Error fetching attributes", err);
            // Non-critical if attribute fetching fails, but good to know
        }
    };

    const fetchClientData = async (clientId) => {
        try {
            const data = await getClientById(clientId);
            populateForm(data);
        } catch (err) {
            console.error("Error fetching client", err);
            setError("Failed to load client details.");
        }
    };

    const populateForm = (data) => {
        setName(data.name || "");

        setDynamicData(prev => {
            const updated = { ...prev };
            // Flatten or use direct access
            // Assuming we have attributes list loaded to iterate keys, OR we iterate data keys
            // Ideally we iterate known attributes
            Object.keys(updated).forEach(key => {
                // Check root, then attributes object
                let val = data[key] !== undefined ? data[key] : (data.attributes?.[key]);
                if (val === undefined || val === null) {
                    // Check attribute type if available in attributes state
                    const attrDef = attributes.find(a => a.name === key);
                    val = (attrDef && attrDef.type === 'boolean') ? false : "";
                }
                updated[key] = val;
            });
            return updated;
        });

        setImages(data.list_of_images || []);
        setTasks(data.list_of_tasks || []);
        setNotes(data.list_of_notes || []);
    };

    const handleDynamicChange = (name, value) => {
        setDynamicData(prev => ({
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
            const res = await uploadClientImage(id, selectedFile);
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
                await updateClient(id, { list_of_tasks: updatedTasks });
            } catch (err) {
                console.error("Error saving task", err);
                setError("Tick.");
            }
        }
    };

    const removeTask = async (index) => {
        const newTasks = tasks.filter((_, i) => i !== index);
        setTasks(newTasks);
        if (!isNew) {
            await updateClient(id, { list_of_tasks: newTasks });
        }
    };

    const toggleTask = async (index) => {
        const newTasks = [...tasks];
        newTasks[index].completed = !newTasks[index].completed;
        setTasks(newTasks);
        if (!isNew) {
            await updateClient(id, { list_of_tasks: newTasks });
        }
    };

    // --- Note Management ---
    const addNote = async () => {
        if (!newNote.trim()) return;

        const newEntry = {
            date: new Date().toISOString(),
            note: newNote
            // user_id handled by backend
        };

        const updatedNotes = [...notes, newEntry];
        setNotes(updatedNotes);
        setNewNote("");

        if (!isNew) {
            try {
                await updateClient(id, { list_of_notes: updatedNotes });
            } catch (err) {
                console.error("Error saving note", err);
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

            const formattedAttributes = formatAttributes(dynamicData, attributes);

            const payload = {
                name,
                attributes: formattedAttributes
            };

            if (isNew) {
                if (tasks.length) payload.list_of_tasks = tasks;
                if (notes.length) payload.list_of_notes = notes;

                const newClient = await createClient(payload);
                if (selectedFile && newClient && newClient.id) {
                    await uploadClientImage(newClient.id, selectedFile);
                }
                navigate(-1);
            } else {
                payload.list_of_tasks = tasks;
                payload.list_of_notes = notes;
                await updateClient(id, payload);
                if (selectedFile) {
                    await uploadClientImage(id, selectedFile);
                }
                navigate(-1);
            }

        } catch (err) {
            console.error("Error saving client", err);
            setError(`Failed to save client. ${err.message || ""}`);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-10 flex justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <div className="sticky top-0 z-10 border-b px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-card shrink-0">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="min-w-0">
                        <h1 className="text-xl font-semibold truncate">
                            {isNew ? "New Client" : "Edit Client"}
                        </h1>
                        <p className="text-sm text-muted-foreground truncate">
                            {isNew ? "Add a new client" : `Managing details for ${name}`}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading || uploading}>
                        {loading ? "Saving..." : "Save Client"}
                    </Button>
                </div>
            </div>

            <div className="flex-1 p-6 max-w-6xl mx-auto w-full">
                {error && (
                    <div className="p-4 mb-6 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
                        {error}
                    </div>
                )}

                {!isNew && (
                    <div role="tablist" aria-label="Client sections" className="flex flex-wrap gap-2 mb-6">
                        {[
                            ["details", "Details"],
                            ["services", `Services (${clientServices.length})`],
                            ["contacts", `Contacts (${clientContacts.length})`],
                            ["tasks", `Tasks & Notes (${tasks.length + notes.length})`],
                        ].map(([key, label]) => (
                            <button key={key} type="button" role="tab" aria-selected={tab === key}
                                onClick={() => { setTab(key); setRelatedSearch(""); }}
                                style={{
                                    height: 36, padding: "0 16px", borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: "pointer",
                                    border: `1px solid ${tab === key ? "var(--c-brand)" : "var(--c-border)"}`,
                                    background: tab === key ? "var(--c-brand)" : "var(--c-card)",
                                    color: tab === key ? "var(--c-on-dark)" : "var(--c-muted)",
                                }}>
                                {label}
                            </button>
                        ))}
                    </div>
                )}

                <div className="space-y-6">
                    {(isNew || tab === "details") && (<>
                    {/* Main Info */}
                    <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Client Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Acme Corp"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Dynamic Attributes */}
                    {attributes.length > 0 && (
                        <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4">
                            <h3 className="font-medium text-lg border-b pb-2">Additional Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {attributes.map((attr) => (
                                    <div key={attr.name} className="space-y-2">
                                        <Label htmlFor={attr.name}>{attr.label}</Label>
                                        {attr.type === 'list' ? (
                                            <Select
                                                onValueChange={(val) => handleDynamicChange(attr.name, val)}
                                                value={dynamicData[attr.name] || ""}
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
                                        ) : attr.type === 'boolean' ? (
                                            <div className="flex items-center space-x-2 h-10">
                                                <Switch
                                                    id={attr.name}
                                                    checked={!!dynamicData[attr.name]}
                                                    onCheckedChange={(checked) => handleDynamicChange(attr.name, checked)}
                                                />
                                                <Label htmlFor={attr.name} className="cursor-pointer font-normal text-muted-foreground">
                                                    {dynamicData[attr.name] ? 'Yes' : 'No'}
                                                </Label>
                                            </div>
                                        ) : (
                                            <Input
                                                id={attr.name}
                                                type={attr.type === 'number' ? 'number' : 'text'}
                                                placeholder={attr.label}
                                                value={dynamicData[attr.name] || ""}
                                                onChange={(e) => handleDynamicChange(attr.name, e.target.value)}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    </>)}

                    {!isNew && tab === "services" && (
                        <RelatedList
                            title="Services" empty="This client has no services yet." search={relatedSearch} onSearch={setRelatedSearch}
                            addLabel="Add Service" onAdd={() => navigate("/service/new", { state: { clientId: id } })}
                            rows={clientServices.map(s => ({
                                id: s.id, title: s.name, onOpen: () => navigate(`/service/${s.id}`),
                                badge: s.status,
                                lines: [
                                    [Mail, s.linked_email], [Phone, s.linked_phone],
                                    [GraduationCap, cohortsById[String(s.actual_cohort)] || cohortsById[String(s.origin_cohort)]],
                                ],
                                haystack: [s.name, s.linked_email, s.linked_phone, cohortsById[String(s.actual_cohort)], cohortsById[String(s.origin_cohort)]],
                            }))}
                        />
                    )}

                    {!isNew && tab === "contacts" && (
                        <RelatedList
                            title="Contacts" empty="This client has no contacts yet." search={relatedSearch} onSearch={setRelatedSearch}
                            addLabel="Add Contact" onAdd={() => navigate("/contact/new", { state: { clientId: id } })}
                            rows={clientContacts.map(c => ({
                                id: c.id, title: `${c.first_name || ""} ${c.last_name || ""}`.trim() || "(no name)", onOpen: () => navigate(`/contact/${c.id}`),
                                badge: c.is_primary ? "primary" : "",
                                subtitle: c.job_title,
                                lines: [[Mail, c.email], [Phone, c.phone]],
                                haystack: [c.first_name, c.last_name, c.email, c.phone, c.job_title],
                            }))}
                        />
                    )}

                    {(isNew || tab === "tasks") && (
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
                                            <DateInput value={newTaskDate} onChange={(e) => setNewTaskDate(e.target.value)} />
                                        </div>
                                        <div className="w-1/2 flex items-center justify-end gap-2 pt-6">
                                            <Checkbox id="new-completed" checked={newTaskCompleted} onCheckedChange={setNewTaskCompleted} />
                                            <Label htmlFor="new-completed" className="text-sm">Done</Label>
                                            <Button size="sm" onClick={addTask} disabled={!newTaskDesc}>Add</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {tasks.length === 0 ? <p className="text-sm text-muted-foreground italic">No tasks.</p> : tasks.map((task, idx) => (
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
                                            <Button variant="ghost" size="sm" onClick={() => removeTask(idx)} className="h-6 w-6 p-0 text-red-500">&times;</Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4">
                            <h3 className="font-medium text-lg border-b pb-2">Notes</h3>
                            <div className="bg-muted/30 p-3 rounded-md space-y-2">
                                <div className="space-y-2">
                                    <Label className="text-xs">New Note</Label>
                                    <Textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add a note..." className="min-h-[80px]" />
                                    <div className="flex justify-end">
                                        <Button size="sm" onClick={addNote} disabled={!newNote}>Add Note</Button>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                {notes.length === 0 ? <p className="text-sm text-muted-foreground italic">No notes.</p> : notes.slice().reverse().map((item, idx) => (
                                    <div key={idx} className="p-3 bg-muted/20 border rounded-md space-y-1">
                                        <p className="text-sm whitespace-pre-wrap">{item.note}</p>
                                        <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                                            <span>{new Date(item.date).toLocaleString()}</span>
                                            {item.user_name && <span>{item.user_name}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    )}

                    {/* Files & Images */}
                    {!isNew && tab === "details" && (
                        <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4">
                            <h3 className="font-medium text-lg border-b pb-2">Files & Images</h3>
                            {images.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {images.map((imgUrl, idx) => (
                                        <div key={idx} className="relative aspect-square bg-gray-100 rounded-md overflow-hidden border">
                                            <img src={imgUrl} alt={`Uploaded ${idx}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-sm text-muted-foreground italic">No images.</p>}

                            <div className="flex items-end gap-4 max-w-md">
                                <div className="w-full space-y-2">
                                    <Label>Upload New Image</Label>
                                    <Input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} />
                                </div>
                                <Button type="button" onClick={handleUpload} disabled={!selectedFile || uploading} variant="secondary">
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
