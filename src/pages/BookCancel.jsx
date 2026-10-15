import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCancelInfo, confirmCancel } from "../services/mentorshipService";
import { formatDateTime, viewerTimeZone } from "../utils/datetime";

const FONT = 'var(--font-body)';
const INK = "var(--c-ink)";
const MUTED = "var(--c-muted)";
const PEBBLE = "var(--c-border)";
const OLIVE = "var(--c-brand)";
const DANGER = "var(--c-danger)";

const buttonStyle = (bg, disabled) => ({
    padding: "10px 22px", borderRadius: 6, border: "none", background: bg, color: "#fff", fontFamily: FONT,
    fontSize: 16, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1,
});

export const BookCancel = () => {
    const { token } = useParams();
    const [info, setInfo] = useState(null);
    const [state, setState] = useState("loading"); // loading | ready | cancelled | missing
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        getCancelInfo(token)
            .then(data => { setInfo(data); setState(data.status === "cancelled" ? "cancelled" : "ready"); })
            .catch(() => setState("missing"));
    }, [token]);

    // Opening this page never cancels anything; only the button below does.
    const cancel = async () => {
        setBusy(true); setError("");
        try {
            await confirmCancel(token);
            setState("cancelled");
        } catch (e) {
            setError(e.message);
        } finally { setBusy(false); }
    };

    return (
        <div style={{ minHeight: "100vh", background: "var(--c-surface)", fontFamily: FONT, color: INK }}>
            <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 16px" }}>
                <img src="/codex-logo.png" alt="CodeX Academy" style={{ height: 72, width: "auto", display: "block", marginBottom: 16 }} />
                <div style={{ background: "var(--c-card)", border: `1px solid ${PEBBLE}`, borderRadius: 10, padding: 20 }}>
                    {state === "loading" && <p style={{ color: MUTED }}>Loading...</p>}
                    {state === "missing" && <p style={{ fontSize: 16 }}>We couldn't find this meeting. The link may be incorrect.</p>}
                    {state === "cancelled" && <p style={{ fontSize: 17, fontWeight: 600 }}>This meeting is cancelled. We emailed you a confirmation.</p>}
                    {state === "ready" && info && (
                        <>
                            <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>You are about to cancel your meeting. Are you sure?</p>
                            <p style={{ fontSize: 16 }}>With {info.mentor_name}</p>
                            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{formatDateTime(info.start)} ({viewerTimeZone()})</p>
                            <p style={{ fontSize: 14, color: MUTED }}>{info.reason}</p>
                            {!info.can_cancel && <p style={{ color: DANGER, marginTop: 12 }}>This meeting has already started and can no longer be cancelled.</p>}
                            {error && <p style={{ color: DANGER, marginTop: 12 }}>{error}</p>}
                            {info.can_cancel && (
                                <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
                                    <button style={buttonStyle(DANGER, busy)} disabled={busy} onClick={cancel}>
                                        {busy ? "Cancelling..." : "Yes, cancel my meeting"}
                                    </button>
                                    <button style={buttonStyle(OLIVE, false)} onClick={() => setState("kept")}>No, keep it</button>
                                </div>
                            )}
                            <p style={{ fontSize: 13, color: MUTED, marginTop: 14 }}>To reschedule, cancel this meeting and book a new time.</p>
                        </>
                    )}
                    {state === "kept" && <p style={{ fontSize: 17, fontWeight: 600 }}>Great, your meeting stays as scheduled. You can close this page.</p>}
                </div>
            </div>
        </div>
    );
};
