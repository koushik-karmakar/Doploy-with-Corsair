"use client";

import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Lock,
  Mail,
  Mic,
  Shield,
  Zap,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Spinner } from "@/components/ui/spinner";

const PERKS = [
  { icon: Mail, text: "Smart Gmail inbox with AI priority filtering" },
  { icon: Calendar, text: "Google Calendar automation & smart scheduling" },
  { icon: Mic, text: "Echo voice agent for hands-free control" },
  { icon: Shield, text: "OAuth 2.0 — we never store your password" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [signing, setSigning] = useState(false);

  const handleGoogleLogin = async () => {
    setSigning(true);
    try {
      await login();
      // router.push("/dashboard");
    } catch {
      setSigning(false);
    }
  };

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#080c14]">
      {/* ── Left panel — branding ────────────────────────────── */}
      <div className="relative hidden w-[480px] shrink-0 flex-col overflow-hidden border-r border-[#1e2636] bg-[#0d1117] lg:flex">
        {/* Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 right-0 top-0 h-96"
          style={{
            background:
              "radial-gradient(ellipse 100% 60% at 30% -10%, rgba(49,97,248,0.25) 0%, transparent 65%)",
          }}
        />
        {/* Grid */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(#60C2FB 1px, transparent 1px), linear-gradient(90deg, #60C2FB 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative flex h-full flex-col p-10">
          {/* Brand */}
          <div className="mb-14 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3161F8] to-[#60C2FB] shadow-xl shadow-[#3161F8]/30">
              {/* Replace with your logo: <img src="/logo.png" alt="Doploy" ... /> */}
              <Zap size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[17px] font-bold text-[#e6edf3]">Doploy</p>
              <p className="text-[11px] text-[#4d5d78]">Echo AI Agent</p>
            </div>
          </div>

          {/* Headline */}
          <div className="flex-1">
            <h1 className="mb-4 text-[40px] font-black leading-tight text-[#e6edf3]">
              Email &amp; Calendar,{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #60C2FB, #3161F8)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                on autopilot
              </span>
            </h1>
            <p className="mb-10 text-[14px] leading-relaxed text-[#8b9ab4]">
              Connect your Google account and let Echo — your AI agent — handle
              the repetitive parts of your inbox and calendar.
            </p>

            {/* Perks */}
            <div className="space-y-4">
              {PERKS.map((perk) => (
                <div key={perk.text} className="flex items-center gap-3">
                  <div className="bg-[#3161F8]/12 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#3161F8]/20">
                    <perk.icon size={14} className="text-[#60C2FB]" />
                  </div>
                  <p className="text-[13px] text-[#8b9ab4]">{perk.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-12 border-t border-[#1e2636] pt-8">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-[#4d5d78]">
              Trusted by teams at
            </p>
            <div className="flex flex-wrap gap-3">
              {["Vercel", "Stripe", "Linear", "Notion"].map((co) => (
                <div
                  key={co}
                  className="rounded-lg border border-[#2a3347] bg-[#161b22] px-3.5 py-1.5 text-[11px] font-medium text-[#4d5d78]"
                >
                  {co}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel — login form ──────────────────────────── */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Subtle bg glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 70% 50%, rgba(49,97,248,0.06) 0%, transparent 70%)",
          }}
        />

        {/* Back button */}
        <Link
          href="/"
          className="absolute left-6 top-6 flex items-center gap-1.5 text-[12px] text-[#4d5d78] transition-colors hover:text-[#8b9ab4]"
        >
          <ArrowLeft size={13} /> Back
        </Link>

        <div className="relative w-full max-w-sm">
          {/* Mobile brand */}
          <div className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#3161F8] to-[#60C2FB] shadow-lg shadow-[#3161F8]/25">
              <Zap size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[16px] font-bold text-[#e6edf3]">Doploy</span>
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-[#2a3347] bg-[#161b22] p-8 shadow-2xl shadow-black/40">
            {/* Icon */}
            <div className="to-[#60C2FB]/8 mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#3161F8]/20 bg-gradient-to-br from-[#3161F8]/15">
              <Lock size={22} className="text-[#60C2FB]" />
            </div>

            <h2 className="mb-1 text-center text-[24px] font-black text-[#e6edf3]">
              Welcome back
            </h2>
            <p className="mb-8 text-center text-[13px] text-[#4d5d78]">
              Sign in to access your AI-powered inbox
            </p>

            {/* Google button */}
            <button
              onClick={handleGoogleLogin}
              disabled={signing}
              className={[
                "group flex w-full items-center justify-center gap-3 rounded-2xl border py-3.5 text-[14px] font-semibold transition-all",
                signing
                  ? "cursor-not-allowed border-[#2a3347] bg-[#1c2230] text-[#4d5d78]"
                  : "hover:bg-[#3161F8]/8 border-[#2a3347] bg-[#1c2230] text-[#e6edf3] hover:border-[#3161F8]/50 hover:shadow-lg hover:shadow-[#3161F8]/10",
              ].join(" ")}
            >
              {signing ? (
                <>
                  <Spinner size={18} />
                  Connecting…
                </>
              ) : (
                <>
                  {/* Google icon */}
                  <svg
                    className="h-5 w-5 shrink-0"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#1e2636]" />
              <span className="text-[11px] font-medium text-[#2a3347]">
                Secure OAuth 2.0
              </span>
              <div className="h-px flex-1 bg-[#1e2636]" />
            </div>

            {/* Permissions preview */}
            <div className="space-y-2.5 rounded-xl border border-[#1e2636] bg-[#0d1117] p-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#4d5d78]">
                Doploy will request access to:
              </p>
              {[
                "Read &amp; send Gmail messages",
                "View &amp; edit Google Calendar",
                "Your basic profile info",
              ].map((perm) => (
                <div key={perm} className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="shrink-0 text-[#22c55e]" />
                  <span
                    className="text-[12px] text-[#8b9ab4]"
                    dangerouslySetInnerHTML={{ __html: perm }}
                  />
                </div>
              ))}
            </div>

            {/* Fine print */}
            <p className="mt-6 text-center text-[11px] leading-relaxed text-[#2a3347]">
              By continuing you agree to our{" "}
              <a
                href="#"
                className="text-[#4d5d78] underline transition-colors hover:text-[#8b9ab4]"
              >
                Terms
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="text-[#4d5d78] underline transition-colors hover:text-[#8b9ab4]"
              >
                Privacy Policy
              </a>
            </p>
          </div>

          {/* Security note */}
          <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-[#2a3347]">
            <Shield size={11} />
            <span>256-bit encrypted · SOC 2 compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
