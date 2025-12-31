import { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const sessionValidate = async () => {
    try {
      const res = await fetch(`${API_URL}/usuario/secure/me`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.usuario);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Error session validation:", err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Al iniciar, consultar al backend si hay sesión activa
  useEffect(() => {
    sessionValidate();
  }, []);

  // El backend ya guarda el token como cookie, solo redireccionamos
  const login = (userLogin) => {
    console.log("Log In function called with user:", userLogin);
    setUser(userLogin);
    sessionValidate();
  };

  // Llamamos al endpoint que limpia la cookie
  const logout = async () => {
    await fetch(`${API_URL}/usuario/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
