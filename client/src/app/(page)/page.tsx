"use client";

import {
  ArrowRight,
  Bell,
  Bot,
  Calendar,
  Check,
  ChevronRight,
  Command,
  Globe,
  Layers,
  Mail,
  Mic,
  Search,
  Shield,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

// ─── Data ────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Bot,
    title: "Echo AI Agent",
    description:
      "Voice and text-driven AI that composes emails, schedules meetings, and manages your inbox — with full context awareness.",
    accent: "#60C2FB",
    bg: "rgba(96,194,251,0.06)",
    border: "rgba(96,194,251,0.22)",
  },
  {
    icon: Mail,
    title: "Smart Gmail Inbox",
    description:
      "AI-powered priority filtering, instant search across your entire history, and one-click draft generation.",
    accent: "#3161F8",
    bg: "rgba(49,97,248,0.06)",
    border: "rgba(49,97,248,0.22)",
  },
  {
    icon: Calendar,
    title: "Calendar Automation",
    description:
      "Detect conflicts, send invites, and receive real-time webhook updates without lifting a finger.",
    accent: "#818cf8",
    bg: "rgba(129,140,248,0.06)",
    border: "rgba(129,140,248,0.22)",
  },
  {
    icon: Search,
    title: "Lightning Search",
    description:
      "Sub-second email and calendar lookup powered by local vector indexing via Corsair — no API round-trips.",
    accent: "#22c55e",
    bg: "rgba(34,197,94,0.06)",
    border: "rgba(34,197,94,0.22)",
  },
  {
    icon: Command,
    title: "Command Palette",
    description:
      "Keyboard-first power user mode. Hit ⌘K to jump anywhere, compose emails, or add events instantly.",
    accent: "#f59e0b",
    bg: "rgba(245,158,11,0.06)",
    border: "rgba(245,158,11,0.22)",
  },
  {
    icon: Bell,
    title: "Real-time Webhooks",
    description:
      "Powered by Corsair — get new emails and calendar invites the instant they arrive, zero polling.",
    accent: "#ec4899",
    bg: "rgba(236,72,153,0.06)",
    border: "rgba(236,72,153,0.22)",
  },
];

const PRICING = [
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
      "Echo AI text agent",
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
      "Echo Voice Agent",
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
  { value: "2.4x", label: "Faster email responses" },
  { value: "18min", label: "Saved per day, avg" },
  { value: "99.9%", label: "Uptime guarantee" },
  { value: "12k+", label: "Active users" },
];

const TESTIMONIALS = [
  {
    quote:
      "Doploy cut my email management time in half. Echo drafts replies that sound exactly like me.",
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
      "Finally a tool where the AI actually understands context. Echo knows my workflow after one day.",
    author: "Mia Torres",
    role: "Engineering Manager",
    company: "Stripe",
    initials: "MT",
    color: "#22c55e",
  },
];

// ─── Google Icon ─────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
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
  );
}

