import { Router } from "express";
import { AuthController } from "../controllers/Auth.controller.js";
import { AuthMiddleware } from "../middlewares/Auth.middleware.js";
import { RateLimitMiddleware } from "../middlewares/RateLimit.middleware.js";

// ─────────────────────────────────────────────
// AUTH ROUTES
// Base path: /api/v1/auth
// ─────────────────────────────────────────────

const router = Router();
const authController = new AuthController();

/**
 * @route   GET /api/v1/auth/google
 * @desc    Initiate Google OAuth2 login — redirects to Google consent screen
 * @access  Public
 */
router.get(
  "/google",
  RateLimitMiddleware.authLimiter,
  authController.initiateGoogleAuth,
);

/**
 * @route   GET /api/v1/auth/google/callback
 * @desc    Google OAuth2 callback — exchange code, create user, issue tokens
 * @access  Public (called by Google)
 */
router.get(
  "/google/callback",
  RateLimitMiddleware.authLimiter,
  authController.handleGoogleCallback,
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Rotate refresh token and issue a new access token
 * @access  Private (requires valid refresh token in cookie or body)
 */
router.post(
  "/refresh",
  RateLimitMiddleware.authLimiter,
  AuthMiddleware.validateRefreshToken,
  authController.refreshAccessToken,
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout — revoke current refresh token
 * @access  Private
 */
router.post("/logout", AuthMiddleware.authenticate, authController.logout);

/**
 * @route   POST /api/v1/auth/logout-all
 * @desc    Logout from ALL devices — revoke all refresh tokens
 * @access  Private
 */
router.post(
  "/logout-all",
  AuthMiddleware.authenticate,
  authController.logoutAll,
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user's profile
 * @access  Private
 */
router.get("/me", AuthMiddleware.authenticate, authController.getMe);

/**
 * @route   PATCH /api/v1/auth/agent-mode
 * @desc    Toggle agent mode between 'manual' and 'voice'
 * @access  Private
 */
router.patch(
  "/agent-mode",
  AuthMiddleware.authenticate,
  authController.updateAgentMode,
);

export default router;
