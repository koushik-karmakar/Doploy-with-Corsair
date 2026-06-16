"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  type ReactNode,
  createContext,
  useContext,
  useLayoutEffect,
} from "react";
import { Spinner } from "@/components/ui/spinner";
import {
  getRedirectForRoute,
  isGuardedRoute,
  isGuestOnlyRoute,
  isProtectedRoute,
} from "@/config/routes";
import { useAuth } from "./AuthContext";

// ─── Context ─────────────────────────────────────────────────────────────────

interface AuthRouteContextValue {
  pathname: string;
  isGuestOnly: boolean;
  isProtected: boolean;
  isGuarded: boolean;
  canShowGuestActions: boolean;
  canShowAuthenticatedActions: boolean;
}

const AuthRouteContext = createContext<AuthRouteContextValue | undefined>(
  undefined,
);

function AuthRouteLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080c14]">
      <Spinner size={32} />
    </div>
  );
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthRouteProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const isGuestOnly = isGuestOnlyRoute(pathname);
  const isProtected = isProtectedRoute(pathname);
  const isGuarded = isGuardedRoute(pathname);
  const redirectTo = isLoading
    ? null
    : getRedirectForRoute(pathname, isAuthenticated);

  useLayoutEffect(() => {
    if (!redirectTo) return;
    router.replace(redirectTo);
  }, [redirectTo, router]);

  const shouldBlockRender =
    (isGuarded && isLoading) ||
    (isGuestOnly && isAuthenticated) ||
    (isProtected && !isLoading && !isAuthenticated);

  const value: AuthRouteContextValue = {
    pathname,
    isGuestOnly,
    isProtected,
    isGuarded,
    canShowGuestActions: !isLoading && !isAuthenticated,
    canShowAuthenticatedActions: !isLoading && isAuthenticated,
  };

  if (shouldBlockRender) {
    return <AuthRouteLoader />;
  }

  return (
    <AuthRouteContext.Provider value={value}>{children}</AuthRouteContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuthRoute(): AuthRouteContextValue {
  const ctx = useContext(AuthRouteContext);
  if (!ctx) {
    throw new Error("useAuthRoute must be used inside <AuthRouteProvider>");
  }
  return ctx;
}
