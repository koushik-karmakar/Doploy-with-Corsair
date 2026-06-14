import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import type{ Request, Response } from "express";
import { env } from "../env.js";
import { Logger } from "../utils/logger.js";

const logger = Logger.getInstance();

// ─────────────────────────────────────────────
// RATE LIMITER FACTORY CLASS
// ─────────────────────────────────────────────

export class RateLimitMiddleware {
  /**
   * General API rate limiter — 100 requests per 15 minutes
   */
  public static general = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,  // Return rate limit info in RateLimit-* headers
    legacyHeaders: false,   // Disable X-RateLimit-* headers
    skipSuccessfulRequests: false,
    message: {
      success: false,
      message: "Too many requests from this IP, please try again later",
      error: "RATE_LIMIT_EXCEEDED",
      timestamp: new Date().toISOString(),
    },
    handler: (req: Request, res: Response) => {
      logger.warn("Rate limit exceeded", {
        ip: req.ip,
        path: req.path,
        method: req.method,
      });
      res.status(429).json({
        success: false,
        message: "Too many requests from this IP, please try again later",
        error: "RATE_LIMIT_EXCEEDED",
        timestamp: new Date().toISOString(),
      });
    },
  });

  /**
   * Strict rate limiter for auth endpoints — 10 attempts per 15 minutes
   */
  public static authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful logins
    message: {
      success: false,
      message: "Too many authentication attempts, please try again later",
      error: "AUTH_RATE_LIMIT_EXCEEDED",
      timestamp: new Date().toISOString(),
    },
    handler: (req: Request, res: Response) => {
      logger.warn("Auth rate limit exceeded", {
        ip: req.ip,
        path: req.path,
      });
      res.status(429).json({
        success: false,
        message:
          "Too many authentication attempts, please wait 15 minutes before trying again",
        error: "AUTH_RATE_LIMIT_EXCEEDED",
        timestamp: new Date().toISOString(),
      });
    },
  });

  /**
   * AI / Agent endpoint rate limiter — 30 requests per 15 minutes (AI calls are expensive)
   */
  public static agentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "AI agent rate limit exceeded, please wait before sending more requests",
      error: "AGENT_RATE_LIMIT_EXCEEDED",
      timestamp: new Date().toISOString(),
    },
  });

  /**
   * Webhook rate limiter — 500 per minute (high volume expected)
   */
  public static webhookLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Webhook rate limit exceeded",
      error: "WEBHOOK_RATE_LIMIT_EXCEEDED",
      timestamp: new Date().toISOString(),
    },
  });

  /**
   * Speed limiter — progressive delay after 50 requests in 15 min
   * Adds 500ms delay per request over the limit
   */
  public static speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000,
    delayAfter: 50,
    delayMs: (used) => (used - 50) * 500, // 500ms delay per extra request
    maxDelayMs: 5000, // Max 5 second delay
  });
}