import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/errors.js";
import { Logger } from "../utils/logger.js";
import { env } from "../env.js";

const logger = Logger.getInstance();

// ─────────────────────────────────────────────
// GLOBAL ERROR HANDLER MIDDLEWARE
// ─────────────────────────────────────────────

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // ── Zod Validation Errors ──────────────────
  if (err instanceof ZodError) {
    const messages = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    logger.warn("Validation error", {
      path: req.path,
      method: req.method,
      errors: messages,
    });

    res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: messages,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // ── Known Operational Errors ───────────────
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(`[${err.name}] ${err.message}`, {
        path: req.path,
        method: req.method,
        stack: err.stack,
        code: err.code,
      });
    } else {
      logger.warn(`[${err.name}] ${err.message}`, {
        path: req.path,
        method: req.method,
        code: err.code,
      });
    }

    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err.code || err.name,
      timestamp: new Date().toISOString(),
      ...(env.NODE_ENV === "development" && { stack: err.stack }),
    });
    return;
  }

  // ── JWT Errors from jsonwebtoken ───────────
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      message: "Invalid token",
      error: "TOKEN_INVALID",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (err.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      message: "Token has expired",
      error: "TOKEN_EXPIRED",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // ── Unknown / Unexpected Errors ────────────
  logger.error("Unhandled error", {
    message: err.message,
    name: err.name,
    path: req.path,
    method: req.method,
    stack: err.stack,
  });

  res.status(500).json({
    success: false,
    message:
      env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : err.message,
    error: "INTERNAL_SERVER_ERROR",
    timestamp: new Date().toISOString(),
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// ─────────────────────────────────────────────
// 404 NOT FOUND HANDLER
// ─────────────────────────────────────────────

export const notFoundHandler = (req: Request, res: Response): void => {
  logger.warn("Route not found", {
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.path}`,
    error: "ROUTE_NOT_FOUND",
    timestamp: new Date().toISOString(),
  });
};
