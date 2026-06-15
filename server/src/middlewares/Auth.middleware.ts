import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../config/db.js";
import { refreshTokens } from "../config/schema.js";
import { eq, and } from "drizzle-orm";
import { env } from "../env.js";
import { Logger } from "../utils/logger.js";
import { UnauthorizedError, TokenInvalidError } from "../utils/errors.js";
const logger = Logger.getInstance();

// ─────────────────────────────────────────────
// JWT PAYLOAD TYPES
// ─────────────────────────────────────────────

export interface JwtAccessPayload {
  userId: string;
  email: string;
  googleId: string;
}

export interface JwtRefreshPayload {
  userId: string;
  tokenId: string;
}

// ─────────────────────────────────────────────
// EXPRESS REQUEST AUGMENTATION
// ─────────────────────────────────────────────

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        googleId?: string;
      };
    }
  }
}

// ─────────────────────────────────────────────
// AUTH MIDDLEWARE CLASS
// ─────────────────────────────────────────────

export class AuthMiddleware {
  /**
   * Verifies the "Authorization: Bearer <accessToken>" header.
   * On success, populates req.user with the decoded payload.
   * Used on every protected route (/me, /logout, /agent-mode, ...).
   */
  public static authenticate = (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): void => {
    try {
      const header = req.headers.authorization;

      if (!header || !header.startsWith("Bearer ")) {
        throw new UnauthorizedError("Missing or invalid Authorization header");
      }

      const token = header.slice("Bearer ".length).trim();

      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
        issuer: "Echo-agent",
        audience: "Echo-agent-client",
      }) as JwtAccessPayload;

      req.user = {
        id: decoded.userId,
        email: decoded.email,
        googleId: decoded.googleId,
      };

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return next(new UnauthorizedError("Access token expired"));
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return next(new UnauthorizedError("Invalid access token"));
      }
      next(error);
    }
  };

  /**
   * Verifies the refresh token (from the signed httpOnly cookie, or
   * from the request body as a fallback for non-browser clients),
   * confirms it hasn't been revoked/expired in the DB, and populates
   * req.user.id so AuthController.refreshAccessToken can rotate it.
   */
  public static validateRefreshToken = async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const token: string | undefined =
        req.signedCookies?.refreshToken ||
        (req.body as { refreshToken?: string })?.refreshToken;

      if (!token) {
        throw new UnauthorizedError("Refresh token not found");
      }

      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET, {
        issuer: "Echo-agent",
      }) as JwtRefreshPayload;

      const [record] = await db
        .select()
        .from(refreshTokens)
        .where(
          and(
            eq(refreshTokens.userId, decoded.userId),
            eq(refreshTokens.token, token),
          ),
        )
        .limit(1);

      if (!record || record.isRevoked) {
        throw new TokenInvalidError("Refresh token has been revoked");
      }

      if (record.expiresAt.getTime() < Date.now()) {
        throw new TokenInvalidError("Refresh token has expired");
      }

      req.user = { id: decoded.userId };
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        logger.warn("Refresh token JWT expired", { ip: req.ip });
        return next(new UnauthorizedError("Refresh token expired"));
      }
      if (error instanceof jwt.JsonWebTokenError) {
        logger.warn("Invalid refresh token JWT", { ip: req.ip });
        return next(new UnauthorizedError("Invalid refresh token"));
      }
      next(error);
    }
  };
}
