import { createContext, useContext, useMemo, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("secureAlumniToken"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("secureAlumniUser");
    return stored ? JSON.parse(stored) : null;
  });

  const value = useMemo(
    () => ({
      token,
      user,
      setSession(nextToken, nextUser) {
        localStorage.setItem("secureAlumniToken", nextToken);
        localStorage.setItem("secureAlumniUser", JSON.stringify(nextUser));
        setToken(nextToken);
        setUser(nextUser);
      },
      logout() {
        localStorage.removeItem("secureAlumniToken");
        localStorage.removeItem("secureAlumniUser");
        setToken(null);
        setUser(null);
      },
      async refreshUser() {
        const { data } = await api.get("/auth/me");
        localStorage.setItem("secureAlumniUser", JSON.stringify(data.user));
        setUser(data.user);
      }
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
