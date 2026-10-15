import { useAuth } from "@/context/AuthContext";
import { postToken, verifyLoginCode, changeTemporaryPassword } from "@/services/login";
import { extractErrorMessage } from "@/services/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("credentials"); // "credentials" | "code" | "change"
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [info, setInfo] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const resetToCredentials = () => {
    setStep("credentials");
    setPassword("");
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!user || !password) return;

    setLoading(true);

    try {
      const authData = { username: user, password: password };
      const res = await postToken(authData);

      if (res?.ok && res?.status === 202) {
        // Credentials are valid — a verification code was emailed to the
        // user. Drop the password from memory now that it's done its job.
        setPassword("");
        setStep("code");
      } else if (res?.status === 403 && res?.data?.code === "password_change_required") {
        // Temporary password from account creation: it stays in memory (still in
        // `password`) only to authorize the change, then the user signs in again.
        setInfo("");
        setStep("change");
      } else {
        const msg = res?.data?.detail || res?.data?.message || res?.status_text || "Invalid credentials.";
        setError(msg);
        setUser("");
        setPassword("");
      }
    } catch (err) {
      console.error(err);
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("The new passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await changeTemporaryPassword({
        username: user,
        current_password: password,
        new_password: newPassword,
      });

      if (res?.ok) {
        // The change does not log in: back to the login form, new password + 2FA.
        setPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setStep("credentials");
        setInfo("Password updated. Please sign in again with your new password.");
      } else if (res?.status === 401) {
        setError("Your temporary password is no longer valid. Go back and sign in again.");
      } else {
        setError(extractErrorMessage(res?.data, "Could not update the password."));
      }
    } catch (err) {
      console.error(err);
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError("");

    if (!code) return;

    setLoading(true);

    try {
      const res = await verifyLoginCode({ username: user, code });

      if (res?.ok && res?.data) {
        // /login/verify/ sets the HttpOnly auth cookie and returns the user
        // data directly in the body (same shape as /me/) — no extra round trip.
        login(res.data);
        navigate("/", { replace: true });
      } else {
        const msg = res?.data?.detail || res?.data?.message || res?.status_text || "Invalid or expired code.";
        setError(msg);
        setCode("");
      }
    } catch (err) {
      console.error(err);
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return {
    //properties
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
    isModalOpen,

    //methods
    handleSubmit,
    handleVerifyCode,
    handleChangePassword,
    resetToCredentials,
    setNewPassword,
    setConfirmPassword,
    setInfo,
    setUser,
    setShowPass,
    setPassword,
    setCode,
    setIsModalOpen,
  };
};
