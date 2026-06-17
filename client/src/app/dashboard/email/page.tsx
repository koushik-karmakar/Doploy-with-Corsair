"use client";

import {
  Archive,
  ArchiveX,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Edit3,
  Filter,
  Inbox,
  Loader2,
  Mail,
  MailOpen,
  Moon,
  Paperclip,
  Pencil,
  RefreshCw,
  Reply,
  ReplyAll,
  RotateCcw,
  Search,
  Send,
  SendHorizonal,
  Sparkles,
  Star,
  Sun,
  Tag,
  Trash2,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/lib/api";
import { getGmailClient } from "@/lib/google";

// ─── Inline ThemeToggle (no external dependency) ─────────────────────────────
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const isDark = theme === "dark" || theme === "system";
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center rounded-lg border p-2 transition-colors"
        style={{
          border: "1px solid var(--border-color)",
          background: "transparent",
          color: "var(--text-muted)",
        }}
      >
        {isDark ? <Moon size={15} /> : <Sun size={15} />}
      </button>
      {open && (
        <div
          className="absolute right-0 top-10 z-50 flex flex-col overflow-hidden rounded-xl py-1 shadow-xl"
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border-color)",
            minWidth: 110,
          }}
        >
          {(["light", "dark", "system"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTheme(t);
                setOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 text-[12px] capitalize transition-colors"
              style={{
                color: theme === t ? "#3161F8" : "var(--text-secondary)",
                background:
                  theme === t ? "rgba(49,97,248,0.08)" : "transparent",
              }}
            >
              {t === "light" ? (
                <Sun size={12} />
              ) : t === "dark" ? (
                <Moon size={12} />
              ) : (
                <Circle size={12} />
              )}
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Email {
  id: string;
  from: string;
  fromEmail: string;
  initials: string;
  avatarColor: string;
  subject: string;
  preview: string;
  body: string;
  time: string;
  date: string;
  read: boolean;
  starred: boolean;
  hasAttachment: boolean;
  category: "primary" | "promotions" | "social";
  labels: string[];
}

type Tab = "primary" | "promotions" | "social";
type Folder =
  | "inbox"
  | "starred"
  | "sent"
  | "drafts"
  | "all"
  | "spam"
  | "trash";

// ─── Mock data ────────────────────────────────────────────────────────────────

const EMAILS: Email[] = [
  {
    id: "1",
    from: "Vercel",
    fromEmail: "noreply@vercel.com",
    initials: "V",
    avatarColor: "#3161F8",
    subject:
      "Failed production deployments on team 'Koushik Karmakar's projects'",
    preview:
      "Hello, Koushik Karmakar. There was an error deploying your project...",
    body: "Hello, Koushik Karmakar.\n\nThere was an error deploying your project to production. The deployment failed due to a build error in your Next.js application.\n\nError: Module not found: Can't resolve '@/components/ui/button'\n\nPlease check your build configuration and try again.",
    time: "10:51 AM",
    date: "Today",
    read: false,
    starred: true,
    hasAttachment: false,
    category: "primary",
    labels: ["Work"],
  },
  {
    id: "2",
    from: "LinkedIn Job Alerts",
    fromEmail: "jobalerts-noreply@linkedin.com",
    initials: "L",
    avatarColor: "#0a66c2",
    subject: "Javascript Developer - Remote Work at BairesDev",
    preview:
      "BairesDev Javascript Developer - Remote Work: At BairesDev, we've been...",
    body: "BairesDev Javascript Developer - Remote Work\n\nAt BairesDev, we've been leading the way in technology projects for over 15 years. We deliver cutting-edge solutions to giants like Google and the most innovative startups in Silicon Valley.\n\nApply now to join our team.",
    time: "10:50 AM",
    date: "Today",
    read: false,
    starred: false,
    hasAttachment: false,
    category: "primary",
    labels: [],
  },
  {
    id: "3",
    from: "LinkedIn Job Alerts",
    fromEmail: "jobalerts-noreply@linkedin.com",
    initials: "L",
    avatarColor: "#0a66c2",
    subject: "Frontend Developer Remote at FunEx",
    preview:
      "FunEx Frontend Developer Remote: HTML/CSS Developer with React Expertise...",
    body: "FunEx is hiring a Frontend Developer with React expertise for a remote position. Experience with TypeScript and Next.js is a plus.",
    time: "8:51 AM",
    date: "Today",
    read: true,
    starred: false,
    hasAttachment: false,
    category: "primary",
    labels: [],
  },
  {
    id: "4",
    from: "ThemeWagon Team",
    fromEmail: "team@themewagon.com",
    initials: "TW",
    avatarColor: "#7c3aed",
    subject: "Download link for your theme is arrived!",
    preview:
      "Download link for your theme is arrived! Thanks for downloading AIStarterKit...",
    body: "Thanks for downloading AIStarterKit from ThemeWagon!\n\nYour download link is ready. Click the button below to download your theme files.\n\nIf you have any questions, feel free to reach out to our support team.",
    time: "10:58 AM",
    date: "Today",
    read: true,
    starred: false,
    hasAttachment: true,
    category: "primary",
    labels: [],
  },
  {
    id: "5",
    from: "Medium Daily Digest",
    fromEmail: "noreply@medium.com",
    initials: "M",
    avatarColor: "#22c55e",
    subject:
      "A Single CLAUDE.md File Went Viral. The Reason Is Embarrassingly Simple.",
    preview: "Sumit Pandey in T... · Stories for Koushik Karmakar",
    body: "A Single CLAUDE.md File Went Viral. The Reason Is Embarrassingly Simple.\n\nBy Sumit Pandey\n\nEveryone thought it was about AI. It was actually about communication...",
    time: "Yesterday",
    date: "Yesterday",
    read: true,
    starred: false,
    hasAttachment: false,
    category: "promotions",
    labels: [],
  },
  {
    id: "6",
    from: "Naukri Alerts",
    fromEmail: "alerts@naukri.com",
    initials: "N",
    avatarColor: "#f59e0b",
    subject:
      "New Developer jobs in Kolkata matching your search - Salary up to Rs 2.1L per month",
    preview: "+ Developer jobs for you — Apply before positions close...",
    body: "New Developer jobs in Kolkata matching your search:\n\n1. React Developer - TechCorp (Rs 1.8L - 2.1L)\n2. Full Stack Developer - StartupX (Rs 1.5L - 2.0L)\n3. Frontend Engineer - DigitalCo (Rs 1.2L - 1.8L)",
    time: "Yesterday",
    date: "Yesterday",
    read: true,
    starred: false,
    hasAttachment: false,
    category: "promotions",
    labels: [],
  },
  {
    id: "7",
    from: "Google",
    fromEmail: "no-reply@accounts.google.com",
    initials: "G",
    avatarColor: "#4285F4",
    subject: "You shared some Google Account data with Koushik Karmakar",
    preview: "Keep track of your Google Account data koushik9339mail@gm...",
    body: "You recently shared your Google Account data. This email confirms the data sharing that occurred on your account.",
    time: "3:19 AM",
    date: "Today",
    read: true,
    starred: false,
    hasAttachment: false,
    category: "primary",
    labels: [],
  },
  {
    id: "8",
    from: "Grammarly Insights",
    fromEmail: "insights@grammarly.com",
    initials: "GR",
    avatarColor: "#15b097",
    subject: "A week without words?",
    preview:
      "There wasn't any writing activity last week. Get back to writing...",
    body: "It looks like you didn't use Grammarly last week. Writing is a skill that improves with practice — we're here whenever you're ready.",
    time: "11:58 PM",
    date: "Yesterday",
    read: true,
    starred: false,
    hasAttachment: false,
    category: "promotions",
    labels: [],
  },
  {
    id: "9",
    from: "Freshersworld",
    fromEmail: "noreply@freshersworld.com",
    initials: "FW",
    avatarColor: "#ec4899",
    subject: "Update your Job Profile on Freshersworld",
    preview:
      "Dear KoushikKarmakar, Your profile completion percentage score is 18%...",
    body: "Dear KoushikKarmakar,\n\nYour profile completion percentage score is 18%. Complete your profile to get better job matches and increase your chances of getting hired.",
    time: "5:40 AM",
    date: "Today",
    read: true,
    starred: false,
    hasAttachment: false,
    category: "promotions",
    labels: [],
  },
  {
    id: "10",
    from: "Jens.. sapidin1",
    fromEmail: "sapidin1@github.com",
    initials: "JS",
    avatarColor: "#8b5cf6",
    subject:
      "Re: [community/community] Issue fields: Structured issue metadata is in public preview",
    preview: "I had to... — Discussion #189141 in GitHub Community",
    body: "I had to chime in here because this feature is exactly what I've been waiting for. The structured metadata will make it so much easier to filter and organize issues across large repositories.",
    time: "8:33 AM",
    date: "Today",
    read: false,
    starred: false,
    hasAttachment: false,
    category: "social",
    labels: [],
  },
  {
    id: "11",
    from: "Sneha from foundit",
    fromEmail: "sneha@foundit.in",
    initials: "SF",
    avatarColor: "#f97316",
    subject: "Job recommendations for you | foundit (Monster)",
    preview:
      "Top job matching your profile — Koushik Karmakar, check these out...",
    body: "Hi Koushik Karmakar,\n\nWe've found some jobs that match your profile. Here are our top picks for you this week.",
    time: "11:58 PM",
    date: "Yesterday",
    read: true,
    starred: false,
    hasAttachment: false,
    category: "primary",
    labels: [],
  },
];

const NAV_FOLDERS: {
  id: Folder;
  label: string;
  icon: React.ReactNode;
  count?: number;
}[] = [
  { id: "inbox", label: "Inbox", icon: <Inbox size={15} />, count: 4 },
  { id: "starred", label: "Starred", icon: <Star size={15} /> },
  { id: "sent", label: "Sent", icon: <Send size={15} /> },
  { id: "drafts", label: "Drafts", icon: <Pencil size={15} />, count: 2 },
  { id: "all", label: "All Mail", icon: <Mail size={15} /> },
  { id: "spam", label: "Spam", icon: <ArchiveX size={15} /> },
  { id: "trash", label: "Trash", icon: <Trash2 size={15} /> },
];

const LABELS = [
  { name: "Work", color: "#3161F8" },
  { name: "Personal", color: "#22c55e" },
  { name: "Finance", color: "#f59e0b" },
  { name: "Travel", color: "#ec4899" },
];

// ─── Compose Modal ────────────────────────────────────────────────────────────

function ComposeModal({
  onClose,
  aiDraft,
}: {
  onClose: () => void;
  aiDraft?: string;
}) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState(aiDraft ?? "");
  const [generating, setGenerating] = useState(false);

  const handleAiDraft = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1200));
    setBody(
      "Hi,\n\nI hope this message finds you well. I wanted to follow up on our previous conversation regarding the project timeline.\n\nCould we schedule a quick call this week to align on the next steps?\n\nBest regards,\nKoushik",
    );
    setGenerating(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-end p-6"
      style={{ pointerEvents: "none" }}
    >
      <div
        className="flex flex-col overflow-hidden rounded-2xl border shadow-2xl"
        style={{
          pointerEvents: "all",
          width: 560,
          height: 480,
          background: "var(--compose-bg)",
          borderColor: "var(--border-color)",
          boxShadow:
            "0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(49,97,248,0.1)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid var(--border-color)" }}
        >
          <span
            className="text-[13px] font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            New Message
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleAiDraft}
              disabled={generating}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all"
              style={{
                background: "rgba(49,97,248,0.12)",
                border: "1px solid rgba(49,97,248,0.3)",
                color: "#60C2FB",
              }}
            >
              {generating ? (
                <Loader2 size={11} className="animate-spin" />
              ) : (
                <Sparkles size={11} />
              )}
              {generating ? "Drafting…" : "AI Draft"}
            </button>
            <button
              onClick={onClose}
              className="ml-1 rounded-lg p-1.5 transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Fields */}
        <div
          className="flex flex-col"
          style={{ borderBottom: "1px solid var(--border-color)" }}
        >
          <div
            className="flex items-center gap-3 px-4 py-2.5"
            style={{ borderBottom: "1px solid var(--border-light)" }}
          >
            <span
              className="w-12 text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: "var(--text-muted)" }}
            >
              To
            </span>
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Recipients"
              className="flex-1 bg-transparent text-[13px] outline-none"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5">
            <span
              className="w-12 text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: "var(--text-muted)" }}
            >
              Subject
            </span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="flex-1 bg-transparent text-[13px] outline-none"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
        </div>

        {/* Body */}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your message…"
          className="flex-1 resize-none bg-transparent px-4 py-3 text-[13px] outline-none"
          style={{ color: "var(--text-primary)", lineHeight: 1.65 }}
        />

        {/* Footer */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderTop: "1px solid var(--border-color)" }}
        >
          <div className="flex items-center gap-1">
            <button
              className="rounded-lg p-2 transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              <Paperclip size={14} />
            </button>
          </div>
          <button
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold text-white transition-all"
            style={{ background: "#3161F8" }}
          >
            <SendHorizonal size={13} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Email Detail Panel ───────────────────────────────────────────────────────

