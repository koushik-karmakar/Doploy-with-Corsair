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
    const rawHash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;

    const params = new URLSearchParams(rawHash);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage(
        "No access token was found in the redirect URL. " +
          "Check that GOOGLE_CALLBACK_URL on the backend matches the " +
          "route registered in Google Cloud Console exactly.",
      );
      return;
    }

    setAccessToken(token);

    window.history.replaceState(null, "", "/auth/success");

    (async () => {
      try {
        await refreshUser();
        router.replace("/dashboard");
        return;
      } catch (err) {
        setStatus("error");
        setMessage(
          "Signed in, but we couldn't load your profile (GET /auth/me " +
            "failed). Check that the backend is running and that " +
            "NEXT_PUBLIC_API_URL points to it.",
        );
      }
    })();
  }, [refreshUser, router]);

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#080c14] px-6 text-center">
        <p className="max-w-sm text-[14px] text-[#f87171]">{message}</p>
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
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#080c14]">
      <Spinner size={32} />
      <p className="text-[13px] text-[#4d5d78]">Signing you in…</p>
    </div>
  );
}
