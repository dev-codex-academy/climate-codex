import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarX2, CalendarClock } from "lucide-react";
import Swal from "sweetalert2";
import { Table } from "../components/Table";
import { getMyMentoringReport } from "../services/mentorshipService";
import { formatDateTime, viewerTimeZone } from "../utils/datetime";
import { MonthPicker, StatCard, EmptyState, StatusPill } from "../components/mentoring/ReportParts";
import { STATUS_LABELS, currentMonth, monthLabel, hours } from "../utils/mentoringReport";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// "2026-11-10" -> "Tue, Nov 10", from the parts (a bare ISO date parses as UTC midnight).
const formatDay = (iso) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(new Date(y, m - 1, d));
};

const card = { background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 16 };
const heading = { margin: "0 0 10px", fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 700, color: "var(--c-ink)" };
const muted = { fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--c-muted)" };

const Availability = ({ availability, month }) => {
    if (!availability || availability.rules.length === 0) {
        return (
            <EmptyState icon={CalendarClock} title="No availability registered">
                You haven't set your weekly hours yet, so students can't book you. Set them in <Link to="/my-availability" style={{ color: "var(--c-brand)" }}>My Availability</Link>.
            </EmptyState>
        );
    }
    const byDay = DAYS.map((_, weekday) => availability.rules.filter(r => r.weekday === weekday));
    return (
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            <div style={card}>
                <p style={heading}>Weekly hours</p>
                <p style={{ ...muted, margin: "0 0 8px" }}>In your timezone ({availability.timezone}){availability.is_active ? "" : " · bookings paused"}</p>
                {byDay.map((rules, weekday) => (
                    <div key={weekday} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "4px 0", borderTop: weekday ? "1px solid var(--c-border)" : "none" }}>
                        <span style={{ ...muted, color: "var(--c-ink)", fontWeight: 600 }}>{DAYS[weekday]}</span>
                        <span style={muted}>{rules.length ? rules.map(r => `${r.start_time}–${r.end_time}`).join(", ") : "—"}</span>
                    </div>
                ))}
            </div>
            <div style={card}>
                <p style={heading}>Time off in {monthLabel(month)}</p>
                {availability.time_off.length === 0 ? (
                    <p style={{ ...muted, margin: 0 }}>No time off this month.</p>
                ) : availability.time_off.map(t => (
                    <div key={t.id} style={{ padding: "4px 0", borderTop: "1px solid var(--c-border)" }}>
                        <span style={{ ...muted, color: "var(--c-ink)", fontWeight: 600 }}>{formatDay(t.date)}</span>{" "}
                        <span style={muted}>{t.start_time ? `${t.start_time}–${t.end_time}` : "All day"}{t.reason ? ` · ${t.reason}` : ""}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Mentor view (teachers / TAs): their own availability and the sessions they had in a month.
export const MyMentoringReport = () => {
    const [month, setMonth] = useState(currentMonth);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        getMyMentoringReport(month)
            .then(data => { if (!cancelled) setReport(data); })
            .catch(error => Swal.fire("Error", error.message, "error"))
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [month]);

    const summary = report?.summary;
    const rows = (report?.sessions || []).map(s => ({
        ...s,
        when: formatDateTime(s.start),
        student: s.student_email ? `${s.student_name} (${s.student_email})` : s.student_name,
        status_label: STATUS_LABELS[s.status] || s.status,
    }));
    const columns = [
        { key: "when", label: "Date" },
        { key: "student", label: "Student" },
        { key: "cohort", label: "Cohort" },
        { key: "minutes", label: "Min" },
        { key: "reason", label: "Reason" },
        { key: "status_label", label: "Status", render: (_, row) => <StatusPill status={row.status} /> },
    ];

    return (
        <div className="h-full flex flex-col p-2 w-full gap-4 overflow-y-auto">
            <div>
                <p className="text-2xl font-bold tracking-tight text-codex-texto-primary dark:text-codex-texto-dark-primary">My Monthly Report</p>
                <p style={{ fontSize: 13, color: "var(--c-muted)", marginTop: 2 }}>
                    Your availability and the mentoring sessions you had each month. Session times are shown in your browser's timezone ({viewerTimeZone()}).
                </p>
            </div>

            <MonthPicker month={month} onChange={setMonth} />

            {loading && !report ? <p style={{ color: "var(--c-muted)" }}>Loading…</p> : report && (
                <>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                        <StatCard label="Delivered" value={summary.completed} hint={hours(summary.completed_minutes)} />
                        <StatCard label="Scheduled" value={summary.scheduled} />
                        <StatCard label="Cancelled" value={summary.cancelled} />
                        <StatCard label="Hours available" value={report.availability ? hours(report.availability.available_minutes) : "—"} hint="Weekly hours this month, minus time off" />
                    </div>

                    <section>
                        <p style={heading}>Availability</p>
                        <Availability availability={report.availability} month={month} />
                    </section>

                    <section className="flex flex-col flex-1 min-h-[300px]">
                        <p style={heading}>Sessions in {monthLabel(month)}</p>
                        {rows.length === 0 ? (
                            <EmptyState icon={CalendarX2} title={`No sessions in ${monthLabel(month)}`}>
                                No student booked a session with you this month. Sessions appear here as soon as they are booked.
                            </EmptyState>
                        ) : (
                            <div className="bg-brand-oat p-2 rounded-lg shadow flex-1 overflow-hidden flex flex-col">
                                <Table data={rows} columns={columns} searchable={true} hideActions />
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
};
