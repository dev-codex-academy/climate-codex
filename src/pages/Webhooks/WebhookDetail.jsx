import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Play, Trash2, Info, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getWebhook, createWebhook, updateWebhook, deleteWebhook } from "@/services/webhookService";
import { getAttributes } from "@/services/attributeService";
import Swal from 'sweetalert2';

export const WebhookDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === "new";
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        model: "Lead",
        url: "",
        method: "POST",
        headers: "{}",
        is_active: true,
        conditions: [],
        condition_logic: "AND"
    });

    const [availableAttributes, setAvailableAttributes] = useState([]);

    useEffect(() => {
        const fetchAttributes = async () => {
            if (!formData.model) return;
            try {
                // Map model name to entity name expected by API (lowercase)
                const entityMap = {
                    'Lead': 'lead',
                    'Client': 'client',
                    'Service': 'service',
                    'FollowUp': 'followup'
                };
                const entity = entityMap[formData.model];
                if (entity) {
                    const attrs = await getAttributes(entity);
                    // The API returns attributes used in forms. We can also include standard fields if needed, 
                    // but for now let's assume valid conditional fields come from here + standard ones.
                    // Let's add standard fields manually since getAttributes might only return custom ones.
                    const standardFields = {
                        'Lead': ['name', 'stage', 'source'],
                        'Client': ['name'],
                        'Service': ['name'],
                        'FollowUp': ['follow_up_date', 'comment']
                    };

                    const attrOptions = (attrs || []).map(a => `attributes.${a.name}`);
                    const stdOptions = standardFields[formData.model] || [];

                    setAvailableAttributes([...stdOptions, ...attrOptions]);
                }
            } catch (error) {
                console.error("Failed to fetch attributes", error);
            }
        };
        fetchAttributes();
    }, [formData.model]);

    useEffect(() => {
        if (!isNew) {
            loadWebhook();
        }
    }, [id]);

    const loadWebhook = async () => {
        try {
            const data = await getWebhook(id);
            setFormData({
                ...data,
                headers: JSON.stringify(data.headers, null, 2),
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load webhook details',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            navigate("/webhook");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddCondition = () => {
        setFormData(prev => ({
            ...prev,
            conditions: [...(prev.conditions || []), { field: '', operator: '=', value: '' }]
        }));
    };

    const handleRemoveCondition = (index) => {
        setFormData(prev => ({
            ...prev,
            conditions: prev.conditions.filter((_, i) => i !== index)
        }));
    };

    const handleConditionChange = (index, field, value) => {
        setFormData(prev => {
            const newConditions = [...prev.conditions];
            newConditions[index] = { ...newConditions[index], [field]: value };
            return { ...prev, conditions: newConditions };
        });
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // Validate JSON headers
            let parsedHeaders = {};
            try {
                parsedHeaders = JSON.parse(formData.headers);
            } catch (e) {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid JSON',
                    text: 'Please check your Headers JSON',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });
                setSaving(false);
                return;
            }

            const payload = {
                ...formData,
                headers: parsedHeaders,
            };

            if (isNew) {
                await createWebhook(payload);
                Swal.fire({
                    icon: 'success',
                    title: 'Created!',
                    text: 'Webhook created successfully',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });
            } else {
                await updateWebhook(id, payload);
                Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: 'Webhook updated successfully',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });
            }
            navigate("/webhook");
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to save webhook',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (!result.isConfirmed) return;

        try {
            await deleteWebhook(id);
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Webhook has been deleted',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            navigate("/webhook");
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to delete webhook',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/webhook")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {isNew ? "New Webhook" : "Edit Webhook"}
                        </h1>
                        <p className="text-muted-foreground mr-2">
                            Configure how your webhook requests are sent.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {!isNew && (
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    )}
                    <Button onClick={handleSave} disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "Saving..." : "Save Webhook"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* General Settings */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Trigger Settings</CardTitle>
                            <CardDescription>When should this webhook fire?</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Friendly Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. New Lead Notification"
                                    value={formData.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Data Model</Label>
                                <Select
                                    value={formData.model}
                                    onValueChange={(val) => handleChange("model", val)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Lead">Lead</SelectItem>
                                        <SelectItem value="Client">Client</SelectItem>
                                        <SelectItem value="Service">Service</SelectItem>
                                        <SelectItem value="FollowUp">FollowUp</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox
                                    id="active"
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => handleChange("is_active", checked)}
                                />
                                <Label htmlFor="active" className="cursor-pointer">
                                    Enable this webhook
                                </Label>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Request Configuration (REST Client Style) */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-t-4 border-t-blue-500">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-md">
                                    <Play className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                                </div>
                                Request Configuration
                            </CardTitle>
                            <CardDescription>
                                Configure the HTTP request that will be sent to your endpoint.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Template Substitution Hint */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-3 rounded-md text-sm flex gap-2 items-start">
                                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <div>
                                    <span className="font-semibold block mb-1">Template Substitution</span>
                                    You can use <code>{`{field_name}`}</code> placeholders in <b>URL</b> and <b>Headers</b>.
                                    <div className="mt-1 text-xs opacity-90">
                                        Example: <code>https://api.com/hooks/{`{id}`}</code> or Header: <code>X-Entity-ID: {`{id}`}</code>
                                    </div>
                                </div>
                            </div>

                            {/* URL Bar */}
                            <div className="flex gap-2">
                                <div className="w-32 flex-shrink-0">
                                    <Select
                                        value={formData.method}
                                        onValueChange={(val) => handleChange("method", val)}
                                    >
                                        <SelectTrigger className="font-mono font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="POST">POST</SelectItem>
                                            <SelectItem value="PUT">PUT</SelectItem>
                                            <SelectItem value="PATCH">PATCH</SelectItem>
                                            <SelectItem value="DELETE">DELETE</SelectItem>
                                            <SelectItem value="GET">GET</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Input
                                    className="font-mono"
                                    placeholder="https://api.example.com/webhook-receiver"
                                    value={formData.url}
                                    onChange={(e) => handleChange("url", e.target.value)}
                                />
                            </div>

                            {/* Headers Editor */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Headers (JSON)
                                    </Label>
                                    <span className="text-xs text-muted-foreground">
                                        Content-Type: application/json is sent by default
                                    </span>
                                </div>
                                <Textarea
                                    className="font-mono text-sm min-h-[200px] bg-slate-50 dark:bg-slate-900 resize-y"
                                    placeholder='{ "Authorization": "Bearer token123" }'
                                    value={formData.headers}
                                    onChange={(e) => handleChange("headers", e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Enter valid JSON object. These headers will be included in the webhook request.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Conditional Logic */}
                    <Card className="border-t-4 border-t-purple-500">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-md">
                                    <Filter className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                                </div>
                                Conditional Execution
                            </CardTitle>
                            <CardDescription>
                                Only trigger this webhook when these conditions are met.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-md border">
                                <Label className="whitespace-nowrap">Logic:</Label>
                                <Select
                                    value={formData.condition_logic}
                                    onValueChange={(val) => handleChange("condition_logic", val)}
                                >
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AND">Match ALL</SelectItem>
                                        <SelectItem value="OR">Match ANY</SelectItem>
                                    </SelectContent>
                                </Select>
                                <span className="text-xs text-muted-foreground">
                                    {formData.condition_logic === 'AND'
                                        ? 'Webhook fires only if ALL conditions are true.'
                                        : 'Webhook fires if AT LEAST ONE condition is true.'
                                    }
                                </span>
                            </div>

                            <div className="space-y-3">
                                {(formData.conditions || []).map((condition, index) => (
                                    <div key={index} className="flex gap-2 items-start animate-in fade-in slide-in-from-top-1">
                                        <div className="flex-1">
                                            {/* Field Selector */}
                                            <Select
                                                value={condition.field}
                                                onValueChange={(val) => handleConditionChange(index, 'field', val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Field" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableAttributes.map((attr) => (
                                                        <SelectItem key={attr} value={attr}>
                                                            {attr}
                                                        </SelectItem>
                                                    ))}
                                                    <SelectItem value="custom">Custom...</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {/* Allow custom input if needed, or if current value is not in list */}
                                            {!availableAttributes.includes(condition.field) && condition.field !== '' && (
                                                <div className="mt-1">
                                                    <Input
                                                        placeholder="Custom field name"
                                                        value={condition.field}
                                                        onChange={(e) => handleConditionChange(index, 'field', e.target.value)}
                                                        className="h-8 text-xs"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="w-32">
                                            <Select
                                                value={condition.operator}
                                                onValueChange={(val) => handleConditionChange(index, 'operator', val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="=">=</SelectItem>
                                                    <SelectItem value="!=">!=</SelectItem>
                                                    <SelectItem value=">">&gt;</SelectItem>
                                                    <SelectItem value="<">&lt;</SelectItem>
                                                    <SelectItem value=">=">&gt;=</SelectItem>
                                                    <SelectItem value="<=">&lt;=</SelectItem>
                                                    <SelectItem value="in">in</SelectItem>
                                                    <SelectItem value="contains">contains</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex-1">
                                            <Input
                                                placeholder="Value"
                                                value={condition.value}
                                                onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                                            />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-red-500"
                                            onClick={() => handleRemoveCondition(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-dashed"
                                onClick={handleAddCondition}
                            >
                                <Plus className="h-4 w-4 mr-2" /> Add Condition
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
