import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, BarChart3, Workflow, Users } from "lucide-react";
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

  const fieldsCambiarPass = [
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

    // Validar que las contraseñas coincidan
    if (password !== confirmar_contrasenia) {
      setNotification({
        message: "Las contraseñas no coinciden.",
        type: "warning",
      });

      return;
    }
    const cargarPass = async () => {
      setUser("");
      setPassword("");
      setShowPass(false);
    };

    await handleSaveCrud(
      newPass,
      //patchPassUsuario,
      cargarPass,
      setNotification,
      setIsModalOpen
    );
  };
  return (
    <>
      <div className="relative min-h-screen grid place-items-center bg-gray-50 dark:bg-novo-fondo-secondary">
        <div
          className={cn(
            "w-full max-w-md md:max-w-2xl px-4 md:px-6 lg:px-0",
            className
          )}
          {...props}
        >
          <Card className="overflow-hidden border-border/60 py-0">
            <CardContent className="grid p-0 md:grid-cols-2 md:items-start">
              <form className="p-6 md:p-8" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-7">
                  <div className="flex flex-col items-center text-center md:items-center gap-1">
                    <h1 className="text-2xl font-bold leading-tight">
                      Welcome to{" "}
                      <span className="font-black text-novo-texto-primary dark:text-novo-texto-primary-variante2">CodeX</span>
                    </h1>
                    <p className="text-muted-foreground text-sm ">
                      Please log in to access the system.
                    </p>
                  </div>

                  {error ? (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      {error}
                    </div>
                  ) : null}

                  <div className="grid gap-3">
                    <Label htmlFor="usuario">Username</Label>
                    <Input
                      id="usuario"
                      name="usuario"
                      type="text"
                      placeholder="Enter your username"
                      required
                      value={usuario}
                      onChange={(e) => setUser(e.target.value.toUpperCase())}
                      disabled={loading}
                    />
                  </div>

                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <button
                        type="button"
                        onClick={() => setShowPass((s) => !s)}
                        className="text-xs text-novo-texto-primary dark:text-novo-texto-primary-variante2 hover:underline"
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
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-1 py-5 text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                    bg-novo-fondo-primary dark:bg-novo-fondo-primary-variante2 hover:bg-novo-fondo-primary-variante3 dark:hover:bg-novo-fondo-primary hover:text-novo-texto-on-primary dark:hover:text-novo-texto-on-primary-variante2
                    "
                  >
                    {loading ? "Loading..." : "Login"}
                  </Button>
                </div>
              </form>

              <div className="hidden md:flex relative z-10 h-full w-full p-8 flex-col justify-start gap-7 text-foreground bg-novo-fondo-primary-variante1 dark:bg-novo-fondo-terciario-variante3">
                <div className="space-y-1 text-center md:text-left">
                  <h1 className="text-2xl font-bold leading-tight">
                    Code<span className="text-novo-texto-primary dark:text-novo-texto-primary-variante2 font-black">X</span>
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Intelligent client.
                  </p>
                </div>

                <ul className="grid gap-4 text-xs">
                  <li className="flex items-start gap-3">
                    <Users className="size-5 text-novo-texto-primary dark:text-novo-texto-terciario-variante3 shrink-0" />
                    360° Customer View.
                    All information centralized in one place.
                  </li>
                  <li className="flex items-start gap-3">
                    <BarChart3 className="size-5 text-novo-texto-primary dark:text-novo-texto-terciario-variante3 shrink-0" />
                    Real-time KPIs and Reports.
                    Make better decisions with up-to-date insights.
                  </li>
                  <li className="flex items-start gap-3">
                    <Workflow className="size-5 text-novo-texto-primary dark:text-novo-texto-terciario-variante3 shrink-0" />
                    Task and Process Automation.
                    Save time with automated workflows.
                  </li>
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="size-5 text-novo-texto-primary dark:text-novo-texto-terciario-variante3 shrink-0" />
                    Access Control and Data Security.
                    Control access and data security with custom roles.
                  </li>
                </ul>

                <p className="text-xs text-muted-foreground text-center mt-2">
                  Technology that takes your business to the next level.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance mt-3">
            © {new Date().getFullYear()} CodeX. All rights reserved.
          </div>

          {/* Modal  */}
          <Modal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            title="Change Password"
            widthClass="sm:w-1/2 lg:w-1/3"
          >
            <Form
              fields={fieldsCambiarPass}
              initialValues={{
                password: "",
                confirmar_contrasenia: "",
                usuario: usuario,
              }}
              onSubmit={handlePass}
            />
          </Modal>
        </div>
      </div>

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
