import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  pgEnum,
  index,
  uniqueIndex,
  integer,
  jsonb,
  bigint,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export const emailStatusEnum = pgEnum("email_status", [
  "unread",
  "read",
  "archived",
  "trashed",
  "spam",
]);

export const emailCategoryEnum = pgEnum("email_category", [
  "primary",
  "promotions",
  "social",
  "updates",
  "forums",
]);

export const emailFolderEnum = pgEnum("email_folder", [
  "inbox",
  "sent",
  "drafts",
  "starred",
  "all",
  "spam",
  "trash",
]);

export const attachmentTypeEnum = pgEnum("attachment_type", [
  "image",
  "document",
  "spreadsheet",
  "presentation",
  "pdf",
  "archive",
  "audio",
  "video",
  "other",
]);

export const calendarEventStatusEnum = pgEnum("calendar_event_status", [
  "confirmed",
  "tentative",
  "cancelled",
]);

export const attendeeResponseEnum = pgEnum("attendee_response", [
  "accepted",
  "declined",
  "tentative",
  "needsAction",
]);

export const labelColorEnum = pgEnum("label_color", [
  "blue",
  "green",
  "yellow",
  "red",
  "purple",
  "pink",
  "orange",
  "teal",
  "gray",
]);

export const webhookEventTypeEnum = pgEnum("webhook_event_type", [
  "email.received",
  "email.sent",
  "email.read",
  "email.archived",
  "email.trashed",
  "email.label_added",
  "email.label_removed",
  "calendar.event_created",
  "calendar.event_updated",
  "calendar.event_deleted",
  "calendar.event_reminder",
  "agent.action_completed",
  "agent.action_failed",
]);

export const agentActionTypeEnum = pgEnum("agent_action_type", [
  "compose_email",
  "reply_email",
  "forward_email",
  "archive_email",
  "delete_email",
  "label_email",
  "create_event",
  "update_event",
  "delete_event",
  "summarize_email",
  "draft_reply",
  "search_emails",
  "search_events",
]);

export const agentActionStatusEnum = pgEnum("agent_action_status", [
  "pending",
  "in_progress",
  "completed",
  "failed",
  "cancelled",
]);

export const agentModeEnum = pgEnum("agent_mode_enum", ["manual", "voice"]);

// ─────────────────────────────────────────────
// USERS TABLE
// ─────────────────────────────────────────────

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    googleId: varchar("google_id", { length: 255 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    avatarUrl: text("avatar_url"),
    corsairUserId: varchar("corsair_user_id", { length: 255 }),
    encryptedAccessToken: text("encrypted_access_token"),
    encryptedRefreshToken: text("encrypted_refresh_token"),
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
    agentMode: agentModeEnum("agent_mode").default("manual").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => ({
    googleIdIdx: uniqueIndex("users_google_id_idx").on(table.googleId),
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
  }),
);

// ─────────────────────────────────────────────
// REFRESH TOKENS TABLE
// ─────────────────────────────────────────────

export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    userAgent: text("user_agent"),
    ipAddress: varchar("ip_address", { length: 45 }),
    isRevoked: boolean("is_revoked").default(false).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("refresh_tokens_user_id_idx").on(table.userId),
    tokenIdx: uniqueIndex("refresh_tokens_token_idx").on(table.token),
  }),
);

// ─────────────────────────────────────────────
// LABELS
// Mirrors Gmail labels (INBOX, custom labels, etc.)
// ─────────────────────────────────────────────

export const labels = pgTable(
  "labels",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    gmailLabelId: varchar("gmail_label_id", { length: 256 }),
    name: varchar("name", { length: 128 }).notNull(),
    color: labelColorEnum("color").notNull().default("blue"),
    isSystem: boolean("is_system").notNull().default(false),
    messageCount: integer("message_count").notNull().default(0),
    unreadCount: integer("unread_count").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("labels_user_id_idx").on(t.userId),
    uniqueIndex("labels_user_gmail_label_idx").on(t.userId, t.gmailLabelId),
    index("labels_user_name_idx").on(t.userId, t.name),
  ],
);

