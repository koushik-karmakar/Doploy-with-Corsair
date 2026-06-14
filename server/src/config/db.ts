import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.js";
import { Logger } from "../utils/logger.js";

const logger = Logger.getInstance();

// ─────────────────────────────────────────────
// DATABASE CONNECTION POOL
// ─────────────────────────────────────────────

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pool: Pool;
  public db: ReturnType<typeof drizzle>;

  private constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20, 
      idleTimeoutMillis: 30000, 
      connectionTimeoutMillis: 10000, 
      allowExitOnIdle: false,
    });

   
    this.pool.on("error", (err: Error) => {
      logger.error("Unexpected PostgreSQL pool error", { error: err.message });
    });

    this.pool.on("connect", () => {
      logger.debug("New PostgreSQL connection established");
    });

    this.db = drizzle(this.pool, {
      schema,
      logger: process.env.NODE_ENV === "development",
    });

    logger.info("Database connection pool initialized");
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async testConnection(): Promise<boolean> {
    try {
      const client = await this.pool.connect();
      await client.query("SELECT 1");
      client.release();
      logger.info("Database connection test passed");
      return true;
    } catch (error) {
      logger.error("Database connection test failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
    }
  }

  public async closePool(): Promise<void> {
    await this.pool.end();
    logger.info("Database pool closed");
  }

  public getPool(): Pool {
    return this.pool;
  }
}

// ─────────────────────────────────────────────
// EXPORT SINGLETON DB INSTANCE
// ─────────────────────────────────────────────

const dbConnection = DatabaseConnection.getInstance();

export const db = dbConnection.db;
export const testDatabaseConnection = () => dbConnection.testConnection();
export const closeDatabasePool = () => dbConnection.closePool();
export const getPool = () => dbConnection.getPool();

export default db;
