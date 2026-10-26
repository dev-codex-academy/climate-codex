import React, { useEffect, useMemo, useState } from "react";
import { Search, Globe, Video, CalendarOff, CalendarCheck, AlertTriangle, GraduationCap } from "lucide-react";
import Swal from "sweetalert2";
import { getMentorOverview } from "../services/mentorshipService";

const FONT = "var(--font-body)";
const INK = "var(--c-ink)";
const MUTED = "var(--c-muted)";
const HINT = "var(--c-hint)";
const PEBBLE = "var(--c-border)";
const BRAND = "var(--c-brand)";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ROLES = { teacher: "Teacher", teaching_assistant: "TA" };
const PLATFORMS = { zoom: "Zoom", google_meet: "Google Meet" };

const STYLES = `
.mo-chip { height: 34px; padding: 0 14px; border-radius: 999px; border: 1px solid ${PEBBLE}; background: var(--c-card); color: ${MUTED};
  font: 600 13px ${FONT}; cursor: pointer; }
.mo-chip[aria-pressed="true"] { background: ${BRAND}; border-color: ${BRAND}; color: var(--c-on-dark); }
.mo-search { height: 40px; border: 1px solid ${PEBBLE}; border-radius: 10px; padding: 0 12px 0 36px; width: 100%; box-sizing: border-box;
  font: 14px ${FONT}; color: ${INK}; background: var(--c-card); outline: none; }
.mo-search:focus { border-color: ${BRAND}; box-shadow: 0 0 0 3px color-mix(in srgb, var(--c-brand) 18%, transparent); }
`;

const hours = (minutes) => `${Math.floor(minutes / 60)}${minutes % 60 ? `h ${minutes % 60}m` : " h"}`;

// "2026-11-01" -> "Sun, Nov 1". Built from the parts: `new Date("2026-11-01")` is UTC midnight and shows the day before in the Americas.
const formatDay = (iso) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(new Date(y, m - 1, d));
};

const Pill = ({ children, tone = "neutral" }) => {
    const tones = {
        neutral: { background: "var(--c-surface-2)", color: MUTED, border: PEBBLE },
        brand: { background: "var(--c-brand-pale)", color: BRAND, border: "transparent" },
        warn: { background: "var(--c-cta-pale)", color: INK, border: "var(--c-cta)" },
        ok: { background: "color-mix(in srgb, #5FB49C 20%, transparent)", color: INK, border: "transparent" },
    }[tone];
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, background: tones.background, color: tones.color, border: `1px solid ${tones.border}`, fontFamily: FONT, fontSize: 12, fontWeight: 700 }}>
            {children}
        </span>
    );
};

