// A report the assistant produced: optional chart + data table + CSV export.
// Charts are plain SVG/CSS on the brand tokens (no chart library), so they follow light/dark.

// Distinct hues (brand blue first, coral second). Not the accent token: in dark mode it is the same blue as the brand.
const SERIES = ["var(--c-brand)", "var(--c-cta)", "#E0A96D", "#5FB49C", "#B07CC6", "#7C8DB5", "#C9D26B", "#4FC3D9", "#D98BB0", "#8A97AA", "#A5784B", "#6FA06F"];
const fmt = (n) => (Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—");
const cell = (v) => (v === null || v === undefined ? "—" : typeof v === "object" ? JSON.stringify(v) : String(v));

function BarChart({ data, x, y }) {
    const max = Math.max(...data.map(d => d[y]), 0) || 1;
    return (
        <div style={{ display: "grid", gap: 6 }}>
            {data.map((d, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "minmax(70px, 30%) 1fr auto", alignItems: "center", gap: 8, fontSize: 12 }}>
                    <span title={cell(d[x])} style={{ color: "var(--muted-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cell(d[x])}</span>
                    <div style={{ background: "var(--muted)", borderRadius: 5, height: 16 }}>
                        <div style={{ width: `${Math.max((d[y] / max) * 100, 1)}%`, height: "100%", background: SERIES[0], borderRadius: 5 }} />
                    </div>
                    <span style={{ color: "var(--foreground)", fontWeight: 600, minWidth: 34, textAlign: "right" }}>{fmt(d[y])}</span>
                </div>
            ))}
        </div>
    );
}

function LineChart({ data, x, y }) {
    const W = 520, H = 190, L = 44, R = 12, T = 10, B = 28;
    const ys = data.map(d => d[y]);
    const max = Math.max(...ys, 0), min = Math.min(...ys, 0);
    const span = max - min || 1;
    const px = (i) => L + (data.length === 1 ? 0 : (i / (data.length - 1)) * (W - L - R));
    const py = (v) => T + (1 - (v - min) / span) * (H - T - B);
    const ticks = [min, min + span / 2, max];
    const every = Math.ceil(data.length / 8);
    return (
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Line chart" style={{ width: "100%", height: "auto", display: "block" }}>
            {ticks.map((t, i) => (
                <g key={i}>
                    <line x1={L} x2={W - R} y1={py(t)} y2={py(t)} stroke="var(--border)" strokeDasharray="3 3" />
                    <text x={L - 6} y={py(t) + 4} textAnchor="end" fontSize="10" fill="var(--muted-foreground)">{fmt(t)}</text>
                </g>
            ))}
            <polyline fill="none" stroke={SERIES[0]} strokeWidth="2" points={data.map((d, i) => `${px(i)},${py(d[y])}`).join(" ")} />
            {data.map((d, i) => (
                <g key={i}>
                    <circle cx={px(i)} cy={py(d[y])} r="3.5" fill={SERIES[0]}><title>{`${cell(d[x])}: ${fmt(d[y])}`}</title></circle>
                    {i % every === 0 && <text x={px(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="var(--muted-foreground)">{cell(d[x]).slice(0, 10)}</text>}
                </g>
            ))}
        </svg>
    );
}

function PieChart({ data, x, y }) {
    const total = data.reduce((s, d) => s + d[y], 0) || 1;
    const R = 70, C = 80;
    let angle = -Math.PI / 2;
    const slices = data.map((d, i) => {
        const frac = d[y] / total;
        const a0 = angle; angle += frac * 2 * Math.PI;
        const large = frac > 0.5 ? 1 : 0;
        const p = (a) => `${C + R * Math.cos(a)},${C + R * Math.sin(a)}`;
        const path = frac >= 0.9999 ? null : `M${C},${C} L${p(a0)} A${R},${R} 0 ${large} 1 ${p(angle)} Z`;
        return { d, frac, path, color: SERIES[i % SERIES.length] };
    });
    return (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18 }}>
            <svg viewBox="0 0 160 160" role="img" aria-label="Pie chart" style={{ width: 150, height: 150, flexShrink: 0 }}>
                {slices.map((s, i) => s.path
                    ? <path key={i} d={s.path} fill={s.color} stroke="var(--background)" strokeWidth="1.5"><title>{`${cell(s.d[x])}: ${fmt(s.d[y])}`}</title></path>
                    : <circle key={i} cx={C} cy={C} r={R} fill={s.color} />)}
            </svg>
            <div style={{ display: "grid", gap: 5, fontSize: 12, minWidth: 0 }}>
                {slices.map((s, i) => (
                    <span key={i} style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--foreground)" }}>
                        <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cell(s.d[x])}</span>
                        <span style={{ color: "var(--muted-foreground)" }}>{fmt(s.d[y])} · {(s.frac * 100).toFixed(0)}%</span>
                    </span>
                ))}
            </div>
        </div>
    );
}

