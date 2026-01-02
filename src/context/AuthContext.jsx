import { createContext, useContext, useEffect, useState } from "react";
import { API_URL, getHeaders } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const sessionValidate = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/me/`, {
        method: "GET",
        headers: getHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data); // Data is the user object directly based on docs
        if (data.permissions) {
          localStorage.setItem("user_permissions", JSON.stringify(data.permissions));
        }
      } else {
        // Token invalid or expired
        logout();
      }
    } catch (err) {
      console.error("Error session validation:", err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Al iniciar, validar token si existe
  useEffect(() => {
    sessionValidate();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("auth_token", token);
    setUser(userData);
    if (userData && userData.permissions) {
      localStorage.setItem("user_permissions", JSON.stringify(userData.permissions));
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_permissions");
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
