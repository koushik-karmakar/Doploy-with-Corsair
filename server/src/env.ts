import { config } from "dotenv";
import { z } from "zod";

// Load .env file
config();

// ─────────────────────────────────────────────
// ENV VALIDATION SCHEMA
// ─────────────────────────────────────────────

const envSchema = z.object({
  // Server
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("5000").transform(Number),
  API_VERSION: z.string().default("v1"),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  POSTGRES_USER: z.string().default("chai_user"),
  POSTGRES_PASSWORD: z.string().default("chai_secret_password"),
  POSTGRES_DB: z.string().default("chai_db"),

  // JWT
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  // Encryption
  ENCRYPTION_KEY: z
    .string()
    .min(32, "ENCRYPTION_KEY must be at least 32 characters"),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  GOOGLE_CALLBACK_URL: z
    .string()
    .url("GOOGLE_CALLBACK_URL must be a valid URL"),

  // Corsair
  CORSAIR_API_KEY: z.string().min(1, "CORSAIR_API_KEY is required"),
  CORSAIR_BASE_URL: z.string().url().default("https://api.corsair.dev"),
  CORSAIR_WEBHOOK_SECRET: z
    .string()
    .min(1, "CORSAIR_WEBHOOK_SECRET is required"),

  // AI (Groq - free tier)
  GROQ_API_KEY: z.string().min(1, "GROQ_API_KEY is required"),
  GROQ_MODEL: z.string().default("llama3-70b-8192"),

  // Frontend
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),

  // Security
  COOKIE_SECRET: z
    .string()
    .min(32, "COOKIE_SECRET must be at least 32 characters"),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default("900000").transform(Number), // 15 min
  RATE_LIMIT_MAX_REQUESTS: z.string().default("100").transform(Number),

  // Webhook
  WEBHOOK_URL: z.string().url().optional(),
  NGROK_URL: z.string().optional(),
});

// ─────────────────────────────────────────────
// VALIDATE AND EXPORT
// ─────────────────────────────────────────────

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error("❌ Invalid environment variables:");
  parseResult.error.issues.forEach((issue) => {
    console.error(`  → ${issue.path.join(".")}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = parseResult.data;

export type Env = typeof env;
