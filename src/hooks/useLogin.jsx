import { useAuth } from "@/context/AuthContext";
import { postToken } from "@/services/login";
import { API_URL } from "@/services/api";
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
      const authData = { username: user, password: password };
      const res = await postToken(authData);

      if (res?.ok && res?.data?.token) {
        const token = res.data.token;

        try {
          const userResponse = await fetch(`${API_URL}/me/`, {
            method: "GET",
            headers: {
              'Content-Type': "application/json",
              'Authorization': `Token ${token}`
            }
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            login(token, userData);
            navigate("/", { replace: true });
          } else {
            setError("Error fetching user permissions.");
          }
        } catch (error) {
          console.error(error);
          setError("Error validating session.");
        }

      } else {
        const msg = res?.data?.message || res?.status_text || "Invalid credentials.";
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
