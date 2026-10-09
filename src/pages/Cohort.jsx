import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye } from "lucide-react";
import Swal from "sweetalert2";
import { Table } from "../components/Table";
import { Modal } from "../components/Modal";
import { DateInput } from "../components/ui/date-input";
import { formatDate } from "../utils/date";
import { getCohorts, createCohort, updateCohort, deleteCohort, getInstructors } from "../services/cohortService";

const EMPTY_FORM = {
    name: "", start_date: "", end_date: "", enrollment_start_date: "",
    enrollment_end_date: "", moodle_course_id: "", instructor: "",
};

const labelStyle = { display: "block", fontSize: 13, fontWeight: 600, color: "#2E2A26", marginBottom: 4 };
const inputStyle = { width: "100%", border: "1px solid #D8CFBC", borderRadius: 8, padding: "8px 10px", fontSize: 14, background: "#fff", color: "#2E2A26" };

export const Cohort = () => {
    const navigate = useNavigate();
    const [cohorts, setCohorts] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const canEdit = (JSON.parse(localStorage.getItem("user_permissions") || "[]")).includes("app.change_cohort");

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
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
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

    const columns = [
        { key: "name", label: "Name" },
        { key: "start_date", label: "Start", render: (v) => formatDate(v) },
        { key: "end_date", label: "End", render: (v) => formatDate(v) },
        { key: "enrollment_end_date", label: "Enrollment Closes", render: (v) => formatDate(v) },
        { key: "status_label", label: "Enrollment" },
        { key: "moodle_course_id", label: "Moodle ID" },
        { key: "instructor_name", label: "Instructor" },
    ];

    return (
        <div className="h-full flex flex-col p-2 w-full">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                <div>
                    <p className="text-2xl font-bold tracking-tight text-codex-texto-primary dark:text-codex-texto-dark-primary">Cohorts</p>
                    <p className="text-sm text-muted-foreground">Create and maintain cohorts, see their students and email them.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold cursor-pointer"
                    style={{ backgroundColor: "#5E6A43", color: "#fff" }}
                >
                    <Plus className="h-4 w-4" /> Add Cohort
                </button>
            </div>

            <div className="bg-brand-oat p-2 rounded-lg shadow flex-1 min-h-0 overflow-hidden flex flex-col">
                <Table
                    data={cohorts}
                    columns={columns}
                    onEdit={canEdit ? openEdit : undefined}
                    onAskDelete={handleDelete}
                    rowActions={[{ label: "Open", icon: Eye, onClick: (row) => navigate(`/cohort/${row.id}`) }]}
                    searchable={true}
                />
                {loading && <p className="text-xs text-gray-500 p-2">Loading...</p>}
            </div>

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
                    <p style={{ fontSize: 12, color: "#6B6459", marginTop: -6 }}>
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
                            style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #D8CFBC", background: "#fff", fontSize: 14 }}>
                            Cancel
                        </button>
                        <button onClick={handleSave} disabled={saving} className="cursor-pointer"
                            style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#5E6A43", color: "#fff", fontSize: 14, fontWeight: 600, opacity: saving ? 0.6 : 1 }}>
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
