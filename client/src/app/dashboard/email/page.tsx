"use client";

import {
  Archive,
  ArchiveX,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Edit3,
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
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/lib/api";

// ─── ThemeToggle ──────────────────────────────────────────────────────────────
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const isDark = theme === "dark" || theme === "system";
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center rounded-lg p-2 transition-colors"
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

// ─── Constants ────────────────────────────────────────────────────────────────
const POLL_INTERVAL_MS = 30_000;
const EMAIL_LIMIT = 10;

const NAV_FOLDERS: {
  id: Folder;
  label: string;
  icon: React.ReactNode;
}[] = [
    { id: "inbox", label: "Inbox", icon: <Inbox size={15} /> },
    { id: "starred", label: "Starred", icon: <Star size={15} /> },
    { id: "sent", label: "Sent", icon: <Send size={15} /> },
    { id: "drafts", label: "Drafts", icon: <Pencil size={15} /> },
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
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your message…"
          className="flex-1 resize-none bg-transparent px-4 py-3 text-[13px] outline-none"
          style={{ color: "var(--text-primary)", lineHeight: 1.65 }}
        />
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
            <SendHorizonal size={13} /> Send
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Email Detail View (full panel replacement) ───────────────────────────────
function EmailDetail({
  email,
  onBack,
  onReply,
  total,
  currentIndex,
  onPrev,
  onNext,
}: {
  email: Email;
  onBack: () => void;
  onReply: () => void;
  total: number;
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
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
      className="flex flex-col overflow-y-auto"
      style={{ background: "var(--main-bg)" }}
    >
      {/* Fixed toolbar */}
      <div
        className="flex flex-shrink-0 items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid var(--border-color)" }}
      >
        <div className="flex items-center gap-1">
          {/* Back to inbox */}
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-colors hover:bg-[rgba(49,97,248,0.08)]"
            style={{ color: "var(--text-muted)" }}
          >
            <ChevronLeft size={15} />
            Inbox
          </button>
          <div
            className="mx-1 h-4 w-px"
            style={{ background: "var(--border-color)" }}
          />
          <button
            className="rounded-lg p-1.5 transition-colors hover:bg-[rgba(255,255,255,0.04)]"
            style={{ color: "var(--text-muted)" }}
          >
            <Archive size={15} />
          </button>
          <button
            className="rounded-lg p-1.5 transition-colors hover:bg-[rgba(255,255,255,0.04)]"
            style={{ color: "var(--text-muted)" }}
          >
            <Trash2 size={15} />
          </button>
          <button
            className="rounded-lg p-1.5 transition-colors hover:bg-[rgba(255,255,255,0.04)]"
            style={{ color: "var(--text-muted)" }}
          >
            <MailOpen size={15} />
          </button>
          <button
            className="rounded-lg p-1.5 transition-colors hover:bg-[rgba(255,255,255,0.04)]"
            style={{ color: "var(--text-muted)" }}
          >
            <Clock size={15} />
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

          {/* Pagination */}
          <div className="flex items-center gap-0.5">
            <span
              className="px-1 text-[11px]"
              style={{ color: "var(--text-muted)" }}
            >
              {currentIndex + 1} of {total}
            </span>
            <button
              onClick={onPrev}
              disabled={currentIndex === 0}
              className="rounded-lg p-1.5 transition-colors hover:bg-[rgba(255,255,255,0.04)] disabled:opacity-30"
              style={{ color: "var(--text-muted)" }}
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={onNext}
              disabled={currentIndex === total - 1}
              className="rounded-lg p-1.5 transition-colors hover:bg-[rgba(255,255,255,0.04)] disabled:opacity-30"
              style={{ color: "var(--text-muted)" }}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable email content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Subject */}
        <h2
          className="mb-5 text-[22px] font-bold leading-snug"
          style={{ color: "var(--text-primary)" }}
        >
          {email.subject}
        </h2>

        {/* Sender row */}
        <div className="mb-6 flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
            style={{ background: email.avatarColor }}
          >
            {email.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span
                  className="text-[14px] font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {email.from}
                </span>
                <span
                  className="ml-2 text-[12px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  &lt;{email.fromEmail}&gt;
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className="text-[12px]"
                  style={{ color: "var(--text-muted)" }}
                >
                  {email.date} · {email.time}
                </span>
                <button
                  className="rounded-lg p-1 transition-colors hover:bg-[rgba(255,255,255,0.04)]"
                  style={{ color: "var(--text-muted)" }}
                >
                  <Star
                    size={14}
                    fill={email.starred ? "#f59e0b" : "none"}
                    color={email.starred ? "#f59e0b" : "currentColor"}
                  />
                </button>
                <button
                  className="rounded-lg p-1 transition-colors hover:bg-[rgba(255,255,255,0.04)]"
                  style={{ color: "var(--text-muted)" }}
                >
                  <Reply size={14} />
                </button>
              </div>
            </div>
            <span
              className="text-[12px]"
              style={{ color: "var(--text-muted)" }}
            >
              to me
            </span>
          </div>
        </div>

        {/* AI Summary box */}
        {aiSummary && (
          <div
            className="mb-6 rounded-xl p-4"
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

        {/* Divider */}
        <div
          className="mb-6"
          style={{ height: 1, background: "var(--border-color)" }}
        />

        {/* Email body */}
        <div
          className="text-[14px] leading-relaxed"
          style={{ color: "var(--text-secondary)", whiteSpace: "pre-line" }}
        >
          {email.body}
        </div>
      </div>

      {/* Fixed reply bar */}
      <div
        className="flex-shrink-0 px-8 py-4"
        style={{ borderTop: "1px solid var(--border-color)" }}
      >
        <div
          className="flex cursor-text items-center gap-3 rounded-xl px-4 py-3 transition-colors"
          style={{
            border: "1px solid var(--border-color)",
            background: "var(--input-bg)",
          }}
          onClick={onReply}
        >
          <Reply size={14} style={{ color: "var(--text-muted)" }} />
          <span
            className="flex-1 text-[13px]"
            style={{ color: "var(--text-muted)" }}
          >
            Reply to {email.from}…
          </span>
          <div className="flex items-center gap-1">
            <button
              className="rounded-lg p-1.5 transition-colors hover:bg-[rgba(255,255,255,0.06)]"
              style={{ color: "var(--text-muted)" }}
              onClick={(e) => {
                e.stopPropagation();
                onReply();
              }}
            >
              <Reply size={13} />
            </button>
            <button
              className="rounded-lg p-1.5 transition-colors hover:bg-[rgba(255,255,255,0.06)]"
              style={{ color: "var(--text-muted)" }}
              onClick={(e) => e.stopPropagation()}
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
              onClick={(e) => e.stopPropagation()}
              className="rounded p-1 transition-colors hover:bg-[rgba(255,255,255,0.06)]"
              style={{ color: "var(--text-muted)" }}
            >
              <Archive size={13} />
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              className="rounded p-1 transition-colors hover:bg-[rgba(255,255,255,0.06)]"
              style={{ color: "var(--text-muted)" }}
            >
              <Clock size={13} />
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              className="rounded p-1 transition-colors hover:bg-[rgba(255,255,255,0.06)]"
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
  inboxUnreadCount,
}: {
  activeFolder: Folder;
  onFolderChange: (f: Folder) => void;
  onCompose: () => void;
  inboxUnreadCount: number;
}) {
  return (
    // height: 100% fills the parent which is calc(100vh - topnav)
    <aside
      className="flex flex-col"
      style={{
        width: 220,
        flexShrink: 0,
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--border-color)",
        height: "100%",
      }}
    >
      {/* Compose */}
      <div className="flex-shrink-0 px-4 py-3">
        <button
          onClick={onCompose}
          className="flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white transition-all"
          style={{
            background: "linear-gradient(135deg,#3161F8,#60C2FB)",
            boxShadow: "0 4px 14px rgba(49,97,248,0.3)",
          }}
        >
          <Edit3 size={14} /> Compose
        </button>
      </div>

      {/* Nav — scrollable if many folders */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-1">
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
            {folder.id === "inbox" && inboxUnreadCount > 0 ? (
              <span
                className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                style={{
                  background:
                    activeFolder === folder.id ? "#3161F8" : "var(--badge-bg)",
                  color:
                    activeFolder === folder.id ? "white" : "var(--text-muted)",
                }}
              >
                {inboxUnreadCount}
              </span>
            ) : null}
          </button>
        ))}
      </nav>
    </aside>
  );
}