function EmailDetail({
  email,
  onClose,
  onReply,
}: {
  email: Email;
  onClose: () => void;
  onReply: () => void;
}) {
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);

  const handleSummarize = async () => {
    setSummarizing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setAiSummary(
      "This email is about a deployment failure in your Vercel project. The build failed due to a missing module. You should check your import paths and ensure all dependencies are installed.",
    );
    setSummarizing(false);
  };

  return (
    <div
      className="flex h-full flex-col"
      style={{ borderLeft: "1px solid var(--border-color)" }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid var(--border-color)" }}
      >
        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition-colors hover:bg-[#1e2636]"
            style={{ color: "var(--text-muted)" }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className="rounded-lg p-1.5 transition-colors hover:bg-[#1e2636]"
            style={{ color: "var(--text-muted)" }}
          >
            <Archive size={15} />
          </button>
          <button
            className="rounded-lg p-1.5 transition-colors hover:bg-[#1e2636]"
            style={{ color: "var(--text-muted)" }}
          >
            <Trash2 size={15} />
          </button>
          <button
            className="rounded-lg p-1.5 transition-colors hover:bg-[#1e2636]"
            style={{ color: "var(--text-muted)" }}
          >
            <MailOpen size={15} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSummarize}
            disabled={summarizing}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all"
            style={{
              background: "rgba(49,97,248,0.1)",
              border: "1px solid rgba(49,97,248,0.25)",
              color: "#60C2FB",
            }}
          >
            {summarizing ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <Sparkles size={11} />
            )}
            {summarizing ? "Summarizing…" : "AI Summary"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <h2
          className="mb-4 text-[18px] font-bold leading-snug"
          style={{ color: "var(--text-primary)" }}
        >
          {email.subject}
        </h2>

        {/* Sender info */}
        <div className="mb-5 flex items-start gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
            style={{ background: email.avatarColor }}
          >
            {email.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span
                  className="text-[13px] font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {email.from}
                </span>
                <span
                  className="ml-2 text-[11px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  &lt;{email.fromEmail}&gt;
                </span>
              </div>
              <span
                className="shrink-0 text-[11px]"
                style={{ color: "var(--text-muted)" }}
              >
                {email.date} · {email.time}
              </span>
            </div>
            <span
              className="text-[11px]"
              style={{ color: "var(--text-muted)" }}
            >
              to me
            </span>
          </div>
        </div>

        {/* AI Summary */}
        {aiSummary && (
          <div
            className="mb-5 rounded-xl p-4"
            style={{
              background: "rgba(49,97,248,0.06)",
              border: "1px solid rgba(49,97,248,0.2)",
            }}
          >
            <div className="mb-2 flex items-center gap-2">
              <Sparkles size={12} color="#60C2FB" />
              <span
                className="text-[11px] font-semibold uppercase tracking-wide"
                style={{ color: "#60C2FB" }}
              >
                Echo Summary
              </span>
            </div>
            <p
              className="text-[13px] leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {aiSummary}
            </p>
          </div>
        )}

        {/* Body */}
        <div
          className="text-[13px] leading-relaxed"
          style={{
            color: "var(--text-secondary)",
            whiteSpace: "pre-line",
          }}
        >
          {email.body}
        </div>
      </div>

      {/* Reply bar */}
      <div
        className="px-5 py-4"
        style={{ borderTop: "1px solid var(--border-color)" }}
      >
        <div
          className="flex cursor-text items-center gap-3 rounded-xl px-4 py-3"
          style={{
            border: "1px solid var(--border-color)",
            background: "var(--input-bg)",
          }}
          onClick={onReply}
        >
          <Reply size={14} style={{ color: "var(--text-muted)" }} />
          <span className="text-[13px]" style={{ color: "var(--text-muted)" }}>
            Reply to {email.from}…
          </span>
          <div className="ml-auto flex items-center gap-1">
            <button
              className="rounded-lg p-1.5 transition-colors hover:bg-[#1e2636]"
              style={{ color: "var(--text-muted)" }}
            >
              <Reply size={13} />
            </button>
            <button
              className="rounded-lg p-1.5 transition-colors hover:bg-[#1e2636]"
              style={{ color: "var(--text-muted)" }}
            >
              <ReplyAll size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Email Row ────────────────────────────────────────────────────────────────

function EmailRow({
  email,
  selected,
  checked,
  onClick,
  onCheck,
  onStar,
}: {
  email: Email;
  selected: boolean;
  checked: boolean;
  onClick: () => void;
  onCheck: (e: React.MouseEvent) => void;
  onStar: (e: React.MouseEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors"
      style={{
        background: selected
          ? "rgba(49,97,248,0.08)"
          : hovered
            ? "var(--row-hover)"
            : !email.read
              ? "var(--row-unread)"
              : "transparent",
        borderBottom: "1px solid var(--border-light)",
        borderLeft: selected ? "2px solid #3161F8" : "2px solid transparent",
      }}
    >
      {/* Checkbox */}
      <button
        onClick={onCheck}
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded"
        style={{
          border: checked ? "none" : "1.5px solid var(--text-muted)",
          background: checked ? "#3161F8" : "transparent",
          opacity: hovered || checked ? 1 : 0,
          transition: "opacity 0.15s",
        }}
      >
        {checked && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path
              d="M1 3.5L3.5 6L8 1"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Star */}
      <button
        onClick={onStar}
        className="shrink-0 transition-colors"
        style={{
          color: email.starred ? "#f59e0b" : "var(--text-muted)",
          opacity: hovered || email.starred ? 1 : 0,
          transition: "opacity 0.15s, color 0.15s",
        }}
      >
        <Star size={14} fill={email.starred ? "#f59e0b" : "none"} />
      </button>

      {/* Avatar */}
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
        style={{ background: email.avatarColor }}
      >
        {email.initials}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span
          className="w-36 shrink-0 truncate text-[13px]"
          style={{
            color: "var(--text-primary)",
            fontWeight: email.read ? 400 : 600,
          }}
        >
          {email.from}
        </span>

        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <span
            className="shrink-0 text-[13px]"
            style={{
              color: "var(--text-primary)",
              fontWeight: email.read ? 400 : 600,
            }}
          >
            {email.subject}
          </span>
          <span
            className="truncate text-[13px]"
            style={{ color: "var(--text-muted)" }}
          >
            — {email.preview}
          </span>
        </div>

        {/* Right side */}
        <div className="flex shrink-0 items-center gap-2">
          {email.hasAttachment && (
            <Paperclip size={12} style={{ color: "var(--text-muted)" }} />
          )}
          {email.labels.map((l) => {
            const label = LABELS.find((lb) => lb.name === l);
            return (
              <span
                key={l}
                className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                style={{
                  background: `${label?.color ?? "#3161F8"}18`,
                  color: label?.color ?? "#3161F8",
                }}
              >
                {l}
              </span>
            );
          })}
          <span
            className="text-[12px]"
            style={{
              color: "var(--text-muted)",
              fontWeight: email.read ? 400 : 600,
              minWidth: 56,
              textAlign: "right",
            }}
          >
            {email.time}
          </span>

          {/* Hover actions */}
          <div
            className="flex items-center gap-0.5"
            style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.15s" }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="rounded p-1 transition-colors hover:bg-[#1e2636]"
              style={{ color: "var(--text-muted)" }}
            >
              <Archive size={13} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="rounded p-1 transition-colors hover:bg-[#1e2636]"
              style={{ color: "var(--text-muted)" }}
            >
              <Clock size={13} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="rounded p-1 transition-colors hover:bg-[#1e2636]"
              style={{ color: "var(--text-muted)" }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  activeFolder,
  onFolderChange,
  onCompose,
}: {
  activeFolder: Folder;
  onFolderChange: (f: Folder) => void;
  onCompose: () => void;
}) {
  const { user } = useAuth();

  return (
    <aside
      className="flex h-[calc(100%-60px)] flex-col"
      style={{
        width: 220,
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--border-color)",
        flexShrink: 0,
      }}
    >
      {/* Logo */}

      {/* Compose */}
      <div className="px-4 py-3">
        <button
          onClick={onCompose}
          className="flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white transition-all"
          style={{
            background: "linear-gradient(135deg,#3161F8,#60C2FB)",
            boxShadow: "0 4px 14px rgba(49,97,248,0.3)",
          }}
        >
          <Edit3 size={14} />
          Compose
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-3 py-1">
        {NAV_FOLDERS.map((folder) => (
          <button
            key={folder.id}
            onClick={() => onFolderChange(folder.id)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors"
            style={{
              background:
                activeFolder === folder.id
                  ? "rgba(49,97,248,0.12)"
                  : "transparent",
              color:
                activeFolder === folder.id
                  ? "#3161F8"
                  : "var(--text-secondary)",
            }}
          >
            <span
              style={{
                color:
                  activeFolder === folder.id ? "#3161F8" : "var(--text-muted)",
              }}
            >
              {folder.icon}
            </span>
            <span className="flex-1">{folder.label}</span>
            {folder.count ? (
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                style={{
                  background:
                    activeFolder === folder.id ? "#3161F8" : "var(--badge-bg)",
                  color:
                    activeFolder === folder.id ? "white" : "var(--text-muted)",
                }}
              >
                {folder.count}
              </span>
            ) : null}
          </button>
        ))}
      </nav>

      {/* Divider */}
      <div
        className="mx-4 my-2"
        style={{ height: 1, background: "var(--border-color)" }}
      />
    </aside>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmailPage() {
  const [activeFolder, setActiveFolder] = useState<Folder>("inbox");
  const [activeTab, setActiveTab] = useState<Tab>("primary");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [composing, setComposing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [emails, setEmails] = useState<Email[]>(EMAILS);

  const filtered = emails.filter(
    (e) =>
      e.category === activeTab &&
      (searchQuery === "" ||
        e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.from.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const unreadCount = filtered.filter((e) => !e.read).length;

  const toggleCheck = (id: string, ev: React.MouseEvent) => {
    ev.stopPropagation();
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleStar = (id: string, ev: React.MouseEvent) => {
    ev.stopPropagation();
    setEmails((prev) =>
      prev.map((e) => (e.id === id ? { ...e, starred: !e.starred } : e)),
    );
  };

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
    setEmails((prev) =>
      prev.map((e) => (e.id === email.id ? { ...e, read: true } : e)),
    );
  };

  const TABS: {
    id: Tab;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }[] = [
    {
      id: "primary",
      label: "Primary",
      icon: <Inbox size={14} />,
      count:
        emails.filter((e) => e.category === "primary" && !e.read).length ||
        undefined,
    },
    {
      id: "promotions",
      label: "Promotions",
      icon: <Tag size={14} />,
    },
    {
      id: "social",
      label: "Social",
      icon: <Users size={14} />,
    },
  ];

  return (
    <>
      {/* CSS variables for light/dark */}
      <style>{`
        :root {
          --sidebar-bg: #0f1623;
          --main-bg: #0d1117;
          --card-bg: #161b22;
          --compose-bg: #161b22;
          --border-color: #1e2636;
          --border-light: rgba(30,38,54,0.6);
          --text-primary: #e6edf3;
          --text-secondary: #c9d1d9;
          --text-muted: #8b9ab4;
          --row-hover: rgba(255,255,255,0.025);
          --row-unread: rgba(49,97,248,0.04);
          --badge-bg: #1e2636;
          --input-bg: #0d1117;
          --tab-active-bg: rgba(49,97,248,0.1);
          --search-bg: #161b22;
        }
        .dark {
          --sidebar-bg: #0f1623;
          --main-bg: #0d1117;
          --card-bg: #161b22;
          --compose-bg: #161b22;
          --border-color: #1e2636;
          --border-light: rgba(30,38,54,0.6);
          --text-primary: #e6edf3;
          --text-secondary: #c9d1d9;
          --text-muted: #8b9ab4;
          --row-hover: rgba(255,255,255,0.025);
          --row-unread: rgba(49,97,248,0.04);
          --badge-bg: #1e2636;
          --input-bg: #0d1117;
          --tab-active-bg: rgba(49,97,248,0.1);
          --search-bg: #161b22;
        }
        html.light, .light {
          --sidebar-bg: #f8fafc;
          --main-bg: #ffffff;
          --card-bg: #f1f5f9;
          --compose-bg: #ffffff;
          --border-color: #e2e8f0;
          --border-light: rgba(226,232,240,0.8);
          --text-primary: #0f172a;
          --text-secondary: #334155;
          --text-muted: #64748b;
          --row-hover: rgba(49,97,248,0.03);
          --row-unread: rgba(49,97,248,0.05);
          --badge-bg: #e2e8f0;
          --input-bg: #f8fafc;
          --tab-active-bg: rgba(49,97,248,0.08);
          --search-bg: #f1f5f9;
        }
      `}</style>

      <div
        className="flex h-full overflow-hidden"
        style={{ background: "var(--main-bg)" }}
      >
        <Sidebar
          activeFolder={activeFolder}
          onFolderChange={setActiveFolder}
          onCompose={() => setComposing(true)}
        />

        {/* Main area */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/* Top bar */}
          <div
            className="flex items-center gap-3 px-5 py-3"
            style={{ borderBottom: "1px solid var(--border-color)" }}
          >
            {/* Search */}
            <div
              className="flex flex-1 items-center gap-2.5 rounded-xl px-4 py-2"
              style={{
                background: "var(--search-bg)",
                border: "1px solid var(--border-color)",
                maxWidth: 600,
              }}
            >
              <Search
                size={14}
                style={{ color: "var(--text-muted)", flexShrink: 0 }}
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mail…"
                className="flex-1 bg-transparent text-[13px] outline-none"
                style={{ color: "var(--text-primary)" }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}>
                  <X size={13} style={{ color: "var(--text-muted)" }} />
                </button>
              )}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                className="rounded-lg p-2 transition-colors hover:bg-[#1e2636]"
                style={{ color: "var(--text-muted)" }}
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </div>

          {/* Email list + detail split */}
          <div className="flex min-h-0 flex-1">
            {/* List panel */}
            <div
              className="flex flex-col"
              style={{
                width: selectedEmail ? 480 : "100%",
                flexShrink: 0,
                borderRight: selectedEmail
                  ? "1px solid var(--border-color)"
                  : "none",
                transition: "width 0.2s",
              }}
            >
              {/* Tabs */}
              <div
                className="flex items-center gap-0 px-2"
                style={{ borderBottom: "1px solid var(--border-color)" }}
              >
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="relative flex items-center gap-2 px-4 py-3 text-[13px] font-medium transition-colors"
                    style={{
                      color:
                        activeTab === tab.id ? "#3161F8" : "var(--text-muted)",
                      borderBottom:
                        activeTab === tab.id
                          ? "2px solid #3161F8"
                          : "2px solid transparent",
                    }}
                  >
                    <span
                      style={{
                        color:
                          activeTab === tab.id
                            ? "#3161F8"
                            : "var(--text-muted)",
                      }}
                    >
                      {tab.icon}
                    </span>
                    {tab.label}
                    {tab.count ? (
                      <span
                        className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                        style={{
                          background:
                            activeTab === tab.id
                              ? "#3161F8"
                              : "var(--badge-bg)",
                          color:
                            activeTab === tab.id
                              ? "white"
                              : "var(--text-muted)",
                        }}
                      >
                        {tab.count}
                      </span>
                    ) : null}
                  </button>
                ))}

                {/* Toolbar right */}
                <div className="ml-auto flex items-center gap-1 pr-2">
                  <span
                    className="text-[11px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    1–{filtered.length} of {filtered.length}
                  </span>
                  <button
                    className="rounded p-1 transition-colors hover:bg-[#1e2636]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    className="rounded p-1 transition-colors hover:bg-[#1e2636]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Select all / actions bar */}
              {checkedIds.size > 0 && (
                <div
                  className="flex items-center gap-2 px-4 py-2"
                  style={{
                    borderBottom: "1px solid var(--border-color)",
                    background: "rgba(49,97,248,0.05)",
                  }}
                >
                  <span
                    className="text-[12px] font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {checkedIds.size} selected
                  </span>
                  <div className="ml-2 flex items-center gap-1">
                    <button
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] transition-colors hover:bg-[#1e2636]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <Archive size={12} /> Archive
                    </button>
                    <button
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] transition-colors hover:bg-[#1e2636]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                    <button
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] transition-colors hover:bg-[#1e2636]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <MailOpen size={12} /> Mark read
                    </button>
                  </div>
                  <button
                    className="ml-auto rounded-lg p-1 transition-colors hover:bg-[#1e2636]"
                    onClick={() => setCheckedIds(new Set())}
                    style={{ color: "var(--text-muted)" }}
                  >
                    <X size={13} />
                  </button>
                </div>
              )}

              {/* Email rows */}
              <div className="flex-1 overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-24">
                    <RotateCcw
                      size={32}
                      style={{ color: "var(--text-muted)", opacity: 0.4 }}
                    />
                    <p
                      className="text-[13px]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {searchQuery ? "No results found" : "No messages here"}
                    </p>
                  </div>
                ) : (
                  filtered.map((email) => (
                    <EmailRow
                      key={email.id}
                      email={email}
                      selected={selectedEmail?.id === email.id}
                      checked={checkedIds.has(email.id)}
                      onClick={() => handleEmailClick(email)}
                      onCheck={(e) => toggleCheck(email.id, e)}
                      onStar={(e) => toggleStar(email.id, e)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Detail panel */}
            {selectedEmail && (
              <div className="min-w-0 flex-1">
                <EmailDetail
                  email={selectedEmail}
                  onClose={() => setSelectedEmail(null)}
                  onReply={() => setComposing(true)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Compose modal */}
        {composing && <ComposeModal onClose={() => setComposing(false)} />}
      </div>
    </>
  );
}
