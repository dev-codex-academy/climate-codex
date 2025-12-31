import { useAuth } from "@/context/AuthContext";
import { postToken } from "@/services/login";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user || !password) return;

    setLoading(true);

    try {
      const authData = { usuario: user.toUpperCase(), pass: password };
      const res = await postToken(authData);

      if (res?.ok) {
        const data = res.data.usuario;
        const state = data?.estado_pass;

        if (state === 3 || state === 4) {
          setIsModalOpen(true);
          
          return;
        }

        if (state === 1) {
            console.log("entra al 1");
          login(data, res.data.token);
          navigate("/", { replace: true });
        }

        setError("Password state not recognized.");
      } else {
        const msg =
          res?.error?.message || res?.message || "Invalid credentials.";
        setError(msg);

        setUser("");
        setPassword("");
      }
    } catch (err) {
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
    isModalOpen,

    //methods
    handleSubmit,
    setUser,
    setShowPass,
    setPassword,
    setIsModalOpen,
  };
};