// Spreadsheet apps run a cell that starts with = + - @ as a formula; the data comes from the
// database, so neutralize those before writing the file.
const csvCell = (v) => {
    let s = v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
};

function exportCsv(title, columns, rows) {
    const lines = [columns.map(csvCell).join(","), ...rows.map(r => columns.map(c => csvCell(r[c])).join(","))];
    const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(title || "report").replace(/[^a-z0-9]+/gi, "_").toLowerCase()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

export function ReportBlock({ report }) {
    const { title, columns = [], rows = [], truncated, row_cap, chart_spec, display = "both" } = report || {};
    if (!columns.length) return null;

    const spec = chart_spec && chart_spec.x && chart_spec.y ? chart_spec : null;
    const data = spec ? rows.map(r => ({ ...r, [spec.y]: Number(r[spec.y]) })).filter(r => Number.isFinite(r[spec.y])) : [];
    const hasChart = data.length > 0;
    // A chart-only request with nothing drawable falls back to the table so the block is never empty.
    const mode = display === "chart" && !hasChart ? "both" : display;
    const showChart = (mode === "chart" || mode === "both") && hasChart;
    const showTable = mode === "table" || mode === "both";
    const Chart = spec?.type === "pie" ? PieChart : spec?.type === "line" ? LineChart : BarChart;

    return (
        <div style={{ marginTop: 12, border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", background: "var(--background)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "9px 12px", background: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title || "Report"}</span>
                <button type="button" onClick={() => exportCsv(title, columns, rows)}
                    style={{ flexShrink: 0, fontSize: 12, fontWeight: 600, color: "var(--c-on-dark)", background: "var(--c-brand)", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}>
                    Export CSV
                </button>
            </div>
            <div style={{ padding: 12, display: "grid", gap: 12 }}>
                {showChart && (
                    <div>
                        {spec.title && <p style={{ margin: "0 0 8px", fontSize: 12.5, fontWeight: 600, color: "var(--foreground)" }}>{spec.title}</p>}
                        <Chart data={data} x={spec.x} y={spec.y} />
                    </div>
                )}
                {showTable && (
                    <div style={{ maxHeight: 320, overflow: "auto", border: "1px solid var(--border)", borderRadius: 8 }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                            <thead>
                                <tr>
                                    {columns.map(c => (
                                        <th key={c} style={{ color: "var(--c-on-dark)", textAlign: "left", padding: "7px 10px", position: "sticky", top: 0, background: "var(--c-brand)", whiteSpace: "nowrap" }}>{c}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r, ri) => (
                                    <tr key={ri} style={{ borderBottom: "1px solid var(--border)" }}>
                                        {columns.map(c => (
                                            <td key={c} style={{ padding: "6px 10px", color: "var(--foreground)", whiteSpace: "nowrap" }}>{cell(r[c])}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {showTable && truncated && (
                    <p style={{ margin: 0, fontSize: 11.5, color: "var(--muted-foreground)" }}>
                        Showing the first {row_cap?.toLocaleString?.() || row_cap} rows. Narrow your request (by date, status, etc.) to see a more specific set.
                    </p>
                )}
            </div>
        </div>
    );
}
