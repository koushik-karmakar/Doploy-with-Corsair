import type { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/Auth.service.js";
import { ResponseHelper } from "../utils/responseHelper.js";
import { Logger } from "../utils/logger.js";
import { env } from "../env.js";
import { BadRequestError, UnauthorizedError } from "../utils/errors.js";

const logger = Logger.getInstance();

// ─────────────────────────────────────────────
// AUTH CONTROLLER CLASS
// ─────────────────────────────────────────────

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = AuthService.getInstance();
  }

  // ─────────────────────────────────────────
  // GET /api/v1/auth/google
  // Redirects user to Google OAuth consent screen
  // ─────────────────────────────────────────

  public initiateGoogleAuth = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      logger.info("Google OAuth initiated", { ip: req.ip });
      const state = Buffer.from(
        JSON.stringify({
          ts: Date.now(),
          ip: req.ip,
        }),
      ).toString("base64url");

      res.cookie("oauth_state", state, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 10 * 60 * 1000,
        signed: true,
      });

      const authUrl = this.authService.generateAuthUrl(state);
      res.redirect(authUrl);
    } catch (error) {
      next(error);
    }
  };

  // ─────────────────────────────────────────
  // GET /api/v1/auth/google/callback
  // Handles Google OAuth callback with code
  // ─────────────────────────────────────────

  public handleGoogleCallback = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const {
        code,
        state,
        error: oauthError,
      } = req.query as {
        code?: string;
        state?: string;
        error?: string;
      };

      if (oauthError) {
        logger.warn("Google OAuth denied by user", {
          error: oauthError,
          ip: req.ip,
        });
        return res.redirect(
          `${env.FRONTEND_URL}/auth/error?reason=access_denied`,
        ) as unknown as void;
      }

      if (!code) {
        throw new BadRequestError("Authorization code missing from callback");
      }

      const savedState = req.signedCookies?.oauth_state;
      if (!savedState || savedState !== state) {
        logger.warn("OAuth state mismatch — possible CSRF attack", {
          ip: req.ip,
          receivedState: state,
        });
        return res.redirect(
          `${env.FRONTEND_URL}/auth/error?reason=state_mismatch`,
        ) as unknown as void;
      }

      res.clearCookie("oauth_state");
      const googleUser = await this.authService.handleOAuthCallback(code);
      console.log("Google user info:", googleUser);
      const user = await this.authService.findOrCreateUser(googleUser);
      const tokens = await this.authService.issueTokenPair(
        user,
        req.ip,
        req.headers["user-agent"],
      );

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        signed: true,
        path: "/api/v1/auth",
      });

      logger.info("User logged in via Google OAuth", {
        userId: user.id,
        email: user.email,
      });

      return res.redirect(
        `${env.FRONTEND_URL}/auth/success#token=${tokens.accessToken}&expiresIn=${tokens.accessExpiresIn}`,
      ) as unknown as void;
    } catch (error) {
      logger.error("Google OAuth callback failed", {
        error: error instanceof Error ? error.message : "Unknown",
      });
      next(error);
    }
  };

  // ─────────────────────────────────────────
  // POST /api/v1/auth/refresh
  // Rotate refresh token → issue new access token
  // ─────────────────────────────────────────

  public refreshAccessToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError("No user from refresh token");

      const oldRefreshToken =
        req.signedCookies?.refreshToken ||
        (req.body as { refreshToken?: string })?.refreshToken;

      if (!oldRefreshToken) {
        throw new UnauthorizedError("Refresh token not found");
      }

      const tokens = await this.authService.rotateRefreshToken(
        req.user.id,
        oldRefreshToken,
        req.ip,
        req.headers["user-agent"],
      );

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        signed: true,
        path: "/api/v1/auth",
      });

      logger.info("Access token refreshed", { userId: req.user.id });

      ResponseHelper.success(
        res,
        {
          accessToken: tokens.accessToken,
          expiresIn: tokens.accessExpiresIn,
        },
        "Token refreshed successfully",
      );
    } catch (error) {
      next(error);
    }
  };

  // ─────────────────────────────────────────
  // POST /api/v1/auth/logout
  // Revoke refresh token, clear cookie
  // ─────────────────────────────────────────

  public logout = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError("Not authenticated");

      const refreshToken =
        req.signedCookies?.refreshToken ||
        (req.body as { refreshToken?: string })?.refreshToken;

      if (refreshToken) {
        await this.authService.revokeRefreshToken(req.user.id, refreshToken);
      }

      res.clearCookie("refreshToken", { path: "/api/v1/auth" });
      res.clearCookie("oauth_state");

      logger.info("User logged out", { userId: req.user.id });

      ResponseHelper.success(res, null, "Logged out successfully");
    } catch (error) {
      next(error);
    }
  };

  // ─────────────────────────────────────────
  // POST /api/v1/auth/logout-all
  // Revoke ALL refresh tokens (logout from all devices)
  // ─────────────────────────────────────────

  public logoutAll = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError("Not authenticated");

      await this.authService.revokeAllRefreshTokens(req.user.id);
      res.clearCookie("refreshToken", { path: "/api/v1/auth" });

      logger.info("User logged out from all devices", { userId: req.user.id });

      ResponseHelper.success(
        res,
        null,
        "Logged out from all devices successfully",
      );
    } catch (error) {
      next(error);
    }
  };

  // ─────────────────────────────────────────
  // GET /api/v1/auth/me
  // Get current authenticated user profile
  // ─────────────────────────────────────────

  public getMe = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError("Not authenticated");

      const user = await this.authService.getUserById(req.user.id);
      if (!user) throw new UnauthorizedError("User not found");

      ResponseHelper.success(res, user, "User profile fetched");
    } catch (error) {
      next(error);
    }
  };

  // ─────────────────────────────────────────
  // PATCH /api/v1/auth/agent-mode
  // Toggle user agent mode: manual ↔ voice
  // ─────────────────────────────────────────

  public updateAgentMode = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError("Not authenticated");

      const { mode } = req.body as { mode?: "manual" | "voice" };

      if (!mode || !["manual", "voice"].includes(mode)) {
        throw new BadRequestError("mode must be 'manual' or 'voice'");
      }

      await this.authService.updateAgentMode(req.user.id, mode);
      logger.info("Agent mode updated", { userId: req.user.id, mode });
      ResponseHelper.success(
        res,
        { agentMode: mode },
        `Agent mode set to ${mode}`,
      );
    } catch (error) {
      next(error);
    }
  };
}
