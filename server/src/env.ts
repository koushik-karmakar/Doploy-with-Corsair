import { config } from "dotenv";
import { z } from "zod";
config();

// ─────────────────────────────────────────────
// ENV VALIDATION SCHEMA
// ─────────────────────────────────────────────

const envSchema = z.object({
  // Server
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development")
    .describe("Node environment"),
  PORT: z.string().default("5000").transform(Number).describe("Server port"),
  API_VERSION: z.string().default("v1").describe("API version"),

  // Database
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .describe("PostgreSQL connection string"),
  POSTGRES_USER: z
    .string()
    .describe("PostgreSQL username"),
  POSTGRES_PASSWORD: z
    .string()
    .describe("PostgreSQL password"),
  POSTGRES_DB: z
    .string()
    .describe("PostgreSQL database name"),

  // JWT
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_ACCESS_SECRET must be at least 32 characters")
    .describe("JWT access token secret"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters")
    .describe("JWT refresh token secret"),
  JWT_ACCESS_EXPIRES_IN: z
    .string()
    .default("15m")
    .describe("JWT access token expiration time"),
  JWT_REFRESH_EXPIRES_IN: z
    .string()
    .default("7d")
    .describe("JWT refresh token expiration time"),

  // Encryption
  ENCRYPTION_KEY: z
    .string()
    .min(32, "ENCRYPTION_KEY must be at least 32 characters")
    .describe("Encryption key"),

  // Google OAuth
  GOOGLE_CLIENT_ID: z
    .string()
    .min(1, "GOOGLE_CLIENT_ID is required")
    .describe("Google OAuth client ID"),
  GOOGLE_CLIENT_SECRET: z
    .string()
    .min(1, "GOOGLE_CLIENT_SECRET is required")
    .describe("Google OAuth client secret"),
  GOOGLE_CALLBACK_URL: z
    .string()
    .url("GOOGLE_CALLBACK_URL must be a valid URL")
    .describe("Google OAuth callback URL"),

  // Corsair
  CORSAIR_API_KEY: z
    .string()
    .min(1, "CORSAIR_API_KEY is required")
    .describe("Corsair API key"),
  CORSAIR_BASE_URL: z
    .string()
    .url()
    .default("https://api.corsair.dev")
    .describe("Corsair API base URL"),
  CORSAIR_WEBHOOK_SECRET: z
    .string()
    .min(1, "CORSAIR_WEBHOOK_SECRET is required")
    .describe("Corsair webhook secret"),

  // AI (Groq - free tier)
  GROQ_API_KEY: z
    .string()
    .min(1, "GROQ_API_KEY is required")
    .describe("Groq API key"),
  GROQ_MODEL: z
    .string()
    .default("llama3-70b-8192")
    .describe("Groq model to use"),

  // Frontend
  FRONTEND_URL: z
    .string()
    .url()
    .default("http://localhost:3000")
    .describe("Frontend URL"),

  // Security
  COOKIE_SECRET: z
    .string()
    .min(32, "COOKIE_SECRET must be at least 32 characters")
    .describe("Cookie secret"),
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:3000")
    .describe("CORS origins"),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .default("900000")
    .transform(Number)
    .describe("Rate limit window in milliseconds"),
  RATE_LIMIT_MAX_REQUESTS: z
    .string()
    .default("100")
    .transform(Number)
    .describe("Maximum requests per window"),

  // Webhook
  WEBHOOK_URL: z
    .string()
    .url()
    .optional()
    .describe("Public URL for receiving webhooks (required in production)"),
  NGROK_URL: z
    .string()
    .optional()
    .describe("Ngrok URL for local development (overrides WEBHOOK_URL)"),
});

// ─────────────────────────────────────────────
// VALIDATE AND EXPORT
// ─────────────────────────────────────────────

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error("Invalid environment variables:");
  parseResult.error.issues.forEach((issue) => {
    console.error(` → ${issue.path.join(".")}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = parseResult.data;

export type Env = typeof env;
