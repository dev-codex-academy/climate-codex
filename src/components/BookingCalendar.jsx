import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toLocalIsoDate } from "../utils/datetime";

const FONT = "var(--font-body)";
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STYLES = `
.bc-day { position: relative; width: 44px; height: 44px; margin: 0 auto; border: none; border-radius: 50%; background: transparent;
  font: 500 15px ${FONT}; color: var(--c-hint); cursor: default; }
.bc-day[data-available="true"] { background: var(--c-brand-pale); color: var(--c-brand); font-weight: 700; cursor: pointer; transition: background .12s; }
.bc-day[data-available="true"]:hover { background: color-mix(in srgb, var(--c-brand) 22%, transparent); }
.bc-day[aria-pressed="true"] { background: var(--c-brand); color: #fff; }
.bc-day:focus-visible { outline: 2px solid var(--c-brand); outline-offset: 2px; }
.bc-today::after { content: ""; position: absolute; left: 50%; bottom: 5px; width: 4px; height: 4px; margin-left: -2px; border-radius: 50%; background: currentColor; }
.bc-nav { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border: none; border-radius: 50%;
  background: transparent; color: var(--c-brand); cursor: pointer; }
.bc-nav:hover:not(:disabled) { background: var(--c-brand-pale); }
.bc-nav:disabled { color: var(--c-border-strong); cursor: not-allowed; }
`;

const monthStart = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const sameMonth = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

// Month calendar where only the days that have bookable times are clickable (like Calendly).
// `availableDays`: Set of local YYYY-MM-DD. Months the student can navigate: today's month through the
// month of the last available day (or the one two weeks from now, the booking horizon).
export const BookingCalendar = ({ availableDays, selectedDay, onSelect, horizonDays = 14 }) => {
    const today = useMemo(() => new Date(), []);
    const firstMonth = monthStart(today);
    const lastMonth = useMemo(() => {
        const edge = new Date(today); edge.setDate(edge.getDate() + horizonDays);
        let last = monthStart(edge);
        availableDays.forEach(iso => { const m = monthStart(new Date(`${iso}T00:00:00`)); if (m > last) last = m; });
        return last;
    }, [availableDays, today, horizonDays]);

    const firstAvailable = useMemo(() => [...availableDays].sort()[0], [availableDays]);
    const [viewMonth, setViewMonth] = useState(() => (firstAvailable ? monthStart(new Date(`${firstAvailable}T00:00:00`)) : firstMonth));

    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const leading = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayIso = toLocalIsoDate(today);
    const cells = [...Array(leading).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

    const shift = (delta) => setViewMonth(new Date(year, month + delta, 1));
    const title = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(viewMonth);

    return (
        <div style={{ fontFamily: FONT }}>
            <style>{STYLES}</style>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, marginBottom: 14 }}>
                <button type="button" className="bc-nav" aria-label="Previous month" disabled={sameMonth(viewMonth, firstMonth)} onClick={() => shift(-1)}>
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <p style={{ margin: 0, minWidth: 150, textAlign: "center", fontSize: 16, fontWeight: 700, color: "var(--c-ink)" }}>{title}</p>
                <button type="button" className="bc-nav" aria-label="Next month" disabled={sameMonth(viewMonth, lastMonth)} onClick={() => shift(1)}>
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: 6, textAlign: "center" }}>
                {WEEKDAYS.map(d => (
                    <span key={d} style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--c-muted)", paddingBottom: 6 }}>{d}</span>
                ))}
                {cells.map((day, i) => {
                    if (day === null) return <span key={`b${i}`} />;
                    const iso = toLocalIsoDate(new Date(year, month, day));
                    const available = availableDays.has(iso);
                    return (
                        <button key={iso} type="button" disabled={!available}
                            className={`bc-day${iso === todayIso ? " bc-today" : ""}`}
                            data-available={available} aria-pressed={selectedDay === iso}
                            aria-label={`${new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date(year, month, day))}${available ? ", times available" : ", no times available"}`}
                            onClick={() => onSelect(iso)}>
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
