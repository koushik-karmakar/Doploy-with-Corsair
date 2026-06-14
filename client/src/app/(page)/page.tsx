"use client";

import {
  ArrowRight,
  Bell,
  Bot,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Command,
  Globe,
  Layers,
  Mail,
  Mic,
  Search,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Bot,
    title: "Chai AI Agent",
    description:
      "Voice and text-driven AI that composes emails, schedules meetings, and manages your inbox — with full context awareness.",
    accent: "#60C2FB",
    bg: "rgba(96,194,251,0.06)",
    border: "rgba(96,194,251,0.18)",
  },
  {
    icon: Mail,
    title: "Smart Gmail Inbox",
    description:
      "AI-powered priority filtering, instant search across your entire history, and one-click draft generation.",
    accent: "#3161F8",
    bg: "rgba(49,97,248,0.06)",
    border: "rgba(49,97,248,0.18)",
  },
  {
    icon: Calendar,
    title: "Calendar Automation",
    description:
      "Detect conflicts, send invites, and receive real-time webhook updates without lifting a finger.",
    accent: "#818cf8",
    bg: "rgba(129,140,248,0.06)",
    border: "rgba(129,140,248,0.18)",
  },
  {
    icon: Search,
    title: "Lightning Search",
    description:
      "Sub-second email and calendar lookup powered by local vector indexing via Corsair — no API round-trips.",
    accent: "#22c55e",
    bg: "rgba(34,197,94,0.06)",
    border: "rgba(34,197,94,0.18)",
  },
  {
    icon: Command,
    title: "Command Palette",
    description:
      "Keyboard-first power user mode. Hit ⌘K to jump anywhere, compose emails, or add events instantly.",
    accent: "#f59e0b",
    bg: "rgba(245,158,11,0.06)",
    border: "rgba(245,158,11,0.18)",
  },
  {
    icon: Bell,
    title: "Real-time Webhooks",
    description:
      "Powered by Corsair — get new emails and calendar invites the instant they arrive, zero polling.",
    accent: "#ec4899",
    bg: "rgba(236,72,153,0.06)",
    border: "rgba(236,72,153,0.18)",
  },
];

const PRICING: {
  name: string;
  price: number | string;
  period?: string;
  description: string;
  features: string[];
  highlighted: boolean;
  cta: string;
}[] = [
  {
    name: "Starter",
    price: 0,
    period: "forever",
    description: "For individuals exploring smarter email.",
    highlighted: false,
    cta: "Get started free",
    features: [
      "Gmail integration (read + draft)",
      "Google Calendar sync",
      "Chai AI text agent",
      "50 AI actions / month",
      "Basic search",
    ],
  },
  {
    name: "Pro",
    price: 19,
    period: "/ month",
    description: "For power users who live in email and calendar.",
    highlighted: true,
    cta: "Start 14-day trial",
    features: [
      "Everything in Starter",
      "Chai Voice Agent",
      "Unlimited AI actions",
      "Real-time webhooks",
      "Lightning local search",
      "Keyboard shortcuts",
      "Priority email filtering",
      "Send on behalf (team)",
    ],
  },
  {
    name: "Team",
    price: "Custom",
    description: "For organizations needing shared access and SSO.",
    highlighted: false,
    cta: "Contact sales",
    features: [
      "Everything in Pro",
      "Shared inbox views",
      "SSO / SAML",
      "Admin dashboard",
      "SLA & dedicated support",
      "Custom Corsair MCP config",
    ],
  },
];

const STATS = [
  { value: "2.4×", label: "Faster email responses" },
  { value: "18min", label: "Saved per day, avg" },
  { value: "99.9%", label: "Uptime guarantee" },
  { value: "12k+", label: "Active users" },
];

