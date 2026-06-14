import type { Application, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import hpp from "hpp";
import morgan from "morgan";
import { env } from "../env.js";
import { Logger } from "../utils/logger.js";
import { RateLimitMiddleware } from "./RateLimit.middleware.js";

const logger = Logger.getInstance();

// ─────────────────────────────────────────────
// SECURITY MIDDLEWARE APPLIER
// ─────────────────────────────────────────────

export class SecurityMiddleware {
  /**
   * Apply all security middleware to the Express app
   */
  public static apply(app: Application): void {
    // ── 1. HELMET — Security HTTP Headers ─────
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
          },
        },
        crossOriginEmbedderPolicy: false,
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        },
        noSniff: true, 
        xssFilter: true, 
        referrerPolicy: { policy: "strict-origin-when-cross-origin" },
        frameguard: { action: "deny" },
      }),
    );

    // ── 2. CORS ────────────────────────────────
    const allowedOrigins = env.CORS_ORIGINS.split(",").map((o) => o.trim());

    app.use(
      cors({
        origin: (origin, callback) => {
          if (!origin && env.NODE_ENV !== "production") {
            return callback(null, true);
          }
          if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
          }
          logger.warn("CORS blocked request from origin", { origin });
          return callback(new Error(`Origin ${origin} not allowed by CORS`));
        },
        credentials: true, 
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: [
          "Content-Type",
          "Authorization",
          "X-Requested-With",
          "Accept",
          "X-CSRF-Token",
        ],
        exposedHeaders: [
          "RateLimit-Limit",
          "RateLimit-Remaining",
          "RateLimit-Reset",
        ],
        maxAge: 86400,
      }),
    );

    // ── 3. HTTP Parameter Pollution ─────
    app.use(hpp());

    // ── 5. Cookie Parser with Secret ─────────
    app.use(cookieParser(env.COOKIE_SECRET));

    // ── 6. Compression ────────────────────────
    app.use(
      compression({
        level: 6,
        threshold: 1024,
        filter: (req, res) => {
          if (req.headers["x-no-compression"]) return false;
          return compression.filter(req, res);
        },
      }),
    );

    // ── 7. Request Logger (Morgan) ────────────
    if (env.NODE_ENV === "development") {
      app.use(morgan("dev"));
    } else {
      app.use(
        morgan("combined", {
          stream: {
            write: (message: string) => logger.http(message.trim()),
          },
          skip: (req) => req.path === "/health",
        }),
      );
    }

    // ── 8. General Rate Limiting ──────────────
    app.use("/api/", RateLimitMiddleware.general);
    app.use("/api/", RateLimitMiddleware.speedLimiter);

    // ── 9. Request ID middleware ──────────────
    app.use((req: Request, _res: Response, next: NextFunction) => {
      req.headers["x-request-id"] =
        req.headers["x-request-id"] ||
        `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      next();
    });

    // ── 10. Trust proxy (for accurate IPs behind load balancers) ──
    if (env.NODE_ENV === "production") {
      app.set("trust proxy", 1);
    }

    logger.info("Security middleware applied");
  }
}
