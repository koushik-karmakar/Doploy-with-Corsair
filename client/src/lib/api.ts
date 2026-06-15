import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

// ─────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

const ACCESS_TOKEN_KEY = "doploy_access_token";

// ─────────────────────────────────────────────────────────────
// ACCESS TOKEN STORAGE (in-memory + localStorage)
// ─────────────────────────────────────────────────────────────
// The JWT access token is short-lived and never set as an
// httpOnly cookie (the backend returns it in the redirect hash),
// so we keep it in localStorage. The long-lived refresh token
// lives in an httpOnly cookie set by the backend and is never
// touched by JS.

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

// ─────────────────────────────────────────────────────────────
// AXIOS INSTANCE
// ─────────────────────────────────────────────────────────────

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

// ─────────────────────────────────────────────────────────────
// 401 HANDLING — silent refresh
// ─────────────────────────────────────────────────────────────
// If a request fails with 401 (access token missing/expired),
// call POST /auth/refresh once. The browser automatically sends
// the refreshToken cookie. On success we get a new access token,
// store it, and retry the original request exactly once.

interface RefreshResponse {
  success: boolean;
  data: { accessToken: string; expiresIn: string };
  message?: string;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const { data } = await axios.post<RefreshResponse>(
      `${API_URL}/auth/refresh`,
      {},
      { withCredentials: true },
    );
    const token = data?.data?.accessToken ?? null;
    setAccessToken(token);
    return token;
  } catch {
    setAccessToken(null);
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableRequestConfig | undefined;

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newToken = await refreshPromise;
      if (newToken) {
        original.headers.set("Authorization", `Bearer ${newToken}`);
        return api(original as AxiosRequestConfig);
      }
    }

    return Promise.reject(error);
  },
);
