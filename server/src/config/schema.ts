import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { sql } from "drizzle-orm";

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export const agentModeEnum = pgEnum("agent_mode_enum", ["manual", "voice"]);

export const priorityLevelEnum = pgEnum("priority_level_enum", [
  "high",
  "medium",
  "low",
  "spam",
]);

export const draftStatusEnum = pgEnum("draft_status_enum", [
  "draft",
  "awaiting_approval",
  "sent",
  "cancelled",
]);

export const sessionTypeEnum = pgEnum("session_type_enum", ["voice", "text"]);

export const messageRoleEnum = pgEnum("message_role_enum", [
  "user",
  "assistant",
]);

// ─────────────────────────────────────────────
// USERS TABLE
// ─────────────────────────────────────────────

export const users = pgTable(
  "users",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    googleId: varchar("google_id", { length: 255 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    avatarUrl: text("avatar_url"),
    corsairUserId: varchar("corsair_user_id", { length: 255 }),
    // Encrypted tokens stored as text
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
// EMAIL CACHE TABLE
// ─────────────────────────────────────────────

export const emailCache = pgTable(
  "email_cache",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    gmailMessageId: varchar("gmail_message_id", { length: 255 })
      .notNull()
      .unique(),
    threadId: varchar("thread_id", { length: 255 }),
    fromAddress: varchar("from_address", { length: 500 }),
    toAddresses: text("to_addresses")
      .array()
      .default(sql`ARRAY[]::text[]`),
    ccAddresses: text("cc_addresses")
      .array()
      .default(sql`ARRAY[]::text[]`),
    subject: text("subject"),
    bodyText: text("body_text"),
    bodyHtml: text("body_html"),
    snippet: text("snippet"),
    priorityLevel: priorityLevelEnum("priority_level").default("medium"),
    labels: text("labels")
      .array()
      .default(sql`ARRAY[]::text[]`),
    isRead: boolean("is_read").default(false).notNull(),
    isStarred: boolean("is_starred").default(false).notNull(),
    hasAttachments: boolean("has_attachments").default(false).notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true }),
    syncedAt: timestamp("synced_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("email_cache_user_id_idx").on(table.userId),
    gmailMsgIdx: uniqueIndex("email_cache_gmail_msg_idx").on(
      table.gmailMessageId,
    ),
    receivedAtIdx: index("email_cache_received_at_idx").on(table.receivedAt),
    priorityIdx: index("email_cache_priority_idx").on(table.priorityLevel),
  }),
);

// ─────────────────────────────────────────────
// CALENDAR EVENTS TABLE
// ─────────────────────────────────────────────

export const calendarEvents = pgTable(
  "calendar_events",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    googleEventId: varchar("google_event_id", { length: 255 })
      .notNull()
      .unique(),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    location: varchar("location", { length: 500 }),
    startTime: timestamp("start_time", { withTimezone: true }).notNull(),
    endTime: timestamp("end_time", { withTimezone: true }).notNull(),
    // JSON: [{email: string, name: string, status: 'accepted'|'declined'|'tentative'|'needsAction'}]
    attendees: jsonb("attendees").default(sql`'[]'::jsonb`),
    meetLink: varchar("meet_link", { length: 500 }),
    isRecurring: boolean("is_recurring").default(false).notNull(),
    recurrenceRule: varchar("recurrence_rule", { length: 500 }),
    calendarId: varchar("calendar_id", { length: 255 }).default("primary"),
    status: varchar("status", { length: 50 }).default("confirmed"),
    syncedAt: timestamp("synced_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("calendar_events_user_id_idx").on(table.userId),
    startTimeIdx: index("calendar_events_start_time_idx").on(table.startTime),
    googleEventIdx: uniqueIndex("calendar_events_google_event_idx").on(
      table.googleEventId,
    ),
  }),
);

// ─────────────────────────────────────────────
// AGENT SESSIONS TABLE
// ─────────────────────────────────────────────

export const agentSessions = pgTable(
  "agent_sessions",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sessionType: sessionTypeEnum("session_type").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    startedAt: timestamp("started_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    metadata: jsonb("metadata").default(sql`'{}'::jsonb`),
  },
  (table) => ({
    userIdIdx: index("agent_sessions_user_id_idx").on(table.userId),
    isActiveIdx: index("agent_sessions_is_active_idx").on(table.isActive),
  }),
);

// ─────────────────────────────────────────────
// AGENT MESSAGES TABLE
// ─────────────────────────────────────────────

export const agentMessages = pgTable(
  "agent_messages",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => agentSessions.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: messageRoleEnum("role").notNull(),
    content: text("content").notNull(),
    // Detected intent: 'send_email' | 'create_event' | 'query_emails' | 'query_calendar' | 'general'
    intent: varchar("intent", { length: 100 }),
    // Stores extracted entities, draft IDs, event IDs
    metadata: jsonb("metadata").default(sql`'{}'::jsonb`),
    tokenCount: integer("token_count").default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => ({
    sessionIdIdx: index("agent_messages_session_id_idx").on(table.sessionId),
    userIdIdx: index("agent_messages_user_id_idx").on(table.userId),
    createdAtIdx: index("agent_messages_created_at_idx").on(table.createdAt),
  }),
);

