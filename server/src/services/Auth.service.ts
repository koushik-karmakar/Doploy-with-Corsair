import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import jwt from "jsonwebtoken";
import { db } from "../config/db.js";
import { users, refreshTokens } from "../config/schema.js";
import { eq, and, lt } from "drizzle-orm";
import { env } from "../env.js";
import { Logger } from "../utils/logger.js";
import { Encryption } from "../utils/encryption.js";
import {
  GoogleAuthError,
  UnauthorizedError,
  DatabaseError,
  TokenInvalidError,
} from "../utils/errors.js";
import type { User, NewUser } from "../config/schema.js";
import type {
  JwtAccessPayload,
  JwtRefreshPayload,
} from "../middlewares/Auth.middleware.js";

const logger = Logger.getInstance();

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface GoogleUserInfo {
  googleId: string;
  email: string;
  name: string | undefined;
  avatarUrl?: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: string;
}

export interface AuthResult {
  user: Omit<User, "encryptedAccessToken" | "encryptedRefreshToken">;
  tokens: TokenPair;
}

// ─────────────────────────────────────────────
// AUTH SERVICE CLASS
// ─────────────────────────────────────────────

export class AuthService {
  private static instance: AuthService;
  private oauthClient: OAuth2Client;

  // Google OAuth Scopes needed for Gmail + Calendar
  private readonly SCOPES: string[] = [
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.labels",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar.readonly",
  ];

  private constructor() {
    this.oauthClient = new OAuth2Client(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_CALLBACK_URL,
    );
    logger.info("AuthService initialized");
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // ─────────────────────────────────────────
  // GOOGLE OAUTH METHODS
  // ─────────────────────────────────────────

  //  Generate Google OAuth2 consent URL

  public generateAuthUrl(state?: string): string {
    const url = this.oauthClient.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: this.SCOPES,
      include_granted_scopes: true,
      state: state || Encryption.generateRandomToken(16),
    });

