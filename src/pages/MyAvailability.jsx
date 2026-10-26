import React, { useState, useEffect } from "react";
import { Plus, Trash2, Video, Globe, Clock, Info, AlertTriangle, GraduationCap, CalendarOff } from "lucide-react";
import Swal from "sweetalert2";
import { getMyMentorProfile, saveMyMentorProfile, addMyTimeOff, deleteMyTimeOff } from "../services/mentorshipService";
import { formatDateTime } from "../utils/datetime";
import { TimezoneSelect } from "../components/TimezoneSelect";

const FONT = 'var(--font-body)';
const INK = "var(--c-ink)";
const MUTED = "var(--c-muted)";
const HINT = "var(--c-hint)";
const PEBBLE = "var(--c-border)";
const OAT = "var(--c-surface-2)";
const OLIVE = "var(--c-brand)";
const CITRON = "var(--c-accent)";
const APRICOT = "var(--c-cta)";
const PEACH = "var(--c-cta-pale)";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SLOT_OPTIONS = [15, 30, 45, 60];
const PLATFORMS = {
    zoom: { label: "Zoom", placeholder: "https://zoom.us/j/1234567890", hint: "Students are told to install Zoom or use Zoom Web." },
    google_meet: { label: "Google Meet", placeholder: "https://meet.google.com/abc-defg-hij", hint: "Students join from the link, no install needed." },
};

// One shared look for every control, so heights and focus states match.
// (Inline styles can't express :focus, so a tiny scoped stylesheet does it.)
const STYLES = `
.av-control { width: 100%; height: 42px; box-sizing: border-box; border: 1px solid ${PEBBLE}; border-radius: 8px; padding: 0 12px;
  font: 15px ${FONT}; color: ${INK}; background: var(--c-card); outline: none; transition: border-color .15s, box-shadow .15s; }
.av-control:hover { border-color: var(--c-border-strong); }
.av-control:focus, .av-control:focus-visible { border-color: ${OLIVE}; box-shadow: 0 0 0 3px color-mix(in srgb, var(--c-brand) 18%, transparent); }
.av-control::placeholder { color: ${HINT}; }
.av-seg { display: inline-flex; padding: 3px; gap: 3px; background: ${OAT}; border: 1px solid ${PEBBLE}; border-radius: 10px; }
.av-seg button { height: 34px; padding: 0 14px; border: none; border-radius: 7px; background: transparent; color: ${MUTED};
  font: 600 14px ${FONT}; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: background .15s, color .15s; }
.av-seg button:hover { color: ${INK}; }
.av-seg button[aria-pressed="true"] { background: var(--c-card); color: ${OLIVE}; box-shadow: 0 1px 3px rgba(30,47,74,.14); }
.av-seg button:focus-visible { outline: 2px solid ${OLIVE}; outline-offset: 1px; }
.av-add { display: inline-flex; align-items: center; gap: 4px; height: 32px; padding: 0 10px; border: 1px dashed ${PEBBLE}; border-radius: 8px;
  background: transparent; color: ${OLIVE}; font: 600 13px ${FONT}; cursor: pointer; }
.av-add:hover { background: var(--c-card); border-color: ${OLIVE}; }
.av-remove { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: none; border-radius: 8px;
  background: transparent; color: var(--c-danger); cursor: pointer; }
.av-remove:hover { background: ${PEACH}; }
.av-save { height: 44px; padding: 0 28px; border: none; border-radius: 8px; background: ${OLIVE}; color: #fff; font: 700 15px ${FONT}; cursor: pointer; }
.av-save:hover:not(:disabled) { background: var(--c-brand-strong); }
.av-save:disabled { opacity: .6; cursor: not-allowed; }
`;

const Card = ({ icon: Icon, title, subtitle, children, right }) => (
    <section style={{ background: "var(--c-card)", border: `1px solid ${PEBBLE}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 20px", background: "var(--c-surface)", borderBottom: `1px solid ${PEBBLE}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 9, background: "var(--c-brand-pale)", flexShrink: 0 }}>
                    <Icon className="h-4 w-4" style={{ color: OLIVE }} />
                </span>
                <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontFamily: FONT, fontSize: 16, fontWeight: 700, color: INK }}>{title}</p>
                    {subtitle && <p style={{ margin: 0, fontFamily: FONT, fontSize: 13, color: MUTED }}>{subtitle}</p>}
                </div>
            </div>
            {right}
        </div>
        <div style={{ padding: 20 }}>{children}</div>
    </section>
);

