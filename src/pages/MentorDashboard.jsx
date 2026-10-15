import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, Calendar, GraduationCap, ExternalLink, AlertTriangle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getMyMentorProfile, getMyMentorships } from "../services/mentorshipService";
import { formatDateTime, viewerTimeZone } from "../utils/datetime";

const FONT = 'var(--font-body)';

const KpiCard = ({ title, value, icon: Icon, color, soft }) => (
    <div className="rounded-xl p-5 flex flex-col gap-3" style={{ backgroundColor: "var(--c-surface-2)", border: "1px solid var(--c-border)", borderTop: `4px solid ${color}` }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: soft }}>
            <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--c-muted)", fontFamily: FONT }}>{title}</p>
        <p className="text-3xl font-bold" style={{ color: "var(--c-ink)", fontFamily: FONT }}>{value ?? "—"}</p>
    </div>
);

export const MentorDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [sessions, setSessions] = useState(null);

    useEffect(() => {
        getMyMentorProfile().then(setProfile).catch(() => setProfile(false));
        getMyMentorships().then(setSessions).catch(() => setSessions([]));
    }, []);

    const now = Date.now();
    const weekAhead = now + 7 * 24 * 3600 * 1000;
    const upcoming = (sessions || [])
        .filter(s => s.status === "confirmed" && new Date(s.end).getTime() > now)
        .sort((a, b) => new Date(a.start) - new Date(b.start));
    const thisWeek = upcoming.filter(s => new Date(s.start).getTime() < weekAhead);

    // What is still missing before students can book this mentor.
    const todo = [];
    if (profile) {
        if (!profile.cohorts?.length) todo.push("You are not assigned to any cohort yet — ask an administrator.");
        if (!profile.meeting_url) todo.push("Add your Zoom or Google Meet room URL.");
        if (!profile.rules?.length) todo.push("Set your weekly hours.");
        if (profile.exists && !profile.is_active) todo.push("Your profile is paused, so nobody can book you.");
    }

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    return (
        <div className="h-full flex flex-col w-full" style={{ backgroundColor: "var(--c-surface)" }}>
            <header className="w-full px-6 py-4" style={{ borderBottom: "1px solid var(--c-border)" }}>
                <p className="text-2xl font-semibold"
                    style={{ fontFamily: 'var(--font-heading)', color: "var(--c-ink)" }}>
                    Mentoring
                </p>
                <p className="text-sm mt-0.5" style={{ color: "var(--c-muted)", fontFamily: FONT }}>
                    {greeting}, <span className="font-semibold" style={{ color: "var(--c-ink)" }}>{user?.first_name || user?.username}</span>
                </p>
            </header>

            <div className="flex-1 p-6 space-y-8 overflow-y-auto">
                {todo.length > 0 && (
                    <div className="rounded-xl p-4 flex gap-3" style={{ backgroundColor: "var(--c-cta-pale)", border: "1px solid var(--c-cta)" }}>
                        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "var(--c-danger)" }} />
                        <div style={{ fontFamily: FONT, color: "var(--c-ink)" }}>
                            <p className="font-semibold">Students can't book you yet</p>
                            <ul className="text-sm mt-1 list-disc pl-5">{todo.map(t => <li key={t}>{t}</li>)}</ul>
                            <button onClick={() => navigate("/my-availability")} className="cursor-pointer mt-3 text-sm font-semibold"
                                style={{ background: "none", border: "none", color: "var(--c-brand)", padding: 0 }}>
                                Open My Availability →
                            </button>
                        </div>
                    </div>
                )}

                <section className="space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--c-hint)", fontFamily: FONT }}>Overview</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <KpiCard title="Upcoming sessions" value={sessions ? upcoming.length : null} icon={CalendarCheck} color="var(--c-brand)" soft="var(--c-brand-pale)" />
                        <KpiCard title="Next 7 days" value={sessions ? thisWeek.length : null} icon={Calendar} color="var(--c-cta)" soft="var(--c-cta-pale)" />
                        <KpiCard title="My cohorts" value={profile ? profile.cohorts?.length ?? 0 : null} icon={GraduationCap} color="var(--c-accent)" soft="var(--c-accent-pale)" />
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--c-hint)", fontFamily: FONT }}>Next sessions</p>
                        <p className="text-xs" style={{ color: "var(--c-hint)", fontFamily: FONT }}>Times in {viewerTimeZone()}</p>
                    </div>
                    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--c-border)", backgroundColor: "var(--c-card)" }}>
                        {sessions && upcoming.length === 0 && (
                            <p className="p-6 text-sm text-center" style={{ color: "var(--c-muted)", fontFamily: FONT }}>
                                No sessions booked yet. Students of your cohorts will appear here when they book.
                            </p>
                        )}
                        {upcoming.slice(0, 6).map((s, i) => (
                            <div key={s.id} className="flex items-center justify-between gap-4 px-5 py-3"
                                style={{ borderTop: i ? "1px solid var(--c-divider)" : "none", fontFamily: FONT }}>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold" style={{ color: "var(--c-ink)" }}>{formatDateTime(s.start)} · {s.minutes} min</p>
                                    <p className="text-sm truncate" style={{ color: "var(--c-muted)" }}>{s.student_name} — {s.reason}</p>
                                </div>
                                <a href={s.meeting_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm font-semibold shrink-0"
                                    style={{ color: "var(--c-brand)" }}>
                                    Join <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        <button onClick={() => navigate("/my-mentorships")} className="cursor-pointer"
                            style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-card)", fontSize: 14, fontWeight: 600, color: "var(--c-ink)" }}>
                            All my mentorships
                        </button>
                        <button onClick={() => navigate("/my-availability")} className="cursor-pointer"
                            style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "var(--c-brand)", fontSize: 14, fontWeight: 600, color: "#fff" }}>
                            My availability
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};
