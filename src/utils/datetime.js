// Formats an ISO instant (e.g. "2026-11-02T15:00:00Z") in the viewer's own
// timezone, or in `timeZone` when given. Used by the mentorship screens, where
// the same moment is shown to people in different timezones.
export function formatDateTime(value, timeZone) {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("en-US", {
        weekday: "short", month: "short", day: "numeric", year: "numeric",
        hour: "numeric", minute: "2-digit", ...(timeZone ? { timeZone } : {}),
    }).format(d);
}

export function formatTime(value, timeZone) {
    const d = new Date(value);
    if (isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric", minute: "2-digit", ...(timeZone ? { timeZone } : {}),
    }).format(d);
}

export function viewerTimeZone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

// YYYY-MM-DD for a Date, using its LOCAL calendar day (not UTC).
export function toLocalIsoDate(d) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