// ─────────────────────────────────────────────
// EMAIL THREADS
// ─────────────────────────────────────────────

export const emailThreads = pgTable(
  "email_threads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    gmailThreadId: varchar("gmail_thread_id", { length: 256 }).notNull(),

    subject: text("subject").notNull().default("(no subject)"),
    snippet: text("snippet"),
    messageCount: integer("message_count").notNull().default(1),
    unreadCount: integer("unread_count").notNull().default(0),

    participantEmails: jsonb("participant_emails")
      .$type<string[]>()
      .notNull()
      .default([]),
    participantNames: jsonb("participant_names")
      .$type<string[]>()
      .notNull()
      .default([]),

    isStarred: boolean("is_starred").notNull().default(false),
    isImportant: boolean("is_important").notNull().default(false),
    isMuted: boolean("is_muted").notNull().default(false),

    folder: emailFolderEnum("folder").notNull().default("inbox"),
    category: emailCategoryEnum("category").notNull().default("primary"),

    lastMessageAt: timestamp("last_message_at", {
      withTimezone: true,
    }).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("email_threads_user_id_idx").on(t.userId),
    uniqueIndex("email_threads_user_gmail_thread_idx").on(
      t.userId,
      t.gmailThreadId,
    ),
    index("email_threads_folder_idx").on(t.userId, t.folder),
    index("email_threads_category_idx").on(t.userId, t.category),
    index("email_threads_last_message_at_idx").on(t.lastMessageAt),
    index("email_threads_starred_idx").on(t.userId, t.isStarred),
  ],
);

