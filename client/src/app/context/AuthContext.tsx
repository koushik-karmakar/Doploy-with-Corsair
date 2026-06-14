"use client";

import React, {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { AuthState, User } from "./type.js";

// ─── Context shape ─────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  login: () => Promise<void>;
  logout: () => void;
}

// ─── Context ────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Storage key ────────────────────────────────────────────────────────────

const SESSION_KEY = "doploy_user";

// ─── Mock Google user (replace with real NextAuth / OAuth flow) ─────────────

const MOCK_GOOGLE_USER: User = {
  id: "usr_google_001",
  name: "Alex Johnson",
  email: "alex.johnson@gmail.com",
  avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=AlexJohnson",
  provider: "google",
  createdAt: new Date().toISOString(),
};

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        setUser(JSON.parse(stored) as User);
      }
    } catch {
      // ignore parse errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * login — in production, this triggers NextAuth signIn("google").
   * Here we simulate the OAuth redirect + callback.
   */
  const login = useCallback(async () => {
    setIsLoading(true);
    // Simulate network delay (OAuth round-trip)
    await new Promise((r) => setTimeout(r, 1200));
    const u = MOCK_GOOGLE_USER;
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    setUser(u);
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
