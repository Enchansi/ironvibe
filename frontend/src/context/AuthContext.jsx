import { createContext, useContext, useEffect, useState } from "react";
import { api, formatApiError } from "../lib/api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("iv_token");
    if (!token) { setUser(false); return; }
    api.get("/auth/me")
      .then((r) => setUser(r.data))
      .catch(() => { localStorage.removeItem("iv_token"); setUser(false); });
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("iv_token", data.token);
      setUser(data.user);
      return { ok: true };
    } catch (e) { return { ok: false, error: formatApiError(e) }; }
  };

  const register = async (email, username, password) => {
    try {
      const { data } = await api.post("/auth/register", { email, username, password });
      localStorage.setItem("iv_token", data.token);
      setUser(data.user);
      return { ok: true };
    } catch (e) { return { ok: false, error: formatApiError(e) }; }
  };

  const logout = () => {
    localStorage.removeItem("iv_token");
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