// ─────────────────────────────────────────────
// EMAIL THREAD LABELS (junction)
// ─────────────────────────────────────────────
export const emailThreadLabels = pgTable(
  "email_thread_labels",
  {
    threadId: uuid("thread_id")
      .notNull()
      .references(() => emailThreads.id, { onDelete: "cascade" }),
    labelId: uuid("label_id")
      .notNull()
      .references(() => labels.id, { onDelete: "cascade" }),
    addedAt: timestamp("added_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("email_thread_labels_pk").on(t.threadId, t.labelId),
    index("email_thread_labels_thread_idx").on(t.threadId),
    index("email_thread_labels_label_idx").on(t.labelId),
  ],
);

// ─────────────────────────────────────────────
// EMAILS (individual messages)
// ─────────────────────────────────────────────

export const emails = pgTable(
  "emails",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    threadId: uuid("thread_id")
      .notNull()
      .references(() => emailThreads.id, { onDelete: "cascade" }),

    gmailMessageId: varchar("gmail_message_id", { length: 256 }).notNull(),
    gmailThreadId: varchar("gmail_thread_id", { length: 256 }).notNull(),

    messageIdHeader: varchar("message_id_header", { length: 512 }),
    inReplyTo: varchar("in_reply_to", { length: 512 }),
    references: text("references"),

    subject: text("subject").notNull().default("(no subject)"),
    snippet: text("snippet"),

    fromName: varchar("from_name", { length: 256 }),
    fromEmail: varchar("from_email", { length: 320 }).notNull(),
    toRecipients: jsonb("to_recipients")
      .$type<{ name?: string; email: string }[]>()
      .notNull()
      .default([]),
    ccRecipients: jsonb("cc_recipients")
      .$type<{ name?: string; email: string }[]>()
      .notNull()
      .default([]),
    bccRecipients: jsonb("bcc_recipients")
      .$type<{ name?: string; email: string }[]>()
      .notNull()
      .default([]),

    bodyHtml: text("body_html"),
    bodyText: text("body_text"),

    sizeEstimate: integer("size_estimate"),

    status: emailStatusEnum("status").notNull().default("unread"),
    folder: emailFolderEnum("folder").notNull().default("inbox"),
    category: emailCategoryEnum("category").notNull().default("primary"),
    isStarred: boolean("is_starred").notNull().default(false),
    isImportant: boolean("is_important").notNull().default(false),
    isDraft: boolean("is_draft").notNull().default(false),
    isSent: boolean("is_sent").notNull().default(false),

    // AI (priority filtering bonus feature — populate via Groq)
    aiSummary: text("ai_summary"),
    aiPriorityScore: integer("ai_priority_score"), // 0-100

    internalDate: bigint("internal_date", { mode: "number" }),
    receivedAt: timestamp("received_at", { withTimezone: true }),
    sentAt: timestamp("sent_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("emails_user_id_idx").on(t.userId),
    index("emails_thread_id_idx").on(t.threadId),
    uniqueIndex("emails_user_gmail_message_idx").on(t.userId, t.gmailMessageId),
    index("emails_folder_idx").on(t.userId, t.folder),
    index("emails_status_idx").on(t.userId, t.status),
    index("emails_received_at_idx").on(t.receivedAt),
    index("emails_from_email_idx").on(t.userId, t.fromEmail),
    index("emails_is_starred_idx").on(t.userId, t.isStarred),
  ],
);

// ─────────────────────────────────────────────
// EMAIL LABELS (junction — per-message)
// ─────────────────────────────────────────────

export const emailLabels = pgTable(
  "email_labels",
  {
    emailId: uuid("email_id")
      .notNull()
      .references(() => emails.id, { onDelete: "cascade" }),
    labelId: uuid("label_id")
      .notNull()
      .references(() => labels.id, { onDelete: "cascade" }),
    addedAt: timestamp("added_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("email_labels_pk").on(t.emailId, t.labelId),
    index("email_labels_email_idx").on(t.emailId),
    index("email_labels_label_idx").on(t.labelId),
  ],
);

// ─────────────────────────────────────────────
// ATTACHMENTS
// ─────────────────────────────────────────────

export const attachments = pgTable(
  "attachments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    emailId: uuid("email_id")
      .notNull()
      .references(() => emails.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    gmailAttachmentId: varchar("gmail_attachment_id", { length: 512 }),
    filename: varchar("filename", { length: 512 }).notNull(),
    mimeType: varchar("mime_type", { length: 256 }).notNull(),
    size: integer("size").notNull(),
    attachmentType: attachmentTypeEnum("attachment_type")
      .notNull()
      .default("other"),

    storageKey: varchar("storage_key", { length: 1024 }),
    storageUrl: varchar("storage_url", { length: 2048 }),
    downloadedAt: timestamp("downloaded_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("attachments_email_id_idx").on(t.emailId),
    index("attachments_user_id_idx").on(t.userId),
  ],
);

// ─────────────────────────────────────────────
// DRAFTS
// ─────────────────────────────────────────────

export const drafts = pgTable(
  "drafts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    threadId: uuid("thread_id").references(() => emailThreads.id, {
      onDelete: "set null",
    }),

    gmailDraftId: varchar("gmail_draft_id", { length: 256 }),

    subject: text("subject").notNull().default(""),
    toRecipients: jsonb("to_recipients")
      .$type<{ name?: string; email: string }[]>()
      .notNull()
      .default([]),
    ccRecipients: jsonb("cc_recipients")
      .$type<{ name?: string; email: string }[]>()
      .notNull()
      .default([]),
    bccRecipients: jsonb("bcc_recipients")
      .$type<{ name?: string; email: string }[]>()
      .notNull()
      .default([]),

    bodyHtml: text("body_html"),
    bodyText: text("body_text"),

    isAiGenerated: boolean("is_ai_generated").notNull().default(false),
    aiPrompt: text("ai_prompt"),

    inReplyToEmailId: uuid("in_reply_to_email_id").references(() => emails.id, {
      onDelete: "set null",
    }),
    isForward: boolean("is_forward").notNull().default(false),

    lastSavedAt: timestamp("last_saved_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("drafts_user_id_idx").on(t.userId),
    index("drafts_thread_id_idx").on(t.threadId),
    index("drafts_gmail_draft_id_idx").on(t.gmailDraftId),
  ],
);

// ─────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  refreshTokens: many(refreshTokens),
  labels: many(labels),
  emailThreads: many(emailThreads),
  emails: many(emails),
  drafts: many(drafts),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, { fields: [refreshTokens.userId], references: [users.id] }),
}));

