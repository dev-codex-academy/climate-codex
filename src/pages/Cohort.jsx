import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Pencil, Trash2, Search, CalendarDays, Hash, UserRound, ChevronLeft, ChevronRight } from "lucide-react";
import Swal from "sweetalert2";
import { Modal } from "../components/Modal";
import { DateInput } from "../components/ui/date-input";
import { formatDate } from "../utils/date";
import { getCohorts, createCohort, updateCohort, deleteCohort, getInstructors } from "../services/cohortService";

const EMPTY_FORM = {
    name: "", start_date: "", end_date: "", enrollment_start_date: "",
    enrollment_end_date: "", moodle_course_id: "", instructor: "",
};

const labelStyle = { display: "block", fontSize: 13, fontWeight: 600, color: "var(--c-ink)", marginBottom: 4 };
const inputStyle = { width: "100%", border: "1px solid var(--c-border)", borderRadius: 8, padding: "8px 10px", fontSize: 14, background: "var(--c-card)", color: "var(--c-ink)" };

export const Cohort = () => {
    const navigate = useNavigate();
    const [cohorts, setCohorts] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const permissions = JSON.parse(localStorage.getItem("user_permissions") || "[]");
    const canAdd = permissions.includes("app.add_cohort");
    const canEdit = permissions.includes("app.change_cohort");
    const canDelete = permissions.includes("app.delete_cohort");
    // A viewer without change rights (teachers / TAs) only receives the cohorts that belong to them.
    const isOwnListOnly = !canEdit && !canAdd;

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all"); // all | open | closed
    const [pageSize, setPageSize] = useState(9);
    const [page, setPage] = useState(1);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cohortData, instructorData] = await Promise.all([getCohorts(), getInstructors().catch(() => [])]);
            setCohorts(cohortData.map(c => ({
                ...c,
                instructor_name: instructorData.find(i => i.id === c.instructor)?.name || "",
                status_label: c.is_active ? "Open" : "Closed",
            })));
            setInstructors(instructorData);
        } catch (error) {
            console.error("Error fetching cohorts", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setModalOpen(true); };
    const openEdit = (cohort) => {
        setEditingId(cohort.id);
        setForm({
            name: cohort.name || "", start_date: cohort.start_date || "", end_date: cohort.end_date || "",
            enrollment_start_date: cohort.enrollment_start_date || "", enrollment_end_date: cohort.enrollment_end_date || "",
            moodle_course_id: cohort.moodle_course_id || "", instructor: cohort.instructor ? String(cohort.instructor) : "",
        });
        setModalOpen(true);
    };
    const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    const handleSave = async () => {
        if (!form.name.trim() || !form.start_date || !form.end_date) {
            Swal.fire("Missing data", "Name, start date and end date are required.", "warning");
            return;
        }
        setSaving(true);
        const payload = {
            name: form.name.trim(),
            start_date: form.start_date,
            end_date: form.end_date,
            enrollment_start_date: form.enrollment_start_date || null,
            enrollment_end_date: form.enrollment_end_date || null,
            moodle_course_id: form.moodle_course_id.trim() || null,
            instructor: form.instructor ? Number(form.instructor) : null,
        };
        try {
            if (editingId) await updateCohort(editingId, payload);
            else await createCohort(payload);
            setModalOpen(false);
            fetchData();
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (cohort) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: `Cohort "${cohort.name}" will be deleted.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "var(--c-brand)",
            cancelButtonColor: "var(--c-cta)",
            confirmButtonText: "Yes, delete it!",
        });
        if (!result.isConfirmed) return;
        try {
            await deleteCohort(cohort.id);
            fetchData();
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        }
    };

    const needle = search.trim().toLowerCase();
    const filtered = cohorts.filter(c => {
        if (statusFilter === "open" && !c.is_active) return false;
        if (statusFilter === "closed" && c.is_active) return false;
        if (!needle) return true;
        return [c.name, c.moodle_course_id, c.instructor_name].some(v => String(v || "").toLowerCase().includes(needle));
    });
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const firstShown = filtered.length ? (currentPage - 1) * pageSize + 1 : 0;
    const lastShown = Math.min(currentPage * pageSize, filtered.length);

    const pageNumbers = (() => {
        const nums = [];
        for (let n = 1; n <= totalPages; n++) {
            if (n === 1 || n === totalPages || Math.abs(n - currentPage) <= 1) nums.push(n);
            else if (nums[nums.length - 1] !== "…") nums.push("…");
        }
        return nums;
    })();

    const pillStyle = (active) => ({
        height: 32, padding: "0 14px", borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: "pointer",
        border: `1px solid ${active ? "var(--c-brand)" : "var(--c-border)"}`,
        background: active ? "var(--c-brand)" : "var(--c-card)", color: active ? "#fff" : "var(--c-muted)",
    });
    const cardButton = (primary) => ({
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, height: 36, padding: "0 14px", borderRadius: 8,
        fontSize: 13, fontWeight: 600, cursor: "pointer",
        border: primary ? "none" : "1px solid var(--c-border)", background: primary ? "var(--c-brand)" : "var(--c-card)",
        color: primary ? "#fff" : "var(--c-ink)",
    });

    const InfoRow = ({ icon: Icon, label, value }) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--c-muted)", minWidth: 0 }}>
            <Icon className="h-3.5 w-3.5" style={{ flexShrink: 0 }} />
            <span style={{ flexShrink: 0 }}>{label}</span>
            <span style={{ color: "var(--c-ink)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value || "—"}</span>
        </div>
    );

    return (
        <div className="h-full flex flex-col p-2 w-full">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                <div>
                    <p className="text-2xl font-bold tracking-tight text-codex-texto-primary dark:text-codex-texto-dark-primary">{isOwnListOnly ? "My Cohorts" : "Cohorts"}</p>
                    <p className="text-sm text-muted-foreground">
                        {isOwnListOnly ? "The cohorts you teach or assist." : "Create and maintain cohorts, see their students and email them."}
                    </p>
                </div>
                {canAdd && (
                    <button onClick={openCreate} className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold cursor-pointer"
                        style={{ backgroundColor: "var(--c-brand)", color: "#fff" }}>
                        <Plus className="h-4 w-4" /> Add Cohort
                    </button>
                )}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ position: "relative", width: 280, maxWidth: "100%" }}>
                    <Search className="h-4 w-4" style={{ position: "absolute", left: 11, top: 11, color: "var(--c-hint)" }} />
                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name, Moodle ID or instructor"
                        style={{ ...inputStyle, paddingLeft: 34, height: 38 }} />
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                    {[["all", "All"], ["open", "Enrollment open"], ["closed", "Closed"]].map(([key, label]) => (
                        <button key={key} onClick={() => { setStatusFilter(key); setPage(1); }} style={pillStyle(statusFilter === key)}>{label}</button>
                    ))}
                </div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--c-muted)" }}>
                    Per page
                    <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} style={{ ...inputStyle, width: 72, height: 36, padding: "0 8px" }}>
                        {[6, 9, 12, 24].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
                {loading && <p className="text-sm text-gray-500 p-2">Loading...</p>}
                {!loading && filtered.length === 0 && (
                    <div style={{ padding: 40, textAlign: "center", color: "var(--c-muted)", fontSize: 14, border: "1px dashed var(--c-border)", borderRadius: 12 }}>
                        {cohorts.length === 0
                            ? (isOwnListOnly ? "You are not assigned to any cohort yet." : "No cohorts yet.")
                            : "No cohorts match your search."}
                    </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 16 }}>
                    {pageItems.map(c => (
                        <article key={c.id} style={{ display: "flex", flexDirection: "column", gap: 14, padding: 18, borderRadius: 14, background: "var(--c-surface-2)",
                            border: "1px solid var(--c-border)", borderTop: `4px solid ${c.is_active ? "var(--c-brand)" : "var(--c-border-strong)"}` }}>
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                                <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--c-ink)", lineHeight: 1.2 }}>{c.name}</p>
                                <span style={{ flexShrink: 0, padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase",
                                    background: c.is_active ? "var(--c-brand-pale)" : "var(--c-card)", color: c.is_active ? "var(--c-brand)" : "var(--c-muted)",
                                    border: `1px solid ${c.is_active ? "var(--c-brand)" : "var(--c-border)"}` }}>
                                    {c.is_active ? "Enrollment open" : "Closed"}
                                </span>
                            </div>
                            <div style={{ display: "grid", gap: 7 }}>
                                <InfoRow icon={CalendarDays} label="Classes" value={`${formatDate(c.start_date)} – ${formatDate(c.end_date)}`} />
                                <InfoRow icon={CalendarDays} label="Enrollment closes" value={formatDate(c.enrollment_end_date)} />
                                <InfoRow icon={Hash} label="Moodle ID" value={c.moodle_course_id} />
                                <InfoRow icon={UserRound} label="Instructor" value={c.instructor_name} />
                            </div>
                            <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                                <button onClick={() => navigate(`/cohort/${c.id}`)} style={{ ...cardButton(true), flex: 1 }}>
                                    <Eye className="h-4 w-4" /> View
                                </button>
                                {canEdit && (
                                    <button onClick={() => openEdit(c)} style={cardButton(false)} aria-label={`Edit ${c.name}`}>
                                        <Pencil className="h-4 w-4" /> Edit
                                    </button>
                                )}
                                {canDelete && (
                                    <button onClick={() => handleDelete(c)} style={{ ...cardButton(false), color: "var(--c-danger)", padding: "0 11px" }} aria-label={`Delete ${c.name}`}>
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            </div>

            {filtered.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10, paddingTop: 14 }}>
                    <p style={{ margin: 0, fontSize: 13, color: "var(--c-muted)" }}>
                        <strong style={{ color: "var(--c-ink)" }}>{firstShown}–{lastShown}</strong> of {filtered.length} cohort{filtered.length === 1 ? "" : "s"}
                    </p>
                    <nav aria-label="Pagination" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page"
                            style={{ ...cardButton(false), width: 36, padding: 0, opacity: currentPage === 1 ? 0.45 : 1 }}><ChevronLeft className="h-4 w-4" /></button>
                        {pageNumbers.map((n, i) => n === "…"
                            ? <span key={`gap${i}`} style={{ color: "var(--c-hint)", padding: "0 4px" }}>…</span>
                            : <button key={n} onClick={() => setPage(n)} aria-current={n === currentPage ? "page" : undefined}
                                style={{ ...cardButton(n === currentPage), width: 36, padding: 0 }}>{n}</button>)}
                        <button onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Next page"
                            style={{ ...cardButton(false), width: 36, padding: 0, opacity: currentPage === totalPages ? 0.45 : 1 }}><ChevronRight className="h-4 w-4" /></button>
                    </nav>
                </div>
            )}

            <Modal isOpen={modalOpen} onClose={() => !saving && setModalOpen(false)} title={editingId ? "Edit Cohort" : "New Cohort"} widthClass="sm:w-[560px]">
                <div style={{ display: "grid", gap: 14 }}>
                    <div>
                        <label style={labelStyle}>Name *</label>
                        <input style={inputStyle} value={form.name} onChange={e => setField("name", e.target.value)} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <div>
                            <label style={labelStyle}>Start date *</label>
                            <DateInput value={form.start_date} onChange={e => setField("start_date", e.target.value)} />
                        </div>
                        <div>
                            <label style={labelStyle}>End date *</label>
                            <DateInput value={form.end_date} onChange={e => setField("end_date", e.target.value)} />
                        </div>
                        <div>
                            <label style={labelStyle}>Enrollment opens</label>
                            <DateInput value={form.enrollment_start_date} onChange={e => setField("enrollment_start_date", e.target.value)} />
                        </div>
                        <div>
                            <label style={labelStyle}>Enrollment closes</label>
                            <DateInput value={form.enrollment_end_date} onChange={e => setField("enrollment_end_date", e.target.value)} />
                        </div>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--c-muted)", marginTop: -6 }}>
                        A cohort without an enrollment close date counts as closed and can't be assigned to Leads.
                    </p>
                    <div>
                        <label style={labelStyle}>Moodle course ID</label>
                        <input style={inputStyle} value={form.moodle_course_id} onChange={e => setField("moodle_course_id", e.target.value)} />
                    </div>
                    <div>
                        <label style={labelStyle}>Instructor</label>
                        <select style={inputStyle} value={form.instructor} onChange={e => setField("instructor", e.target.value)}>
                            <option value="">— None —</option>
                            {instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
                        <button onClick={() => setModalOpen(false)} disabled={saving} className="cursor-pointer"
                            style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-card)", fontSize: 14 }}>
                            Cancel
                        </button>
                        <button onClick={handleSave} disabled={saving} className="cursor-pointer"
                            style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--c-brand)", color: "#fff", fontSize: 14, fontWeight: 600, opacity: saving ? 0.6 : 1 }}>
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
