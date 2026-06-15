"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Spinner } from "@/components/ui/spinner";
import { setAccessToken } from "@/lib/api";

export default function AuthSuccessPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // ── 1. Read the full URL as the backend sent it ──────────────────

    const fullHash = window.location.hash;
    const search = window.location.search;
    const hashString = fullHash.startsWith("#") ? fullHash.slice(1) : fullHash;
    const fromHash = new URLSearchParams(hashString);
    const fromSearch = new URLSearchParams(search);
    const token = fromHash.get("token") ?? fromSearch.get("token");
    const expiresIn = fromHash.get("expiresIn") ?? fromSearch.get("expiresIn");

    // ── 2. Debug log (remove before production) ──────────────────────
    console.group("[AuthSuccess] OAuth callback debug");
    console.log("full href    :", window.location.href);
    console.log("hash string  :", hashString);
    console.log("token found  :", token ? `${token.slice(0, 20)}…` : "NONE");
    console.log("expiresIn    :", expiresIn);
    console.groupEnd();

    // ── 3. Guard: no token ───────────────────────────────────────────
    if (!token) {
      setStatus("error");
      setMessage(
        "No access token found in the redirect URL.\n\n" +
          "Possible reasons:\n" +
          "• GOOGLE_CALLBACK_URL in the backend does not match Google Cloud Console.\n" +
          "• Backend redirected to the wrong frontend URL.\n" +
          "• The redirect URL does not include #token=… in the hash.\n\n" +
          `Received hash: "${fullHash || "(empty)"}"\n` +
          `Received search: "${search || "(empty)"}"`,
      );
      return;
    }

    // ── 4. Persist token FIRST, then clean URL ───────────────────────
    setAccessToken(token);

    // window.history.replaceState(null, "", "/auth/success");

    // ── 5. Hydrate user then navigate ────────────────────────────────
    void (async () => {
      const result = await refreshUser();
      if (!result.ok) {
        console.error("[AuthSuccess] refreshUser failed:", result.error);
        setStatus("error");
        setMessage(
          "Signed in successfully, but loading your profile failed.\n\n" +
            result.error,
        );
        return;
      }

      router.replace("/dashboard");
    })();
  }, [refreshUser, router]);

  // ── Error state ───────────────────────────────────────────────────
  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#080c14] px-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#f87171]/20 bg-[#f87171]/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f87171"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <div className="max-w-md">
          <p className="mb-2 text-[15px] font-semibold text-[#f87171]">
            Authentication failed
          </p>
          <pre className="whitespace-pre-wrap rounded-xl border border-[#1e2636] bg-[#0d1117] px-4 py-3 text-left text-[11px] leading-relaxed text-[#8b9ab4]">
            {message}
          </pre>
        </div>

        <a
          href="/login"
          className="text-[13px] text-[#60C2FB] underline transition-colors hover:text-[#8b9ab4]"
        >
          ← Back to login
        </a>
      </div>
    );
  }

  // ── Loading state ─────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#080c14]">
      <Spinner size={32} />
      <p className="text-[13px] text-[#4d5d78]">Signing you in…</p>
    </div>
  );
}
