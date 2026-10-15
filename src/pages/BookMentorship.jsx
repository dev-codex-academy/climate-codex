import React, { useState, useMemo } from "react";
import {
    requestMentorshipCode, verifyMentorshipCode, getBookingMe, getBookableMentors,
    getMentorSlots, createBooking,
} from "../services/mentorshipService";
import { Clock, Video, Globe } from "lucide-react";
import { BookingCalendar } from "../components/BookingCalendar";
import { formatDateTime, formatTime, viewerTimeZone, toLocalIsoDate } from "../utils/datetime";

const FONT = 'var(--font-body)';
const INK = "var(--c-ink)";
const MUTED = "var(--c-muted)";
const LINEN = "var(--c-surface)";
const OAT = "var(--c-surface-2)";
const PEBBLE = "var(--c-border)";
const OLIVE = "var(--c-brand)";
const ERROR = "var(--c-danger)";

const inputStyle = {
    width: "100%", padding: "10px 14px", border: `1px solid ${PEBBLE}`, borderRadius: 6,
    backgroundColor: "var(--c-card)", color: INK, fontFamily: FONT, fontSize: 16, outline: "none", boxSizing: "border-box",
};
const cardStyle = { background: "var(--c-card)", border: `1px solid ${PEBBLE}`, borderRadius: 10, padding: 20 };
const primaryButton = (disabled) => ({
    padding: "10px 22px", borderRadius: 6, border: "none", background: OLIVE, color: "#fff",
    fontFamily: FONT, fontSize: 16, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.55 : 1,
});
const ROLE_LABELS = { teacher: "Teacher", teaching_assistant: "Teaching Assistant" };
const PLATFORM_LABELS = { zoom: "Zoom", google_meet: "Google Meet" };
const MIN_REASON = 10;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DAYS_AHEAD = 13;

const Shell = ({ children, wide = false }) => (
    <div style={{ minHeight: "100vh", background: LINEN, fontFamily: FONT, color: INK }}>
        <div style={{ maxWidth: wide ? 1000 : 760, margin: "0 auto", padding: "32px 16px 64px" }}>
            <img src="/codex-logo.png" alt="CodeX Academy" style={{ height: 72, width: "auto", display: "block", marginBottom: 8 }} />
            <p style={{ fontSize: 16, color: MUTED, marginBottom: 20 }}>Book a mentorship session</p>
            {children}
        </div>
    </div>
);