export const labelsRelations = relations(labels, ({ one, many }) => ({
  user: one(users, { fields: [labels.userId], references: [users.id] }),
  emailLabels: many(emailLabels),
  threadLabels: many(emailThreadLabels),
}));

export const emailThreadsRelations = relations(
  emailThreads,
  ({ one, many }) => ({
    user: one(users, {
      fields: [emailThreads.userId],
      references: [users.id],
    }),
    emails: many(emails),
    // threadLabels: many(emailThreadLabels),
    drafts: many(drafts),
  }),
);

export const emailsRelations = relations(emails, ({ one, many }) => ({
  user: one(users, { fields: [emails.userId], references: [users.id] }),
  thread: one(emailThreads, {
    fields: [emails.threadId],
    references: [emailThreads.id],
  }),
  labels: many(emailLabels),
  attachments: many(attachments),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  email: one(emails, {
    fields: [attachments.emailId],
    references: [emails.id],
  }),
  user: one(users, { fields: [attachments.userId], references: [users.id] }),
}));

export const draftsRelations = relations(drafts, ({ one }) => ({
  user: one(users, { fields: [drafts.userId], references: [users.id] }),
  thread: one(emailThreads, {
    fields: [drafts.threadId],
    references: [emailThreads.id],
  }),
  inReplyToEmail: one(emails, {
    fields: [drafts.inReplyToEmailId],
    references: [emails.id],
  }),
}));

export const emailThreadLabelsRelations = relations(
  emailThreadLabels,
  ({ one }) => ({
    thread: one(emailThreads, {
      fields: [emailThreadLabels.threadId],
      references: [emailThreads.id],
    }),
    label: one(labels, {
      fields: [emailThreadLabels.labelId],
      references: [labels.id],
    }),
  }),
);

export const emailLabelsRelations = relations(emailLabels, ({ one }) => ({
  email: one(emails, {
    fields: [emailLabels.emailId],
    references: [emails.id],
  }),
  label: one(labels, {
    fields: [emailLabels.labelId],
    references: [labels.id],
  }),
}));
// ─────────────────────────────────────────────
// TYPE EXPORTS
// ─────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;

export type Label = typeof labels.$inferSelect;
export type NewLabel = typeof labels.$inferInsert;

export type EmailThread = typeof emailThreads.$inferSelect;
export type NewEmailThread = typeof emailThreads.$inferInsert;

export type Email = typeof emails.$inferSelect;
export type NewEmail = typeof emails.$inferInsert;

export type Attachment = typeof attachments.$inferSelect;
export type NewAttachment = typeof attachments.$inferInsert;

export type Draft = typeof drafts.$inferSelect;
export type NewDraft = typeof drafts.$inferInsert;
//////////////////////////////////////////////////////////////////////////////////////////////////Corsair tables///////////////////////////////
export const corsairIntegrations = pgTable("corsair_integrations", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  name: text("name").notNull(),
  config: jsonb("config").notNull().default({}),
  dek: text("dek"),
});

export const corsairAccounts = pgTable("corsair_accounts", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  tenantId: text("tenant_id").notNull(),
  integrationId: text("integration_id")
    .notNull()
    .references(() => corsairIntegrations.id),
  config: jsonb("config").notNull().default({}),
  dek: text("dek"),
});

export const corsairEntities = pgTable("corsair_entities", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  accountId: text("account_id")
    .notNull()
    .references(() => corsairAccounts.id),
  entityId: text("entity_id").notNull(),
  entityType: text("entity_type").notNull(),
  version: text("version").notNull(),
  data: jsonb("data").notNull().default({}),
});

export const corsairEvents = pgTable("corsair_events", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  accountId: text("account_id")
    .notNull()
    .references(() => corsairAccounts.id),
  eventType: text("event_type").notNull(),
  payload: jsonb("payload").notNull().default({}),
  status: text("status"),
});
