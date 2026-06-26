import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { getEnrollmentPrefill, submitEnrollment } from "../services/enrollmentService";

const BRAND = {
  linen: "#FBF7EF",
  oat: "#F2EBDD",
  pebble: "#D8D2C4",
  olive: "#5E6A43",
  apricot: "#F29B6B",
  ink: "#2E2A26",
  muted: "#6b6560",
  hint: "#9b948e",
};

const STUDENT_TYPES = [
  { value: "scholarship_grant", label: "Scholarship / Grant" },
  { value: "snap",              label: "SNAP" },
  { value: "acap",              label: "Army Credentialing Assistance Program (ACAP)" },
  { value: "privately_funded",  label: "Privately Funded" },
  { value: "other",             label: "Other" },
];

const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  border: `1px solid ${BRAND.pebble}`,
  borderRadius: 4,
  backgroundColor: "#fff",
  color: BRAND.ink,
  fontSize: 14,
  fontFamily: '"Source Sans 3", Arial, sans-serif',
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: BRAND.muted,
  marginBottom: 4,
  fontFamily: '"Source Sans 3", Arial, sans-serif',
};

const sectionTitleStyle = {
  fontSize: 18,
  fontWeight: 700,
  color: BRAND.ink,
  fontFamily: '"Source Sans 3", Arial, sans-serif',
  borderBottom: `2px solid ${BRAND.pebble}`,
  paddingBottom: 8,
  marginBottom: 20,
  marginTop: 32,
};

const fieldRow = { marginBottom: 16 };

