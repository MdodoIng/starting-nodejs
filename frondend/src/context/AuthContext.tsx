import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { User } from "../api/types";
import { AuthApi } from "../api/endpoints";
import { getAuthToken, setAuthToken } from "../api/client";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }
    AuthApi.me()
      .then((res) => setUser(res.user))
      .catch(() => setAuthToken(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await AuthApi.login(email, password);
    setAuthToken(res.token);
    setUser(res.user);
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await AuthApi.signup(name, email, password);
      setAuthToken(res.token);
      setUser(res.user);
    },
    [],
  );

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
