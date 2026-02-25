import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, BarChart3, Users, GraduationCap, Briefcase, Zap } from "lucide-react";
import { useLogin } from "@/hooks/useLogin";
import { Modal } from "@/components/Modal";
import { Form } from "@/components/Form";
import { Notification } from "@/components/Notification";
import { useState } from "react";
import { handleSaveCrud } from "@/utils/handleOperacion";

export const Login = ({ className, ...props }) => {
  const {
    usuario,
    loading,
    error,
    showPass,
    password,
    handleSubmit,
    setUser,
    setShowPass,
    setPassword,
    isModalOpen,
    setIsModalOpen,
  } = useLogin();

  const [notification, setNotification] = useState(null);

  const changePassFields = [
    {
      name: "usuario",
      label: "Username",
      type: "text",
      placeholder: "Username",
      required: true,
      disabled: true,
    },
    {
      name: "password",
      label: "New Password",
      type: "password",
      placeholder: "Enter your new password",
      required: true,
    },
    {
      name: "confirmar_contrasenia",
      label: "Confirm New Password",
      type: "password",
      placeholder: "Confirm your new password",
      required: true,
    },
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
      setNotification({
        message: "Passwords do not match.",
        type: "warning",
      });
      return;
    }

    const resetForm = async () => {
      setUser("");
      setPassword("");
      setShowPass(false);
    };

    await handleSaveCrud(
      newPass,
      resetForm,
      setNotification,
      setIsModalOpen
    );
  };

  return (
    <>
      <div className="w-full h-screen lg:grid lg:grid-cols-2">
        {/* Left Side: Login Form */}
        <div className="flex items-center justify-center py-12 px-8 bg-background">
          <div className="mx-auto grid w-full max-w-sm gap-6">
            <div className="grid gap-2 text-center">
              <h1 className="text-3xl font-bold tracking-tight">Welcome Back notifications</h1>
              <p className="text-muted-foreground text-sm">
                Enter your credentials to access the <strong>Climate Codex</strong>.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 font-medium">
                  {error}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="usuario">Username</Label>
                <Input
                  id="usuario"
                  type="text"
                  placeholder="Enter your username"
                  required
                  value={usuario}
                  onChange={(e) => setUser(e.target.value)}
                  disabled={loading}
                  className="h-11"
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="text-xs font-medium text-primary hover:underline"
                    tabIndex={-1}
                  >
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="h-11"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full mt-2 h-11 text-base font-semibold transition-all duration-300 hover:shadow-md active:scale-[0.99]"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Logging in...
                  </div>
                ) : (
                  "Login to Dashboard"
                )}
              </Button>
            </form>

            <div className="text-center text-xs text-muted-foreground mt-4 space-x-4">
              <span>© {new Date().getFullYear()} CodeX Academy</span>
              <span className="text-slate-300">|</span>
              <a href="/faq" className="hover:text-primary transition-colors">FAQ</a>
              <span className="text-slate-300">|</span>
              <a href="/api" className="hover:text-primary transition-colors">API Docs</a>
            </div>
          </div>
        </div>

        {/* Right Side: Branding & Features */}
        <div className="hidden lg:flex flex-col relative justify-center p-12 bg-slate-900 text-white overflow-hidden">
          {/* Abstract Background Elements if needed, or just solid color */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

          <div className="relative z-10 max-w-lg mx-auto space-y-12">
            <div className="space-y-4">
              <h2 className="text-4xl font-extrabold tracking-tight">
                Orchestrate your Academy
              </h2>
              <p className="text-lg text-slate-300 leading-relaxed">
                A unified platform to manage Sales, Education, and Operations seamlessly.
              </p>
            </div>

            <div className="grid gap-8">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <Briefcase className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Sales Pipeline</h3>
                  <p className="text-sm text-slate-400">Manage leads and opportunities efficiently from initial contact to closed deal.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <GraduationCap className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Student Success</h3>
                  <p className="text-sm text-slate-400">Track student progress, attendance, and performance across all cohorts.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <Zap className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Unified Operations</h3>
                  <p className="text-sm text-slate-400">Connect Sales, Ops, and Instructors in one real-time workspace.</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-700/50">
              <blockquote className="text-slate-300 italic text-sm">
                "Technology that takes your educational business to the next level."
              </blockquote>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Password Change */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Change Password"
        widthClass="sm:w-1/2 lg:w-1/3"
      >
        <Form
          fields={changePassFields}
          initialValues={{
            password: "",
            confirmar_contrasenia: "",
            usuario: usuario,
          }}
          onSubmit={handlePass}
        />
      </Modal>

      {/* Notification Toast */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
};
