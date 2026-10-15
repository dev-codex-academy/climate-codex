import React from "react";
import { Calendar, Building, FileCheck2, Phone, Archive } from "lucide-react";
import { formatDate } from "../../utils/date";
import Swal from "sweetalert2";

export const LeadCard = ({ lead, salesUsers = [], clientsById = {}, onDragStart, onClick, onArchive }) => {

    const handleArchiveClick = async (e) => {
        e.stopPropagation();
        const confirm = await Swal.fire({
            title: 'Archive this lead?',
            text: 'It will be hidden from the pipeline board until you unarchive it.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Archive',
        });
        if (confirm.isConfirmed) onArchive?.(lead.id);
    };

    const getResponsibleName = () => {
        const resp = lead.responsible;
        if (!resp) return "Unassigned";
        if (typeof resp === 'object') return resp.name || resp.username || "Unassigned";
        if (typeof resp === 'string' && isNaN(parseInt(resp))) return resp;
        const user = salesUsers.find(u => u.id === parseInt(resp));
        return user ? (user.name || user.username) : "Unassigned";
    };

    const getPossibleClientName = () => {
        const client = lead.possible_client;
        if (!client) return null;
        if (typeof client === 'object') return client.name || "Unknown Client";
        return clientsById[String(client)] || ("Client #" + String(client).slice(0, 8));
    };

    const responsibleName = getResponsibleName();
    const clientName = getPossibleClientName();

    return (
        <div
            onClick={() => onClick?.(lead)}
            draggable
            onDragStart={(e) => onDragStart(e, lead)}
            className="cursor-pointer active:scale-[0.98] transition-transform"
        >
            <div
                className="rounded-lg p-3 transition-all"
                style={{
                    backgroundColor: "var(--c-surface)",
                    border: "1px solid var(--c-border)",
                    fontFamily: 'var(--font-body)',
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "var(--c-brand)";
                    e.currentTarget.style.boxShadow = "0 4px 12px color-mix(in srgb, var(--c-brand) 10%, transparent)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "var(--c-border)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "none";
                }}
            >
                {/* Lead name */}
                <div className="flex items-start justify-between gap-1.5 mb-2.5">
                    <p
                        className="text-[11px] font-bold uppercase tracking-tight leading-tight line-clamp-2"
                        style={{ color: "var(--c-ink)" }}
                    >
                        {lead.name}
                    </p>
                    <div className="flex items-center gap-1 shrink-0">
                        {lead.calls_count > 0 && (
                            <div
                                className="flex items-center gap-0.5"
                                style={{ color: "var(--c-brand)" }}
                                title={`${lead.calls_count} call${lead.calls_count === 1 ? "" : "s"} on file`}
                            >
                                <Phone className="w-3.5 h-3.5" />
                                <span className="text-[9px] font-bold">{lead.calls_count}</span>
                            </div>
                        )}
                        {lead.has_enrollment_agreement && (
                            <FileCheck2
                                className="w-3.5 h-3.5"
                                style={{ color: "var(--c-brand)" }}
                                title="Enrollment Agreement on file"
                            />
                        )}
                        <button
                            type="button"
                            onClick={handleArchiveClick}
                            title="Archive lead"
                            className="cursor-pointer hover:opacity-70 transition-opacity"
                            style={{ color: "var(--c-hint)", lineHeight: 0 }}
                        >
                            <Archive className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Responsible */}
                <div
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md mb-2"
                    style={{ backgroundColor: "var(--c-surface-2)", border: "1px solid var(--c-border)" }}
                >
                    <div
                        className="h-4 w-4 rounded-full flex items-center justify-center text-[7px] font-black shrink-0"
                        style={{ backgroundColor: "var(--c-brand)", color: "var(--c-on-dark)" }}
                    >
                        {responsibleName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[9px] font-semibold truncate" style={{ color: "var(--c-ink)" }}>
                        {responsibleName}
                    </span>
                </div>

                {/* Date + client */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1" style={{ color: "var(--c-hint)" }}>
                        <Calendar className="w-2.5 h-2.5" />
                        <span className="text-[9px] font-medium">
                            {formatDate(lead.created_at || lead.date) || "No date"}
                        </span>
                    </div>
                    {clientName && (
                        <div className="flex items-center gap-1 max-w-[55%]" style={{ color: "var(--c-hint)" }}>
                            <Building className="w-2.5 h-2.5 shrink-0" />
                            <span className="text-[9px] truncate">{clientName}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