    logger.debug("Generated Google OAuth URL");
    return url;
  }

  // Exchange authorization code for tokens and fetch user info
  public async handleOAuthCallback(code: string): Promise<GoogleUserInfo> {
    try {
      const { tokens } = await this.oauthClient.getToken(code);

      if (!tokens.access_token) {
        throw new GoogleAuthError("No access token received from Google");
      }
      if (!tokens.refresh_token) {
        throw new GoogleAuthError(
          "No refresh token received — ensure 'prompt: consent' is set",
        );
      }

      this.oauthClient.setCredentials(tokens);
      const oauth2 = google.oauth2({
        version: "v2",
        auth: this.oauthClient as any,
      });
      const { data: userInfo } = await oauth2.userinfo.get();
      if (!userInfo.id || !userInfo.email) {
        throw new GoogleAuthError("Failed to fetch user info from Google");
      }

      const expiresAt = tokens.expiry_date
        ? new Date(tokens.expiry_date)
        : new Date(Date.now() + 3600 * 1000);

      logger.info("Google OAuth callback successful", {
        email: userInfo.email,
      });

      return {
        googleId: userInfo.id,
        email: userInfo.email,
        name: userInfo.name || userInfo.email.split("@")[0],
        ...(userInfo.picture ? { avatarUrl: userInfo.picture } : {}),
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
      };
    } catch (error) {
      if (error instanceof GoogleAuthError) throw error;
      logger.error("Google OAuth callback error", {
        error: error instanceof Error ? error.message : "Unknown",
      });
      throw new GoogleAuthError(
        `Google authentication failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  // ─────────────────────────────────────────
  // USER MANAGEMENT
  // ─────────────────────────────────────────

  /**
   * Find or create user from Google OAuth data
   */
  public async findOrCreateUser(googleUser: GoogleUserInfo): Promise<User> {
    try {
      const userName = googleUser.name ?? googleUser.email;

      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.googleId, googleUser.googleId))
        .limit(1);

      if (existingUser) {
        const [updatedUser] = await db
          .update(users)
          .set({
            encryptedAccessToken: Encryption.encrypt(googleUser.accessToken),
            encryptedRefreshToken: Encryption.encrypt(googleUser.refreshToken),
            tokenExpiresAt: googleUser.expiresAt,
            lastLoginAt: new Date(),
            avatarUrl: googleUser.avatarUrl,
            name: userName,
            updatedAt: new Date(),
          })
          .where(eq(users.id, existingUser.id))
          .returning();

        if (!updatedUser) {
          throw new DatabaseError("Failed to update existing user");
        }

        logger.info("Existing user updated after Google OAuth", {
          userId: updatedUser.id,
        });
        return updatedUser;
      }

      const newUser: NewUser = {
        googleId: googleUser.googleId,
        email: googleUser.email,
        name: userName,
        avatarUrl: googleUser.avatarUrl,
        encryptedAccessToken: Encryption.encrypt(googleUser.accessToken),
        encryptedRefreshToken: Encryption.encrypt(googleUser.refreshToken),
        tokenExpiresAt: googleUser.expiresAt,
        agentMode: "manual",
        isActive: true,
        lastLoginAt: new Date(),
      };

      const [createdUser] = await db.insert(users).values(newUser).returning();

      if (!createdUser) {
        throw new DatabaseError("Failed to create new user");
      }

      logger.info("New user created from Google OAuth", {
        userId: createdUser.id,
        email: createdUser.email,
      });

      return createdUser;
    } catch (error) {
      logger.error("findOrCreateUser failed", {
        error: error instanceof Error ? error.message : "Unknown",
      });
      throw new DatabaseError("Failed to create or update user account");
    }
  }

  /**
   * Get user's decrypted Google access token (refreshing if needed)
   */
  public async getValidGoogleAccessToken(userId: string): Promise<string> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) throw new UnauthorizedError("User not found");
    if (!user.encryptedAccessToken || !user.encryptedRefreshToken) {
      throw new UnauthorizedError("User has no stored Google tokens");
    }

    const accessToken = Encryption.decrypt(user.encryptedAccessToken);
    const refreshTokenValue = Encryption.decrypt(user.encryptedRefreshToken);

    const isExpiredOrExpiring =
      !user.tokenExpiresAt ||
      user.tokenExpiresAt.getTime() < Date.now() + 5 * 60 * 1000;

    if (!isExpiredOrExpiring) {
      return accessToken;
    }

    logger.debug("Google access token expired, refreshing", { userId });
    return this.refreshGoogleToken(userId, refreshTokenValue);
  }

  /**
   * Refresh a Google OAuth token using the stored refresh token
   */
  private async refreshGoogleToken(
    userId: string,
    refreshToken: string,
  ): Promise<string> {
    try {
      const client = new OAuth2Client(
        env.GOOGLE_CLIENT_ID,
        env.GOOGLE_CLIENT_SECRET,
        env.GOOGLE_CALLBACK_URL,
      );

      client.setCredentials({ refresh_token: refreshToken });
      const { credentials } = await client.refreshAccessToken();

      if (!credentials.access_token) {
        throw new GoogleAuthError("Failed to refresh Google access token");
      }

      const expiresAt = credentials.expiry_date
        ? new Date(credentials.expiry_date)
        : new Date(Date.now() + 3600 * 1000);

      await db
        .update(users)
        .set({
          encryptedAccessToken: Encryption.encrypt(credentials.access_token),
          tokenExpiresAt: expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      logger.info("Google access token refreshed", { userId });
      return credentials.access_token;
    } catch (error) {
      logger.error("Google token refresh failed", {
        userId,
        error: error instanceof Error ? error.message : "Unknown",
      });
      throw new GoogleAuthError(
        "Could not refresh Google access token — please re-login",
      );
    }
  }

  // ─────────────────────────────────────────
  // JWT MANAGEMENT
  // ─────────────────────────────────────────

  /**
   * Issue a new JWT access + refresh token pair
   */
  public async issueTokenPair(
    user: User,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<TokenPair> {
    const accessPayload: JwtAccessPayload = {
      userId: user.id,
      email: user.email,
      googleId: user.googleId,
    };

    const accessExpiresIn =
      env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"];
    const refreshExpiresIn =
      env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"];

    if (accessExpiresIn === undefined || refreshExpiresIn === undefined) {
      throw new Error("JWT expiration values must be configured");
    }

    const accessToken = jwt.sign(accessPayload, env.JWT_ACCESS_SECRET, {
      expiresIn: accessExpiresIn,
      issuer: "chai-agent",
      audience: "chai-agent-client",
    });

    const refreshTokenId = Encryption.generateRandomToken(32);

    const refreshPayload: JwtRefreshPayload = {
      userId: user.id,
      tokenId: refreshTokenId,
    };

    const refreshTokenValue = jwt.sign(refreshPayload, env.JWT_REFRESH_SECRET, {
      expiresIn: refreshExpiresIn,
      issuer: "chai-agent",
    });

    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);

    await db.insert(refreshTokens).values({
      userId: user.id,
      token: refreshTokenValue,
      userAgent: userAgent || null,
      ipAddress: ipAddress || null,
      isRevoked: false,
      expiresAt: refreshExpiresAt,
    });

    logger.debug("Token pair issued", { userId: user.id });

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    };
  }

  /**
   * Rotate refresh token — revoke old, issue new pair
   */
  public async rotateRefreshToken(
    userId: string,
    oldRefreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<TokenPair> {
    await db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(
        and(
          eq(refreshTokens.userId, userId),
          eq(refreshTokens.token, oldRefreshToken),
        ),
      );

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) throw new TokenInvalidError("User not found for token rotation");

    return this.issueTokenPair(user, ipAddress, userAgent);
  }

  /**
   * Revoke a specific refresh token (logout)
   */
  public async revokeRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(
        and(
          eq(refreshTokens.userId, userId),
          eq(refreshTokens.token, refreshToken),
        ),
      );
    logger.info("Refresh token revoked", { userId });
  }

  /**
   * Revoke ALL refresh tokens for a user (logout everywhere)
   */
  public async revokeAllRefreshTokens(userId: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.userId, userId));
    logger.info("All refresh tokens revoked for user", { userId });
  }

  /**
   * Clean up expired refresh tokens (run as cron job)
   */
  public async purgeExpiredTokens(): Promise<number> {
    const result = await db
      .delete(refreshTokens)
      .where(lt(refreshTokens.expiresAt, new Date()))
      .returning({ id: refreshTokens.id });

    logger.info(`Purged ${result.length} expired refresh tokens`);
    return result.length;
  }

  /**
   * Get user by ID (public safe fields only)
   */
  public async getUserById(
    userId: string,
  ): Promise<Omit<
    User,
    "encryptedAccessToken" | "encryptedRefreshToken"
  > | null> {
    const [user] = await db
      .select({
        id: users.id,
        googleId: users.googleId,
        email: users.email,
        name: users.name,
        avatarUrl: users.avatarUrl,
        corsairUserId: users.corsairUserId,
        tokenExpiresAt: users.tokenExpiresAt,
        agentMode: users.agentMode,
        isActive: users.isActive,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user || null;
  }

  /**
   * Update user's agent mode (manual ↔ voice)
   */
  public async updateAgentMode(
    userId: string,
    mode: "manual" | "voice",
  ): Promise<void> {
    await db
      .update(users)
      .set({ agentMode: mode, updatedAt: new Date() })
      .where(eq(users.id, userId));

    logger.info("User agent mode updated", { userId, mode });
  }

  /**
   * Get an OAuth2Client with the user's tokens set (for Gmail/Calendar APIs)
   */
  public async getAuthenticatedOAuthClient(
    userId: string,
  ): Promise<OAuth2Client> {
    const accessToken = await this.getValidGoogleAccessToken(userId);

    const [user] = await db
      .select({ encryptedRefreshToken: users.encryptedRefreshToken })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const client = new OAuth2Client(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_CALLBACK_URL,
    );

    const refreshToken = user?.encryptedRefreshToken
      ? Encryption.safeDecrypt(user.encryptedRefreshToken)
      : null;

    client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    return client;
  }
}
