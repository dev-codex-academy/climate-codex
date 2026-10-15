import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, Edit, Globe, Activity, Webhook } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getWebhooks, deleteWebhook } from "@/services/webhookService";
import Swal from 'sweetalert2';

const MODEL_COLORS = {
    Lead: { bg: "color-mix(in srgb, var(--c-cta) 12%, transparent)", border: "color-mix(in srgb, var(--c-cta) 40%, transparent)", text: "var(--c-cta-strong)" },
    Client: { bg: "color-mix(in srgb, var(--c-brand) 12%, transparent)", border: "color-mix(in srgb, var(--c-brand) 40%, transparent)", text: "var(--c-brand-strong)" },
    Service: { bg: "color-mix(in srgb, var(--c-accent) 12%, transparent)", border: "color-mix(in srgb, var(--c-accent) 40%, transparent)", text: "var(--c-brand-strong)" },
    FollowUp: { bg: "rgba(216,210,196,0.3)", border: "var(--c-border)", text: "var(--c-muted)" },
};

const METHOD_COLORS = {
    POST: { bg: "color-mix(in srgb, var(--c-brand) 12%, transparent)", border: "color-mix(in srgb, var(--c-brand) 35%, transparent)", text: "var(--c-brand-strong)" },
    PUT: { bg: "color-mix(in srgb, var(--c-accent) 12%, transparent)", border: "color-mix(in srgb, var(--c-accent) 35%, transparent)", text: "var(--c-brand-strong)" },
    PATCH: { bg: "color-mix(in srgb, var(--c-cta) 12%, transparent)", border: "color-mix(in srgb, var(--c-cta) 35%, transparent)", text: "var(--c-cta-strong)" },
    DELETE: { bg: "rgba(192,98,42,0.10)", border: "rgba(192,98,42,0.35)", text: "var(--c-cta-strong)" },
    GET: { bg: "rgba(216,210,196,0.3)", border: "var(--c-border)", text: "var(--c-muted)" },
};

const Pill = ({ label, colors }) => {
    const c = colors || { bg: "rgba(216,210,196,0.3)", border: "var(--c-border)", text: "var(--c-muted)" };
    return (
        <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: c.bg, border: `1px solid ${c.border}`, color: c.text }}
        >
            {label}
        </span>
    );
};