const Field = ({ label, hint, children }) => (
    <div style={{ minWidth: 0 }}>
        <p style={{ margin: "0 0 6px", fontFamily: FONT, fontSize: 13, fontWeight: 700, color: INK, letterSpacing: 0, textTransform: "none" }}>{label}</p>
        {children}
        {hint && <p style={{ margin: "6px 0 0", fontFamily: FONT, fontSize: 12.5, lineHeight: 1.4, color: MUTED }}>{hint}</p>}
    </div>
);

const Switch = ({ checked, onChange, label }) => (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: FONT }}>
        <span style={{ position: "relative", width: 42, height: 24, borderRadius: 999, background: checked ? OLIVE : "var(--c-switch-off)", transition: "background .15s", flexShrink: 0 }}>
            <span style={{ position: "absolute", top: 3, left: checked ? 21 : 3, width: 18, height: 18, borderRadius: "50%", background: "var(--c-card)", boxShadow: "0 1px 3px rgba(0,0,0,.25)", transition: "left .15s" }} />
        </span>
        <span style={{ fontSize: 14, fontWeight: 700, color: checked ? OLIVE : MUTED }}>{label}</span>
    </button>
);

const minutesOf = (hhmm) => {
    const [h, m] = String(hhmm || "0:0").split(":").map(Number);
    return h * 60 + m;
};

// "2026-11-01" -> "Sun, Nov 1, 2026". Built from the parts, never `new Date("2026-11-01")`,
// which is UTC midnight and would show the previous day in the Americas.
const formatDay = (iso) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }).format(new Date(y, m - 1, d));
};

// Today's date in the mentor's own timezone (what the server treats as "not in the past").
const todayIn = (timeZone) => new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

const EMPTY_OFF = { date: "", allDay: true, start_time: "09:00", end_time: "12:00", reason: "" };

