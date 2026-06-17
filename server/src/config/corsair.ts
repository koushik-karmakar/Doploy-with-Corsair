import "dotenv/config";
import { Pool } from "pg";
import { createCorsair } from "corsair";
import { gmail } from "@corsair-dev/gmail";

// ─────────────────────────────────────────────
// CORSAIR INSTANCE — Gmail only
// ─────────────────────────────────────────────
//
// Corsair owns and encrypts the Google OAuth tokens itself, inside its own
// tables (corsair_integrations, corsair_accounts, corsair_entities,
// corsair_events) which live in the SAME Postgres database as our app
// tables (users, emails, drafts, ...). We never touch those tables directly
// — Corsair manages them through the `corsair` instance below.
//
// The `pool` here MUST point at the same DATABASE_URL as our Drizzle `db`
// instance (see config/db.ts), since both write to the same Postgres
// container.

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const corsair = createCorsair({
  plugins: [gmail()],
  database: pool,
  kek: process.env.CORSAIR_KEK!,
  multiTenancy: false,
});

export const corsairPool = pool;
