// Shared look for the "list of cards" screens (Cohorts, Clients, Services): same pills, buttons,
// inputs and card shell, so a change here changes them all.
export const inputStyle = {
    width: "100%", border: "1px solid var(--c-border)", borderRadius: 8, padding: "8px 10px",
    fontSize: 14, background: "var(--c-card)", color: "var(--c-ink)",
};

export const pillStyle = (active) => ({
    height: 32, padding: "0 14px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer",
    border: `1px solid ${active ? "var(--c-brand)" : "var(--c-border)"}`,
    background: active ? "var(--c-brand)" : "var(--c-card)", color: active ? "var(--c-on-dark)" : "var(--c-muted)",
});

export const cardButton = (primary) => ({
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, height: 36, padding: "0 14px", borderRadius: 8,
    fontSize: 13, fontWeight: 600, cursor: "pointer",
    border: primary ? "none" : "1px solid var(--c-border)", background: primary ? "var(--c-brand)" : "var(--c-card)",
    color: primary ? "var(--c-on-dark)" : "var(--c-ink)",
});

export const cardShell = (accent = "var(--c-brand)") => ({
    display: "flex", flexDirection: "column", gap: 12, padding: 18, borderRadius: 14, background: "var(--c-surface-2)",
    border: "1px solid var(--c-border)", borderTop: `4px solid ${accent}`,
});

export const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 16 };

export const pageInfo = (total, page, pageSize) => {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(page, totalPages);
    return {
        totalPages, currentPage,
        first: total ? (currentPage - 1) * pageSize + 1 : 0,
        last: Math.min(currentPage * pageSize, total),
    };
};

// Slice helper so every screen paginates the same way.
export const paginate = (items, page, pageSize) => {
    const info = pageInfo(items.length, page, pageSize);
    return { ...info, pageItems: items.slice((info.currentPage - 1) * pageSize, info.currentPage * pageSize) };
};