export const MyAvailability = () => {
    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [off, setOff] = useState(EMPTY_OFF);
    const [addingOff, setAddingOff] = useState(false);

    useEffect(() => {
        getMyMentorProfile()
            .then(setForm)
            .catch(error => Swal.fire("Error", error.message, "error"));
    }, []);

    if (!form) return <div className="p-4 text-sm text-gray-500">Loading...</div>;

    const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
    const rulesOf = (weekday) => form.rules.map((r, index) => ({ ...r, index })).filter(r => r.weekday === weekday);
    const updateRule = (index, patch) => set("rules", form.rules.map((r, i) => (i === index ? { ...r, ...patch } : r)));
    // A window is one session long by default: its end = start + the session length picked above.
    // New windows start at 09:00 (first of the day) or where the day's latest window ends.
    const toHHMM = (mins) => `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
    const endFor = (startMins) => Math.min(startMins + Number(form.slot_minutes || 30), 23 * 60 + 59);
    const addRule = (weekday) => {
        const existing = form.rules.filter(r => r.weekday === weekday);
        const start = existing.length ? Math.max(...existing.map(r => minutesOf(r.end_time))) : 9 * 60;
        if (start >= 23 * 60 + 30) {
            Swal.fire("No time left", `${DAYS[weekday]} already runs until the end of the day.`, "info");
            return;
        }
        set("rules", [...form.rules, { weekday, start_time: toHHMM(start), end_time: toHHMM(endFor(start)) }]);
    };
    // Changing a window's start moves its end too (start + session length); the end can still be edited after.
    const setStart = (index, value) => {
        if (!value) { updateRule(index, { start_time: value }); return; }
        updateRule(index, { start_time: value, end_time: toHHMM(endFor(minutesOf(value))) });
    };
    const removeRule = (index) => set("rules", form.rules.filter((_, i) => i !== index));

    const platform = PLATFORMS[form.meeting_platform] || PLATFORMS.google_meet;
    const weeklyMinutes = form.rules.reduce((sum, r) => sum + Math.max(0, minutesOf(r.end_time) - minutesOf(r.start_time)), 0);
    const weeklyLabel = `${Math.floor(weeklyMinutes / 60)}${weeklyMinutes % 60 ? `h ${weeklyMinutes % 60}m` : " h"} per week`;

    const refreshTimeOff = async () => {
        const fresh = await getMyMentorProfile();
        setForm(f => ({ ...f, time_off: fresh.time_off }));
    };

    const submitTimeOff = async (cancelConflicts) => {
        setAddingOff(true);
        try {
            const result = await addMyTimeOff({
                date: off.date,
                start_time: off.allDay ? null : off.start_time,
                end_time: off.allDay ? null : off.end_time,
                reason: off.reason.trim(),
                cancel_conflicts: cancelConflicts,
            });
            await refreshTimeOff();
            setOff(EMPTY_OFF);
            Swal.fire("Time off saved", result.cancelled
                ? `${result.cancelled} booking${result.cancelled > 1 ? "s were" : " was"} cancelled and the student${result.cancelled > 1 ? "s were" : " was"} notified by email.`
                : "Students can no longer book you then.", "success");
        } catch (error) {
            if (error.status === 409) {
                const list = error.conflicts.map(b => `<li style="margin:4px 0"><b>${formatDateTime(b.start, form.timezone)}</b> — ${b.student_name.replace(/</g, "&lt;")}</li>`).join("");
                const answer = await Swal.fire({
                    title: "You already have bookings then",
                    html: `<p style="text-align:left">These sessions fall inside the time you want to block (times in ${form.timezone.replace(/_/g, " ")}):</p><ul style="text-align:left;padding-left:18px">${list}</ul><p style="text-align:left">Cancel them? Each student gets a cancellation email and can book another time.</p>`,
                    icon: "warning", showCancelButton: true, confirmButtonText: "Cancel them and block the time", cancelButtonText: "Keep my bookings",
                });
                if (answer.isConfirmed) { await submitTimeOff(true); return; }
            } else {
                Swal.fire("Error", error.message, "error");
            }
        } finally {
            setAddingOff(false);
        }
    };

    const removeTimeOff = async (id) => {
        try {
            await deleteMyTimeOff(id);
            await refreshTimeOff();
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const saved = await saveMyMentorProfile({
                timezone: form.timezone,
                meeting_platform: form.meeting_platform,
                meeting_url: form.meeting_url.trim(),
                slot_minutes: Number(form.slot_minutes),
                min_notice_hours: Number(form.min_notice_hours),
                is_active: form.is_active,
                rules: form.rules,
            });
            setForm(saved);
            Swal.fire("Saved", "Your availability was updated.", "success");
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="h-full flex flex-col w-full overflow-y-auto" style={{ backgroundColor: "var(--c-surface)" }}>
            <style>{STYLES}</style>

            <header style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${PEBBLE}`, display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 30, lineHeight: 1.1, color: INK }}>
                        My Availability
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 12 }}>
                        {form.cohorts?.length ? (
                            form.cohorts.map(name => (
                                <span key={name} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, background: "var(--c-brand-pale)", border: `1px solid ${CITRON}`, color: OLIVE, fontFamily: FONT, fontSize: 12.5, fontWeight: 700 }}>
                                    <GraduationCap className="h-3.5 w-3.5" /> {name}
                                </span>
                            ))
                        ) : (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, background: PEACH, border: `1px solid ${APRICOT}`, color: INK, fontFamily: FONT, fontSize: 12.5, fontWeight: 700 }}>
                                <AlertTriangle className="h-3.5 w-3.5" style={{ color: "var(--c-danger)" }} /> Not assigned to any cohort yet — nobody can book you
                            </span>
                        )}
                    </div>
                    <p style={{ margin: "10px 0 0", display: "flex", alignItems: "center", gap: 6, fontFamily: FONT, fontSize: 13.5, color: MUTED }}>
                        <Info className="h-4 w-4" style={{ flexShrink: 0 }} />
                        Students can only book the current week and the next one (Monday to Sunday, Honduras time).
                    </p>
                </div>
                <div style={{ paddingTop: 6 }}>
                    <Switch checked={form.is_active} onChange={v => set("is_active", v)} label={form.is_active ? "Accepting bookings" : "Bookings paused"} />
                </div>
            </header>

            <div style={{ padding: 24, display: "grid", gap: 20, maxWidth: 1100 }}>
                <Card icon={Video} title="Session room" subtitle="Where you meet your students. This link goes in the confirmation email and the calendar invite.">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, alignItems: "start" }}>
                        <Field label="Platform" hint={platform.hint}>
                            <div className="av-seg" role="group" aria-label="Platform">
                                {Object.entries(PLATFORMS).map(([key, p]) => (
                                    <button key={key} type="button" aria-pressed={form.meeting_platform === key} onClick={() => set("meeting_platform", key)}>
                                        <Video className="h-4 w-4" /> {p.label}
                                    </button>
                                ))}
                            </div>
                        </Field>
                        <div style={{ gridColumn: "span 2", minWidth: 0 }}>
                            <Field label={`${platform.label} room URL`} hint="Paste your permanent room link. It must be an https link from the platform you picked.">
                                <input className="av-control" value={form.meeting_url} placeholder={platform.placeholder} onChange={e => set("meeting_url", e.target.value)} />
                            </Field>
                        </div>
                    </div>
                </Card>

                <Card icon={Globe} title="Scheduling" subtitle="How your sessions are offered to students.">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, alignItems: "start" }}>
                        <Field label="Your timezone" hint="The weekly hours below are in this timezone.">
                            <TimezoneSelect value={form.timezone} onChange={tz => set("timezone", tz)} />
                        </Field>
                        <Field label="Session length" hint="Each booking lasts this long.">
                            <div className="av-seg" role="group" aria-label="Session length">
                                {SLOT_OPTIONS.map(m => (
                                    <button key={m} type="button" aria-pressed={Number(form.slot_minutes) === m} onClick={() => set("slot_minutes", m)}>{m} min</button>
                                ))}
                            </div>
                        </Field>
                        <Field label="Minimum notice" hint="Students can't book sooner than this before a session.">
                            <div style={{ position: "relative", maxWidth: 200 }}>
                                <input className="av-control" type="number" min={0} max={168} value={form.min_notice_hours}
                                    onChange={e => set("min_notice_hours", e.target.value)} style={{ paddingRight: 64 }} />
                                <span style={{ position: "absolute", right: 12, top: 0, height: 42, display: "flex", alignItems: "center", fontFamily: FONT, fontSize: 14, color: MUTED, pointerEvents: "none" }}>hours</span>
                            </div>
                        </Field>
                    </div>
                </Card>

                <Card icon={Clock} title="Weekly hours" subtitle={`Add the windows when students can book you. ${weeklyMinutes ? `Total: ${weeklyLabel}.` : ""}`}>
                    <div style={{ display: "grid" }}>
                        {DAYS.map((day, weekday) => {
                            const rules = rulesOf(weekday);
                            return (
                                <div key={day} style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: 12, alignItems: "start", padding: "12px 0", borderTop: weekday ? "1px solid var(--c-divider)" : "none" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, height: 42 }}>
                                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: rules.length ? CITRON : PEBBLE }} />
                                        <span style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: rules.length ? INK : MUTED }}>{day}</span>
                                    </div>
                                    <div style={rules.length === 0
                                        ? { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, minHeight: 42 }
                                        : { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
                                        {rules.length === 0 && <span style={{ fontFamily: FONT, fontSize: 13.5, color: HINT, marginRight: 4 }}>Unavailable</span>}
                                        {rules.map(rule => (
                                            <div key={rule.index} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 4px 4px 6px", background: OAT, border: `1px solid ${PEBBLE}`, borderRadius: 10 }}>
                                                <input className="av-control" type="time" aria-label={`${day} start`} value={rule.start_time}
                                                    onChange={e => setStart(rule.index, e.target.value)} style={{ width: 142, height: 34, padding: "0 8px" }} />
                                                <span style={{ color: MUTED, fontFamily: FONT, fontSize: 13 }}>to</span>
                                                <input className="av-control" type="time" aria-label={`${day} end`} value={rule.end_time}
                                                    onChange={e => updateRule(rule.index, { end_time: e.target.value })} style={{ width: 142, height: 34, padding: "0 8px" }} />
                                                <button type="button" className="av-remove" onClick={() => removeRule(rule.index)} aria-label={`Remove ${day} window`}>
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                        <button type="button" className="av-add" onClick={() => addRule(weekday)}>
                                            <Plus className="h-3.5 w-3.5" /> Add window
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                <Card icon={CalendarOff} title="Time off" subtitle={`Block a specific day or a few hours without changing your weekly hours. Dates and times are in your timezone (${form.timezone.replace(/_/g, " ")}).`}>
                    {!form.exists ? (
                        <p style={{ margin: 0, fontFamily: FONT, fontSize: 14, color: MUTED }}>Save your availability once above, then you can add time off.</p>
                    ) : (
                        <div style={{ display: "grid", gap: 16 }}>
                            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 14 }}>
                                <div style={{ width: 180 }}>
                                    <Field label="Date">
                                        <input className="av-control" type="date" aria-label="Time off date" min={todayIn(form.timezone)} value={off.date}
                                            onChange={e => setOff(o => ({ ...o, date: e.target.value }))} />
                                    </Field>
                                </div>
                                <Field label="Block">
                                    <div className="av-seg" role="group" aria-label="Block scope">
                                        <button type="button" aria-pressed={off.allDay} onClick={() => setOff(o => ({ ...o, allDay: true }))}>All day</button>
                                        <button type="button" aria-pressed={!off.allDay} onClick={() => setOff(o => ({ ...o, allDay: false }))}>Specific hours</button>
                                    </div>
                                </Field>
                                {!off.allDay && (
                                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                                        <input className="av-control" type="time" aria-label="Time off start" value={off.start_time}
                                            onChange={e => setOff(o => ({ ...o, start_time: e.target.value }))} style={{ width: 142 }} />
                                        <span style={{ color: MUTED, fontFamily: FONT, fontSize: 13 }}>to</span>
                                        <input className="av-control" type="time" aria-label="Time off end" value={off.end_time}
                                            onChange={e => setOff(o => ({ ...o, end_time: e.target.value }))} style={{ width: 142 }} />
                                    </div>
                                )}
                                <div style={{ flex: "1 1 200px", minWidth: 180 }}>
                                    <Field label="Reason (only you see it)">
                                        <input className="av-control" maxLength={200} placeholder="Optional" value={off.reason}
                                            onChange={e => setOff(o => ({ ...o, reason: e.target.value }))} />
                                    </Field>
                                </div>
                                <button type="button" className="av-save" style={{ height: 42 }} disabled={!off.date || addingOff} onClick={() => submitTimeOff(false)}>
                                    {addingOff ? "Saving..." : "Block time"}
                                </button>
                            </div>

                            {form.time_off?.length ? (
                                <div style={{ display: "grid" }}>
                                    {form.time_off.map((t, i) => (
                                        <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 0", borderTop: i ? "1px solid var(--c-divider)" : "none" }}>
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{ margin: 0, fontFamily: FONT, fontSize: 15, fontWeight: 700, color: INK }}>
                                                    {formatDay(t.date)} · {t.start_time ? `${t.start_time} to ${t.end_time}` : "All day"}
                                                </p>
                                                {t.reason && <p style={{ margin: 0, fontFamily: FONT, fontSize: 13, color: MUTED }}>{t.reason}</p>}
                                            </div>
                                            <button type="button" className="av-remove" onClick={() => removeTimeOff(t.id)} aria-label={`Remove time off on ${formatDay(t.date)}`}>
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p style={{ margin: 0, fontFamily: FONT, fontSize: 13.5, color: HINT }}>No upcoming time off.</p>
                            )}
                        </div>
                    )}
                </Card>

                <div style={{ display: "flex", alignItems: "center", gap: 14, paddingBottom: 12 }}>
                    <button type="button" className="av-save" onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save availability"}
                    </button>
                    <span style={{ fontFamily: FONT, fontSize: 13, color: MUTED }}>Changes don't affect sessions that are already booked.</span>
                </div>
            </div>
        </div>
    );
};
