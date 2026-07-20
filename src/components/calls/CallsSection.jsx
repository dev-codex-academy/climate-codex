import React, { useEffect, useState } from "react";
import { getLeadCalls, getServiceCalls } from "../../services/callService";
import { formatDate } from "../../utils/date";

// Transcribe's raw channel labels aren't confirmed to map to agent/customer
// on every call direction yet (only checked once, on an outbound call —
// see plan.md #69) — shown as generic speakers rather than guessing wrong.
const SPEAKER_LABELS = { ch_0: "Speaker 1", ch_1: "Speaker 2" };

const CallsSection = ({ entityType, entityId }) => {
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        if (!entityId) return;
        setLoading(true);
        const fetcher = entityType === "lead" ? getLeadCalls : getServiceCalls;
        fetcher(entityId)
            .then((data) => setCalls(data || []))
            .catch(() => setCalls([]))
            .finally(() => setLoading(false));
    }, [entityType, entityId]);

    if (loading) return null;

    return (
        <div className="bg-card p-6 rounded-lg border shadow-sm space-y-4">
            <h3 className="font-medium text-lg border-b pb-2">Calls</h3>

            {calls.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No calls on file yet.</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {calls.map((call) => {
                        const expanded = expandedId === call.id;
                        const turns = call.transcription?.turns || [];
                        return (
                            <div key={call.id} style={{ border: "1px solid #D8D2C4", borderRadius: 6, padding: 12 }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                                    <div style={{ fontSize: 13, fontFamily: '"Source Sans 3", Arial, sans-serif' }}>
                                        <span style={{ color: "#2E2A26", fontWeight: 600 }}>
                                            {formatDate(call.call_started_at || call.created_at) || "—"}
                                        </span>
                                        <span style={{ color: "#9b948e", marginLeft: 10 }}>{call.phone_number || "Unknown number"}</span>
                                    </div>
                                    {turns.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setExpandedId(expanded ? null : call.id)}
                                            style={{ fontSize: 12, padding: "4px 14px", borderRadius: 6, border: "1px solid #D8D2C4", backgroundColor: "transparent", color: "#5E6A43", cursor: "pointer", fontWeight: 500 }}>
                                            {expanded ? "Hide Transcript" : "View Transcript"}
                                        </button>
                                    )}
                                </div>

                                {call.recording_url && (
                                    <audio controls preload="none" style={{ width: "100%", height: 32 }} src={call.recording_url} />
                                )}

                                {expanded && (
                                    <div style={{ marginTop: 12, backgroundColor: "#FAF7F0", border: "1px solid #D8D2C4", borderRadius: 6, padding: 12, maxHeight: 260, overflowY: "auto" }}>
                                        {turns.map((turn, idx) => (
                                            <p key={idx} style={{ fontSize: 13, fontFamily: '"Source Sans 3", Arial, sans-serif', margin: "0 0 8px", color: "#2E2A26" }}>
                                                <span style={{ fontWeight: 600, color: "#5E6A43" }}>
                                                    {SPEAKER_LABELS[turn.speaker] || turn.speaker}:{" "}
                                                </span>
                                                {turn.content}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CallsSection;
