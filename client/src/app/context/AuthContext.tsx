"use client";

import React, {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { API_URL, api, setAccessToken } from "@/lib/api";
import type { AuthState, User } from "./type.js";

// ─── Context shape ─────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  login: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ─── Context ────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface MeResponse {
  success: boolean;
  data: User;
  message?: string;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Fetch the current user from the backend.
   *
   * - If a valid access token exists, GET /auth/me succeeds immediately.
   * - If it's missing/expired, the api response interceptor transparently
   *   calls POST /auth/refresh (using the httpOnly refreshToken cookie),
   *   stores the new access token, and retries this request once.
   * - If both fail, the user is treated as logged out.
   */
  const fetchUser = useCallback(async () => {
    try {
      const { data } = await api.get<MeResponse>("/auth/me");
      setUser(data.data);
    } catch {
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      await fetchUser();
      if (mounted) setIsLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [fetchUser]);

  /**
   * login — Google OAuth requires a real top-level browser navigation
   * (it cannot be done via fetch/XHR), so this performs a full redirect
   * to the backend, which in turn redirects to Google's consent screen.
   *
   * Flow:
   *   1. Browser → GET {API_URL}/auth/google
   *   2. Backend  → redirect → Google consent screen
   *   3. Google   → redirect → GET {API_URL}/auth/google/callback
   *   4. Backend  → sets refreshToken cookie, redirects to
   *                  {FRONTEND_URL}/auth/success#token=...&expiresIn=...
   *   5. /auth/success page stores the access token and calls refreshUser()
   */
  const login = useCallback(async () => {
    window.location.href = `${API_URL}/auth/google`;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Even if the server call fails, clear local session state below.
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser: fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
