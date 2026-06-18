import { google, type gmail_v1 } from "googleapis";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../config/db.js";
import {
  emailThreads,
  emails,
  type Email as DbEmail,
} from "../config/schema.js";
import { AuthService } from "./Auth.service.js";
import { Logger } from "../utils/logger.js";
import { GoogleAuthError } from "../utils/errors.js";

const logger = Logger.getInstance();
const SYNC_LIMIT = 10;

type EmailCategory = DbEmail["category"];
type EmailFolder = DbEmail["folder"];
type EmailStatus = DbEmail["status"];

const AVATAR_COLORS = [
  "#3161F8",
  "#22c55e",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#06b6d4",
  "#ef4444",
  "#14b8a6",
];

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface EmailListItem {
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

export interface SyncResult {
  synced: number;
  emails: EmailListItem[];
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function getHeader(
  headers: gmail_v1.Schema$MessagePartHeader[] | undefined,
  name: string,
): string {
  return (
    headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ??
    ""
  );
}

function parseFromAddress(raw: string): { name: string; email: string } {
  const match = raw.match(/^(?:"?([^"]*)"?\s)?<?([^>]+@[^>]+)>?$/);
  if (match) {
    const name = (match[1] || match[2] || "Unknown").trim();
    const email = (match[2] || raw).trim();
    return { name, email };
  }
  return { name: raw || "Unknown", email: raw || "unknown@email.com" };
}

function decodeBase64Url(data: string): string {
  const normalized = data.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf-8");
}

function extractBody(
  payload: gmail_v1.Schema$MessagePart | undefined,
): { text: string; html: string; hasAttachment: boolean } {
  if (!payload) return { text: "", html: "", hasAttachment: false };

  let text = "";
  let html = "";
  let hasAttachment = false;

  const walk = (part: gmail_v1.Schema$MessagePart) => {
    if (part.filename && part.filename.length > 0) {
      hasAttachment = true;
    }

    const mime = part.mimeType ?? "";
    if (part.body?.data) {
      const decoded = decodeBase64Url(part.body.data);
      if (mime === "text/plain" && !text) text = decoded;
      if (mime === "text/html" && !html) html = decoded;
    }

    for (const child of part.parts ?? []) {
      walk(child);
    }
  };

  walk(payload);

  if (!text && html) {
    text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  return { text, html, hasAttachment };
}

function mapCategory(
  labelIds: string[] = [],
): "primary" | "promotions" | "social" {
  if (labelIds.includes("CATEGORY_PROMOTIONS")) return "promotions";
  if (labelIds.includes("CATEGORY_SOCIAL")) return "social";
  return "primary";
}

function mapFolder(labelIds: string[] = []): EmailFolder {
  if (labelIds.includes("TRASH")) return "trash";
  if (labelIds.includes("SPAM")) return "spam";
  if (labelIds.includes("DRAFT")) return "drafts";
  if (labelIds.includes("SENT")) return "sent";
  if (labelIds.includes("STARRED")) return "starred";
  return "inbox";
}

function mapStatus(labelIds: string[] = []): EmailStatus {
  if (labelIds.includes("TRASH")) return "trashed";
  if (labelIds.includes("SPAM")) return "spam";
  if (labelIds.includes("UNREAD")) return "unread";
  return "read";
}

function avatarColorFor(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]!;
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

function formatEmailDate(date: Date): { time: string; date: string } {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (date.toDateString() === now.toDateString()) {
    return { time, date: "Today" };
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return { time, date: "Yesterday" };
  }

  return {
    time,
    date: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    }),
  };
}

function toListItem(row: typeof emails.$inferSelect): EmailListItem {
  const fromName = row.fromName ?? row.fromEmail;
  const receivedAt = row.receivedAt ?? new Date();
  const { time, date } = formatEmailDate(receivedAt);

  return {
    id: row.id,
    from: fromName,
    fromEmail: row.fromEmail,
    initials: initialsFor(fromName),
    avatarColor: avatarColorFor(row.fromEmail),
    subject: row.subject,
    preview: row.snippet ?? row.bodyText?.slice(0, 120) ?? "",
    body: row.bodyText ?? row.snippet ?? "",
    time,
    date,
    read: row.status !== "unread",
    starred: row.isStarred,
    hasAttachment: (row.sizeEstimate ?? 0) > 100_000,
    category: row.category as "primary" | "promotions" | "social",
    labels: [],
  };
}

// ─────────────────────────────────────────────
// GMAIL SERVICE
// ─────────────────────────────────────────────

export class GmailService {
  private static instance: GmailService;
  private authService: AuthService;

  private constructor() {
    this.authService = AuthService.getInstance();
  }

  public static getInstance(): GmailService {
    if (!GmailService.instance) {
      GmailService.instance = new GmailService();
    }
    return GmailService.instance;
  }

  private async getGmailClient(userId: string) {
    const auth = await this.authService.getAuthenticatedOAuthClient(userId);
    return google.gmail({ version: "v1", auth: auth as never });
  }

  /**
   * Fetch the latest inbox messages from Gmail, upsert into DB, return list.
   */
  public async syncInbox(
    userId: string,
    limit: number = SYNC_LIMIT,
  ): Promise<SyncResult> {
    try {
      const gmail = await this.getGmailClient(userId);

      const listRes = await gmail.users.messages.list({
        userId: "me",
        maxResults: limit,
        labelIds: ["INBOX"],
      });

      const messageIds = listRes.data.messages ?? [];
      if (messageIds.length === 0) {
        const stored = await this.getStoredEmails(userId, limit);
        return { synced: 0, emails: stored };
      }

      let synced = 0;

      for (const item of messageIds) {
        if (!item.id) continue;

        const msgRes = await gmail.users.messages.get({
          userId: "me",
          id: item.id,
          format: "full",
        });

        const message = msgRes.data;
        if (!message.id || !message.threadId) continue;

        await this.upsertMessage(userId, message);
        synced++;
      }

      const stored = await this.getStoredEmails(userId, limit);
      logger.info("Gmail inbox synced", { userId, synced });

      return { synced, emails: stored };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown Gmail sync error";
      logger.error("Gmail sync failed", { userId, error: message });

      if (
        message.includes("insufficient") ||
        message.includes("Insufficient Permission") ||
        message.includes("403")
      ) {
        throw new GoogleAuthError(
          "Gmail access not granted — please log out and sign in again to grant Gmail permissions",
        );
      }

      throw new GoogleAuthError(`Failed to sync Gmail: ${message}`);
    }
  }

  private async upsertMessage(
    userId: string,
    message: gmail_v1.Schema$Message,
  ): Promise<void> {
    const labelIds = message.labelIds ?? [];
    const headers = message.payload?.headers;
    const subject = getHeader(headers, "Subject") || "(no subject)";
    const fromRaw = getHeader(headers, "From");
    const { name: fromName, email: fromEmail } = parseFromAddress(fromRaw);
    const { text: bodyText, html: bodyHtml } = extractBody(message.payload);

    const internalDate = message.internalDate
      ? Number(message.internalDate)
      : Date.now();
    const receivedAt = new Date(internalDate);
    const category = mapCategory(labelIds) as EmailCategory;
    const folder = mapFolder(labelIds);
    const status = mapStatus(labelIds);
    const isStarred = labelIds.includes("STARRED");

    // Upsert thread
    const [existingThread] = await db
      .select({ id: emailThreads.id })
      .from(emailThreads)
      .where(
        and(
          eq(emailThreads.userId, userId),
          eq(emailThreads.gmailThreadId, message.threadId!),
        ),
      )
      .limit(1);

    let threadId: string;

    if (existingThread) {
      threadId = existingThread.id;
      await db
        .update(emailThreads)
        .set({
          subject,
          snippet: message.snippet ?? null,
          isStarred,
          folder,
          category,
          lastMessageAt: receivedAt,
          updatedAt: new Date(),
        })
        .where(eq(emailThreads.id, threadId));
    } else {
      const [newThread] = await db
        .insert(emailThreads)
        .values({
          userId,
          gmailThreadId: message.threadId!,
          subject,
          snippet: message.snippet ?? null,
          participantEmails: [fromEmail],
          participantNames: [fromName],
          isStarred,
          folder,
          category,
          lastMessageAt: receivedAt,
        })
        .returning({ id: emailThreads.id });

      if (!newThread) throw new Error("Failed to create email thread");
      threadId = newThread.id;
    }

    // Upsert email message
    const [existingEmail] = await db
      .select({ id: emails.id })
      .from(emails)
      .where(
        and(
          eq(emails.userId, userId),
          eq(emails.gmailMessageId, message.id!),
        ),
      )
      .limit(1);

    const emailData = {
      userId,
      threadId,
      gmailMessageId: message.id!,
      gmailThreadId: message.threadId!,
      messageIdHeader: getHeader(headers, "Message-ID") || null,
      subject,
      snippet: message.snippet ?? null,
      fromName,
      fromEmail,
      bodyText: bodyText || message.snippet || null,
      bodyHtml: bodyHtml || null,
      sizeEstimate: message.sizeEstimate ?? null,
      status,
      folder,
      category,
      isStarred,
      internalDate,
      receivedAt,
      updatedAt: new Date(),
    };

    if (existingEmail) {
      await db
        .update(emails)
        .set(emailData)
        .where(eq(emails.id, existingEmail.id));
    } else {
      await db.insert(emails).values(emailData);
    }
  }

  /**
   * Read stored emails from DB (no Gmail API call).
   */
  public async getStoredEmails(
    userId: string,
    limit: number = SYNC_LIMIT,
    folder: EmailFolder = "inbox",
    category?: EmailCategory,
  ): Promise<EmailListItem[]> {
    const conditions = [
      eq(emails.userId, userId),
      eq(emails.folder, folder),
    ];
    if (category) {
      conditions.push(eq(emails.category, category));
    }

    const rows = await db
      .select()
      .from(emails)
      .where(and(...conditions))
      .orderBy(desc(emails.receivedAt))
      .limit(limit);

    return rows.map((row) => toListItem(row));
  }
}