const TESTIMONIALS = [
  {
    quote:
      "Doploy cut my email management time in half. Chai drafts replies that sound exactly like me.",
    author: "Sarah Chen",
    role: "Head of Product",
    company: "Vercel",
    initials: "SC",
    color: "#60C2FB",
  },
  {
    quote:
      "The voice agent is insane. I just say 'schedule a call with Marcus Thursday 2pm' and it's done.",
    author: "Raj Patel",
    role: "Founder",
    company: "Stealth startup",
    initials: "RP",
    color: "#818cf8",
  },
  {
    quote:
      "Finally a tool where the AI actually understands context. Chai knows my workflow after one day.",
    author: "Mia Torres",
    role: "Engineering Manager",
    company: "Stripe",
    initials: "MT",
    color: "#22c55e",
  },
];

// ─── AnimatedCounter ──────────────────────────────────────────────────────────
function AnimatedCounter({ value }: { value: string }) {
  return <span>{value}</span>;
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function LandingNav({ onLogin }: { onLogin: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={[
        "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-[#1e2636] bg-[#0d1117]/90 backdrop-blur"
          : "bg-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#3161F8] to-[#60C2FB] shadow-lg shadow-[#3161F8]/30">
            {/* Replace with <img src="/logo.png" ... /> */}
            <Zap size={15} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-bold text-[#e6edf3]">Doploy</span>
        </Link>

        {/* Links */}
        <div className="hidden items-center gap-1 md:flex">
          {["Features", "Pricing", "Changelog"].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className="hover:bg-white/4 rounded-lg px-3 py-2 text-[13px] text-[#8b9ab4] transition-all hover:text-[#e6edf3]"
            >
              {label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-xl bg-[#3161F8] px-4 py-2 text-[13px] font-semibold text-white transition-all hover:bg-[#4a77f8] hover:shadow-lg hover:shadow-[#3161F8]/25"
            >
              Dashboard <ArrowRight size={13} />
            </Link>
          ) : (
            <>
              <button
                onClick={onLogin}
                className="rounded-xl border border-[#2a3347] px-3.5 py-2 text-[13px] text-[#8b9ab4] transition-all hover:border-[#3a4a63] hover:text-[#e6edf3]"
              >
                Sign in
              </button>
              <button
                onClick={onLogin}
                className="flex items-center gap-1.5 rounded-xl bg-[#3161F8] px-4 py-2 text-[13px] font-semibold text-white transition-all hover:bg-[#4a77f8] hover:shadow-lg hover:shadow-[#3161F8]/25"
              >
                Get started <ArrowRight size={13} />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  const handleLogin = () => router.push("/login");

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#080c14] text-[#e6edf3]">
      <LandingNav onLogin={handleLogin} />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-16 pt-24 text-center">
        {/* Background radial glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 50% -5%, rgba(49,97,248,0.25) 0%, transparent 65%)",
          }}
        />
        {/* Grid pattern */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#60C2FB 1px, transparent 1px), linear-gradient(90deg, #60C2FB 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Badge */}
        <div className="animate-fade-in bg-[#3161F8]/8 mb-8 flex items-center gap-2 rounded-full border border-[#3161F8]/30 px-4 py-2 text-[12px] font-semibold text-[#60C2FB]">
          <Sparkles size={12} />
          Powered by Corsair MCP · AI Email &amp; Calendar
          <ChevronRight size={12} className="opacity-60" />
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in stagger-1 mb-6 max-w-4xl text-[52px] font-black leading-[1.05] tracking-tight sm:text-[68px]">
          Your email &amp; calendar,{" "}
          <span
            style={{
              background:
                "linear-gradient(135deg, #60C2FB 0%, #3161F8 50%, #818cf8 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            finally intelligent
          </span>
        </h1>

        {/* Sub */}
        <p className="animate-fade-in stagger-2 mb-10 max-w-xl text-[17px] leading-relaxed text-[#8b9ab4]">
          Doploy replaces the click-heavy Gmail and Calendar UI with a
          voice-first AI agent — Chai — that reads, drafts, and schedules on
          your behalf, in real-time.
        </p>

        {/* CTAs */}
        <div className="animate-fade-in stagger-3 mb-14 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleLogin}
            className="group flex items-center gap-2 rounded-2xl px-6 py-3.5 text-[15px] font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#3161F8]/30"
            style={{
              background: "linear-gradient(135deg, #3161F8 0%, #60C2FB 100%)",
            }}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </button>
          <a
            href="#features"
            className="flex items-center gap-1.5 rounded-2xl border border-[#2a3347] px-6 py-3.5 text-[15px] font-medium text-[#8b9ab4] transition-all hover:border-[#3a4a63] hover:text-[#e6edf3]"
          >
            See how it works
          </a>
        </div>

        {/* Hero mockup / preview */}
        <div className="animate-fade-in stagger-4 relative mx-auto w-full max-w-5xl">
          {/* Glow under card */}
          <div
            aria-hidden="true"
            className="absolute -inset-4 rounded-3xl opacity-30 blur-2xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(49,97,248,0.4), rgba(96,194,251,0.2))",
            }}
          />
          <div className="relative overflow-hidden rounded-2xl border border-[#2a3347] bg-[#0d1117] shadow-2xl">
            {/* Fake window chrome */}
            <div className="flex items-center gap-1.5 border-b border-[#1e2636] bg-[#161b22] px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-[#ef4444]/70" />
              <div className="h-3 w-3 rounded-full bg-[#f59e0b]/70" />
              <div className="h-3 w-3 rounded-full bg-[#22c55e]/70" />
              <div className="ml-4 flex h-6 max-w-xs flex-1 items-center rounded-md bg-[#1c2230] px-3">
                <span className="text-[11px] text-[#4d5d78]">
                  app.doploy.dev/dashboard
                </span>
              </div>
            </div>
            {/* Dashboard mini preview */}
            <div className="grid grid-cols-4 gap-3 p-4">
              {[
                {
                  label: "Today's Meetings",
                  value: "4",
                  change: "+25%",
                  color: "#22c55e",
                },
                {
                  label: "Important Emails",
                  value: "7",
                  change: "-12%",
                  color: "#ef4444",
                },
                {
                  label: "Pending Approvals",
                  value: "3",
                  change: "+50%",
                  color: "#22c55e",
                },
                {
                  label: "AI Tasks Done",
                  value: "18",
                  change: "+34%",
                  color: "#22c55e",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-[#1e2636] bg-[#161b22] p-3"
                >
                  <p className="mb-1 text-[10px] text-[#4d5d78]">{s.label}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[22px] font-bold text-[#e6edf3]">
                      {s.value}
                    </span>
                    <span
                      className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                      style={{ color: s.color, background: `${s.color}18` }}
                    >
                      {s.change}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[9px] text-[#2a3347]">
                    vs last month
                  </p>
                </div>
              ))}
            </div>
            {/* Agent chat preview */}
            <div className="mx-4 mb-4 rounded-xl border border-[#2a3347] bg-[#161b22] p-3.5">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#3161F8] to-[#60C2FB]">
                  <Bot size={11} className="text-white" />
                </div>
                <span className="text-[11px] font-semibold text-[#e6edf3]">
                  Chai · AI Agent
                </span>
                <span className="ml-auto flex items-center gap-1 text-[9px] text-[#22c55e]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22c55e]" />{" "}
                  Online
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#3161F8] to-[#60C2FB] text-[8px] font-bold text-white">
                    C
                  </div>
                  <div className="max-w-xs rounded-xl rounded-tl-sm border border-[#2a3347] bg-[#1c2230] px-3 py-2 text-[11px] text-[#e6edf3]">
                    Hello! I'm <strong>Chai</strong>. You have 2 meetings today
                    and 7 unread priority emails.
                  </div>
                </div>
                <div className="flex flex-row-reverse gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#232d3f] text-[8px] text-[#8b9ab4]">
                    U
                  </div>
                  <div className="rounded-xl rounded-tr-sm border border-[#3161F8]/35 bg-[#1a2a4a] px-3 py-2 text-[11px] text-[#e6edf3]">
                    Write an email to Sarah saying I'll be late
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#3161F8] to-[#60C2FB] text-[8px] font-bold text-white">
                    C
                  </div>
                  <div className="flex items-center gap-1.5 rounded-xl rounded-tl-sm border border-[#60C2FB]/20 bg-[#1c2230] px-3 py-2 text-[11px] text-[#e6edf3]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#60C2FB]" />
                    Drafting your email…
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────── */}
      <section className="border-y border-[#1e2636] bg-[#0d1117] py-12">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 text-center md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="mb-1 text-[40px] font-black leading-none text-[#e6edf3]">
                <AnimatedCounter value={s.value} />
              </p>
              <p className="text-[13px] text-[#4d5d78]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────── */}
      <section id="features" className="section-pad mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#2a3347] bg-[#161b22] px-3.5 py-1.5 text-[11px] font-medium text-[#8b9ab4]">
            <Layers size={11} /> Built for flow, not friction
          </div>
          <h2 className="mb-4 text-[38px] font-black leading-tight">
            Everything you hate about Gmail,{" "}
            <span className="gradient-text">finally fixed</span>
          </h2>
          <p className="mx-auto max-w-xl text-[16px] text-[#8b9ab4]">
            Doploy reimagines the email and calendar experience from scratch —
            powered by Corsair integrations and a voice-first AI agent.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="feature-card group cursor-default"
              style={{
                background: f.bg,
                border: `1px solid ${f.border}`,
              }}
            >
              <div
                className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                style={{ background: `${f.accent}18` }}
              >
                <f.icon size={20} style={{ color: f.accent }} />
              </div>
              <h3 className="mb-2 text-[15px] font-bold text-[#e6edf3]">
                {f.title}
              </h3>
              <p className="text-[13px] leading-relaxed text-[#8b9ab4]">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section className="section-pad border-y border-[#1e2636] bg-[#0d1117] px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <h2 className="mb-4 text-[36px] font-black">How Chai works</h2>
            <p className="text-[16px] text-[#8b9ab4]">
              Three steps from idea to inbox — no CLI, no config.
            </p>
          </div>

          <div className="relative grid gap-6 md:grid-cols-3">
            {/* Connector line */}
            <div
              aria-hidden="true"
              className="absolute left-[33%] right-[33%] top-10 hidden h-[1px] bg-gradient-to-r from-[#3161F8]/40 to-[#60C2FB]/40 md:block"
            />
            {[
              {
                step: "01",
                icon: Shield,
                title: "Connect Google",
                desc: "Sign in with Google once. Doploy securely connects Gmail and Calendar via Corsair — no passwords stored.",
                color: "#60C2FB",
              },
              {
                step: "02",
                icon: Mic,
                title: "Speak or type",
                desc: "Use voice or text to tell Chai what to do: draft an email, schedule a meeting, or search your inbox.",
                color: "#3161F8",
              },
              {
                step: "03",
                icon: Zap,
                title: "Review & send",
                desc: "Chai shows you the composed email or event, plays a confirmation tone, and sends only on your approval.",
                color: "#818cf8",
              },
            ].map((step) => (
              <div
                key={step.step}
                className="relative rounded-2xl border border-[#2a3347] bg-[#161b22] p-7 transition-all hover:border-[#3a4a63]"
              >
                <div className="absolute -top-3.5 left-6 bg-[#080c14] px-2">
                  <span
                    className="text-[11px] font-bold"
                    style={{ color: step.color }}
                  >
                    {step.step}
                  </span>
                </div>
                <div
                  className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: `${step.color}15` }}
                >
                  <step.icon size={22} style={{ color: step.color }} />
                </div>
                <h3 className="mb-2 text-[15px] font-bold text-[#e6edf3]">
                  {step.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-[#8b9ab4]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────── */}
      <section className="section-pad px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-[36px] font-black">
              Loved by people who{" "}
              <span className="gradient-text">hate email</span>
            </h2>
            <p className="text-[15px] text-[#8b9ab4]">
              Real feedback from people in their first week.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.author}
                className="rounded-2xl border border-[#2a3347] bg-[#161b22] p-6 transition-all hover:border-[#3a4a63]"
              >
                {/* Stars */}
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={13}
                      className="fill-[#f59e0b] text-[#f59e0b]"
                    />
                  ))}
                </div>
                <p className="mb-5 text-[14px] italic leading-relaxed text-[#c9d1d9]">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${t.color}, ${t.color}88)`,
                    }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#e6edf3]">
                      {t.author}
                    </p>
                    <p className="text-[11px] text-[#4d5d78]">
                      {t.role} · {t.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────────── */}
      <section
        id="pricing"
        className="section-pad border-y border-[#1e2636] bg-[#0d1117] px-6"
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-[36px] font-black">
              Simple, honest pricing
            </h2>
            <p className="text-[15px] text-[#8b9ab4]">
              Start free. Upgrade when Chai earns its keep.
            </p>
          </div>

          <div className="grid items-start gap-5 md:grid-cols-3">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={[
                  "rounded-2xl border p-7 transition-all",
                  plan.highlighted
                    ? "from-[#3161F8]/8 relative border-[#3161F8]/50 bg-gradient-to-b to-transparent"
                    : "border-[#2a3347] bg-[#161b22]",
                ].join(" ")}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#3161F8] px-4 py-1 text-[11px] font-bold text-white">
                    Most popular
                  </div>
                )}
                <p className="mb-1 text-[14px] font-bold text-[#8b9ab4]">
                  {plan.name}
                </p>
                <div className="mb-2 flex items-baseline gap-1">
                  {typeof plan.price === "number" ? (
                    <>
                      <span className="text-[40px] font-black text-[#e6edf3]">
                        ${plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-[13px] text-[#4d5d78]">
                          {plan.period}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-[36px] font-black text-[#e6edf3]">
                      {plan.price}
                    </span>
                  )}
                </div>
                <p className="mb-6 text-[12px] text-[#4d5d78]">
                  {plan.description}
                </p>

                <button
                  onClick={handleLogin}
                  className={[
                    "mb-6 w-full rounded-xl py-2.5 text-[13px] font-semibold transition-all",
                    plan.highlighted
                      ? "bg-[#3161F8] text-white hover:bg-[#4a77f8] hover:shadow-lg hover:shadow-[#3161F8]/25"
                      : "border border-[#2a3347] text-[#8b9ab4] hover:border-[#3a4a63] hover:text-[#e6edf3]",
                  ].join(" ")}
                >
                  {plan.cta}
                </button>

                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-[12px] text-[#8b9ab4]"
                    >
                      <Check
                        size={13}
                        className="mt-0.5 shrink-0 text-[#22c55e]"
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────────── */}
      <section className="section-pad px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div
            className="relative overflow-hidden rounded-3xl border border-[#3161F8]/30 p-12"
            style={{
              background:
                "linear-gradient(135deg, rgba(49,97,248,0.12) 0%, rgba(96,194,251,0.06) 100%)",
            }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(49,97,248,0.2) 0%, transparent 70%)",
              }}
            />
            <h2 className="relative mb-4 text-[36px] font-black">
              Start talking to <span className="gradient-text">Chai today</span>
            </h2>
            <p className="relative mb-8 text-[15px] text-[#8b9ab4]">
              Connect Google, say hello, and let Chai take it from there. Free
              forever, no card required.
            </p>
            <button
              onClick={handleLogin}
              className="group relative inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-[15px] font-bold text-white transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#3161F8]/30"
              style={{
                background: "linear-gradient(135deg, #3161F8 0%, #60C2FB 100%)",
              }}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Get started with Google
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#1e2636] px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#3161F8] to-[#60C2FB]">
                <Zap size={13} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[14px] font-bold text-[#e6edf3]">
                Doploy
              </span>
            </div>
            <div className="flex flex-wrap gap-6 text-[12px] text-[#4d5d78]">
              {["Privacy", "Terms", "Changelog", "GitHub", "Status"].map(
                (l) => (
                  <a
                    key={l}
                    href="#"
                    className="transition-colors hover:text-[#8b9ab4]"
                  >
                    {l}
                  </a>
                ),
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] text-[#2a3347]">
            <p>
              © 2026 Doploy. Built with Corsair MCP, Next.js, and TypeScript.
            </p>
            <div className="flex items-center gap-1.5">
              <Globe size={11} />
              <span>Deployed on Vercel</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
