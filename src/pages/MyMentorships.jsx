import React, { useState, useEffect, useCallback } from "react";
import { XCircle, ExternalLink } from "lucide-react";
import Swal from "sweetalert2";
import { Table } from "../components/Table";
import { getMyMentorships, cancelMyMentorship } from "../services/mentorshipService";
import { formatDateTime, viewerTimeZone } from "../utils/datetime";

const STATUS_LABELS = { confirmed: "Confirmed", cancelled: "Cancelled" };

export const MyMentorships = () => {
    const [rows, setRows] = useState([]);
    const [tab, setTab] = useState("upcoming");

    const load = useCallback(async () => {
        try {
            setRows(await getMyMentorships());
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const now = Date.now();
    const upcoming = rows.filter(r => r.status === "confirmed" && new Date(r.end).getTime() > now).reverse();
    const history = rows.filter(r => !upcoming.includes(r));
    const shown = (tab === "upcoming" ? upcoming : history).map(r => ({
        ...r,
        when: formatDateTime(r.start),
        status_label: STATUS_LABELS[r.status] || r.status,
        student: r.student_email ? `${r.student_name} (${r.student_email})` : r.student_name,
    }));

    const handleCancel = async (row) => {
        if (!row.can_cancel) {
            Swal.fire("Not available", "Only upcoming confirmed meetings can be cancelled.", "info");
            return;
        }
        const confirm = await Swal.fire({
            title: "Cancel this meeting?",
            text: `${row.student_name} will be notified by email and the event will be removed from their calendar.`,
            icon: "warning", showCancelButton: true, confirmButtonText: "Yes, cancel it",
        });
        if (!confirm.isConfirmed) return;
        try {
            await cancelMyMentorship(row.id);
            await load();
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        }
    };

    const columns = [
        { key: "when", label: "When" },
        { key: "student", label: "Student" },
        { key: "cohort", label: "Cohort" },
        { key: "minutes", label: "Min" },
        { key: "reason", label: "Reason" },
        { key: "status_label", label: "Status" },
    ];

    const tabButton = (key, label) => (
        <button key={key} onClick={() => setTab(key)} className="cursor-pointer"
            style={{
                padding: "8px 16px", fontSize: 14, fontWeight: 600, background: "none", border: "none",
                borderBottom: tab === key ? "2px solid var(--c-brand)" : "2px solid transparent",
                color: tab === key ? "var(--c-brand)" : "var(--c-muted)",
            }}>
            {label}
        </button>
    );

    return (
        <div className="h-full flex flex-col p-2 w-full gap-3 overflow-y-auto">
            <div>
                <p className="text-2xl font-bold tracking-tight text-codex-texto-primary dark:text-codex-texto-dark-primary">My Mentorships</p>
                <p style={{ fontSize: 13, color: "var(--c-muted)", marginTop: 2 }}>Times are shown in your browser's timezone ({viewerTimeZone()}).</p>
            </div>
            <div style={{ borderBottom: "1px solid var(--c-border)", display: "flex" }}>
                {tabButton("upcoming", `Upcoming (${upcoming.length})`)}
                {tabButton("history", `History (${history.length})`)}
            </div>
            <div className="bg-brand-oat p-2 rounded-lg shadow flex-1 min-h-[300px] overflow-hidden flex flex-col">
                <Table data={shown} columns={columns} searchable={true} onlyRowActions
                    rowActions={[
                        { label: "Open room", icon: ExternalLink, onClick: (row) => window.open(row.meeting_url, "_blank", "noopener,noreferrer") },
                        { label: "Cancel meeting", icon: XCircle, onClick: handleCancel },
                    ]} />
            </div>
        </div>
    );
};
