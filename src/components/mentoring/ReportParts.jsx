import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { STATUS_LABELS, shiftMonth } from "../../utils/mentoringReport";

// Shared pieces of the monthly mentoring reports (Mentoring Sessions / My Monthly Report).

const FONT = "var(--font-body)";
const INK = "var(--c-ink)";
const MUTED = "var(--c-muted)";
const PEBBLE = "var(--c-border)";
const BRAND = "var(--c-brand)";

const navButton = { height: 36, width: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8,
    border: `1px solid ${PEBBLE}`, background: "var(--c-card)", color: BRAND, cursor: "pointer" };

export const MonthPicker = ({ month, onChange }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button type="button" style={navButton} onClick={() => onChange(shiftMonth(month, -1))} aria-label="Previous month">
            <ChevronLeft size={16} />
        </button>
        <input
            type="month"
            value={month}
            onChange={e => e.target.value && onChange(e.target.value)}
            aria-label="Month"
            style={{ height: 36, padding: "0 10px", borderRadius: 8, border: `1px solid ${PEBBLE}`, background: "var(--c-card)",
                color: INK, font: `600 14px ${FONT}`, colorScheme: "light dark" }}
        />
        <button type="button" style={navButton} onClick={() => onChange(shiftMonth(month, 1))} aria-label="Next month">
            <ChevronRight size={16} />
        </button>
    </div>
);

export const StatCard = ({ label, value, hint }) => (
    <div style={{ background: "var(--c-card)", border: `1px solid ${PEBBLE}`, borderRadius: 12, padding: "12px 16px", minWidth: 130, flex: "1 1 130px" }}>
        <p style={{ margin: 0, fontFamily: FONT, fontSize: 12, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</p>
        <p style={{ margin: "4px 0 0", fontFamily: FONT, fontSize: 24, fontWeight: 800, color: INK }}>{value}</p>
        {hint && <p style={{ margin: "2px 0 0", fontFamily: FONT, fontSize: 12, color: MUTED }}>{hint}</p>}
    </div>
);

export const EmptyState = ({ icon: Icon, title, children }) => (
    <div style={{ border: `1.5px dashed ${PEBBLE}`, borderRadius: 12, padding: "32px 20px", textAlign: "center", background: "var(--c-surface)" }}>
        {Icon && <Icon size={28} style={{ color: MUTED, margin: "0 auto 8px" }} />}
        <p style={{ margin: 0, fontFamily: FONT, fontSize: 15, fontWeight: 700, color: INK }}>{title}</p>
        {children && <p style={{ margin: "6px auto 0", maxWidth: 460, fontFamily: FONT, fontSize: 13.5, color: MUTED }}>{children}</p>}
    </div>
);

export const StatusPill = ({ status }) => {
    const tones = {
        scheduled: { background: "var(--c-brand-pale)", color: BRAND },
        completed: { background: "color-mix(in srgb, #5FB49C 22%, transparent)", color: INK },
        cancelled: { background: "var(--c-surface-2)", color: MUTED },
    }[status] || { background: "var(--c-surface-2)", color: MUTED };
    return (
        <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 999, fontFamily: FONT, fontSize: 12, fontWeight: 700, ...tones }}>
            {STATUS_LABELS[status] || status}
        </span>
    );
};
