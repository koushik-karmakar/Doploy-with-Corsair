// ─── Auth ──────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: "google";
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// ─── Agent / Chat ──────────────────────────────────────────────────────────

export type AgentMode = "text" | "voice";

export type MessageRole = "ai" | "user";

export type MessageType =
  | "text"
  | "typing"
  | "email-draft"
  | "meeting-confirm"
  | "email-sent"
  | "meeting-saved";

export interface EmailDraft {
  to: string;
  subject: string;
  body: string;
  cc?: string;
}

export interface MeetingDraft {
  title: string;
  date: string;
  time: string;
  attendees: string[];
  location?: string;
  description?: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  type: MessageType;
  content: string;
  draft?: EmailDraft;
  meeting?: MeetingDraft;
  timestamp: Date;
}

// ─── Dashboard stats ────────────────────────────────────────────────────────

export interface StatCard {
  label: string;
  value: number | string;
  change: number; // percentage
  trend: "up" | "down";
  icon: string;
}

export interface Meeting {
  id: string;
  title: string;
  time: string;
  attendees: string[];
  location: string;
  isToday: boolean;
}

export interface Email {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  preview: string;
  timestamp: string;
  read: boolean;
  priority: "high" | "medium" | "low";
  starred: boolean;
  labels: string[];
}

// ─── Navigation ─────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: number;
}

// ─── Landing ────────────────────────────────────────────────────────────────

export interface PricingPlan {
  name: string;
  price: number | "Custom";
  period?: string;
  description: string;
  features: string[];
  highlighted: boolean;
  cta: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
}

export interface FeatureItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  accent: string;
}
