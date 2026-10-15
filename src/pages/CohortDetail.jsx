import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Eye, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { Table } from "../components/Table";
import { Modal } from "../components/Modal";
import { formatDate } from "../utils/date";
import {
    getCohortById, getCohortStudents, previewCohortEmail, sendCohortEmail,
    getCohortEmails, getCohortEmailById,
    getInstructors, getTeachingAssistants, getCohortMentors, addCohortMentor, removeCohortMentor,
} from "../services/cohortService";

const labelStyle = { display: "block", fontSize: 13, fontWeight: 600, color: "var(--c-ink)", marginBottom: 4 };
const inputStyle = { width: "100%", border: "1px solid var(--c-border)", borderRadius: 8, padding: "8px 10px", fontSize: 14, background: "var(--c-card)", color: "var(--c-ink)" };
const cardStyle = { background: "var(--c-card)", border: "1px solid var(--c-border)", borderRadius: 10, padding: 16 };

const STATUS_LABELS = { sent: "Sent", failed: "Failed", no_email: "No email" };
const SOURCE_LABELS = { service: "Service", lead: "Lead (First Class)" };

const Field = ({ label, value }) => (
    <div>
        <p style={{ fontSize: 12, color: "var(--c-muted)" }}>{label}</p>
        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--c-ink)" }}>{value || "—"}</p>
    </div>
);

