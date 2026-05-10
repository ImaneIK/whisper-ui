import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "./mock/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthState | null>(null);

const KEY = "whisper.auth.v1";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (u: User | null) => {
    setUser(u);
    if (typeof window !== "undefined") {
      if (u) localStorage.setItem(KEY, JSON.stringify(u));
      else localStorage.removeItem(KEY);
    }
  };

  const value: AuthState = {
    user,
    isAuthenticated: !!user,
    async login(email) {
      await new Promise((r) => setTimeout(r, 200));
      persist({
        id: "u_" + email,
        email,
        name: email.split("@")[0],
        isAdmin: email.startsWith("admin"),
      });
    },
    async register(name, email) {
      await new Promise((r) => setTimeout(r, 200));
      persist({ id: "u_" + email, email, name, isAdmin: email.startsWith("admin") });
    },
    logout() {
      persist(null);
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
