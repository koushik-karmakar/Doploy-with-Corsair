"use client";

import {
  Bot,
  CalendarPlus,
  CheckCircle2,
  Keyboard,
  Loader2,
  Mail,
  Mic,
  MicOff,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Mode = "text" | "voice";

interface Message {
  id: string;
  role: "ai" | "user";
  content: string;
  type?: "text" | "email-draft" | "meeting-confirm" | "typing";
  draft?: EmailDraft;
  meeting?: MeetingDraft;
}

interface EmailDraft {
  to: string;
  subject: string;
  body: string;
}

interface MeetingDraft {
  title: string;
  date: string;
  time: string;
  attendees: string[];
}

const uid = () => Math.random().toString(36).slice(2, 9);

const QUICK_PROMPTS = [
  "Any meetings today?",
  "Show my pending emails",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function WaveformBars({ active }: { active: boolean }) {
  return (
    <div className="flex h-8 items-end gap-[3px]">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className={[
            "w-[3px] rounded-full transition-all duration-300",
            active ? "bg-[#60C2FB]" : "bg-[#2a3347]",
          ].join(" ")}
          style={{
            height: active
              ? `${Math.max(6, Math.sin((i / 11) * Math.PI) * 28 + 8)}px`
              : "6px",
            animation: active
              ? `waveAnim ${0.8 + (i % 4) * 0.15}s ease-in-out infinite alternate`
              : "none",
            animationDelay: `${i * 0.06}s`,
          }}
        />
      ))}
    </div>
  );
}

