import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";

// Friendly region names for the first segment of an IANA id ("America/Tegucigalpa").
// America first: it is where most of the academy's mentors and students are.
const REGIONS = [
    ["America", "Americas"], ["Europe", "Europe"], ["Asia", "Asia"], ["Africa", "Africa"],
    ["Pacific", "Pacific"], ["Atlantic", "Atlantic"], ["Indian", "Indian Ocean"],
    ["Australia", "Australia"], ["Antarctica", "Antarctica"], ["Other", "UTC / Other"],
];

const FALLBACK_ZONES = [
    "America/Tegucigalpa", "America/Guatemala", "America/El_Salvador", "America/Mexico_City", "America/Bogota",
    "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/Madrid", "Europe/London", "UTC",
];

const allZones = (() => {
    try {
        return Intl.supportedValuesOf("timeZone");
    } catch {
        return FALLBACK_ZONES;
    }
})();

// "UTC-06:00" for the zone's offset right now (DST-aware).
const offsetLabel = (zone) => {
    try {
        const part = new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "longOffset" })
            .formatToParts(new Date()).find(p => p.type === "timeZoneName")?.value || "GMT";
        return part === "GMT" ? "UTC+00:00" : part.replace("GMT", "UTC");
    } catch {
        return "";
    }
};

const cityOf = (zone) => zone.split("/").slice(1).join(" / ").replace(/_/g, " ") || zone;
const regionKeyOf = (zone) => {
    const head = zone.split("/")[0];
    return REGIONS.some(([key]) => key === head) ? head : "Other";
};

const buildGroups = () => {
    const byRegion = {};
    allZones.forEach(zone => {
        const entry = { zone, city: cityOf(zone), offset: offsetLabel(zone) };
        // Offset in the forms people type: "UTC-06:00", "GMT-06:00", "-6", "-06", "+5:30".
        const m = /([+-])(\d{2}):(\d{2})/.exec(entry.offset);
        const short = m ? `${m[1]}${Number(m[2])}${m[3] === "00" ? "" : `:${m[3]}`}` : "";
        entry.haystack = `${zone} ${entry.city} ${entry.offset} ${entry.offset.replace("UTC", "GMT")} ${short} utc${short} gmt${short}`
            .toLowerCase().replace(/_/g, " ");
        (byRegion[regionKeyOf(zone)] ||= []).push(entry);
    });
    if (!byRegion.Other) byRegion.Other = [];
    if (!byRegion.Other.some(e => e.zone === "UTC")) byRegion.Other.push({ zone: "UTC", city: "UTC", offset: "UTC+00:00", haystack: "utc gmt coordinated universal time" });
    return REGIONS.map(([key, label]) => ({ key, label, items: byRegion[key] || [] })).filter(g => g.items.length);
};

export const TimezoneSelect = ({ value, onChange, disabled = false }) => {
    const groups = useMemo(buildGroups, []);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [active, setActive] = useState(0);
    const wrapperRef = useRef(null);
    const listRef = useRef(null);

    useEffect(() => {
        const close = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    const needle = query.trim().toLowerCase().replace(/_/g, " ");
    const filtered = useMemo(() => groups
        .map(g => ({ ...g, items: needle ? g.items.filter(i => needle.split(/\s+/).every(w => i.haystack.includes(w))) : g.items }))
        .filter(g => g.items.length), [groups, needle]);
    const flat = useMemo(() => filtered.flatMap(g => g.items), [filtered]);

    useEffect(() => { setActive(0); }, [needle]);
    // On open (no search yet) jump to the currently selected zone instead of the top of the list.
    useEffect(() => {
        if (!open) return;
        const idx = flat.findIndex(i => i.zone === value);
        if (idx >= 0) setActive(idx);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);
    useEffect(() => {
        listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
    }, [active]);

    const select = (zone) => { onChange(zone); setOpen(false); setQuery(""); };

    const onKeyDown = (e) => {
        if (e.key === "ArrowDown") { e.preventDefault(); setActive(i => Math.min(i + 1, flat.length - 1)); }
        else if (e.key === "ArrowUp") { e.preventDefault(); setActive(i => Math.max(i - 1, 0)); }
        else if (e.key === "Enter") { e.preventDefault(); if (flat[active]) select(flat[active].zone); }
        else if (e.key === "Escape") { setOpen(false); }
    };

    const border = "1px solid var(--c-border)";
    let index = -1;

    return (
        <div ref={wrapperRef} style={{ position: "relative" }}>
            <button type="button" disabled={disabled} onClick={() => setOpen(o => !o)} className="av-control cursor-pointer"
                style={{ width: "100%", height: 42, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, border, borderRadius: 8, padding: "0 12px", fontSize: 15, background: "var(--c-card)", color: "var(--c-ink)", textAlign: "left" }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {value ? `${cityOf(value)} (${offsetLabel(value)})` : "Select a timezone..."}
                </span>
                <ChevronsUpDown className="h-4 w-4" style={{ opacity: 0.5, flexShrink: 0 }} />
            </button>

            {open && (
                <div style={{ position: "absolute", zIndex: 40, top: "calc(100% + 4px)", left: 0, minWidth: "100%", width: 360, maxWidth: "90vw", background: "var(--c-card)", border, borderRadius: 10, boxShadow: "0 10px 28px rgba(30,47,74,0.18)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderBottom: "1px solid var(--c-divider)" }}>
                        <Search className="h-4 w-4" style={{ opacity: 0.5 }} />
                        <input autoFocus value={query} onChange={e => setQuery(e.target.value)} onKeyDown={onKeyDown}
                            placeholder="Search city, country code or offset (e.g. Tegucigalpa, -6)"
                            style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "var(--c-ink)", background: "transparent" }} />
                    </div>
                    <div ref={listRef} style={{ maxHeight: 280, overflowY: "auto" }}>
                        {flat.length === 0 && <p style={{ padding: 14, fontSize: 13, color: "var(--c-muted)" }}>No timezones match "{query}".</p>}
                        {filtered.map(group => (
                            <div key={group.key}>
                                <p style={{ position: "sticky", top: 0, background: "var(--c-surface-2)", padding: "5px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--c-brand)" }}>
                                    {group.label}
                                </p>
                                {group.items.map(item => {
                                    index += 1;
                                    const i = index;
                                    const selected = item.zone === value;
                                    return (
                                        <div key={item.zone} data-index={i} role="option" aria-selected={selected}
                                            onMouseEnter={() => setActive(i)} onMouseDown={(e) => { e.preventDefault(); select(item.zone); }}
                                            className="cursor-pointer"
                                            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "7px 12px", fontSize: 14, color: "var(--c-ink)", background: i === active ? "var(--c-hover)" : "transparent" }}>
                                            <span style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                                                {selected ? <Check className="h-3.5 w-3.5" style={{ color: "var(--c-brand)", flexShrink: 0 }} /> : <span style={{ width: 14, flexShrink: 0 }} />}
                                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.city}</span>
                                            </span>
                                            <span style={{ fontSize: 12, color: "var(--c-muted)", flexShrink: 0 }}>{item.offset}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