const MentorCard = ({ m, zone }) => {
    // Honduras time puts every mentor on one calendar; their own zone is what they typed in.
    const rules = zone === "honduras" ? m.rules_business : m.rules;
    const byDay = DAYS.map((_, weekday) => rules.filter(r => r.weekday === weekday));
    const status = !m.configured
        ? <Pill tone="warn"><AlertTriangle className="h-3.5 w-3.5" /> Not configured</Pill>
        : m.is_active ? <Pill tone="ok">Accepting bookings</Pill> : <Pill tone="neutral">Bookings paused</Pill>;

    return (
        <section style={{ background: "var(--c-card)", border: `1px solid ${PEBBLE}`, borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${PEBBLE}`, background: "var(--c-surface)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontFamily: FONT, fontSize: 16, fontWeight: 700, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</p>
                        <p style={{ margin: 0, fontFamily: FONT, fontSize: 12.5, color: HINT }}>{m.username}</p>
                    </div>
                    <Pill tone="brand">{ROLES[m.role] || "Mentor"}</Pill>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                    {status}
                    {m.cohorts.length === 0
                        ? <Pill tone="warn"><GraduationCap className="h-3.5 w-3.5" /> No cohort</Pill>
                        : m.cohorts.map(c => <Pill key={c}><GraduationCap className="h-3.5 w-3.5" /> {c}</Pill>)}
                </div>
            </div>

            <div style={{ padding: 18, display: "grid", gap: 14, flex: 1 }}>
                {!m.configured ? (
                    <p style={{ margin: 0, fontFamily: FONT, fontSize: 14, color: MUTED }}>
                        This mentor hasn't set up their weekly hours yet, so students can't book them.
                    </p>
                ) : (
                    <>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", fontFamily: FONT, fontSize: 13, color: MUTED }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Globe className="h-3.5 w-3.5" /> Mentor's zone: {m.timezone.replace(/_/g, " ")}</span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                                <Video className="h-3.5 w-3.5" /> {PLATFORMS[m.meeting_platform] || "—"}{m.has_meeting_url ? "" : " · no room link"}
                            </span>
                            <span>{m.slot_minutes} min sessions · {m.min_notice_hours} h notice</span>
                        </div>

                        <div style={{ display: "grid", gap: 4 }}>
                            {DAYS.map((day, i) => (
                                <div key={day} style={{ display: "grid", gridTemplateColumns: "42px 1fr", gap: 8, alignItems: "baseline", fontFamily: FONT, fontSize: 13.5 }}>
                                    <span style={{ fontWeight: 700, color: byDay[i].length ? INK : HINT }}>{day}</span>
                                    <span style={{ color: byDay[i].length ? INK : HINT }}>
                                        {byDay[i].length ? byDay[i].map(r => `${r.start_time}–${r.end_time}`).join("  ·  ") : "Unavailable"}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <p style={{ margin: 0, fontFamily: FONT, fontSize: 12.5, color: MUTED }}>
                            {hours(m.weekly_minutes)} per week · {zone === "honduras" ? "shown in Honduras time" : "shown in the mentor's own timezone"}
                        </p>
                    </>
                )}

                {m.time_off.length > 0 && (
                    <div style={{ borderTop: "1px solid var(--c-divider)", paddingTop: 12, display: "grid", gap: 4 }}>
                        <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 6, fontFamily: FONT, fontSize: 12.5, fontWeight: 700, color: INK }}>
                            <CalendarOff className="h-3.5 w-3.5" /> Time off
                        </p>
                        {m.time_off.map(t => (
                            <p key={t.id} style={{ margin: 0, fontFamily: FONT, fontSize: 13, color: MUTED }}>
                                {formatDay(t.date)} · {t.start_time ? `${t.start_time}–${t.end_time}` : "All day"}{t.reason ? ` · ${t.reason}` : ""}
                            </p>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ padding: "10px 18px", borderTop: `1px solid ${PEBBLE}`, background: "var(--c-surface)", display: "flex", alignItems: "center", gap: 6, fontFamily: FONT, fontSize: 13, color: MUTED }}>
                <CalendarCheck className="h-4 w-4" />
                {m.upcoming_bookings} upcoming session{m.upcoming_bookings === 1 ? "" : "s"} booked
            </div>
        </section>
    );
};

export const MentorOverview = () => {
    const [mentors, setMentors] = useState(null);
    const [role, setRole] = useState("all");
    const [zone, setZone] = useState("honduras");
    const [search, setSearch] = useState("");

    useEffect(() => {
        getMentorOverview()
            .then(setMentors)
            .catch(error => { setMentors([]); Swal.fire("Error", error.message, "error"); });
    }, []);

    const visible = useMemo(() => {
        const q = search.trim().toLowerCase();
        return (mentors || []).filter(m =>
            (role === "all" || m.role === role) &&
            (!q || m.name.toLowerCase().includes(q) || m.username.toLowerCase().includes(q) || m.cohorts.some(c => c.toLowerCase().includes(q))));
    }, [mentors, role, search]);

    if (!mentors) return <div className="p-4 text-sm text-gray-500">Loading...</div>;

    const configured = mentors.filter(m => m.configured).length;
    const withoutCohort = mentors.filter(m => m.cohorts.length === 0).length;

    return (
        <div className="h-full flex flex-col w-full overflow-y-auto" style={{ backgroundColor: "transparent" }}>
            <style>{STYLES}</style>
            <header style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${PEBBLE}` }}>
                <p style={{ margin: 0, fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 30, lineHeight: 1.1, color: INK }}>Mentor Availability</p>
                <p style={{ margin: "6px 0 0", fontFamily: FONT, fontSize: 14, color: MUTED }}>
                    What each teacher and Teacher Assistant has set up for student bookings. Read-only: they edit their own hours.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                    <Pill tone="brand">{mentors.length} mentors</Pill>
                    <Pill tone={configured === mentors.length ? "ok" : "warn"}>{configured} with hours set</Pill>
                    {mentors.length - configured > 0 && <Pill tone="warn">{mentors.length - configured} not configured</Pill>}
                    {withoutCohort > 0 && <Pill tone="warn">{withoutCohort} without a cohort</Pill>}
                </div>
            </header>

            <div style={{ padding: 24, display: "grid", gap: 18 }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
                    <div style={{ position: "relative", flex: "1 1 260px", maxWidth: 360 }}>
                        <Search className="h-4 w-4" style={{ position: "absolute", left: 12, top: 12, color: HINT }} />
                        <input className="mo-search" placeholder="Search by name or cohort" aria-label="Search mentors" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    {[["all", "All"], ["teacher", "Teachers"], ["teaching_assistant", "TAs"]].map(([key, label]) => (
                        <button key={key} type="button" className="mo-chip" aria-pressed={role === key} onClick={() => setRole(key)}>{label}</button>
                    ))}
                    <span style={{ width: 1, height: 22, background: PEBBLE }} aria-hidden="true" />
                    <span style={{ fontFamily: FONT, fontSize: 13, color: MUTED }}>Show times in</span>
                    {[["honduras", "Honduras time"], ["own", "Mentor's own zone"]].map(([key, label]) => (
                        <button key={key} type="button" className="mo-chip" aria-pressed={zone === key} onClick={() => setZone(key)}>{label}</button>
                    ))}
                </div>

                {zone === "honduras" && (
                    <p style={{ margin: 0, fontFamily: FONT, fontSize: 12.5, color: MUTED }}>
                        Honduras has no daylight saving. A mentor in a zone that does (like Chicago) shifts by an hour while it's in effect,
                        so their hours can differ by a day's date this week.
                    </p>
                )}

                {visible.length === 0 ? (
                    <p style={{ margin: 0, fontFamily: FONT, fontSize: 14, color: MUTED }}>
                        {mentors.length === 0 ? "No teachers or Teacher Assistants yet." : "No mentors match your filters."}
                    </p>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 16, alignItems: "stretch" }}>
                        {visible.map(m => <MentorCard key={m.id} m={m} zone={zone} />)}
                    </div>
                )}
            </div>
        </div>
    );
};