function EmailDraftCard({
  draft,
  onSend,
  onEdit,
}: {
  draft: EmailDraft;
  onSend: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-[#60C2FB]/20 bg-[#0d1117]">
      {/* Header bar */}
      <div className="flex items-center gap-2 border-b border-[#60C2FB]/10 bg-[#60C2FB]/5 px-4 py-2">
        <CheckCircle2 size={13} className="text-[#60C2FB]" />
        <span className="text-[11px] font-medium tracking-wide text-[#60C2FB]">
          Draft ready · Last-minute check
        </span>
      </div>

      {/* Fields */}
      <div className="space-y-1 px-4 pb-1 pt-3 text-[12px]">
        <div className="flex gap-2">
          <span className="w-14 shrink-0 text-[#7d8590]">To:</span>
          <span className="text-[#e6edf3]">{draft.to}</span>
        </div>
        <div className="flex gap-2">
          <span className="w-14 shrink-0 text-[#7d8590]">Subject:</span>
          <span className="text-[#e6edf3]">{draft.subject}</span>
        </div>
      </div>

      <div className="mx-4 my-2 border-t border-[#2a3347]" />

      <p className="whitespace-pre-line px-4 pb-4 text-[12px] leading-relaxed text-[#b0bec5]">
        {draft.body}
      </p>

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-4">
        <button
          onClick={onSend}
          className="flex items-center gap-1.5 rounded-lg bg-[#3161F8] px-4 py-2 text-[12px] font-medium text-white transition-colors hover:bg-[#4a77f8]"
        >
          <Mail size={13} />
          Send Gmail
        </button>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 rounded-lg border border-[#2a3347] px-4 py-2 text-[12px] text-[#7d8590] transition-colors hover:border-[#3161F8] hover:text-[#e6edf3]"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

function MeetingConfirmCard({
  meeting,
  onSave,
}: {
  meeting: MeetingDraft;
  onSave: () => void;
}) {
  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-[#818cf8]/20 bg-[#0d1117]">
      <div className="flex items-center gap-2 border-b border-[#818cf8]/10 bg-[#818cf8]/5 px-4 py-2">
        <CalendarPlus size={13} className="text-[#818cf8]" />
        <span className="text-[11px] font-medium tracking-wide text-[#818cf8]">
          Calendar event ready
        </span>
      </div>
      <div className="space-y-1 px-4 py-3 text-[12px]">
        <div className="flex gap-2">
          <span className="w-20 shrink-0 text-[#7d8590]">Title:</span>
          <span className="text-[#e6edf3]">{meeting.title}</span>
        </div>
        <div className="flex gap-2">
          <span className="w-20 shrink-0 text-[#7d8590]">Date:</span>
          <span className="text-[#e6edf3]">{meeting.date}</span>
        </div>
        <div className="flex gap-2">
          <span className="w-20 shrink-0 text-[#7d8590]">Time:</span>
          <span className="text-[#e6edf3]">{meeting.time}</span>
        </div>
        <div className="flex gap-2">
          <span className="w-20 shrink-0 text-[#7d8590]">Attendees:</span>
          <span className="text-[#e6edf3]">{meeting.attendees.join(", ")}</span>
        </div>
      </div>
      <div className="flex gap-2 px-4 pb-4">
        <button
          onClick={onSave}
          className="flex items-center gap-1.5 rounded-lg bg-[#4f46e5] px-4 py-2 text-[12px] font-medium text-white transition-colors hover:bg-[#5855eb]"
        >
          <CalendarPlus size={13} />
          Save to Calendar
        </button>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-[#60C2FB]"
          style={{
            animation: `typingDot 1s ease-in-out infinite`,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}

function ChatMessage({ msg }: { msg: Message }) {
  const isAI = msg.role === "ai";
  return (
    <div className={`flex gap-2.5 ${isAI ? "" : "flex-row-reverse"}`}>
      {/* Avatar */}
      <div
        className={[
          "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
          isAI
            ? "bg-gradient-to-br from-[#3161F8] to-[#60C2FB] text-white"
            : "bg-[#2a3347] text-[#7d8590]",
        ].join(" ")}
      >
        {isAI ? "C" : <User size={13} />}
      </div>

      {/* Bubble */}
      <div
        className={[
          "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
          isAI
            ? "rounded-tl-sm border border-[#2a3347] bg-[#1c2230] text-[#e6edf3]"
            : "rounded-tr-sm border border-[#3161F8]/40 bg-[#1a2a4a] text-[#e6edf3]",
        ].join(" ")}
      >
        {msg.type === "typing" ? (
          <TypingIndicator />
        ) : (
          <div dangerouslySetInnerHTML={{ __html: msg.content }} />
        )}
        {msg.type === "email-draft" && msg.draft && (
          <EmailDraftCard
            draft={msg.draft}
            onSend={() => alert("📤 Gmail sent!")}
            onEdit={() => {}}
          />
        )}
        {msg.type === "meeting-confirm" && msg.meeting && (
          <MeetingConfirmCard
            meeting={msg.meeting}
            onSave={() => alert("📅 Meeting saved to Calendar!")}
          />
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EchoVoiceAgent() {
  const [mode, setMode] = useState<Mode>("text");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uid(),
      role: "ai",
      type: "text",
      content:
        "Hello! I'm <strong>Echo</strong>, your AI assistant for Gmail &amp; Calendar. Type a command below or switch to Voice mode to speak.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMsg = useCallback((msg: Omit<Message, "id">) => {
    setMessages((prev) => [...prev, { ...msg, id: uid() }]);
  }, []);

  const removeTyping = useCallback(() => {
    setMessages((prev) => prev.filter((m) => m.type !== "typing"));
  }, []);

  const processCommand = useCallback(
    async (cmd: string) => {
      if (!cmd.trim() || isProcessing) return;
      setIsProcessing(true);

      addMsg({ role: "user", type: "text", content: cmd });

      // Show typing indicator
      const typingId = uid();
      setMessages((prev) => [
        ...prev,
        { id: typingId, role: "ai", type: "typing", content: "" },
      ]);

      const lower = cmd.toLowerCase();
      await new Promise((r) => setTimeout(r, 1200));
      removeTyping();

      if (
        lower.includes("meeting") ||
        lower.includes("today") ||
        lower.includes("schedule today")
      ) {
        addMsg({
          role: "ai",
          type: "text",
          content:
            "Yes! You have <strong>2 meetings</strong> today:<br/><br/>" +
            "<span style='color:#60C2FB'>◆</span> <strong>Design Sync</strong> — 10:00 AM · Google Meet<br/>" +
            "<span style='color:#818cf8'>◆</span> <strong>Sprint Planning</strong> — 3:30 PM · Zoom",
        });
      } else if (
        lower.includes("email") ||
        lower.includes("gmail") ||
        lower.includes("write") ||
        lower.includes("send")
      ) {
        // Extract recipient if present
        const toMatch = cmd.match(/to\s+([^\s,]+@[^\s,]+)/i);
        const to = toMatch ? toMatch[1] : "friend@corsair.dev";

        addMsg({
          role: "ai",
          type: "email-draft",
          content: "Here's your drafted email — review before sending:",
          draft: {
            to,
            subject: "Looking forward to our meeting",
            body: `Hi,\n\nI just wanted to reach out and say I'm really looking forward to our meeting this Thursday at 9 AM. It'll be a great opportunity to connect and discuss what's next.\n\nSee you then!\nBest regards`,
          },
        });
      } else if (
        lower.includes("calendar") ||
        lower.includes("invite") ||
        lower.includes("schedule")
      ) {
        addMsg({
          role: "ai",
          type: "meeting-confirm",
          content: "I've prepared this calendar event for you:",
          meeting: {
            title: "Meeting with friend@corsair.dev",
            date: "Thursday, June 19, 2026",
            time: "9:00 AM",
            attendees: ["friend@corsair.dev"],
          },
        });
      } else {
        addMsg({
          role: "ai",
          type: "text",
          content:
            "Got it! I can help you with Gmail or Google Calendar. Try asking:<br/>" +
            "<span style='color:#60C2FB'>·</span> 'Any meetings today?'" +
            "<span style='color:#60C2FB'>·</span> 'Write an email to someone@example.com'" +
            "<span style='color:#818cf8'>·</span> 'Schedule a meeting for Thursday'",
        });
      }

      setIsProcessing(false);
    },
    [addMsg, removeTyping, isProcessing],
  );

  const handleSend = () => {
    const val = input.trim();
    if (!val) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "40px";
    processCommand(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleMic = () => {
    if (isListening) {
      setIsListening(false);
      // In real app: stop SpeechRecognition
    } else {
      setIsListening(true);
      // Simulate: after 2.5s pretend user said something
      setTimeout(() => {
        setIsListening(false);
        processCommand("Any meetings today?");
      }, 2500);
    }
  };

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px";
  };

  return (
    <>
      {/* Keyframe animations via style tag */}
      <style>{`
        @keyframes waveAnim {
          from { transform: scaleY(0.4); opacity: 0.5; }
          to   { transform: scaleY(1);   opacity: 1;   }
        }
        @keyframes typingDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1;   }
        }
        @keyframes micPulse {
          0%,100% { box-shadow: 0 0 0 0   rgba(49,97,248,0.45); }
          50%     { box-shadow: 0 0 0 10px rgba(49,97,248,0);    }
        }
        .mic-recording { animation: micPulse 1s infinite; }
      `}</style>

      {/* ── Root card ── matches the "Average Tickets Created" panel size/style */}
      <section className="flex h-full flex-col gap-2">
        {/* ── Title row ── same pattern as ChartTitle in your codebase */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Bot size={18} className="text-[#60C2FB]" />
            <h2 className="text-[15px] font-medium tracking-tight text-white">
              Echo · AI Voice Agent
            </h2>
            <span className="flex items-center gap-1 text-[10px] font-medium text-[#60C2FB]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#60C2FB]" />
              Online
            </span>
          </div>

          {/* Mode toggle — same visual weight as the date picker */}
          <div className="flex items-center gap-1 rounded-xl border border-[#2a3347] bg-[#0d1117] p-1">
            <button
              onClick={() => setMode("text")}
              className={[
                "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[12px] font-medium transition-all",
                mode === "text"
                  ? "bg-[#3161F8] text-white"
                  : "text-[#7d8590] hover:text-[#e6edf3]",
              ].join(" ")}
            >
              <Keyboard size={13} />
              Text
            </button>
            <button
              onClick={() => setMode("voice")}
              className={[
                "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[12px] font-medium transition-all",
                mode === "voice"
                  ? "bg-[#3161F8] text-white"
                  : "text-[#7d8590] hover:text-[#e6edf3]",
              ].join(" ")}
            >
              <Mic size={13} />
              Voice
            </button>
          </div>
        </div>

        {/* ── Agent panel (matches chart panel dimensions) ── */}
        <div className="flex flex-1 flex-wrap gap-4">
          {/* ── Left sidebar: stats/quick actions (mirrors the MetricCard column) ── */}
          <div className="my-4 flex w-52 shrink-0 flex-col justify-start gap-4">
            {/* Agent avatar card */}
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#2a3347] bg-[#161b22] p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#3161F8] to-[#60C2FB] text-xl font-bold text-white shadow-lg shadow-[#3161F8]/20">
                C
              </div>
              <div className="text-center">
                <p className="text-[13px] font-medium text-white">Echo</p>
                <p className="text-[11px] text-[#7d8590]">
                  AI Email &amp; Calendar
                </p>
              </div>
              {/* Waveform preview */}
              <div className="flex justify-center pt-1">
                <WaveformBars active={isListening} />
              </div>
            </div>

            {/* Quick prompts */}
            <div className="flex flex-col gap-2">
              <p className="px-1 text-[10px] font-medium uppercase tracking-widest text-[#7d8590]">
                Quick commands
              </p>
              {QUICK_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => processCommand(p)}
                  className="rounded-lg border border-transparent px-2 py-1.5 text-left text-[11px] leading-snug text-[#7d8590] transition-all hover:border-[#60C2FB]/10 hover:bg-[#60C2FB]/5 hover:text-[#60C2FB]"
                >
                  <Sparkles size={10} className="mr-1.5 inline opacity-60" />
                  {p}
                </button>
              ))}
            </div>

            {/* Action buttons */}
            <div className="mt-auto flex flex-col gap-2">
              <button
                onClick={() =>
                  processCommand("Write an email to friend@corsair.dev")
                }
                className="flex w-full items-center gap-2 rounded-xl border border-[#60C2FB]/20 bg-[#60C2FB]/5 px-3 py-2.5 text-[12px] font-medium text-[#60C2FB] transition-all hover:border-[#60C2FB]/40 hover:bg-[#60C2FB]/10"
              >
                <Mail size={14} />
                Send Gmail
              </button>
              <button
                onClick={() =>
                  processCommand("Schedule a calendar invite for Thursday")
                }
                className="flex w-full items-center gap-2 rounded-xl border border-[#818cf8]/20 bg-[#818cf8]/5 px-3 py-2.5 text-[12px] font-medium text-[#818cf8] transition-all hover:border-[#818cf8]/40 hover:bg-[#818cf8]/10"
              >
                <CalendarPlus size={14} />
                Save to Calendar
              </button>
            </div>
          </div>

          {/* ── Right: chat window (mirrors the chart's flex-1 h-96 panel) ── */}
          <div className="relative flex h-96 min-w-[320px] flex-1 flex-col overflow-hidden rounded-2xl border border-[#2a3347] bg-[#161b22]">
            {/* Chat messages */}
            <div className="scrollbar-thin scrollbar-thumb-[#2a3347] flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} msg={msg} />
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* ── Voice mode overlay ── */}
            {mode === "voice" && (
              <div className="flex flex-col items-center justify-center gap-4 border-t border-[#2a3347] bg-[#0d1117]/60 py-4 backdrop-blur-sm">
                <WaveformBars active={isListening} />
                <button
                  onClick={toggleMic}
                  className={[
                    "flex h-14 w-14 items-center justify-center rounded-full border-2 text-[#60C2FB] transition-all",
                    isListening
                      ? "mic-recording border-[#60C2FB] bg-[#3161F8]"
                      : "border-[#2a3347] bg-[#1c2230] hover:border-[#3161F8]",
                  ].join(" ")}
                  aria-label={
                    isListening ? "Stop recording" : "Start recording"
                  }
                >
                  {isListening ? (
                    <MicOff size={22} className="text-white" />
                  ) : (
                    <Mic size={22} />
                  )}
                </button>
                <p className="text-[11px] text-[#7d8590]">
                  {isListening
                    ? "Listening… speak to Echo"
                    : "Press to speak to Echo"}
                </p>
              </div>
            )}

            {/* ── Text mode input ── */}
            {mode === "text" && (
              <div className="flex items-end gap-2 border-t border-[#2a3347] bg-[#0d1117]/50 px-3 py-3">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={autoResize}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Echo… e.g. Any meetings today?"
                  rows={1}
                  className="font-inherit max-h-24 min-h-[40px] flex-1 resize-none rounded-xl border border-[#2a3347] bg-[#0d1117] px-3.5 py-2.5 text-[13px] leading-relaxed text-[#e6edf3] placeholder-[#3d4d63] outline-none transition-colors focus:border-[#3161F8]"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isProcessing}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#3161F8] text-white transition-colors hover:bg-[#4a77f8] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send"
                >
                  {isProcessing ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