// ─── Nav ─────────────────────────────────────────────────────────────────────
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
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: "all 0.3s",
        background: scrolled ? "rgba(13,17,23,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #1e2636" : "1px solid transparent",
      }}
    >
      <div
        style={{
          maxWidth: 1152,
          margin: "0 auto",
          padding: "0 32px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "linear-gradient(135deg,#3161F8,#60C2FB)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 16px rgba(49,97,248,0.35)",
              flexShrink: 0,
            }}
          >
            <Zap size={16} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#e6edf3" }}>
            Doploy
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {["Features", "Pricing", "Changelog"].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                fontSize: 14,
                color: "#8b9ab4",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#e6edf3")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#8b9ab4")}
            >
              {label}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 18px",
                borderRadius: 10,
                background: "#3161F8",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Dashboard <ArrowRight size={13} />
            </Link>
          ) : (
            <>
              <button
                onClick={onLogin}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  border: "1px solid #2a3347",
                  background: "transparent",
                  color: "#8b9ab4",
                  fontSize: 13,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#e6edf3";
                  e.currentTarget.style.borderColor = "#3a4a63";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#8b9ab4";
                  e.currentTarget.style.borderColor = "#2a3347";
                }}
              >
                Sign in
              </button>
              <button
                onClick={onLogin}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 18px",
                  borderRadius: 10,
                  background: "#3161F8",
                  border: "none",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#4a77f8")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#3161F8")
                }
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

  const W = { maxWidth: 1152, margin: "0 auto", padding: "0 48px" };
  const W5 = { maxWidth: 1100, margin: "0 auto", padding: "0 48px" };

  return (
    <div
      style={{
        minHeight: "100vh",
        overflowX: "hidden",
        background: "#080c14",
        color: "#e6edf3",
        fontFamily: "Inter, system-ui, sans-serif",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        .anim { animation: fadeInUp 0.55s ease both; }
        .d1{animation-delay:0.06s} .d2{animation-delay:0.13s} .d3{animation-delay:0.20s} .d4{animation-delay:0.27s}
        .fcrd:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.32) !important; }
        .fcrd { transition: transform 0.2s, box-shadow 0.2s; }
        .tcrd:hover { border-color: #3a4a63 !important; }
        .tcrd { transition: border-color 0.2s; }
        .pulse-dot { animation: pulse 1.8s ease-in-out infinite; }
      `}</style>

      <LandingNav onLogin={handleLogin} />

      {/* ═══════════ HERO ═══════════ */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "128px 48px 96px",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 90% 65% at 50% -5%, rgba(49,97,248,0.26) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.03,
            backgroundImage:
              "linear-gradient(#60C2FB 1px,transparent 1px),linear-gradient(90deg,#60C2FB 1px,transparent 1px)",
            backgroundSize: "60px 60px",
            pointerEvents: "none",
          }}
        />

        <div
          className="anim d1"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 32,
            padding: "8px 18px",
            borderRadius: 999,
            border: "1px solid rgba(49,97,248,0.35)",
            background: "rgba(49,97,248,0.08)",
            fontSize: 12,
            fontWeight: 600,
            color: "#60C2FB",
          }}
        >
          <Sparkles size={12} /> Powered by Corsair MCP · AI Email &amp;
          Calendar <ChevronRight size={12} style={{ opacity: 0.6 }} />
        </div>

        <h1
          className="anim d2"
          style={{
            maxWidth: 860,
            fontSize: "clamp(40px,6vw,68px)",
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            marginBottom: 24,
            color: "#e6edf3",
          }}
        >
          Your email &amp; calendar,{" "}
          <span
            style={{
              background:
                "linear-gradient(135deg,#60C2FB 0%,#3161F8 50%,#818cf8 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            finally intelligent
          </span>
        </h1>

        <p
          className="anim d3"
          style={{
            maxWidth: 520,
            fontSize: 17,
            lineHeight: 1.7,
            color: "#8b9ab4",
            marginBottom: 40,
          }}
        >
          Doploy replaces the click-heavy Gmail and Calendar UI with a
          voice-first AI agent — Echo — that reads, drafts, and schedules on
          your behalf, in real-time.
        </p>

        <div
          className="anim d3"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: "center",
            marginBottom: 60,
          }}
        >
          <button
            onClick={handleLogin}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 28px",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg,#3161F8 0%,#60C2FB 100%)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 12px 32px rgba(49,97,248,0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <GoogleIcon /> Continue with Google <ArrowRight size={14} />
          </button>
          <a
            href="#features"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "14px 28px",
              borderRadius: 14,
              border: "1px solid #2a3347",
              background: "transparent",
              color: "#8b9ab4",
              fontSize: 15,
              fontWeight: 500,
              textDecoration: "none",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#e6edf3";
              e.currentTarget.style.borderColor = "#3a4a63";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#8b9ab4";
              e.currentTarget.style.borderColor = "#2a3347";
            }}
          >
            See how it works
          </a>
        </div>

        {/* Mockup */}
        <div
          className="anim d4"
          style={{ width: "100%", maxWidth: 900, position: "relative" }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: -16,
              borderRadius: 28,
              background:
                "linear-gradient(135deg,rgba(49,97,248,0.35),rgba(96,194,251,0.18))",
              filter: "blur(28px)",
              opacity: 0.28,
            }}
          />
          <div
            style={{
              position: "relative",
              borderRadius: 16,
              border: "1px solid #2a3347",
              background: "#0d1117",
              overflow: "hidden",
              boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "12px 16px",
                borderBottom: "1px solid #1e2636",
                background: "#161b22",
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  background: "rgba(239,68,68,0.7)",
                }}
              />
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  background: "rgba(245,158,11,0.7)",
                }}
              />
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  background: "rgba(34,197,94,0.7)",
                }}
              />
              <div
                style={{
                  marginLeft: 16,
                  flex: 1,
                  maxWidth: 280,
                  height: 24,
                  borderRadius: 6,
                  background: "#1c2230",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 12px",
                }}
              >
                <span style={{ fontSize: 11, color: "#4d5d78" }}>
                  app.doploy.dev/dashboard
                </span>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 12,
                padding: 16,
              }}
            >
              {[
                {
                  label: "Today's Meetings",
                  value: "4",
                  change: "+25%",
                  c: "#22c55e",
                },
                {
                  label: "Important Emails",
                  value: "7",
                  change: "-12%",
                  c: "#ef4444",
                },
                {
                  label: "Pending Approvals",
                  value: "3",
                  change: "+50%",
                  c: "#22c55e",
                },
                {
                  label: "AI Tasks Done",
                  value: "18",
                  change: "+34%",
                  c: "#22c55e",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "#161b22",
                    border: "1px solid #1e2636",
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  <p
                    style={{ fontSize: 10, color: "#4d5d78", marginBottom: 4 }}
                  >
                    {s.label}
                  </p>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <span
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: "#e6edf3",
                      }}
                    >
                      {s.value}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: "2px 6px",
                        borderRadius: 4,
                        color: s.c,
                        background: `${s.c}18`,
                      }}
                    >
                      {s.change}
                    </span>
                  </div>
                  <p style={{ fontSize: 9, color: "#2a3347", marginTop: 2 }}>
                    vs last month
                  </p>
                </div>
              ))}
            </div>
            <div
              style={{
                margin: "0 16px 16px",
                border: "1px solid #2a3347",
                borderRadius: 12,
                background: "#161b22",
                padding: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 8,
                    background: "linear-gradient(135deg,#3161F8,#60C2FB)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Bot size={12} color="#fff" />
                </div>
                <span
                  style={{ fontSize: 12, fontWeight: 600, color: "#e6edf3" }}
                >
                  Echo · AI Agent
                </span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 10,
                    color: "#22c55e",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span
                    className="pulse-dot"
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      background: "#22c55e",
                      display: "inline-block",
                    }}
                  />{" "}
                  Online
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      background: "linear-gradient(135deg,#3161F8,#60C2FB)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 8,
                      fontWeight: 700,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    C
                  </div>
                  <div
                    style={{
                      background: "#1c2230",
                      border: "1px solid #2a3347",
                      borderRadius: "10px 10px 10px 2px",
                      padding: "8px 12px",
                      fontSize: 11,
                      color: "#e6edf3",
                      maxWidth: 320,
                    }}
                  >
                    Hello! I'm <strong>Echo</strong>. You have 2 meetings today
                    and 7 unread priority emails.
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexDirection: "row-reverse",
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      background: "#232d3f",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      color: "#8b9ab4",
                      flexShrink: 0,
                    }}
                  >
                    U
                  </div>
                  <div
                    style={{
                      background: "#1a2a4a",
                      border: "1px solid rgba(49,97,248,0.35)",
                      borderRadius: "10px 10px 2px 10px",
                      padding: "8px 12px",
                      fontSize: 11,
                      color: "#e6edf3",
                    }}
                  >
                    Write an email to Sarah saying I'll be late
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      background: "linear-gradient(135deg,#3161F8,#60C2FB)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 8,
                      fontWeight: 700,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    C
                  </div>
                  <div
                    style={{
                      background: "#1c2230",
                      border: "1px solid rgba(96,194,251,0.22)",
                      borderRadius: "10px 10px 10px 2px",
                      padding: "8px 12px",
                      fontSize: 11,
                      color: "#e6edf3",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span
                      className="pulse-dot"
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        background: "#60C2FB",
                        display: "inline-block",
                      }}
                    />{" "}
                    Drafting your email…
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <div
        style={{
          borderTop: "1px solid #1e2636",
          borderBottom: "1px solid #1e2636",
          background: "#0d1117",
        }}
      >
        <div style={{ ...W, paddingTop: 56, paddingBottom: 56 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 32,
              textAlign: "center",
            }}
          >
            {STATS.map((s) => (
              <div key={s.label}>
                <p
                  style={{
                    fontSize: 44,
                    fontWeight: 900,
                    color: "#e6edf3",
                    lineHeight: 1,
                    marginBottom: 8,
                  }}
                >
                  {s.value}
                </p>
                <p style={{ fontSize: 13, color: "#4d5d78" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════ FEATURES ═══════════ */}
      <section id="features" style={{ padding: "96px 0" }}>
        <div style={W}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "6px 14px",
                borderRadius: 999,
                border: "1px solid #2a3347",
                background: "#161b22",
                fontSize: 12,
                color: "#8b9ab4",
                fontWeight: 500,
                marginBottom: 20,
              }}
            >
              <Layers size={12} /> Built for flow, not friction
            </div>
            <h2
              style={{
                fontSize: "clamp(28px,4vw,40px)",
                fontWeight: 900,
                color: "#e6edf3",
                lineHeight: 1.2,
                marginBottom: 16,
              }}
            >
              Everything you hate about Gmail,{" "}
              <span
                style={{
                  background: "linear-gradient(135deg,#60C2FB,#3161F8)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                finally fixed
              </span>
            </h2>
            <p
              style={{
                maxWidth: 520,
                margin: "0 auto",
                fontSize: 16,
                color: "#8b9ab4",
                lineHeight: 1.65,
              }}
            >
              Doploy reimagines the email and calendar experience from scratch —
              powered by Corsair integrations and a voice-first AI agent.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 20,
            }}
          >
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="fcrd"
                style={{
                  background: f.bg,
                  border: `1px solid ${f.border}`,
                  borderRadius: 16,
                  padding: "28px 28px 32px",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: `${f.accent}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <f.icon size={22} color={f.accent} />
                </div>
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#e6edf3",
                    marginBottom: 10,
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ fontSize: 13, color: "#8b9ab4", lineHeight: 1.65 }}>
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section
        style={{
          padding: "96px 0",
          background: "#0d1117",
          borderTop: "1px solid #1e2636",
          borderBottom: "1px solid #1e2636",
        }}
      >
        <div style={W5}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2
              style={{
                fontSize: "clamp(28px,4vw,38px)",
                fontWeight: 900,
                color: "#e6edf3",
                marginBottom: 12,
              }}
            >
              How Echo works
            </h2>
            <p style={{ fontSize: 16, color: "#8b9ab4" }}>
              Three steps from idea to inbox — no CLI, no config.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 20,
              position: "relative",
            }}
          >
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: 40,
                left: "calc(33% + 20px)",
                right: "calc(33% + 20px)",
                height: 1,
                background:
                  "linear-gradient(90deg,rgba(49,97,248,0.4),rgba(96,194,251,0.4))",
              }}
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
                desc: "Use voice or text to tell Echo what to do: draft an email, schedule a meeting, or search your inbox.",
                color: "#3161F8",
              },
              {
                step: "03",
                icon: Zap,
                title: "Review & send",
                desc: "Echo shows you the composed email or event, plays a confirmation tone, and sends only on your approval.",
                color: "#818cf8",
              },
            ].map((step) => (
              <div
                key={step.step}
                className="tcrd"
                style={{
                  position: "relative",
                  background: "#161b22",
                  border: "1px solid #2a3347",
                  borderRadius: 16,
                  padding: "44px 28px 32px",
                }}
              >
                {/* Step label inside card top-left — never clips */}
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    left: 24,
                    fontSize: 11,
                    fontWeight: 700,
                    color: step.color,
                    letterSpacing: "0.05em",
                  }}
                >
                  {step.step}
                </div>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: `${step.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <step.icon size={24} color={step.color} />
                </div>
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#e6edf3",
                    marginBottom: 10,
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ fontSize: 13, color: "#8b9ab4", lineHeight: 1.65 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section style={{ padding: "96px 0" }}>
        <div style={W}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2
              style={{
                fontSize: "clamp(26px,4vw,38px)",
                fontWeight: 900,
                color: "#e6edf3",
                marginBottom: 10,
              }}
            >
              Loved by people who{" "}
              <span
                style={{
                  background: "linear-gradient(135deg,#60C2FB,#3161F8)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                hate email
              </span>
            </h2>
            <p style={{ fontSize: 15, color: "#8b9ab4" }}>
              Real feedback from people in their first week.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 20,
            }}
          >
            {TESTIMONIALS.map((t) => (
              <div
                key={t.author}
                className="tcrd"
                style={{
                  background: "#161b22",
                  border: "1px solid #2a3347",
                  borderRadius: 16,
                  padding: "28px 28px 32px",
                }}
              >
                <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: "#c9d1d9",
                    lineHeight: 1.7,
                    marginBottom: 20,
                    fontStyle: "italic",
                  }}
                >
                  "{t.quote}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 19,
                      background: `linear-gradient(135deg,${t.color},${t.color}80)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#e6edf3",
                      }}
                    >
                      {t.author}
                    </p>
                    <p style={{ fontSize: 11, color: "#4d5d78" }}>
                      {t.role} · {t.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PRICING ═══════════ */}
      <section
        id="pricing"
        style={{
          padding: "96px 0",
          background: "#0d1117",
          borderTop: "1px solid #1e2636",
          borderBottom: "1px solid #1e2636",
        }}
      >
        <div style={W5}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2
              style={{
                fontSize: "clamp(26px,4vw,38px)",
                fontWeight: 900,
                color: "#e6edf3",
                marginBottom: 10,
              }}
            >
              Simple, honest pricing
            </h2>
            <p style={{ fontSize: 15, color: "#8b9ab4" }}>
              Start free. Upgrade when Echo earns its keep.
            </p>
          </div>
          {/* paddingTop gives room for "Most popular" badge */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 20,
              alignItems: "start",
              paddingTop: 18,
            }}
          >
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                style={{
                  position: "relative",
                  borderRadius: 18,
                  border: plan.highlighted
                    ? "1px solid rgba(49,97,248,0.5)"
                    : "1px solid #2a3347",
                  background: plan.highlighted
                    ? "linear-gradient(180deg,rgba(49,97,248,0.09) 0%,transparent 100%)"
                    : "#161b22",
                  padding: "32px 28px 36px",
                }}
              >
                {plan.highlighted && (
                  <div
                    style={{
                      position: "absolute",
                      top: -14,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#3161F8",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "5px 18px",
                      borderRadius: 999,
                      whiteSpace: "nowrap",
                      boxShadow: "0 4px 14px rgba(49,97,248,0.4)",
                    }}
                  >
                    Most popular
                  </div>
                )}
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#8b9ab4",
                    marginBottom: 6,
                  }}
                >
                  {plan.name}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 4,
                    marginBottom: 8,
                  }}
                >
                  {typeof plan.price === "number" ? (
                    <>
                      <span
                        style={{
                          fontSize: 44,
                          fontWeight: 900,
                          color: "#e6edf3",
                          lineHeight: 1,
                        }}
                      >
                        ${plan.price}
                      </span>
                      {plan.period && (
                        <span style={{ fontSize: 13, color: "#4d5d78" }}>
                          {plan.period}
                        </span>
                      )}
                    </>
                  ) : (
                    <span
                      style={{
                        fontSize: 40,
                        fontWeight: 900,
                        color: "#e6edf3",
                        lineHeight: 1,
                      }}
                    >
                      {plan.price}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 12, color: "#4d5d78", marginBottom: 24 }}>
                  {plan.description}
                </p>
                <button
                  onClick={handleLogin}
                  style={{
                    width: "100%",
                    padding: "11px 0",
                    borderRadius: 10,
                    border: plan.highlighted ? "none" : "1px solid #2a3347",
                    background: plan.highlighted ? "#3161F8" : "transparent",
                    color: plan.highlighted ? "#fff" : "#8b9ab4",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    marginBottom: 24,
                  }}
                  onMouseEnter={(e) => {
                    if (plan.highlighted)
                      e.currentTarget.style.background = "#4a77f8";
                    else {
                      e.currentTarget.style.borderColor = "#3a4a63";
                      e.currentTarget.style.color = "#e6edf3";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (plan.highlighted)
                      e.currentTarget.style.background = "#3161F8";
                    else {
                      e.currentTarget.style.borderColor = "#2a3347";
                      e.currentTarget.style.color = "#8b9ab4";
                    }
                  }}
                >
                  {plan.cta}
                </button>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        fontSize: 12,
                        color: "#8b9ab4",
                      }}
                    >
                      <Check
                        size={13}
                        color="#22c55e"
                        style={{ flexShrink: 0, marginTop: 1 }}
                      />{" "}
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA BANNER ═══════════ */}
      <section style={{ padding: "96px 0" }}>
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            padding: "0 48px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              borderRadius: 24,
              border: "1px solid rgba(49,97,248,0.3)",
              padding: "64px 48px",
              position: "relative",
              overflow: "hidden",
              background:
                "linear-gradient(135deg,rgba(49,97,248,0.1) 0%,rgba(96,194,251,0.05) 100%)",
            }}
          >
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse 70% 50% at 50% 0%,rgba(49,97,248,0.2) 0%,transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <h2
              style={{
                fontSize: "clamp(26px,4vw,38px)",
                fontWeight: 900,
                color: "#e6edf3",
                marginBottom: 14,
                position: "relative",
              }}
            >
              Start talking to{" "}
              <span
                style={{
                  background: "linear-gradient(135deg,#60C2FB,#3161F8)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Echo today
              </span>
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "#8b9ab4",
                marginBottom: 36,
                position: "relative",
              }}
            >
              Connect Google, say hello, and let Echo take it from there. Free
              forever, no card required.
            </p>
            <button
              onClick={handleLogin}
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "15px 32px",
                borderRadius: 14,
                border: "none",
                background: "linear-gradient(135deg,#3161F8 0%,#60C2FB 100%)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  "translateY(-2px) scale(1.02)";
                e.currentTarget.style.boxShadow =
                  "0 16px 40px rgba(49,97,248,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <GoogleIcon /> Get started with Google <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer style={{ borderTop: "1px solid #1e2636", padding: "40px 0" }}>
        <div style={{ ...W, paddingTop: 0, paddingBottom: 0 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "linear-gradient(135deg,#3161F8,#60C2FB)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Zap size={13} color="#fff" strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#e6edf3" }}>
                Doploy
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
              {["Privacy", "Terms", "Changelog", "GitHub", "Status"].map(
                (l) => (
                  <a
                    key={l}
                    href="#"
                    style={{
                      fontSize: 12,
                      color: "#4d5d78",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#8b9ab4")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#4d5d78")
                    }
                  >
                    {l}
                  </a>
                ),
              )}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <p style={{ fontSize: 11, color: "#2a3347" }}>
              © 2026 Doploy. Built with Corsair MCP, Next.js, and TypeScript.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11,
                color: "#2a3347",
              }}
            >
              <Globe size={11} /> <span>Deployed on Vercel</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
