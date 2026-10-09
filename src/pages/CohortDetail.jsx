import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Eye } from "lucide-react";
import Swal from "sweetalert2";
import { Table } from "../components/Table";
import { Modal } from "../components/Modal";
import { formatDate } from "../utils/date";
import {
    getCohortById, getCohortStudents, previewCohortEmail, sendCohortEmail,
    getCohortEmails, getCohortEmailById,
} from "../services/cohortService";

const labelStyle = { display: "block", fontSize: 13, fontWeight: 600, color: "#2E2A26", marginBottom: 4 };
const inputStyle = { width: "100%", border: "1px solid #D8CFBC", borderRadius: 8, padding: "8px 10px", fontSize: 14, background: "#fff", color: "#2E2A26" };
const cardStyle = { background: "#fff", border: "1px solid #D8CFBC", borderRadius: 10, padding: 16 };

const STATUS_LABELS = { sent: "Sent", failed: "Failed", no_email: "No email" };
const SOURCE_LABELS = { service: "Service", lead: "Lead (First Class)" };

const Field = ({ label, value }) => (
    <div>
        <p style={{ fontSize: 12, color: "#6B6459" }}>{label}</p>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#2E2A26" }}>{value || "—"}</p>
    </div>
);

export const CohortDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cohort, setCohort] = useState(null);
    const [tab, setTab] = useState("students");
    const [students, setStudents] = useState(null);
    const [emails, setEmails] = useState([]);
    const [openEmail, setOpenEmail] = useState(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [preview, setPreview] = useState(null);
    const [sending, setSending] = useState(false);

    const canSend = (JSON.parse(localStorage.getItem("user_permissions") || "[]")).includes("app.add_cohortemail");

    const load = useCallback(async () => {
        try {
            const [c, s, e] = await Promise.all([getCohortById(id), getCohortStudents(id), getCohortEmails(id)]);
            setCohort(c);
            setStudents(s);
            setEmails(e);
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

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
                borderBottom: tab === key ? "2px solid #5E6A43" : "2px solid transparent",
                color: tab === key ? "#5E6A43" : "#6B6459",
            }}>
            {label}
        </button>
    );

    return (
        <div className="h-full flex flex-col p-2 w-full gap-3 overflow-y-auto">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate("/cohort")} className="cursor-pointer" style={{ background: "none", border: "none", color: "#5E6A43" }} aria-label="Back">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <p className="text-2xl font-bold tracking-tight text-codex-texto-primary dark:text-codex-texto-dark-primary">{cohort.name}</p>
                    <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: cohort.is_active ? "rgba(94,106,67,0.15)" : "#E7E1D4", color: cohort.is_active ? "#5E6A43" : "#6B6459" }}>
                        {cohort.is_active ? "Enrollment open" : "Enrollment closed"}
                    </span>
                </div>
                {canSend && (
                    <button onClick={openSendModal} className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold cursor-pointer"
                        style={{ backgroundColor: "#5E6A43", color: "#fff" }}>
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
                <Field label="Students" value={students ? `${students.total} (${students.without_email} without email)` : ""} />
            </div>

            <div style={{ borderBottom: "1px solid #D8CFBC", display: "flex" }}>
                {tabButton("students", "Students")}
                {tabButton("communications", `Communications (${emails.length})`)}
            </div>

            {tab === "students" && (
                <div className="bg-brand-oat p-2 rounded-lg shadow flex-1 min-h-[300px] overflow-hidden flex flex-col">
                    <p style={{ fontSize: 12, color: "#6B6459", padding: "2px 4px 8px" }}>
                        {students?.cohort_started
                            ? "Active Services in this cohort."
                            : "This cohort hasn't started: active Services plus Leads linked to it in the First Class stage."}
                    </p>
                    <Table data={studentRows} columns={studentColumns} searchable={true}
                        onlyRowActions
                        rowActions={[{ label: "View", icon: Eye, onClick: (row) => navigate(row.service ? `/service/${row.service}` : `/lead/${row.lead}`) }]} />
                </div>
            )}

            {tab === "communications" && !openEmail && (
                <div className="bg-brand-oat p-2 rounded-lg shadow flex-1 min-h-[300px] overflow-hidden flex flex-col">
                    <Table data={emails} columns={emailColumns} searchable={true}
                        onlyRowActions
                        rowActions={[{ label: "View detail", icon: Eye, onClick: showEmail }]} />
                </div>
            )}

            {tab === "communications" && openEmail && (
                <div className="flex flex-col gap-3">
                    <button onClick={() => setOpenEmail(null)} className="cursor-pointer self-start flex items-center gap-1"
                        style={{ background: "none", border: "none", color: "#5E6A43", fontSize: 14, fontWeight: 600 }}>
                        <ArrowLeft className="h-4 w-4" /> All communications
                    </button>
                    <div style={cardStyle}>
                        <p style={{ fontSize: 16, fontWeight: 700, color: "#2E2A26" }}>{openEmail.subject}</p>
                        <p style={{ fontSize: 12, color: "#6B6459", margin: "2px 0 10px" }}>
                            {formatDate(openEmail.created_at)} · by {openEmail.sent_by} · from {openEmail.from_email} · replies to {openEmail.reply_to}
                        </p>
                        <p style={{ fontSize: 14, whiteSpace: "pre-wrap", color: "#2E2A26" }}>{openEmail.message}</p>
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
                    <p style={{ fontSize: 13, color: "#6B6459" }}>
                        {preview
                            ? `Will be sent to ${preview.will_send} students individually (${preview.without_email} without an email address are skipped). Replies go to admissions@codex.academy.`
                            : "Counting recipients..."}
                    </p>
                    <div>
                        <label style={labelStyle}>Subject *</label>
                        <input style={inputStyle} value={subject} maxLength={255} onChange={e => setSubject(e.target.value)} />
                    </div>
                    <div>
                        <label style={labelStyle}>Message * <span style={{ fontWeight: 400, color: "#6B6459" }}>(each email opens with "Hello {"{student name}"},")</span></label>
                        <textarea style={{ ...inputStyle, minHeight: 180, resize: "vertical" }} value={message} maxLength={10000} onChange={e => setMessage(e.target.value)} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                        <button onClick={() => setModalOpen(false)} disabled={sending} className="cursor-pointer"
                            style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #D8CFBC", background: "#fff", fontSize: 14 }}>Cancel</button>
                        <button onClick={handleSend} disabled={sending || !preview || preview.will_send === 0} className="cursor-pointer"
                            style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#5E6A43", color: "#fff", fontSize: 14, fontWeight: 600, opacity: (sending || !preview || preview.will_send === 0) ? 0.5 : 1 }}>
                            {sending ? "Sending..." : "Send"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
