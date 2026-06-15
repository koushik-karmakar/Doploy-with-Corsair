"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext.js";
import { Spinner } from "@/components/ui/spinner";
import { API_URL, api, setAccessToken } from "@/lib/api";

const REASON_MESSAGES: Record<string, string> = {
  access_denied: "You declined the Google permissions request.",
  state_mismatch: "Security check failed — please try signing in again.",
  default: "Something went wrong while signing in with Google.",
};

function AuthErrorContent() {
  const params = useSearchParams();
  const reason = params.get("reason") ?? "default";
  const message = REASON_MESSAGES[reason] ?? REASON_MESSAGES.default;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#080c14] px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
        <AlertTriangle size={22} className="text-red-400" />
      </div>
      <h1 className="text-[20px] font-bold text-[#e6edf3]">Sign in failed</h1>
      <p className="max-w-xs text-[13px] text-[#8b9ab4]">{message}</p>
      <Link
        href="/login"
        className="mt-2 rounded-xl bg-[#3161F8] px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
      >
        Try again
      </Link>
    </div>
  );
}

export function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080c14]" />}>
      <AuthErrorContent />
    </Suspense>
  );
}

export function AuthSuccessPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // The backend redirects here with:
    //   /auth/success#token=<jwt>&expiresIn=<duration>
    // The fragment (#...) is never sent to any server, so we must
    // read it from window.location on the client.
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;

    const params = new URLSearchParams(hash);
    const token = params.get("token");

    if (!token) {
      setError("No access token was returned from the server.");
      return;
    }

    setAccessToken(token);

    // Remove the token from the visible URL so it isn't leaked via
    // browser history, referrer headers, screenshots, etc.
    window.history.replaceState(null, "", "/auth/success");

    void (async () => {
      const result = await refreshUser();
      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.replace("/dashboard");
    })();
  }, [refreshUser, router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#080c14] px-6 text-center">
        <p className="text-[14px] text-[#f87171]">{error}</p>
        <a
          href="/login"
          className="text-[13px] text-[#60C2FB] underline transition-colors hover:text-[#8b9ab4]"
        >
          Back to login
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080c14]">
      <Spinner size={32} />
    </div>
  );
}
