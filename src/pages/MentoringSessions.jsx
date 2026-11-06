import React, { useEffect, useState } from "react";
import { CalendarX2 } from "lucide-react";
import Swal from "sweetalert2";
import { Table } from "../components/Table";
import { getMentoringSessionsReport } from "../services/mentorshipService";
import { formatDateTime, viewerTimeZone } from "../utils/datetime";
import { MonthPicker, StatCard, EmptyState, StatusPill } from "../components/mentoring/ReportParts";
import { STATUS_LABELS, currentMonth, monthLabel, hours } from "../utils/mentoringReport";

const ROLES = { teacher: "Teacher", teaching_assistant: "TA" };
const selectStyle = { height: 36, padding: "0 10px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-card)",
    color: "var(--c-ink)", font: "600 14px var(--font-body)" };

// Operations view (managers): every mentoring session students booked in a month, across all mentors.
export const MentoringSessions = () => {
    const [month, setMonth] = useState(currentMonth);
    const [mentor, setMentor] = useState("");
    const [status, setStatus] = useState("");
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        getMentoringSessionsReport({ month, mentor, status })
            .then(data => { if (!cancelled) setReport(data); })
            .catch(error => Swal.fire("Error", error.message, "error"))
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [month, mentor, status]);

    const summary = report?.summary;
    const rows = (report?.sessions || []).map(s => ({
        ...s,
        when: formatDateTime(s.start),
        student: s.student_email ? `${s.student_name} (${s.student_email})` : s.student_name,
        status_label: STATUS_LABELS[s.status] || s.status,
    }));
    const filtered = mentor || status;

    const columns = [
        { key: "when", label: "Scheduled for" },
        { key: "student", label: "Student" },
        { key: "cohort", label: "Cohort" },
        { key: "mentor_name", label: "Mentor" },
        { key: "minutes", label: "Min" },
        { key: "reason", label: "Reason" },
        { key: "status_label", label: "Status", render: (_, row) => <StatusPill status={row.status} /> },
    ];

    return (
        <div className="h-full flex flex-col p-2 w-full gap-3 overflow-y-auto">
            <div>
                <p className="text-2xl font-bold tracking-tight text-codex-texto-primary dark:text-codex-texto-dark-primary">Mentoring Sessions</p>
                <p style={{ fontSize: 13, color: "var(--c-muted)", marginTop: 2 }}>
                    Sessions students booked with teachers and TAs. A month counts sessions by their start date in Honduras time; times are shown in your timezone ({viewerTimeZone()}).
                </p>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                <MonthPicker month={month} onChange={setMonth} />
                <select value={mentor} onChange={e => setMentor(e.target.value)} style={selectStyle} aria-label="Mentor">
                    <option value="">All mentors</option>
                    {(report?.mentors || []).map(m => (
                        <option key={m.id} value={m.id}>{m.name}{m.role ? ` (${ROLES[m.role]})` : ""}</option>
                    ))}
                </select>
                <select value={status} onChange={e => setStatus(e.target.value)} style={selectStyle} aria-label="Status">
                    <option value="">All statuses</option>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
            </div>

            {summary && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    <StatCard label="Sessions" value={summary.total} />
                    <StatCard label="Scheduled" value={summary.scheduled} />
                    <StatCard label="Completed" value={summary.completed} hint={hours(summary.completed_minutes) + " delivered"} />
                    <StatCard label="Cancelled" value={summary.cancelled} />
                </div>
            )}

            {loading && !report ? (
                <p style={{ color: "var(--c-muted)" }}>Loading…</p>
            ) : rows.length === 0 ? (
                <EmptyState icon={CalendarX2} title={`No mentoring sessions in ${monthLabel(month)}`}>
                    {filtered
                        ? "Nothing matches these filters. Try another mentor or status, or clear the filters."
                        : "No student booked a session with a teacher or TA this month. Pick another month to see its sessions."}
                </EmptyState>
            ) : (
                <div className="bg-brand-oat p-2 rounded-lg shadow flex-1 min-h-[300px] overflow-hidden flex flex-col">
                    <Table data={rows} columns={columns} searchable={true} searchPlaceholder="Search student, mentor, cohort..." hideActions />
                </div>
            )}
        </div>
    );
};
