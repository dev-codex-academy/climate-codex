// Helpers of the monthly mentoring reports (Mentoring Sessions / My Monthly Report).

export const STATUS_LABELS = { scheduled: "Scheduled", completed: "Completed", cancelled: "Cancelled" };

// Current month as "YYYY-MM" in Honduras time — the same month the API defaults to.
export const currentMonth = () => {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Tegucigalpa", year: "numeric", month: "2-digit" })
        .formatToParts(new Date());
    return `${parts.find(p => p.type === "year").value}-${parts.find(p => p.type === "month").value}`;
};

export const shiftMonth = (month, delta) => {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const monthLabel = (month) => {
    const [y, m] = month.split("-").map(Number);
    return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(y, m - 1, 1));
};

export const hours = (minutes) => {
    const h = Math.floor(minutes / 60), m = minutes % 60;
    return h && m ? `${h} h ${m} min` : h ? `${h} h` : `${m} min`;
};
