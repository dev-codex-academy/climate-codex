import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, GraduationCap, Users, ArrowRight } from "lucide-react";
import { useLogin } from "@/hooks/useLogin";
import { Modal } from "@/components/Modal";
import { Form } from "@/components/Form";
import { Notification } from "@/components/Notification";
import { useState } from "react";
import { handleSaveCrud } from "@/utils/handleOperacion";

export const Login = ({ className, ...props }) => {
  const {
    user,
    loading,
    error,
    showPass,
    password,
    code,
    step,
    newPassword,
    confirmPassword,
    info,
    handleSubmit,
    handleVerifyCode,
    handleChangePassword,
    resetToCredentials,
    setUser,
    setShowPass,
    setPassword,
    setCode,
    setNewPassword,
    setConfirmPassword,
    isModalOpen,
    setIsModalOpen,
  } = useLogin();

  const [notification, setNotification] = useState(null);

  const changePassFields = [
    { name: "usuario", label: "Username", type: "text", placeholder: "Username", required: true, disabled: true },
    { name: "password", label: "New Password", type: "password", placeholder: "Enter your new password", required: true },
    { name: "confirmar_contrasenia", label: "Confirm New Password", type: "password", placeholder: "Confirm your new password", required: true },
  ];

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setUser("");
    setPassword("");
    setShowPass(false);
  };

  const handlePass = async (newPass) => {
    const { password, confirmar_contrasenia } = newPass;
    if (password !== confirmar_contrasenia) {
      setNotification({ message: "Passwords do not match.", type: "warning" });
      return;
    }
    const resetForm = async () => { setUser(""); setPassword(""); setShowPass(false); };
    await handleSaveCrud(newPass, resetForm, setNotification, setIsModalOpen);
  };

  return (
    <>
      <div className="w-full h-screen lg:grid lg:grid-cols-2" style={{ fontFamily: 'var(--font-body)' }}>

        {/* Left — Form */}
        <div className="flex items-center justify-center py-12 px-8" style={{ backgroundColor: "var(--c-surface)" }}>
          {/* Green top accent bar */}
          <div className="absolute top-0 left-0 w-1/2 h-1 lg:block hidden" style={{ backgroundColor: "var(--c-brand)" }} />
          <div className="mx-auto grid w-full max-w-sm gap-8">

            {/* Brand mark */}
            <div className="flex flex-col items-center gap-4">
              <img src="/codex-logo.png" alt="CodeX" className="h-24 w-auto" />
              <div className="text-center">
                <h1
                  className="text-3xl font-semibold"
                  style={{ fontFamily: 'var(--font-heading)', color: "var(--c-ink)", letterSpacing: "-0.015em", lineHeight: 1.1 }}
                >
                  Welcome back
                </h1>
                <p className="text-sm mt-1.5" style={{ color: "var(--c-muted)" }}>
                  Sign in to your{" "}
                  <span className="font-bold" style={{ color: "var(--c-brand)" }}>CodeX CRM</span>{" "}
                  workspace
                </p>
              </div>
            </div>

            {/* Form */}
            {step === "credentials" ? (
              <form onSubmit={handleSubmit} className="grid gap-4">
                {info && (
                  <div
                    className="rounded-lg p-3 text-sm"
                    style={{ backgroundColor: "color-mix(in srgb, var(--c-brand) 12%, transparent)", border: "1px solid var(--c-brand)", color: "var(--c-ink)" }}
                  >
                    {info}
                  </div>
                )}
                {error && (
                  <div
                    className="flex items-start gap-2.5 rounded-lg p-3 text-sm"
                    style={{ backgroundColor: "var(--c-cta-pale)", border: "1px solid var(--c-cta)", color: "var(--c-ink)" }}
                  >
                    <span
                      className="mt-0.5 shrink-0 flex h-4 w-4 items-center justify-center rounded-full text-white text-xs font-bold"
                      style={{ backgroundColor: "var(--c-cta)" }}
                    >!</span>
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid gap-1.5">
                  <Label htmlFor="usuario" className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--c-muted)" }}>
                    Username
                  </Label>
                  <Input
                    id="usuario"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder="Enter your username"
                    required
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    disabled={loading}
                    className="h-11 rounded-md transition-all"
                    style={{
                      backgroundColor: "var(--c-card)",
                      border: "1px solid var(--c-border)",
                      color: "var(--c-ink)",
                      fontFamily: 'var(--font-body)',
                    }}
                  />
                </div>

                <div className="grid gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--c-muted)" }}>
                      Password
                    </Label>
                    <button
                      type="button"
                      onClick={() => setShowPass((s) => !s)}
                      className="text-xs font-medium transition-colors"
                      style={{ color: "var(--c-cta)" }}
                      tabIndex={-1}
                    >
                      {showPass ? "Hide" : "Show"}
                    </button>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPass ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="h-11 rounded-md transition-all"
                    style={{
                      backgroundColor: "var(--c-card)",
                      border: "1px solid var(--c-border)",
                      color: "var(--c-ink)",
                      fontFamily: 'var(--font-body)',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1 h-11 rounded-md font-semibold text-sm transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 shadow-sm"
                  style={{
                    backgroundColor: loading ? "var(--c-cta-strong)" : "var(--c-cta)",
                    color: "var(--c-on-dark)",
                    fontFamily: 'var(--font-body)',
                    letterSpacing: "0.02em",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                  onMouseEnter={e => !loading && (e.currentTarget.style.backgroundColor = "var(--c-cta-strong)")}
                  onMouseLeave={e => !loading && (e.currentTarget.style.backgroundColor = "var(--c-cta)")}
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in to Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            ) : step === "change" ? (
              <form onSubmit={handleChangePassword} className="grid gap-4">
                {error && (
                  <div
                    className="flex items-start gap-2.5 rounded-lg p-3 text-sm"
                    style={{ backgroundColor: "var(--c-cta-pale)", border: "1px solid var(--c-cta)", color: "var(--c-ink)" }}
                  >
                    <span
                      className="mt-0.5 shrink-0 flex h-4 w-4 items-center justify-center rounded-full text-white text-xs font-bold"
                      style={{ backgroundColor: "var(--c-cta)" }}
                    >!</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Password managers need a username field in a change-password form to know which
                    account to update; the name above is plain text, which they can't read. */}
                <input type="text" name="username" autoComplete="username" value={user} readOnly hidden />

                <div className="text-sm" style={{ color: "var(--c-muted)" }}>
                  <strong style={{ color: "var(--c-ink)" }}>{user}</strong>, you signed in with a temporary password.
                  Choose a new password to continue. Afterwards you will sign in again with it and a verification code.
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="new-password" className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--c-muted)" }}>
                    New password
                  </Label>
                  <Input
                    id="new-password"
                    name="new-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    required
                    autoFocus
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                    className="h-11 rounded-md transition-all"
                    style={{ backgroundColor: "var(--c-card)", border: "1px solid var(--c-border)", color: "var(--c-ink)", fontFamily: 'var(--font-body)' }}
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="confirm-password" className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--c-muted)" }}>
                    Confirm new password
                  </Label>
                  <Input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Repeat the new password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="h-11 rounded-md transition-all"
                    style={{ backgroundColor: "var(--c-card)", border: "1px solid var(--c-border)", color: "var(--c-ink)", fontFamily: 'var(--font-body)' }}
                  />
                </div>

                <p className="text-xs" style={{ color: "var(--c-muted)" }}>
                  It can't be too common, entirely numeric, or similar to your username or email.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1 h-11 rounded-md font-semibold text-sm transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 shadow-sm"
                  style={{
                    backgroundColor: loading ? "var(--c-cta-strong)" : "var(--c-cta)",
                    color: "var(--c-on-dark)",
                    fontFamily: 'var(--font-body)',
                    letterSpacing: "0.02em",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Saving..." : "Set new password"}
                </button>

                <button
                  type="button"
                  onClick={resetToCredentials}
                  disabled={loading}
                  className="text-xs font-medium text-center"
                  style={{ color: "var(--c-muted)" }}
                >
                  Back to login
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="grid gap-4">
                {error && (
                  <div
                    className="flex items-start gap-2.5 rounded-lg p-3 text-sm"
                    style={{ backgroundColor: "var(--c-cta-pale)", border: "1px solid var(--c-cta)", color: "var(--c-ink)" }}
                  >
                    <span
                      className="mt-0.5 shrink-0 flex h-4 w-4 items-center justify-center rounded-full text-white text-xs font-bold"
                      style={{ backgroundColor: "var(--c-cta)" }}
                    >!</span>
                    <span>{error}</span>
                  </div>
                )}

                <div className="text-sm" style={{ color: "var(--c-muted)" }}>
                  We emailed a verification code to <strong style={{ color: "var(--c-ink)" }}>{user}</strong>'s address.
                  It expires in <strong style={{ color: "var(--c-ink)" }}>1 minute</strong>.
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="code" className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--c-muted)" }}>
                    Verification code
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    required
                    autoFocus
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    disabled={loading}
                    className="h-11 rounded-md transition-all text-center tracking-[0.5em] text-lg"
                    style={{
                      backgroundColor: "var(--c-card)",
                      border: "1px solid var(--c-border)",
                      color: "var(--c-ink)",
                      fontFamily: 'var(--font-body)',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1 h-11 rounded-md font-semibold text-sm transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 shadow-sm"
                  style={{
                    backgroundColor: loading ? "var(--c-cta-strong)" : "var(--c-cta)",
                    color: "var(--c-on-dark)",
                    fontFamily: 'var(--font-body)',
                    letterSpacing: "0.02em",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                  onMouseEnter={e => !loading && (e.currentTarget.style.backgroundColor = "var(--c-cta-strong)")}
                  onMouseLeave={e => !loading && (e.currentTarget.style.backgroundColor = "var(--c-cta)")}
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify code
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetToCredentials}
                  disabled={loading}
                  className="text-xs font-medium text-center"
                  style={{ color: "var(--c-muted)" }}
                >
                  Back to login
                </button>
              </form>
            )}

            <p className="text-center text-xs" style={{ color: "var(--c-border)" }}>
              © {new Date().getFullYear()} Codex Technologies
            </p>
          </div>
        </div>

        {/* Right — Branding */}
        <div
          className="hidden lg:flex flex-col relative justify-center p-14 overflow-hidden"
          style={{ backgroundColor: "var(--c-navy)" }}
        >
          {/* Decorative elements */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, var(--c-navy) 0%, #27406A 50%, #1A2A44 100%)" }} />
          <div className="absolute top-[-60px] right-[-60px] h-72 w-72 rounded-full blur-3xl" style={{ backgroundColor: "color-mix(in srgb, var(--c-brand) 15%, transparent)" }} />
          <div className="absolute bottom-[-40px] left-[-30px] h-56 w-56 rounded-full blur-3xl" style={{ backgroundColor: "color-mix(in srgb, var(--c-cta) 8%, transparent)" }} />

          {/* Subtle grid */}
          <div className="absolute inset-0 opacity-[0.025]" style={{
            backgroundImage: "linear-gradient(color-mix(in srgb, var(--c-surface) 100%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--c-surface) 100%, transparent) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }} />

          <div className="relative z-10 max-w-md mx-auto space-y-10">

            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
              style={{ backgroundColor: "color-mix(in srgb, var(--c-brand) 20%, transparent)", border: "1px solid color-mix(in srgb, var(--c-brand) 40%, transparent)", color: "var(--c-accent)" }}
            >
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: "var(--c-accent)" }} />
              Codex CRM Platform
            </div>

            {/* Hero heading — Cormorant Garamond */}
            <div className="space-y-3">
              <h2
                className="text-5xl font-semibold leading-tight"
                style={{ fontFamily: 'var(--font-heading)', color: "var(--c-on-dark)", letterSpacing: "-0.015em", lineHeight: 1.1 }}
              >
                From enrollment<br />
                <span style={{ color: "var(--c-accent)" }}>to graduation.</span>
              </h2>
              <p className="text-base leading-relaxed" style={{ color: "#B9C7DD", fontFamily: 'var(--font-body)' }}>
                One workspace to enroll students, guide them through their cohort, and support the people who teach them.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-5">
              {[
                { icon: UserPlus, color: "color-mix(in srgb, var(--c-brand) 25%, transparent)", border: "color-mix(in srgb, var(--c-brand) 40%, transparent)", iconColor: "var(--c-accent)", title: "New Enrollments", desc: "Capture every applicant, follow them through the pipeline, and turn them into enrolled students." },
                { icon: GraduationCap, color: "color-mix(in srgb, var(--c-cta) 18%, transparent)", border: "color-mix(in srgb, var(--c-cta) 35%, transparent)", iconColor: "var(--c-cta)", title: "Student Success Management", desc: "Keep each student's cohort, progress, and mentorship sessions in one place, so nobody falls behind." },
                { icon: Users, color: "color-mix(in srgb, var(--c-accent) 18%, transparent)", border: "color-mix(in srgb, var(--c-accent) 35%, transparent)", iconColor: "var(--c-accent)", title: "Instructors and TAs", desc: "Assign teachers and teaching assistants to cohorts and let students book time with them." },
              ].map(({ icon: Icon, color, border, iconColor, title, desc }) => (
                <div key={title} className="flex gap-4 group">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105"
                    style={{ backgroundColor: color, border: `1px solid ${border}` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: iconColor }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: "var(--c-on-dark)", fontFamily: 'var(--font-body)' }}>{title}</h3>
                    <p className="text-sm mt-0.5 leading-relaxed" style={{ color: "#AEBDD6", fontFamily: 'var(--font-body)' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quote */}
            <div className="pt-8" style={{ borderTop: "1px solid color-mix(in srgb, var(--c-surface) 15%, transparent)" }}>
              <blockquote
                className="text-sm leading-relaxed"
                style={{ fontFamily: 'var(--font-heading)', color: "#C4D1E6" }}
              >
                "Real projects, mentorship, and interview prep, so every student graduates with a portfolio that proves what they can build."
              </blockquote>
              <p className="text-xs mt-2 font-semibold uppercase tracking-widest" style={{ color: "var(--c-accent)" }}>
                — CodeX Academy
              </p>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Change Password" widthClass="sm:w-1/2 lg:w-1/3">
        <Form fields={changePassFields} initialValues={{ password: "", confirmar_contrasenia: "", usuario: user }} onSubmit={handlePass} />
      </Modal>

      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}
    </>
  );
};
