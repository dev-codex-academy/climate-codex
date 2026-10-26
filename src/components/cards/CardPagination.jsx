import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cardButton, inputStyle, pageInfo } from "./cardStyles";

// Page-number window: first, last and the neighbours of the current page, with "…" for the gaps.
const pageNumbers = (totalPages, currentPage) => {
    const nums = [];
    for (let n = 1; n <= totalPages; n++) {
        if (n === 1 || n === totalPages || Math.abs(n - currentPage) <= 1) nums.push(n);
        else if (nums[nums.length - 1] !== "…") nums.push("…");
    }
    return nums;
};

export const PerPage = ({ value, onChange, options = [6, 9, 12, 24] }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--c-muted)" }}>
        Per page
        <select value={value} onChange={e => onChange(Number(e.target.value))} style={{ ...inputStyle, width: 72, height: 36, padding: "0 8px" }}>
            {options.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
    </div>
);

export const CardPagination = ({ total, noun, page, pageSize, onPage }) => {
    const { totalPages, currentPage, first, last } = pageInfo(total, page, pageSize);
    if (total === 0) return null;
    return (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10, paddingTop: 14 }}>
            <p style={{ margin: 0, fontSize: 13, color: "var(--c-muted)" }}>
                <strong style={{ color: "var(--c-ink)" }}>{first}–{last}</strong> of {total} {noun}{total === 1 ? "" : "s"}
            </p>
            <nav aria-label="Pagination" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={() => onPage(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page"
                    style={{ ...cardButton(false), width: 36, padding: 0, opacity: currentPage === 1 ? 0.45 : 1 }}><ChevronLeft className="h-4 w-4" /></button>
                {pageNumbers(totalPages, currentPage).map((n, i) => n === "…"
                    ? <span key={`gap${i}`} style={{ color: "var(--c-hint)", padding: "0 4px" }}>…</span>
                    : <button key={n} onClick={() => onPage(n)} aria-current={n === currentPage ? "page" : undefined}
                        style={{ ...cardButton(n === currentPage), width: 36, padding: 0 }}>{n}</button>)}
                <button onClick={() => onPage(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Next page"
                    style={{ ...cardButton(false), width: 36, padding: 0, opacity: currentPage === totalPages ? 0.45 : 1 }}><ChevronRight className="h-4 w-4" /></button>
            </nav>
        </div>
    );
};