export const WebhookList = () => {
    const [webhooks, setWebhooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedModel, setSelectedModel] = useState("Lead");

    useEffect(() => {
        loadWebhooks();
    }, []);

    const loadWebhooks = async () => {
        try {
            const data = await getWebhooks();
            setWebhooks(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load webhooks',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
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
            await deleteWebhook(id);
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Webhook has been deleted.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            loadWebhooks();
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

    if (loading) {
        return (
            <div className="p-8 text-center" style={{ color: "var(--c-muted)", fontFamily: 'var(--font-body)' }}>
                Loading webhooks...
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6" style={{ fontFamily: 'var(--font-body)' }}>

            {/* Page header */}
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: "color-mix(in srgb, var(--c-brand) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--c-brand) 30%, transparent)" }}
                    >
                        <Webhook className="h-5 w-5" style={{ color: "var(--c-brand)" }} />
                    </div>
                    <div>
                        <p
                            className="text-base font-semibold"
                            style={{ color: "var(--c-ink)", fontFamily: 'var(--font-body)' }}
                        >
                            Webhooks
                        </p>
                        <p className="text-sm" style={{ color: "var(--c-hint)" }}>
                            Manage your system webhooks and event listeners.
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 items-center mt-3 sm:mt-0">
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                        <SelectTrigger className="w-[160px] h-10">
                            <SelectValue placeholder="Select Model" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Lead">Lead</SelectItem>
                            <SelectItem value="Client">Client</SelectItem>
                            <SelectItem value="Service">Service</SelectItem>
                            <SelectItem value="FollowUp">FollowUp</SelectItem>
                        </SelectContent>
                    </Select>
                    <Link to={`/webhook/new?model=${selectedModel}`}>
                        <button
                            className="flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                            style={{ backgroundColor: "var(--c-brand)", color: "var(--c-on-dark)" }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--c-brand-strong)"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--c-brand)"}
                        >
                            <Plus className="h-4 w-4" />
                            Add Webhook
                        </button>
                    </Link>
                </div>
            </div>

            {/* Table card */}
            <div
                className="overflow-hidden"
                style={{ borderRadius: "10px", border: "1px solid var(--c-border)", backgroundColor: "var(--c-surface)" }}
            >
                {/* Card header */}
                <div
                    className="px-5 py-3"
                    style={{ borderBottom: "1px solid var(--c-border)", backgroundColor: "var(--c-surface-2)" }}
                >
                    <span className="text-sm font-semibold" style={{ color: "var(--c-ink)" }}>
                        Configured Webhooks
                    </span>
                    <span
                        className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: "color-mix(in srgb, var(--c-brand) 12%, transparent)", color: "var(--c-brand)", border: "1px solid color-mix(in srgb, var(--c-brand) 30%, transparent)" }}
                    >
                        {webhooks.length}
                    </span>
                </div>

                {webhooks.length === 0 ? (
                    <div className="py-16 text-center" style={{ color: "var(--c-hint)" }}>
                        <Webhook className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No webhooks configured.</p>
                        <p className="text-xs mt-1">Click "Add Webhook" to create one.</p>
                    </div>
                ) : (
                    <div className="overflow-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ backgroundColor: "var(--c-brand)" }}>
                                    {["Name", "Model / Event", "Method & URL", "Status", "Actions"].map((h, i) => (
                                        <th
                                            key={h}
                                            className="px-4 py-2.5 text-xs font-semibold text-left"
                                            style={{
                                                color: "var(--c-on-dark)",
                                                letterSpacing: "0.06em",
                                                fontFamily: 'var(--font-body)',
                                                textAlign: i === 4 ? "right" : "left",
                                            }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody style={{ color: "var(--c-ink)" }}>
                                {webhooks.map((webhook, idx) => (
                                    <tr
                                        key={webhook.id}
                                        style={{ borderBottom: "1px solid var(--c-border)" }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--c-surface-2)"}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = ""}
                                    >
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-2">
                                                <Activity className="h-4 w-4 shrink-0" style={{ color: "var(--c-brand)" }} />
                                                <span className="font-medium">{webhook.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <Pill
                                                    label={webhook.model}
                                                    colors={MODEL_COLORS[webhook.model]}
                                                />
                                                <Pill
                                                    label={webhook.event || "UPDATE"}
                                                    colors={{ bg: "rgba(216,210,196,0.3)", border: "var(--c-border)", text: "var(--c-muted)" }}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 max-w-[260px]">
                                            <div className="flex items-center gap-2">
                                                <Pill
                                                    label={webhook.method || "POST"}
                                                    colors={METHOD_COLORS[webhook.method] || METHOD_COLORS.POST}
                                                />
                                                <div className="flex items-center gap-1 min-w-0">
                                                    <Globe className="h-3 w-3 shrink-0" style={{ color: "var(--c-hint)" }} />
                                                    <span
                                                        className="truncate text-xs"
                                                        style={{ color: "var(--c-muted)" }}
                                                        title={webhook.url}
                                                    >
                                                        {webhook.url}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <Pill
                                                label={webhook.is_active ? "Active" : "Inactive"}
                                                colors={webhook.is_active
                                                    ? { bg: "color-mix(in srgb, var(--c-brand) 12%, transparent)", border: "color-mix(in srgb, var(--c-brand) 40%, transparent)", text: "var(--c-brand-strong)" }
                                                    : { bg: "rgba(216,210,196,0.3)", border: "var(--c-border)", text: "var(--c-hint)" }
                                                }
                                            />
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link to={`/webhook/${webhook.id}`}>
                                                    <button
                                                        className="flex h-8 w-8 items-center justify-center rounded-md transition-colors cursor-pointer"
                                                        style={{ color: "var(--c-brand)" }}
                                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "color-mix(in srgb, var(--c-brand) 10%, transparent)"}
                                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                                                        title="Edit"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                </Link>
                                                <button
                                                    className="flex h-8 w-8 items-center justify-center rounded-md transition-colors cursor-pointer"
                                                    style={{ color: "#c0392b" }}
                                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(192,57,43,0.08)"}
                                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                                                    onClick={() => handleDelete(webhook.id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