// ─────────────────────────────────────────────
// EMAIL DRAFTS TABLE
// ─────────────────────────────────────────────

export const emailDrafts = pgTable(
  "email_drafts",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sessionMessageId: uuid("session_message_id").references(
      () => agentMessages.id,
      { onDelete: "set null" },
    ),
    toAddresses: text("to_addresses")
      .array()
      .default(sql`ARRAY[]::text[]`),
    ccAddresses: text("cc_addresses")
      .array()
      .default(sql`ARRAY[]::text[]`),
    bccAddresses: text("bcc_addresses")
      .array()
      .default(sql`ARRAY[]::text[]`),
    subject: text("subject"),
    bodyHtml: text("body_html"),
    bodyText: text("body_text"),
    aiGenerated: boolean("ai_generated").default(true).notNull(),
    status: draftStatusEnum("status").default("draft").notNull(),
    corsairDraftId: varchar("corsair_draft_id", { length: 255 }),
    gmailDraftId: varchar("gmail_draft_id", { length: 255 }),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("email_drafts_user_id_idx").on(table.userId),
    statusIdx: index("email_drafts_status_idx").on(table.status),
  }),
);

// ─────────────────────────────────────────────
// WEBHOOK EVENTS TABLE
// ─────────────────────────────────────────────

export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    // e.g. 'gmail.message.received', 'calendar.event.created'
    eventType: varchar("event_type", { length: 100 }).notNull(),
    source: varchar("source", { length: 100 }).default("corsair"),
    payload: jsonb("payload").notNull(),
    processed: boolean("processed").default(false).notNull(),
    processingError: text("processing_error"),
    retryCount: integer("retry_count").default(0).notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
  },
  (table) => ({
    userIdIdx: index("webhook_events_user_id_idx").on(table.userId),
    processedIdx: index("webhook_events_processed_idx").on(table.processed),
    eventTypeIdx: index("webhook_events_event_type_idx").on(table.eventType),
    receivedAtIdx: index("webhook_events_received_at_idx").on(table.receivedAt),
  }),
);

// ─────────────────────────────────────────────
// REFRESH TOKENS TABLE (for JWT rotation)
// ─────────────────────────────────────────────

export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v4()`),
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
// RELATIONS
// ─────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  emailCache: many(emailCache),
  calendarEvents: many(calendarEvents),
  agentSessions: many(agentSessions),
  agentMessages: many(agentMessages),
  emailDrafts: many(emailDrafts),
  webhookEvents: many(webhookEvents),
  refreshTokens: many(refreshTokens),
}));

export const emailCacheRelations = relations(emailCache, ({ one }) => ({
  user: one(users, { fields: [emailCache.userId], references: [users.id] }),
}));

export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
  user: one(users, {
    fields: [calendarEvents.userId],
    references: [users.id],
  }),
}));

export const agentSessionsRelations = relations(
  agentSessions,
  ({ one, many }) => ({
    user: one(users, {
      fields: [agentSessions.userId],
      references: [users.id],
    }),
    messages: many(agentMessages),
  }),
);

export const agentMessagesRelations = relations(agentMessages, ({ one }) => ({
  session: one(agentSessions, {
    fields: [agentMessages.sessionId],
    references: [agentSessions.id],
  }),
  user: one(users, { fields: [agentMessages.userId], references: [users.id] }),
  emailDraft: one(emailDrafts, {
    fields: [agentMessages.id],
    references: [emailDrafts.sessionMessageId],
  }),
}));

export const emailDraftsRelations = relations(emailDrafts, ({ one }) => ({
  user: one(users, { fields: [emailDrafts.userId], references: [users.id] }),
  sessionMessage: one(agentMessages, {
    fields: [emailDrafts.sessionMessageId],
    references: [agentMessages.id],
  }),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

// ─────────────────────────────────────────────
// EXPORT TYPE INFERENCES
// ─────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type EmailCache = typeof emailCache.$inferSelect;
export type NewEmailCache = typeof emailCache.$inferInsert;
export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type NewCalendarEvent = typeof calendarEvents.$inferInsert;
export type AgentSession = typeof agentSessions.$inferSelect;
export type NewAgentSession = typeof agentSessions.$inferInsert;
export type AgentMessage = typeof agentMessages.$inferSelect;
export type NewAgentMessage = typeof agentMessages.$inferInsert;
export type EmailDraft = typeof emailDrafts.$inferSelect;
export type NewEmailDraft = typeof emailDrafts.$inferInsert;
export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type NewWebhookEvent = typeof webhookEvents.$inferInsert;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;
