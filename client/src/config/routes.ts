// ─── App routes ──────────────────────────────────────────────────────────────

export const APP_ROUTES = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
  authSuccess: "/auth/success",
  authError: "/auth/error",
} as const;

export type AppRoute = (typeof APP_ROUTES)[keyof typeof APP_ROUTES];
export const GUEST_ONLY_ROUTES = [APP_ROUTES.login] as const;
export const PROTECTED_ROUTE_PREFIXES = [APP_ROUTES.dashboard] as const;
export const PUBLIC_ROUTES = [
  APP_ROUTES.home,
  APP_ROUTES.authSuccess,
  APP_ROUTES.authError,
] as const;

function matchesRoutePrefix(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function isGuestOnlyRoute(pathname: string): boolean {
  return GUEST_ONLY_ROUTES.some((route) => matchesRoutePrefix(pathname, route));
}

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some((route) =>
    matchesRoutePrefix(pathname, route),
  );
}

export function isGuardedRoute(pathname: string): boolean {
  return isGuestOnlyRoute(pathname) || isProtectedRoute(pathname);
}

export function getRedirectForRoute(
  pathname: string,
  isAuthenticated: boolean,
): string | null {
  if (isGuestOnlyRoute(pathname) && isAuthenticated) {
    return APP_ROUTES.dashboard;
  }

  if (isProtectedRoute(pathname) && !isAuthenticated) {
    return APP_ROUTES.login;
  }

  return null;
}
