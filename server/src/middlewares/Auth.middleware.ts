import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../config/db.js";
import { users, refreshTokens } from "../config/schema.js";
import { eq, and } from "drizzle-orm";
import { env } from "../env.js";
import { Logger } from "../utils/logger.js";
import {
  UnauthorizedError,
  TokenExpiredError,
  TokenInvalidError,
} from "../utils/errors.js";

const logger = Logger.getInstance();

// ─────────────────────────────────────────────
// TOKEN PAYLOAD TYPES
// ─────────────────────────────────────────────

export interface JwtAccessPayload {
  userId: string;
  email: string;
  googleId: string;
  iat?: number;
  exp?: number;
}

export interface JwtRefreshPayload {
  userId: string;
  tokenId: string;
  iat?: number;
  exp?: number;
}

// Extend Express Request to carry user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        googleId: string;
        name: string;
      };
      accessToken?: string;
    }
  }
}

// ─────────────────────────────────────────────
// AUTH MIDDLEWARE CLASS
// ─────────────────────────────────────────────

export class AuthMiddleware {
  /**
   * Protect routes — verifies Bearer access token from Authorization header
   */
  public static authenticate = async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new UnauthorizedError(
          "Authorization header missing or malformed",
        );
      }

      const token = authHeader.split(" ")[1];
      if (!token) throw new UnauthorizedError("Access token missing");

      // Verify JWT
      let payload: JwtAccessPayload;
      try {
        payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAccessPayload;
      } catch (jwtError) {
        if (jwtError instanceof jwt.TokenExpiredError) {
          throw new TokenExpiredError("Access token has expired");
        }
        throw new TokenInvalidError("Access token is invalid");
      }

      // Fetch user from DB to ensure they still exist and are active
      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          googleId: users.googleId,
          name: users.name,
          isActive: users.isActive,
        })
        .from(users)
        .where(eq(users.id, payload.userId))
        .limit(1);

      if (!user) {
        throw new UnauthorizedError("User account not found");
      }

      if (!user.isActive) {
        throw new UnauthorizedError("User account is deactivated");
      }

      // Attach user to request
      req.user = {
        id: user.id,
        email: user.email,
        googleId: user.googleId,
        name: user.name,
      };
      req.accessToken = token;

      logger.debug("User authenticated", { userId: user.id, path: req.path });
      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Optional authentication — attaches user if token provided, but doesn't fail if missing
   */
  public static optionalAuthenticate = async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next();
      }

      const token = authHeader.split(" ")[1];
      if (!token) return next();

      const payload = jwt.verify(
        token,
        env.JWT_ACCESS_SECRET,
      ) as JwtAccessPayload;

      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          googleId: users.googleId,
          name: users.name,
          isActive: users.isActive,
        })
        .from(users)
        .where(eq(users.id, payload.userId))
        .limit(1);

      if (user && user.isActive) {
        req.user = {
          id: user.id,
          email: user.email,
          googleId: user.googleId,
          name: user.name,
        };
      }

      next();
    } catch {
      // Token invalid but optional — proceed without user
      next();
    }
  };

  /**
   * Validate refresh token from httpOnly cookie
   */
  public static validateRefreshToken = async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const refreshToken =
        req.cookies?.refreshToken ||
        (req.body as { refreshToken?: string })?.refreshToken;

      if (!refreshToken) {
        throw new UnauthorizedError("Refresh token missing");
      }

      // Verify JWT signature first
      let payload: JwtRefreshPayload;
      try {
        payload = jwt.verify(
          refreshToken,
          env.JWT_REFRESH_SECRET,
        ) as JwtRefreshPayload;
      } catch {
        throw new TokenInvalidError("Refresh token is invalid or expired");
      }

      // Check DB for token existence and revocation
      const [storedToken] = await db
        .select()
        .from(refreshTokens)
        .where(
          and(
            eq(refreshTokens.userId, payload.userId),
            eq(refreshTokens.isRevoked, false),
          ),
        )
        .limit(1);

      if (!storedToken) {
        throw new TokenInvalidError(
          "Refresh token has been revoked or not found",
        );
      }

      // Fetch user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, payload.userId))
        .limit(1);

      if (!user || !user.isActive) {
        throw new UnauthorizedError("User not found or deactivated");
      }

      req.user = {
        id: user.id,
        email: user.email,
        googleId: user.googleId,
        name: user.name,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
}
