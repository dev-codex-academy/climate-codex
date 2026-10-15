import React from "react";
import { Calendar, Building, ChevronDown } from "lucide-react";
import { formatDate } from "../../utils/date";

export const LeadCardMobile = ({ lead, stages = [], salesUsers = [], clientsById = {}, onClick, onChangeStage }) => {

    const handleStageChange = (e) => {
        onChangeStage?.(lead.id, e.target.value);
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
    const currentStage = lead.stage || stages[0]?.name || "";

    return (
        <div
            onClick={() => onClick?.(lead)}
            className="cursor-pointer active:scale-[0.98] transition-transform rounded-xl p-3.5"
            style={{
                backgroundColor: "var(--c-surface)",
                border: "1px solid var(--c-border)",
                fontFamily: 'var(--font-body)',
            }}
        >
            {/* Lead name */}
            <p className="text-sm font-bold leading-tight mb-2.5" style={{ color: "var(--c-ink)" }}>
                {lead.name}
            </p>

            {/* Responsible + client */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
                <div
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md"
                    style={{ backgroundColor: "var(--c-surface-2)", border: "1px solid var(--c-border)" }}
                >
                    <div
                        className="h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0"
                        style={{ backgroundColor: "var(--c-brand)", color: "var(--c-on-dark)" }}
                    >
                        {responsibleName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[11px] font-semibold" style={{ color: "var(--c-ink)" }}>
                        {responsibleName}
                    </span>
                </div>
                {clientName && (
                    <div className="flex items-center gap-1 text-[11px] min-w-0" style={{ color: "var(--c-hint)" }}>
                        <Building className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[140px]">{clientName}</span>
                    </div>
                )}
            </div>

            {/* Date + stage move */}
            <div className="flex items-center justify-between gap-2 pt-2.5" style={{ borderTop: "1px solid var(--c-surface-2)" }}>
                <div className="flex items-center gap-1" style={{ color: "var(--c-hint)" }}>
                    <Calendar className="w-3 h-3" />
                    <span className="text-[11px] font-medium">
                        {formatDate(lead.created_at || lead.date) || "No date"}
                    </span>
                </div>
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <select
                        value={currentStage}
                        onChange={handleStageChange}
                        className="appearance-none pl-2.5 pr-6 py-1 rounded-full text-[11px] font-semibold focus:outline-none cursor-pointer"
                        style={{ border: "1px solid var(--c-border)", backgroundColor: "var(--c-surface-2)", color: "var(--c-brand)" }}
                    >
                        {stages.map(s => (
                            <option key={s.name} value={s.name}>{s.name}</option>
                        ))}
                    </select>
                    <ChevronDown
                        size={11}
                        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: "var(--c-hint)" }}
                    />
                </div>
            </div>
        </div>
    );
};
