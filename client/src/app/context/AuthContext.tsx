"use client";

import React, {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { type AxiosError } from "axios";
import { API_URL, api, setAccessToken } from "@/lib/api";
import type { AuthState, User } from "./type.js";

// ─── Context shape ─────────────────────────────────────────────────────────

export type RefreshUserResult =
  | { ok: true }
  | { ok: false; error: string };

export type LoginResult =
  | { ok: true }
  | { ok: false; error: string };

interface AuthContextValue extends AuthState {
  login: () => Promise<LoginResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<RefreshUserResult>;
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
  const fetchUser = useCallback(async (): Promise<RefreshUserResult> => {
    try {
      const { data } = await api.get<MeResponse>("/auth/me");
      setUser(data.data);
      return { ok: true };
    } catch (err) {
      setUser(null);
      setAccessToken(null);

      const axiosErr = err as AxiosError<{ message?: string }>;
      if (axiosErr.response) {
        const status = axiosErr.response.status;
        const serverMessage = axiosErr.response.data?.message;
        return {
          ok: false,
          error: serverMessage
            ? `GET /auth/me failed (${status}): ${serverMessage}`
            : `GET /auth/me failed with status ${status}.`,
        };
      }

      if (axiosErr.request) {
        return {
          ok: false,
          error:
            "Could not reach the API. Check that the backend is running and NEXT_PUBLIC_API_URL is correct.",
        };
      }

      return {
        ok: false,
        error:
          axiosErr.message || "An unexpected error occurred while loading your profile.",
      };
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // /auth/success reads #token=… and calls refreshUser itself.
    // Bootstrapping here races that flow and can clear a token that was
    // just saved (especially under React Strict Mode).
    if (
      typeof window !== "undefined" &&
      window.location.pathname === "/auth/success"
    ) {
      setIsLoading(false);
      return;
    }

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
   * We preflight with fetch + redirect:"manual" first so rate-limit (429)
   * responses stay on the login page instead of showing raw JSON.
   *
   * Flow:
   *   1. Browser → GET {API_URL}/auth/google (preflight)
   *   2. Backend  → redirect → Google consent screen
   *   3. Google   → redirect → GET {API_URL}/auth/google/callback
   *   4. Backend  → sets refreshToken cookie, redirects to
   *                  {FRONTEND_URL}/auth/success#token=...&expiresIn=...
   *   5. /auth/success page stores the access token and calls refreshUser()
   */
  const login = useCallback(async (): Promise<LoginResult> => {
    try {
      const response = await fetch(`${API_URL}/auth/google`, {
        method: "GET",
        credentials: "include",
        redirect: "manual",
      });

      if (response.status === 429) {
        const data = (await response.json()) as { message?: string };
        return {
          ok: false,
          error:
            data.message ??
            "Too many authentication attempts, please wait 15 minutes before trying again",
        };
      }

      if (
        response.status === 0 ||
        response.type === "opaqueredirect" ||
        (response.status >= 300 && response.status < 400)
      ) {
        const location = response.headers.get("Location");
        window.location.href = location ?? `${API_URL}/auth/google`;
        return { ok: true };
      }

      if (!response.ok) {
        let message = "Unable to start Google sign-in. Please try again.";
        try {
          const data = (await response.json()) as { message?: string };
          if (data.message) message = data.message;
        } catch {
          // ignore JSON parse errors
        }
        return { ok: false, error: message };
      }

      window.location.href = `${API_URL}/auth/google`;
      return { ok: true };
    } catch {
      return {
        ok: false,
        error:
          "Could not reach the server. Please check that the backend is running and try again.",
      };
    }
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