// ─── Email List View ──────────────────────────────────────────────────────────
function EmailListView({
  filtered,
  activeTab,
  setActiveTab,
  checkedIds,
  selectedEmailId,
  onEmailClick,
  onCheck,
  onStar,
  onClearChecked,
  emails,
  searchQuery,
  isLoading,
  error,
}: {
  filtered: Email[];
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  checkedIds: Set<string>;
  selectedEmailId: string | null;
  onEmailClick: (email: Email) => void;
  onCheck: (id: string, e: React.MouseEvent) => void;
  onStar: (id: string, e: React.MouseEvent) => void;
  onClearChecked: () => void;
  emails: Email[];
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}) {
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
      { id: "promotions", label: "Promotions", icon: <Tag size={14} /> },
      { id: "social", label: "Social", icon: <Users size={14} /> },
    ];

  return (
    <div
      className="flex h-full flex-col"
      style={{ background: "var(--main-bg)" }}
    >
      {/* Fixed tabs bar */}
      <div
        className="flex flex-shrink-0 items-center gap-0 px-2"
        style={{ borderBottom: "1px solid var(--border-color)" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative flex items-center gap-2 px-4 py-3 text-[13px] font-medium transition-colors"
            style={{
              color: activeTab === tab.id ? "#3161F8" : "var(--text-muted)",
              borderBottom:
                activeTab === tab.id
                  ? "2px solid #3161F8"
                  : "2px solid transparent",
            }}
          >
            <span
              style={{
                color: activeTab === tab.id ? "#3161F8" : "var(--text-muted)",
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
                    activeTab === tab.id ? "#3161F8" : "var(--badge-bg)",
                  color: activeTab === tab.id ? "white" : "var(--text-muted)",
                }}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-1 pr-2">
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            1–{filtered.length} of {filtered.length}
          </span>
          <button
            className="rounded p-1 transition-colors hover:bg-[rgba(255,255,255,0.04)]"
            style={{ color: "var(--text-muted)" }}
          >
            <ChevronLeft size={14} />
          </button>
          <button
            className="rounded p-1 transition-colors hover:bg-[rgba(255,255,255,0.04)]"
            style={{ color: "var(--text-muted)" }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Fixed checked-items action bar */}
      {checkedIds.size > 0 && (
        <div
          className="flex flex-shrink-0 items-center gap-2 px-4 py-2"
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
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] transition-colors hover:bg-[rgba(255,255,255,0.06)]"
              style={{ color: "var(--text-muted)" }}
            >
              <Archive size={12} /> Archive
            </button>
            <button
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] transition-colors hover:bg-[rgba(255,255,255,0.06)]"
              style={{ color: "var(--text-muted)" }}
            >
              <Trash2 size={12} /> Delete
            </button>
            <button
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] transition-colors hover:bg-[rgba(255,255,255,0.06)]"
              style={{ color: "var(--text-muted)" }}
            >
              <MailOpen size={12} /> Mark read
            </button>
          </div>
          <button
            className="ml-auto rounded-lg p-1 transition-colors hover:bg-[rgba(255,255,255,0.06)]"
            onClick={onClearChecked}
            style={{ color: "var(--text-muted)" }}
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* ONLY this area scrolls */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24">
            <Loader2
              size={32}
              className="animate-spin"
              style={{ color: "var(--text-muted)", opacity: 0.6 }}
            />
            <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
              Loading your inbox…
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-24 text-center">
            <p className="text-[13px]" style={{ color: "#ef4444" }}>
              {error}
            </p>
            <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
              Try refreshing or log out and sign in again to grant Gmail access.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24">
            <RotateCcw
              size={32}
              style={{ color: "var(--text-muted)", opacity: 0.4 }}
            />
            <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
              {searchQuery ? "No results found" : "No messages here"}
            </p>
          </div>
        ) : (
          filtered.map((email) => (
            <EmailRow
              key={email.id}
              email={email}
              selected={selectedEmailId === email.id}
              checked={checkedIds.has(email.id)}
              onClick={() => onEmailClick(email)}
              onCheck={(e) => onCheck(email.id, e)}
              onStar={(e) => onStar(email.id, e)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function EmailPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeFolder, setActiveFolder] = useState<Folder>("inbox");
  const [activeTab, setActiveTab] = useState<Tab>("primary");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [composing, setComposing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialSyncDone = useRef(false);

  const fetchEmails = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const { data } = await api.get<{
        success: boolean;
        data: { emails: Email[] };
      }>("/gmail/messages", {
        params: {
          limit: EMAIL_LIMIT,
          folder: activeFolder,
          category: activeTab,
        },
      });

      setEmails(data.data.emails);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load emails";
      setError(message);
    }
  }, [isAuthenticated, activeFolder, activeTab]);

  const syncGmail = useCallback(
    async (showSpinner = true) => {
      if (!isAuthenticated) return;

      if (showSpinner) setIsSyncing(true);
      try {
        await api.post("/gmail/sync", null, {
          params: { limit: EMAIL_LIMIT },
        });
        await fetchEmails();
        setError(null);
      } catch (err: unknown) {
        const axiosErr = err as {
          response?: { data?: { message?: string } };
        };
        const message =
          axiosErr.response?.data?.message ??
          (err instanceof Error ? err.message : "Failed to sync Gmail");
        setError(message);
      } finally {
        if (showSpinner) setIsSyncing(false);
        setIsLoading(false);
      }
    },
    [isAuthenticated, fetchEmails],
  );

  // Initial load: sync from Gmail then show DB data
  useEffect(() => {
    if (authLoading || !isAuthenticated || initialSyncDone.current) return;
    initialSyncDone.current = true;
    void syncGmail(true);
  }, [authLoading, isAuthenticated, syncGmail]);

  // Refetch from DB when folder/tab changes (no Gmail API call)
  useEffect(() => {
    if (!isAuthenticated || !initialSyncDone.current) return;
    setIsLoading(true);
    void fetchEmails().finally(() => setIsLoading(false));
  }, [isAuthenticated, activeFolder, activeTab, fetchEmails]);

  // Poll Gmail every 30s for near-real-time updates
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      void syncGmail(false);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isAuthenticated, syncGmail]);

  const inboxUnreadCount = emails.filter((e) => !e.read).length;

  const filtered = emails.filter(
    (e) =>
      e.category === activeTab &&
      (searchQuery === "" ||
        e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.from.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const selectedIndex = selectedEmail
    ? filtered.findIndex((e) => e.id === selectedEmail.id)
    : -1;

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

  const handleBack = () => setSelectedEmail(null);
  const handlePrev = () => {
    if (selectedIndex > 0) setSelectedEmail(filtered[selectedIndex - 1]!);
  };
  const handleNext = () => {
    if (selectedIndex < filtered.length - 1)
      setSelectedEmail(filtered[selectedIndex + 1]!);
  };

  return (
    <>
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
          --search-bg: #f1f5f9;
        }
      `}</style>

      <div
        className="flex h-screen overflow-hidden"
        style={{ background: "var(--main-bg)" }}
      >
        {/* ── Sidebar — fixed height, does not scroll the page ── */}
        <Sidebar
          activeFolder={activeFolder}
          onFolderChange={(f) => {
            setActiveFolder(f);
            setSelectedEmail(null);
          }}
          onCompose={() => setComposing(true)}
          inboxUnreadCount={inboxUnreadCount}
        />

        {/* ── Main column — flex column, fills remaining width ── */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {/* Fixed top search bar */}
          <div
            className="flex flex-shrink-0 items-center gap-3 px-5 py-3"
            style={{ borderBottom: "1px solid var(--border-color)" }}
          >
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
              <ThemeToggle />
              <button
                onClick={() => void syncGmail(true)}
                disabled={isSyncing}
                className="rounded-lg p-2 transition-colors hover:bg-[rgba(255,255,255,0.04)] disabled:opacity-50"
                style={{ color: "var(--text-muted)" }}
                title="Sync from Gmail"
              >
                <RefreshCw
                  size={15}
                  className={isSyncing ? "animate-spin" : undefined}
                />
              </button>
            </div>
          </div>

          {/* Content area — either list or detail, fills remaining space */}
          <div className="min-h-0 flex-1 overflow-hidden">
            {selectedEmail ? (
              /* Email detail replaces the list completely */
              <EmailDetail
                email={selectedEmail}
                onBack={handleBack}
                onReply={() => setComposing(true)}
                total={filtered.length}
                currentIndex={selectedIndex}
                onPrev={handlePrev}
                onNext={handleNext}
              />
            ) : (
              /* Email list with tabs */
              <EmailListView
                filtered={filtered}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                checkedIds={checkedIds}
                selectedEmailId={selectedEmail}
                onEmailClick={handleEmailClick}
                onCheck={toggleCheck}
                onStar={toggleStar}
                onClearChecked={() => setCheckedIds(new Set())}
                emails={emails}
                searchQuery={searchQuery}
                isLoading={isLoading}
                error={error}
              />
            )}
          </div>
        </div>
      </div>

      {composing && <ComposeModal onClose={() => setComposing(false)} />}
    </>
  );
}