export function EnrollmentForm() {
  const { leadId } = useParams();
  const sigRef = useRef(null);

  const [prefill, setPrefill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    student_name: "",
    address: "",
    email: "",
    telephone: "",
    date_of_birth: "",
    program_name: "",
    program_duration: "Part-Time",
    enrollment_start_date: "",
    projected_end_date: "",
    student_type: "",
    other_student_type: "",
    total_tuition: "",
    has_disability: null,
  });

  useEffect(() => {
    getEnrollmentPrefill(leadId)
      .then((data) => {
        setPrefill(data);
        setForm((f) => ({
          ...f,
          student_name: data.student_name || "",
          email: data.email || "",
          telephone: data.telephone || "",
          program_name: data.program_name || "",
          enrollment_start_date: data.initial_date || "",
          projected_end_date: data.projected_end_date || "",
        }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [leadId]);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!form.student_type) {
      setErrors({ student_type: "Please select a student type." });
      return;
    }
    if (sigRef.current?.isEmpty()) {
      setErrors({ student_signature: "Please sign the form before submitting." });
      return;
    }

    const signature = sigRef.current.getTrimmedCanvas().toDataURL("image/png");

    setSubmitting(true);
    try {
      await submitEnrollment(leadId, { ...form, student_signature: signature });
      setSubmitted(true);
    } catch (err) {
      if (err && typeof err === "object" && Object.keys(err).length > 0) {
        setErrors(err);
      } else {
        setErrors({ detail: "Failed to submit. Please check your connection and try again." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: BRAND.linen }}>
        <p style={{ color: BRAND.muted, fontFamily: '"Source Sans 3", Arial, sans-serif' }}>Loading…</p>
      </div>
    );
  }

  if (prefill?.already_signed) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: BRAND.linen, padding: 24 }}>
        <div style={{ backgroundColor: "#fff", border: `1px solid ${BRAND.pebble}`, borderRadius: 8, padding: 48, maxWidth: 520, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
          <p style={{ fontSize: 22, fontWeight: 700, color: BRAND.ink, fontFamily: '"Source Sans 3", Arial, sans-serif', marginBottom: 8 }}>
            Agreement Already Signed
          </p>
          <p style={{ color: BRAND.muted, fontFamily: '"Source Sans 3", Arial, sans-serif' }}>
            Your enrollment agreement has already been submitted. If you have any questions, please contact us at admissions@codex.academy.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: BRAND.linen, padding: 24 }}>
        <div style={{ backgroundColor: "#fff", border: `1px solid ${BRAND.pebble}`, borderRadius: 8, padding: 48, maxWidth: 520, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
          <p style={{ fontSize: 22, fontWeight: 700, color: BRAND.ink, fontFamily: '"Source Sans 3", Arial, sans-serif', marginBottom: 8 }}>
            Enrollment Agreement Submitted
          </p>
          <p style={{ color: BRAND.muted, fontFamily: '"Source Sans 3", Arial, sans-serif' }}>
            Thank you, {form.student_name}. Your signed enrollment agreement has been received. You will receive a confirmation from our team shortly.
          </p>
        </div>
      </div>
    );
  }

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div style={{ backgroundColor: BRAND.linen, minHeight: "100vh", padding: "32px 16px" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: BRAND.ink, fontFamily: '"Source Sans 3", Arial, sans-serif', marginBottom: 4 }}>
            Enrollment Agreement
          </p>
          <p style={{ color: BRAND.muted, fontFamily: '"Source Sans 3", Arial, sans-serif' }}>
            CodeX Academy Technologies, LLC · 2930 Pipkin Hills Drive · Spring Hill, TN 37174<br />
            (615) 266-4847 · Hours: 9:00 a.m. – 5:00 p.m. (Central)
          </p>
        </div>

        {/* Error banner */}
        {hasErrors && (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 6, padding: "12px 16px", marginBottom: 20 }}>
            <p style={{ color: "#b91c1c", fontFamily: '"Source Sans 3", Arial, sans-serif', fontSize: 14, margin: 0 }}>
              {errors.detail || "Please review the errors below and try again."}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ backgroundColor: "#fff", border: `1px solid ${BRAND.pebble}`, borderRadius: 8, padding: 28 }}>

            {/* Student Information */}
            <p style={sectionTitleStyle}>Student Information</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ ...fieldRow, gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Full Name (first &amp; last) *</label>
                <input style={inputStyle} value={form.student_name} onChange={set("student_name")} required />
              </div>
              <div style={{ ...fieldRow, gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Address</label>
                <textarea style={{ ...inputStyle, height: 72, resize: "vertical" }} value={form.address} onChange={set("address")} />
              </div>
              <div style={fieldRow}>
                <label style={labelStyle}>Email Address *</label>
                <input style={inputStyle} type="email" value={form.email} onChange={set("email")} required />
              </div>
              <div style={fieldRow}>
                <label style={labelStyle}>Telephone</label>
                <input style={inputStyle} value={form.telephone} onChange={set("telephone")} />
              </div>
              <div style={fieldRow}>
                <label style={labelStyle}>Date of Birth</label>
                <input style={inputStyle} type="date" value={form.date_of_birth} onChange={set("date_of_birth")} />
              </div>
            </div>

            {/* Program Information */}
            <p style={sectionTitleStyle}>Program Information</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={fieldRow}>
                <label style={labelStyle}>Program Name</label>
                <input style={{ ...inputStyle, backgroundColor: BRAND.oat }} value={form.program_name} readOnly />
              </div>
              <div style={fieldRow}>
                <label style={labelStyle}>Program Duration</label>
                <select style={inputStyle} value={form.program_duration} onChange={set("program_duration")}>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Full-Time">Full-Time</option>
                </select>
              </div>
              <div style={fieldRow}>
                <label style={labelStyle}>Enrollment Start Date</label>
                <input style={{ ...inputStyle, backgroundColor: BRAND.oat }} type="date" value={form.enrollment_start_date} readOnly />
              </div>
              <div style={fieldRow}>
                <label style={labelStyle}>Projected End Date</label>
                <input style={inputStyle} type="date" value={form.projected_end_date} onChange={set("projected_end_date")} />
              </div>
              <div style={{ ...fieldRow, gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Student Type *</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                  {STUDENT_TYPES.map((t) => (
                    <label key={t.value} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: '"Source Sans 3", Arial, sans-serif', fontSize: 14, color: BRAND.ink }}>
                      <input
                        type="radio"
                        name="student_type"
                        value={t.value}
                        checked={form.student_type === t.value}
                        onChange={set("student_type")}
                        style={{ accentColor: BRAND.olive }}
                      />
                      {t.label}
                    </label>
                  ))}
                </div>
                {errors.student_type && (
                  <p style={{ color: "#b91c1c", fontSize: 13, marginTop: 4, fontFamily: '"Source Sans 3", Arial, sans-serif' }}>{errors.student_type}</p>
                )}
              </div>
              {form.student_type === "other" && (
                <div style={{ ...fieldRow, gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Please specify *</label>
                  <input style={inputStyle} value={form.other_student_type} onChange={set("other_student_type")} required />
                </div>
              )}
              {!["scholarship_grant", "snap", "acap"].includes(form.student_type) && (
                <div style={fieldRow}>
                  <label style={labelStyle}>Total Student Tuition Cost</label>
                  <input style={inputStyle} value={form.total_tuition} onChange={set("total_tuition")} placeholder="$" />
                </div>
              )}
            </div>

            {/* Enrollment Agreement Text */}
            <p style={sectionTitleStyle}>Student Enrollment Agreement</p>
            <div style={{ backgroundColor: BRAND.linen, border: `1px solid ${BRAND.pebble}`, borderRadius: 6, padding: 20, fontSize: 13, color: BRAND.ink, fontFamily: '"Source Sans 3", Arial, sans-serif', lineHeight: 1.7, maxHeight: 400, overflowY: "auto" }}>
              <p style={{ fontWeight: 700, marginBottom: 8 }}>Admissions Statement</p>
              <p>Each student is assessed as part of the application process. The admissions staff review each application to determine if the student meets the standards for acceptance. For adult learners, a minimum of a High School Diploma or GED is required for acceptance. General admission acceptance is based on the following criteria:</p>
              <ul>
                <li>Reading Comprehension: Ability to understand and interpret written material.</li>
                <li>General Math Skills: Proficiency in basic mathematical concepts.</li>
                <li>Computer Skills: Existing skills in computer use.</li>
                <li>Commitment: Dedication to the time required for learning.</li>
              </ul>

              <p style={{ fontWeight: 700, marginTop: 16, marginBottom: 8 }}>Course Requirements</p>
              <p>Understanding Requirements: To ensure successful completion of our online course in its virtual environment, it is important to understand the course requirements. Please review all information and materials provided by the CodeX instructor and staff.</p>
              <p><strong>Course Structure:</strong> Familiarize yourself with the structure of the course, including the number of required projects, assignments, assessments, etc.</p>
              <p><strong>Staying Informed:</strong> Stay on top of things by checking the course channels regularly for additional information, tracking your progress on the learner dashboard, and reaching out to the course instructor or the support team (Teacher Assistants, Student Success Coordinators, Mentors, etc.) with questions or concerns.</p>

              <p style={{ fontWeight: 700, marginTop: 16, marginBottom: 8 }}>Use of Artificial Intelligence Tools</p>
              <p>The use of AI tools (e.g., ChatGPT, GitHub Copilot, etc.) to assist with assignments and projects is not recommended. While these tools can offer support, over-reliance on them can limit your ability to fully grasp key coding concepts. If a student is found to have used AI tools on an assignment, they will be allowed <strong>one additional opportunity</strong> to resubmit the work without penalty. If the assignment is submitted a second time and AI usage is identified, the assignment will receive a <strong>grade of 0</strong>.</p>

              <p style={{ fontWeight: 700, marginTop: 16, marginBottom: 8 }}>Course Completion and Failure</p>
              <ul>
                <li>Automatic Enrollment: Upon successful completion of the first Pathway, you will automatically be enrolled in the second Pathway.</li>
                <li>Retake Policy: If you do not complete the first Pathway, you are allowed one retake of the class at the start of the next cohort.</li>
              </ul>

              <p style={{ fontWeight: 700, marginTop: 16, marginBottom: 8 }}>Capstone Project</p>
              <p>At the end of each Pathway, you will create your own project using the skills you have developed. Capstone evaluations are in the form of interviews conducted by professional software developers. You have two chances to pass your capstone project evaluation. If you fail the first time, you will be given instructions on how to improve your project. If you fail the second evaluation, you will not be allowed to progress to the next segment of the program.</p>

              <p style={{ fontWeight: 700, marginTop: 16, marginBottom: 8 }}>Withdrawal Policy</p>
              <ul>
                <li>Early Withdrawal: If you decide to withdraw from the course at the 4-week mark, you may do so with a prorated penalty. This applies to "Privately Funded Students".</li>
                <li>Illness or Emergency: If you need to withdraw due to illness or emergency, notify your instructor or support team as soon as possible.</li>
                <li>Re-enrollment: You may be eligible to re-enroll in a future cohort, subject to approval and applicable financial obligations.</li>
              </ul>

              <p style={{ fontWeight: 700, marginTop: 16, marginBottom: 8 }}>Failure to Progress</p>
              <ul>
                <li>Warning Period: If you're not making satisfactory progress, you may be given a warning period (usually during Pathway 1).</li>
                <li>Suspension: If you're still not meeting expectations after the warning period, you may be suspended with the possibility of future re-enrollment.</li>
              </ul>

              <p style={{ fontWeight: 700, marginTop: 16, marginBottom: 8 }}>Attendance</p>
              <p>Regular attendance and participation are essential for success. Excessive excused or unexcused absences may lead to course withdrawal.</p>

              <p style={{ fontWeight: 700, marginTop: 16, marginBottom: 8 }}>Cohort Transfer Applicability</p>
              <p>This Enrollment Agreement shall remain fully valid and enforceable in the event that the student requests and is approved for a transfer to a different cohort.</p>

              <p style={{ marginTop: 16 }}>Please review this agreement carefully and ensure you understand all the terms and conditions.</p>
            </div>

            {/* Disability accommodation */}
            <p style={{ ...sectionTitleStyle, marginTop: 28 }}>Accommodation</p>
            <p style={{ fontSize: 13, color: BRAND.ink, fontFamily: '"Source Sans 3", Arial, sans-serif', marginBottom: 12 }}>
              Do you have a disability that may require reasonable accommodations to support your success in this course?
            </p>
            <div style={{ display: "flex", gap: 24 }}>
              {[{ label: "Yes", value: true }, { label: "No", value: false }].map((opt) => (
                <label key={String(opt.value)} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: '"Source Sans 3", Arial, sans-serif', fontSize: 14, color: BRAND.ink }}>
                  <input
                    type="radio"
                    name="has_disability"
                    checked={form.has_disability === opt.value}
                    onChange={() => setForm((f) => ({ ...f, has_disability: opt.value }))}
                    style={{ accentColor: BRAND.olive }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>

            {/* Signatures */}
            <p style={{ ...sectionTitleStyle, marginTop: 32 }}>Signatures</p>
            <p style={{ fontSize: 13, color: BRAND.ink, fontFamily: '"Source Sans 3", Arial, sans-serif', marginBottom: 20 }}>
              By my signature, I agree to the conditions of this agreement. I also verify that I have read and received a copy of this agreement and the school catalog.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
              {/* Student signature */}
              <div>
                <label style={labelStyle}>Student Signature *</label>
                <div style={{ border: `1px solid ${BRAND.pebble}`, borderRadius: 4, backgroundColor: "#fff", overflow: "hidden" }}>
                  <SignatureCanvas
                    ref={sigRef}
                    penColor={BRAND.ink}
                    canvasProps={{ width: 340, height: 120, style: { display: "block" } }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => sigRef.current?.clear()}
                  style={{ marginTop: 6, fontSize: 12, color: BRAND.muted, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: '"Source Sans 3", Arial, sans-serif' }}
                >
                  Clear signature
                </button>
                {errors.student_signature && (
                  <p style={{ color: "#b91c1c", fontSize: 13, marginTop: 4, fontFamily: '"Source Sans 3", Arial, sans-serif' }}>{errors.student_signature}</p>
                )}
                <p style={{ fontSize: 12, color: BRAND.hint, marginTop: 4, fontFamily: '"Source Sans 3", Arial, sans-serif' }}>
                  Date: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>

              {/* Institutional representative — static display */}
              <div>
                <label style={labelStyle}>Institutional Representative</label>
                <div style={{ border: `1px solid ${BRAND.pebble}`, borderRadius: 4, backgroundColor: BRAND.oat, padding: "12px 16px", height: 120, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <p style={{ fontSize: 13, color: BRAND.muted, fontFamily: '"Source Sans 3", Arial, sans-serif', margin: 0 }}>Lillian Reina</p>
                  <p style={{ fontSize: 12, color: BRAND.hint, fontFamily: '"Source Sans 3", Arial, sans-serif', margin: "4px 0 0" }}>Signed on file</p>
                </div>
                <p style={{ fontSize: 12, color: BRAND.hint, marginTop: 4, fontFamily: '"Source Sans 3", Arial, sans-serif' }}>
                  Date: June 23, 2026
                </p>
              </div>
            </div>

            {/* Footer note */}
            <p style={{ fontSize: 11, color: BRAND.hint, fontFamily: '"Source Sans 3", Arial, sans-serif', marginTop: 28, fontStyle: "italic" }}>
              CodeX Academy Technologies LLC is authorized by the Tennessee Higher Education Commission. This authorization must be renewed each year and is based on an evaluation of minimum standards concerning quality of education, ethical business practices, and fiscal responsibility.
            </p>

            {/* Submit */}
            <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  backgroundColor: submitting ? BRAND.pebble : BRAND.olive,
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "10px 28px",
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: '"Source Sans 3", Arial, sans-serif',
                  cursor: submitting ? "not-allowed" : "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = "#4a5535"; }}
                onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = BRAND.olive; }}
              >
                {submitting ? "Submitting…" : "Submit Enrollment Agreement"}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
