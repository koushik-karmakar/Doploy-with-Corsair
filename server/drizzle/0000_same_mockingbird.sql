CREATE TYPE "public"."agent_action_status" AS ENUM('pending', 'in_progress', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."agent_action_type" AS ENUM('compose_email', 'reply_email', 'forward_email', 'archive_email', 'delete_email', 'label_email', 'create_event', 'update_event', 'delete_event', 'summarize_email', 'draft_reply', 'search_emails', 'search_events');--> statement-breakpoint
CREATE TYPE "public"."agent_mode_enum" AS ENUM('manual', 'voice');--> statement-breakpoint
CREATE TYPE "public"."attachment_type" AS ENUM('image', 'document', 'spreadsheet', 'presentation', 'pdf', 'archive', 'audio', 'video', 'other');--> statement-breakpoint
CREATE TYPE "public"."attendee_response" AS ENUM('accepted', 'declined', 'tentative', 'needsAction');--> statement-breakpoint
CREATE TYPE "public"."calendar_event_status" AS ENUM('confirmed', 'tentative', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."email_category" AS ENUM('primary', 'promotions', 'social', 'updates', 'forums');--> statement-breakpoint
CREATE TYPE "public"."email_folder" AS ENUM('inbox', 'sent', 'drafts', 'starred', 'all', 'spam', 'trash');--> statement-breakpoint
CREATE TYPE "public"."email_status" AS ENUM('unread', 'read', 'archived', 'trashed', 'spam');--> statement-breakpoint
CREATE TYPE "public"."label_color" AS ENUM('blue', 'green', 'yellow', 'red', 'purple', 'pink', 'orange', 'teal', 'gray');--> statement-breakpoint
CREATE TYPE "public"."webhook_event_type" AS ENUM('email.received', 'email.sent', 'email.read', 'email.archived', 'email.trashed', 'email.label_added', 'email.label_removed', 'calendar.event_created', 'calendar.event_updated', 'calendar.event_deleted', 'calendar.event_reminder', 'agent.action_completed', 'agent.action_failed');--> statement-breakpoint
CREATE TABLE "attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"gmail_attachment_id" varchar(512),
	"filename" varchar(512) NOT NULL,
	"mime_type" varchar(256) NOT NULL,
	"size" integer NOT NULL,
	"attachment_type" "attachment_type" DEFAULT 'other' NOT NULL,
	"storage_key" varchar(1024),
	"storage_url" varchar(2048),
	"downloaded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "corsair_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tenant_id" text NOT NULL,
	"integration_id" text NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"dek" text
);
--> statement-breakpoint
CREATE TABLE "corsair_entities" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"account_id" text NOT NULL,
	"entity_id" text NOT NULL,
	"entity_type" text NOT NULL,
	"version" text NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "corsair_events" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"account_id" text NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" text
);
--> statement-breakpoint
CREATE TABLE "corsair_integrations" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"dek" text
);
--> statement-breakpoint
CREATE TABLE "drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"thread_id" uuid,
	"gmail_draft_id" varchar(256),
	"subject" text DEFAULT '' NOT NULL,
	"to_recipients" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"cc_recipients" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"bcc_recipients" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"body_html" text,
	"body_text" text,
	"is_ai_generated" boolean DEFAULT false NOT NULL,
	"ai_prompt" text,
	"in_reply_to_email_id" uuid,
	"is_forward" boolean DEFAULT false NOT NULL,
	"last_saved_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_labels" (
	"email_id" uuid NOT NULL,
	"label_id" uuid NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_thread_labels" (
	"thread_id" uuid NOT NULL,
	"label_id" uuid NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_threads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"gmail_thread_id" varchar(256) NOT NULL,
	"subject" text DEFAULT '(no subject)' NOT NULL,
	"snippet" text,
	"message_count" integer DEFAULT 1 NOT NULL,
	"unread_count" integer DEFAULT 0 NOT NULL,
	"participant_emails" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"participant_names" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_starred" boolean DEFAULT false NOT NULL,
	"is_important" boolean DEFAULT false NOT NULL,
	"is_muted" boolean DEFAULT false NOT NULL,
	"folder" "email_folder" DEFAULT 'inbox' NOT NULL,
	"category" "email_category" DEFAULT 'primary' NOT NULL,
	"last_message_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"thread_id" uuid NOT NULL,
	"gmail_message_id" varchar(256) NOT NULL,
	"gmail_thread_id" varchar(256) NOT NULL,
	"message_id_header" varchar(512),
	"in_reply_to" varchar(512),
	"references" text,
	"subject" text DEFAULT '(no subject)' NOT NULL,
	"snippet" text,
	"from_name" varchar(256),
	"from_email" varchar(320) NOT NULL,
	"to_recipients" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"cc_recipients" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"bcc_recipients" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"body_html" text,
	"body_text" text,
	"size_estimate" integer,
	"status" "email_status" DEFAULT 'unread' NOT NULL,
	"folder" "email_folder" DEFAULT 'inbox' NOT NULL,
	"category" "email_category" DEFAULT 'primary' NOT NULL,
	"is_starred" boolean DEFAULT false NOT NULL,
	"is_important" boolean DEFAULT false NOT NULL,
	"is_draft" boolean DEFAULT false NOT NULL,
	"is_sent" boolean DEFAULT false NOT NULL,
	"ai_summary" text,
	"ai_priority_score" integer,
	"internal_date" bigint,
	"received_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "labels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"gmail_label_id" varchar(256),
	"name" varchar(128) NOT NULL,
	"color" "label_color" DEFAULT 'blue' NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"message_count" integer DEFAULT 0 NOT NULL,
	"unread_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"user_agent" text,
	"ip_address" varchar(45),
	"is_revoked" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "refresh_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"google_id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"avatar_url" text,
	"corsair_user_id" varchar(255),
	"encrypted_access_token" text,
	"encrypted_refresh_token" text,
	"token_expires_at" timestamp with time zone,
	"agent_mode" "agent_mode_enum" DEFAULT 'manual' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_email_id_emails_id_fk" FOREIGN KEY ("email_id") REFERENCES "public"."emails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corsair_accounts" ADD CONSTRAINT "corsair_accounts_integration_id_corsair_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."corsair_integrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corsair_entities" ADD CONSTRAINT "corsair_entities_account_id_corsair_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."corsair_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corsair_events" ADD CONSTRAINT "corsair_events_account_id_corsair_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."corsair_accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drafts" ADD CONSTRAINT "drafts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drafts" ADD CONSTRAINT "drafts_thread_id_email_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."email_threads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drafts" ADD CONSTRAINT "drafts_in_reply_to_email_id_emails_id_fk" FOREIGN KEY ("in_reply_to_email_id") REFERENCES "public"."emails"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_labels" ADD CONSTRAINT "email_labels_email_id_emails_id_fk" FOREIGN KEY ("email_id") REFERENCES "public"."emails"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_labels" ADD CONSTRAINT "email_labels_label_id_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."labels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_thread_labels" ADD CONSTRAINT "email_thread_labels_thread_id_email_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."email_threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_thread_labels" ADD CONSTRAINT "email_thread_labels_label_id_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."labels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_threads" ADD CONSTRAINT "email_threads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emails" ADD CONSTRAINT "emails_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emails" ADD CONSTRAINT "emails_thread_id_email_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."email_threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "labels" ADD CONSTRAINT "labels_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attachments_email_id_idx" ON "attachments" USING btree ("email_id");--> statement-breakpoint
CREATE INDEX "attachments_user_id_idx" ON "attachments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "drafts_user_id_idx" ON "drafts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "drafts_thread_id_idx" ON "drafts" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX "drafts_gmail_draft_id_idx" ON "drafts" USING btree ("gmail_draft_id");--> statement-breakpoint
CREATE UNIQUE INDEX "email_labels_pk" ON "email_labels" USING btree ("email_id","label_id");--> statement-breakpoint
CREATE INDEX "email_labels_email_idx" ON "email_labels" USING btree ("email_id");--> statement-breakpoint
CREATE INDEX "email_labels_label_idx" ON "email_labels" USING btree ("label_id");--> statement-breakpoint
CREATE UNIQUE INDEX "email_thread_labels_pk" ON "email_thread_labels" USING btree ("thread_id","label_id");--> statement-breakpoint
CREATE INDEX "email_thread_labels_thread_idx" ON "email_thread_labels" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX "email_thread_labels_label_idx" ON "email_thread_labels" USING btree ("label_id");--> statement-breakpoint
CREATE INDEX "email_threads_user_id_idx" ON "email_threads" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "email_threads_user_gmail_thread_idx" ON "email_threads" USING btree ("user_id","gmail_thread_id");--> statement-breakpoint
CREATE INDEX "email_threads_folder_idx" ON "email_threads" USING btree ("user_id","folder");--> statement-breakpoint
CREATE INDEX "email_threads_category_idx" ON "email_threads" USING btree ("user_id","category");--> statement-breakpoint
CREATE INDEX "email_threads_last_message_at_idx" ON "email_threads" USING btree ("last_message_at");--> statement-breakpoint
CREATE INDEX "email_threads_starred_idx" ON "email_threads" USING btree ("user_id","is_starred");--> statement-breakpoint
CREATE INDEX "emails_user_id_idx" ON "emails" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "emails_thread_id_idx" ON "emails" USING btree ("thread_id");--> statement-breakpoint
CREATE UNIQUE INDEX "emails_user_gmail_message_idx" ON "emails" USING btree ("user_id","gmail_message_id");--> statement-breakpoint
CREATE INDEX "emails_folder_idx" ON "emails" USING btree ("user_id","folder");--> statement-breakpoint
CREATE INDEX "emails_status_idx" ON "emails" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "emails_received_at_idx" ON "emails" USING btree ("received_at");--> statement-breakpoint
CREATE INDEX "emails_from_email_idx" ON "emails" USING btree ("user_id","from_email");--> statement-breakpoint
CREATE INDEX "emails_is_starred_idx" ON "emails" USING btree ("user_id","is_starred");--> statement-breakpoint
CREATE INDEX "labels_user_id_idx" ON "labels" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "labels_user_gmail_label_idx" ON "labels" USING btree ("user_id","gmail_label_id");--> statement-breakpoint
CREATE INDEX "labels_user_name_idx" ON "labels" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "refresh_tokens_token_idx" ON "refresh_tokens" USING btree ("token");--> statement-breakpoint
CREATE UNIQUE INDEX "users_google_id_idx" ON "users" USING btree ("google_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");