export const BookMentorship = () => {
    const [step, setStep] = useState("email"); // email | code | book | done
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [token, setToken] = useState("");
    const [me, setMe] = useState(null);
    const [mentors, setMentors] = useState([]);
    const [mentor, setMentor] = useState(null);
    const [slots, setSlots] = useState([]);
    const [day, setDay] = useState("");
    const [slot, setSlot] = useState(null);
    const [reason, setReason] = useState("");
    const [booking, setBooking] = useState(null);
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);

    const tz = viewerTimeZone();

    const backToStart = (text) => {
        setToken(""); setMe(null); setMentor(null); setSlots([]); setSlot(null); setCode("");
        setStep("email"); setMessage(text);
    };
    // Any 401 after verification means the 30-minute session ended.
    const handleError = (error) => {
        if (error.status === 401) backToStart("Your session expired. Please verify your email again.");
        else setMessage(error.message);
    };

    const sendCode = async () => {
        if (!EMAIL_PATTERN.test(email.trim())) {
            setMessage("Enter a valid email address, like name@example.com.");
            return;
        }
        setBusy(true); setMessage("");
        try {
            await requestMentorshipCode(email.trim());
            setStep("code");
            setMessage("If this email is registered as a CodeX student and it is yours, you will receive a 6-digit code to access the booking page. It expires in 2 minutes. Didn't get it? Check your spam folder and make sure you used the email you registered with (the one you use in Moodle).");
        } catch (error) {
            setMessage(error.message);
        } finally { setBusy(false); }
    };

    const verify = async () => {
        setBusy(true); setMessage("");
        try {
            const { token: t } = await verifyMentorshipCode(email.trim(), code.trim());
            setToken(t);
            const [info, list] = await Promise.all([getBookingMe(t), getBookableMentors(t)]);
            setMe(info); setMentors(list); setStep("book");
        } catch (error) {
            setMessage(error.status === 401 ? "Invalid or expired code. Request a new one if needed." : error.message);
        } finally { setBusy(false); }
    };

    const chooseMentor = async (m) => {
        setMentor(m); setSlot(null); setDay(""); setSlots([]); setMessage("");
        setBusy(true);
        try {
            const from = new Date(); from.setDate(from.getDate() - 1);
            const to = new Date(); to.setDate(to.getDate() + DAYS_AHEAD - 1);
            const data = await getMentorSlots(token, m.id, toLocalIsoDate(from), toLocalIsoDate(to));
            setSlots(data.slots);
            const first = data.slots[0];
            if (first) setDay(toLocalIsoDate(new Date(first.start)));
        } catch (error) { handleError(error); } finally { setBusy(false); }
    };

    const slotsByDay = useMemo(() => {
        const map = {};
        slots.forEach(s => { (map[toLocalIsoDate(new Date(s.start))] ||= []).push(s); });
        return map;
    }, [slots]);

    const submit = async () => {
        setBusy(true); setMessage("");
        try {
            setBooking(await createBooking(token, mentor.id, slot.start, reason.trim()));
            setStep("done");
        } catch (error) {
            if (error.status === 409) {
                setSlot(null);
                setMessage(`${error.message} Please choose another time.`);
                chooseMentor(mentor);
            } else handleError(error);
        } finally { setBusy(false); }
    };

    const notice = message && (
        <p style={{ fontSize: 15, color: step === "code" && !message.startsWith("Invalid") ? MUTED : ERROR, margin: "12px 0" }}>{message}</p>
    );

    if (step === "email") {
        return (
            <Shell>
                <div style={cardStyle}>
                    <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>Enter the email you use for Moodle</p>
                    <p style={{ fontSize: 14, color: MUTED, marginBottom: 14 }}>We'll send you a verification code.</p>
                    <input style={inputStyle} type="email" autoComplete="email" value={email} placeholder="you@email.com"
                        onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && email.trim() && sendCode()} />
                    {notice}
                    <div style={{ marginTop: 14 }}>
                        <button style={primaryButton(busy || !email.trim())} disabled={busy || !email.trim()} onClick={sendCode}>
                            {busy ? "Sending..." : "Send code"}
                        </button>
                    </div>
                </div>
            </Shell>
        );
    }

    if (step === "code") {
        return (
            <Shell>
                <div style={cardStyle}>
                    <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>Enter your code</p>
                    <input style={{ ...inputStyle, letterSpacing: 6, fontSize: 22, maxWidth: 220 }} inputMode="numeric" maxLength={6}
                        autoComplete="one-time-code" value={code} placeholder="000000"
                        onChange={e => setCode(e.target.value.replace(/\D/g, ""))} onKeyDown={e => e.key === "Enter" && code.length === 6 && verify()} />
                    {notice}
                    <div style={{ marginTop: 14, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                        <button style={primaryButton(busy || code.length !== 6)} disabled={busy || code.length !== 6} onClick={verify}>
                            {busy ? "Verifying..." : "Verify"}
                        </button>
                        <button onClick={sendCode} disabled={busy} style={{ background: "none", border: "none", color: OLIVE, fontFamily: FONT, fontSize: 15, cursor: "pointer" }}>
                            Send a new code
                        </button>
                        <button onClick={() => backToStart("")} style={{ background: "none", border: "none", color: MUTED, fontFamily: FONT, fontSize: 15, cursor: "pointer" }}>
                            Use another email
                        </button>
                    </div>
                </div>
            </Shell>
        );
    }

    if (step === "done") {
        return (
            <Shell>
                <div style={cardStyle}>
                    <p style={{ fontSize: 20, fontWeight: 700, color: OLIVE, marginBottom: 8 }}>You're booked!</p>
                    <p style={{ fontSize: 16, marginBottom: 4 }}>{booking.mentor_name}</p>
                    <p style={{ fontSize: 16, fontWeight: 600 }}>{formatDateTime(booking.start)} ({tz})</p>
                    <p style={{ fontSize: 15, color: MUTED, marginTop: 10 }}>
                        We emailed you a confirmation with a calendar invitation and the link to join. The email also has a link to cancel if you need to.
                    </p>
                    {booking.meeting_platform === "zoom" && (
                        <p style={{ fontSize: 15, color: INK, background: OAT, border: `1px solid ${PEBBLE}`, borderRadius: 8, padding: "10px 14px", marginTop: 12 }}>
                            <strong>Joining by Zoom:</strong> for the best experience, install the Zoom app before the session
                            (zoom.us/download). If you can't, you can join from your browser with Zoom Web.
                        </p>
                    )}
                    <div style={{ marginTop: 16 }}>
                        <button style={primaryButton(false)} onClick={() => { setStep("book"); setSlot(null); setReason(""); setMessage(""); getBookingMe(token).then(setMe).catch(handleError); chooseMentor(mentor); }}>
                            Book another session
                        </button>
                    </div>
                </div>
            </Shell>
        );
    }

    const usedHours = Math.round((me.week_used_minutes / 60) * 10) / 10;
    const limitHours = me.week_limit_minutes / 60;
    const reasonOk = reason.trim().length >= MIN_REASON;

    const availableDays = new Set(Object.keys(slotsByDay));
    const dayLabel = day && new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date(`${day}T00:00:00`));

    return (
        <Shell wide>
            <style>{`
              .bk-grid { display: grid; grid-template-columns: 250px minmax(320px, 1fr); }
              .bk-grid.has-day { grid-template-columns: 250px minmax(320px, 1fr) 210px; }
              .bk-pane { padding: 24px; }
              .bk-pane + .bk-pane { border-left: 1px solid var(--c-border); }
              @media (max-width: 860px) {
                .bk-grid, .bk-grid.has-day { grid-template-columns: 1fr; }
                .bk-pane + .bk-pane { border-left: none; border-top: 1px solid var(--c-border); }
              }
              .bk-time { display: block; width: 100%; height: 46px; margin-bottom: 8px; border: 1px solid var(--c-brand); border-radius: 8px;
                background: var(--c-card); color: var(--c-brand); font: 700 15px var(--font-body); cursor: pointer; transition: background .12s; }
              .bk-time:hover { background: var(--c-brand-pale); }
              .bk-time[aria-pressed="true"] { background: var(--c-brand); color: #fff; }
            `}</style>
            <div style={{ ...cardStyle, marginBottom: 16 }}>
                <p style={{ fontSize: 17, fontWeight: 600 }}>Hello {me.student_name}</p>
                <p style={{ fontSize: 14, color: MUTED }}>{me.cohort} · You can book up to {limitHours} hours per week (this week: {usedHours} h used).</p>
                {me.upcoming.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Your upcoming sessions</p>
                        {me.upcoming.map(b => (
                            <p key={b.id} style={{ fontSize: 14, color: INK }}>{formatDateTime(b.start)} — {b.mentor_name}</p>
                        ))}
                        <p style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>To cancel or reschedule, use the cancel link in your confirmation email, then book a new time here.</p>
                    </div>
                )}
            </div>

            <div style={{ ...cardStyle, marginBottom: 16 }}>
                <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 10 }}>1. Choose who you want to meet</p>
                {mentors.length === 0 && <p style={{ fontSize: 15, color: MUTED }}>No mentors are available for your cohort yet.</p>}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 10 }}>
                    {mentors.map(m => (
                        <button key={m.id} onClick={() => chooseMentor(m)} style={{
                            textAlign: "left", padding: 12, borderRadius: 8, cursor: "pointer", fontFamily: FONT,
                            border: `2px solid ${mentor?.id === m.id ? OLIVE : PEBBLE}`, background: mentor?.id === m.id ? OAT : "var(--c-card)", color: INK,
                        }}>
                            <span style={{ display: "block", fontSize: 16, fontWeight: 600 }}>{m.name}</span>
                            <span style={{ display: "block", fontSize: 13, color: MUTED }}>{ROLE_LABELS[m.role]} · {m.slot_minutes} min · {PLATFORM_LABELS[m.meeting_platform] || "Online"}</span>
                        </button>
                    ))}
                </div>
            </div>

            {mentor && (
                <div style={{ ...cardStyle, padding: 0, overflow: "hidden", marginBottom: 16 }}>
                    <div className={`bk-grid${day ? " has-day" : ""}`}>
                        <div className="bk-pane">
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: MUTED }}>{ROLE_LABELS[mentor.role]}</p>
                            <p style={{ margin: "2px 0 14px", fontSize: 22, fontWeight: 700, color: INK, lineHeight: 1.15 }}>{mentor.name}</p>
                            <p style={{ margin: "0 0 8px", display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: MUTED }}><Clock className="h-4 w-4" /> {mentor.slot_minutes} min session</p>
                            <p style={{ margin: "0 0 8px", display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: MUTED }}><Video className="h-4 w-4" /> {PLATFORM_LABELS[mentor.meeting_platform] || "Online"}, link sent on confirmation</p>
                            <p style={{ margin: 0, display: "flex", alignItems: "flex-start", gap: 8, fontSize: 14, color: MUTED }}><Globe className="h-4 w-4" style={{ flexShrink: 0, marginTop: 2 }} /> Times shown in {tz.replace(/_/g, " ")}</p>
                            <p style={{ margin: "14px 0 0", fontSize: 13, color: MUTED }}>You can book this week and next week.</p>
                        </div>
                        <div className="bk-pane">
                            <p style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 700, color: INK }}>Select a date &amp; time</p>
                            {busy && !slots.length && <p style={{ fontSize: 15, color: MUTED }}>Loading...</p>}
                            {!busy && availableDays.size === 0 && <p style={{ fontSize: 15, color: MUTED }}>No available times in the next two weeks.</p>}
                            {(availableDays.size > 0 || !busy) && (
                                <BookingCalendar key={`${mentor.id}-${slots.length}`} availableDays={availableDays} selectedDay={day}
                                    onSelect={(iso) => { setDay(iso); setSlot(null); }} />
                            )}
                        </div>
                        {day && (
                            <div className="bk-pane">
                                <p style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: INK }}>{dayLabel}</p>
                                <div style={{ maxHeight: 360, overflowY: "auto", paddingRight: 4 }}>
                                    {(slotsByDay[day] || []).map(s => (
                                        <button key={s.start} type="button" className="bk-time" aria-pressed={slot?.start === s.start} onClick={() => setSlot(s)}>
                                            {formatTime(s.start)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {slot && (
                <div style={cardStyle}>
                    <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>2. Why do you want to meet? *</p>
                    <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} maxLength={1000} value={reason}
                        placeholder="Tell your mentor what you need help with (required)" onChange={e => setReason(e.target.value)} />
                    <p style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>
                        {reasonOk ? "" : `At least ${MIN_REASON} characters.`}
                    </p>
                    {notice}
                    <div style={{ marginTop: 10 }}>
                        <button style={primaryButton(busy || !reasonOk)} disabled={busy || !reasonOk} onClick={submit}>
                            {busy ? "Booking..." : `Confirm ${formatTime(slot.start)} with ${mentor.name}`}
                        </button>
                    </div>
                </div>
            )}
            {!slot && notice}
        </Shell>
    );
};