export const CohortDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cohort, setCohort] = useState(null);
    // Teachers / TAs open only their own cohorts (the API enforces it) and never see student data:
    // Students needs view_service, Communications needs view_cohortemail.
    const permissions = JSON.parse(localStorage.getItem("user_permissions") || "[]");
    const canSeeStudents = permissions.includes("app.view_service");
    const canSeeComms = permissions.includes("app.view_cohortemail");
    const canSeeMentors = permissions.includes("app.view_cohortmentor");
    const [tab, setTab] = useState(canSeeStudents ? "students" : canSeeMentors ? "mentors" : "");
    const [students, setStudents] = useState(null);
    const [emails, setEmails] = useState([]);
    const [openEmail, setOpenEmail] = useState(null);
    const [mentors, setMentors] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [selectedMentor, setSelectedMentor] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [preview, setPreview] = useState(null);
    const [sending, setSending] = useState(false);

    const canSend = permissions.includes("app.add_cohortemail");
    const canManageMentors = permissions.includes("app.add_cohortmentor");

    const load = useCallback(async () => {
        try {
            const [c, s, e] = await Promise.all([
                getCohortById(id),
                canSeeStudents ? getCohortStudents(id) : Promise.resolve(null),
                canSeeComms ? getCohortEmails(id) : Promise.resolve([]),
            ]);
            setCohort(c);
            setStudents(s);
            setEmails(e);
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        }
    }, [id, canSeeStudents, canSeeComms]);

    const loadMentors = useCallback(async () => {
        if (!canSeeMentors) return;
        try {
            setMentors(await getCohortMentors(id));
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        }
    }, [id, canSeeMentors]);

    useEffect(() => { load(); loadMentors(); }, [load, loadMentors]);

    useEffect(() => {
        if (!canManageMentors) return;
        Promise.all([getInstructors(), getTeachingAssistants()])
            .then(([teachers, tas]) => {
                const byId = new Map();
                teachers.forEach(u => byId.set(u.id, { ...u, label: `${u.name} (Teacher)` }));
                tas.forEach(u => { if (!byId.has(u.id)) byId.set(u.id, { ...u, label: `${u.name} (Teaching Assistant)` }); });
                setCandidates([...byId.values()]);
            })
            .catch(error => Swal.fire("Error", error.message, "error"));
    }, [canManageMentors]);

    const handleAddMentor = async () => {
        if (!selectedMentor) return;
        try {
            await addCohortMentor(id, Number(selectedMentor));
            setSelectedMentor("");
            await loadMentors();
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        }
    };

    const handleRemoveMentor = async (row) => {
        const confirm = await Swal.fire({
            title: `Remove ${row.user_name}?`, text: "They will no longer be bookable for this cohort.",
            icon: "warning", showCancelButton: true, confirmButtonText: "Remove",
        });
        if (!confirm.isConfirmed) return;
        try {
            await removeCohortMentor(row.id);
            await loadMentors();
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        }
    };

    const openSendModal = async () => {
        setSubject("");
        setMessage("");
        setPreview(null);
        setModalOpen(true);
        try {
            setPreview(await previewCohortEmail(id));
        } catch (error) {
            Swal.fire("Error", error.message, "error");
            setModalOpen(false);
        }
    };

    const handleSend = async () => {
        if (!subject.trim() || !message.trim()) {
            Swal.fire("Missing data", "Subject and message are required.", "warning");
            return;
        }
        const confirm = await Swal.fire({
            title: `Send to ${preview?.will_send ?? 0} students?`,
            text: "This email can't be recalled once sent.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Send",
        });
        if (!confirm.isConfirmed) return;
        setSending(true);
        try {
            const result = await sendCohortEmail(id, subject.trim(), message.trim());
            setModalOpen(false);
            await load();
            setTab("communications");
            Swal.fire("Done", `Sent: ${result.sent_count} · Failed: ${result.failed_count} · No email: ${result.no_email_count}`,
                result.failed_count ? "warning" : "success");
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        } finally {
            setSending(false);
        }
    };

    const showEmail = async (row) => {
        try {
            setOpenEmail(await getCohortEmailById(row.id));
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        }
    };

    if (!cohort) return <div className="p-4 text-sm text-gray-500">Loading...</div>;

    const studentRows = (students?.students || []).map(s => ({
        ...s,
        source_label: SOURCE_LABELS[s.source],
        email_label: s.email || "— no email —",
    }));
    const studentColumns = [
        { key: "name", label: "Student" },
        { key: "email_label", label: "Email" },
        { key: "source_label", label: "Origin" },
    ];
    const emailColumns = [
        { key: "created_at", label: "Sent", render: (v) => formatDate(v) },
        { key: "subject", label: "Subject" },
        { key: "sent_by", label: "Sent by" },
        { key: "total_recipients", label: "Recipients" },
        { key: "sent_count", label: "Sent" },
        { key: "failed_count", label: "Failed" },
        { key: "no_email_count", label: "No email" },
    ];
    const ROLE_LABELS = { teacher: "Teacher", teaching_assistant: "Teaching Assistant" };
    const mentorRows = mentors.map(m => ({ ...m, role_label: ROLE_LABELS[m.role] }));
    const mentorColumns = [
        { key: "user_name", label: "Name" },
        { key: "user_email", label: "Email" },
        { key: "role_label", label: "Role" },
    ];
    const assignedUserIds = new Set(mentors.map(m => m.user));
    const recipientColumns = [
        { key: "name", label: "Student" },
        { key: "email", label: "Email" },
        { key: "source_label", label: "Origin" },
        { key: "status_label", label: "Status" },
        { key: "error", label: "Error" },
    ];

    const tabButton = (key, label) => (
        <button key={key} onClick={() => { setTab(key); setOpenEmail(null); }} className="cursor-pointer"
            style={{
                padding: "8px 16px", fontSize: 14, fontWeight: 600, background: "none", border: "none",
                borderBottom: tab === key ? "2px solid var(--c-brand)" : "2px solid transparent",
                color: tab === key ? "var(--c-brand)" : "var(--c-muted)",
            }}>
            {label}
        </button>
    );

    return (
        <div className="h-full flex flex-col p-2 w-full gap-3 overflow-y-auto">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate("/cohort")} className="cursor-pointer" style={{ background: "none", border: "none", color: "var(--c-brand)" }} aria-label="Back">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <p className="text-2xl font-bold tracking-tight text-codex-texto-primary dark:text-codex-texto-dark-primary">{cohort.name}</p>
                    <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: cohort.is_active ? "color-mix(in srgb, var(--c-brand) 15%, transparent)" : "var(--c-surface-2)", color: cohort.is_active ? "var(--c-brand)" : "var(--c-muted)" }}>
                        {cohort.is_active ? "Enrollment open" : "Enrollment closed"}
                    </span>
                </div>
                {canSend && (
                    <button onClick={openSendModal} className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold cursor-pointer"
                        style={{ backgroundColor: "var(--c-brand)", color: "#fff" }}>
                        <Mail className="h-4 w-4" /> Send email
                    </button>
                )}
            </div>

            <div style={{ ...cardStyle, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
                <Field label="Start" value={formatDate(cohort.start_date)} />
                <Field label="End" value={formatDate(cohort.end_date)} />
                <Field label="Enrollment opens" value={formatDate(cohort.enrollment_start_date)} />
                <Field label="Enrollment closes" value={formatDate(cohort.enrollment_end_date)} />
                <Field label="Moodle ID" value={cohort.moodle_course_id} />
                {canSeeStudents && <Field label="Students" value={students ? `${students.total} (${students.without_email} without email)` : ""} />}
            </div>

            <div style={{ borderBottom: "1px solid var(--c-border)", display: "flex" }}>
                {canSeeStudents && tabButton("students", "Students")}
                {canSeeMentors && tabButton("mentors", `Mentors (${mentors.length})`)}
                {canSeeComms && tabButton("communications", `Communications (${emails.length})`)}
            </div>

            {canSeeStudents && tab === "students" && (
                <div className="bg-brand-oat p-2 rounded-lg shadow flex-1 min-h-[300px] overflow-hidden flex flex-col">
                    <p style={{ fontSize: 12, color: "var(--c-muted)", padding: "2px 4px 8px" }}>
                        {students?.cohort_started
                            ? "Active Services in this cohort."
                            : "This cohort hasn't started: active Services plus Leads linked to it in the First Class stage."}
                    </p>
                    <Table data={studentRows} columns={studentColumns} searchable={true}
                        onlyRowActions
                        rowActions={[{ label: "View", icon: Eye, onClick: (row) => navigate(row.service ? `/service/${row.service}` : `/lead/${row.lead}`) }]} />
                </div>
            )}

            {canSeeMentors && tab === "mentors" && (
                <div className="bg-brand-oat p-2 rounded-lg shadow flex-1 min-h-[300px] overflow-hidden flex flex-col gap-2">
                    {canManageMentors && (
                        <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "2px 4px" }}>
                            <select style={{ ...inputStyle, maxWidth: 360 }} value={selectedMentor} onChange={e => setSelectedMentor(e.target.value)}>
                                <option value="">Select a teacher or teaching assistant...</option>
                                {candidates.filter(c => !assignedUserIds.has(c.id)).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                            </select>
                            <button onClick={handleAddMentor} disabled={!selectedMentor} className="cursor-pointer"
                                style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--c-brand)", color: "#fff", fontSize: 14, fontWeight: 600, opacity: selectedMentor ? 1 : 0.5 }}>
                                Add
                            </button>
                        </div>
                    )}
                    <Table data={mentorRows} columns={mentorColumns} searchable={true}
                        onlyRowActions
                        rowActions={canManageMentors ? [{ label: "Remove", icon: Trash2, onClick: handleRemoveMentor }] : []} />
                </div>
            )}

            {canSeeComms && tab === "communications" && !openEmail && (
                <div className="bg-brand-oat p-2 rounded-lg shadow flex-1 min-h-[300px] overflow-hidden flex flex-col">
                    <Table data={emails} columns={emailColumns} searchable={true}
                        onlyRowActions
                        rowActions={[{ label: "View detail", icon: Eye, onClick: showEmail }]} />
                </div>
            )}

            {canSeeComms && tab === "communications" && openEmail && (
                <div className="flex flex-col gap-3">
                    <button onClick={() => setOpenEmail(null)} className="cursor-pointer self-start flex items-center gap-1"
                        style={{ background: "none", border: "none", color: "var(--c-brand)", fontSize: 14, fontWeight: 600 }}>
                        <ArrowLeft className="h-4 w-4" /> All communications
                    </button>
                    <div style={cardStyle}>
                        <p style={{ fontSize: 16, fontWeight: 700, color: "var(--c-ink)" }}>{openEmail.subject}</p>
                        <p style={{ fontSize: 12, color: "var(--c-muted)", margin: "2px 0 10px" }}>
                            {formatDate(openEmail.created_at)} · by {openEmail.sent_by} · from {openEmail.from_email} · replies to {openEmail.reply_to}
                        </p>
                        <p style={{ fontSize: 14, whiteSpace: "pre-wrap", color: "var(--c-ink)" }}>{openEmail.message}</p>
                    </div>
                    <div className="bg-brand-oat p-2 rounded-lg shadow min-h-[300px] overflow-hidden flex flex-col">
                        <Table
                            data={openEmail.recipients.map(r => ({ ...r, source_label: SOURCE_LABELS[r.source], status_label: STATUS_LABELS[r.status] }))}
                            columns={recipientColumns} searchable={true} />
                    </div>
                </div>
            )}

            <Modal isOpen={modalOpen} onClose={() => !sending && setModalOpen(false)} title="Send email to cohort" widthClass="sm:w-[620px]">
                <div style={{ display: "grid", gap: 14 }}>
                    <p style={{ fontSize: 13, color: "var(--c-muted)" }}>
                        {preview
                            ? `Will be sent to ${preview.will_send} students individually (${preview.without_email} without an email address are skipped). Replies go to admissions@codex.academy.`
                            : "Counting recipients..."}
                    </p>
                    <div>
                        <label style={labelStyle}>Subject *</label>
                        <input style={inputStyle} value={subject} maxLength={255} onChange={e => setSubject(e.target.value)} />
                    </div>
                    <div>
                        <label style={labelStyle}>Message * <span style={{ fontWeight: 400, color: "var(--c-muted)" }}>(each email opens with "Hello {"{student name}"},")</span></label>
                        <textarea style={{ ...inputStyle, minHeight: 180, resize: "vertical" }} value={message} maxLength={10000} onChange={e => setMessage(e.target.value)} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                        <button onClick={() => setModalOpen(false)} disabled={sending} className="cursor-pointer"
                            style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-card)", fontSize: 14 }}>Cancel</button>
                        <button onClick={handleSend} disabled={sending || !preview || preview.will_send === 0} className="cursor-pointer"
                            style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--c-brand)", color: "#fff", fontSize: 14, fontWeight: 600, opacity: (sending || !preview || preview.will_send === 0) ? 0.5 : 1 }}>
                            {sending ? "Sending..." : "Send"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
