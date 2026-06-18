import { Router } from "express";
import { GmailController } from "../controllers/Gmail.controller.js";
import { AuthMiddleware } from "../middlewares/Auth.middleware.js";
import { RateLimitMiddleware } from "../middlewares/RateLimit.middleware.js";

const router = Router();
const gmailController = new GmailController();

/**
 * @route   POST /api/v1/gmail/sync
 * @desc    Fetch latest Gmail inbox messages and store in DB
 * @access  Private
 */
router.post(
  "/sync",
  RateLimitMiddleware.general,
  AuthMiddleware.authenticate,
  gmailController.syncInbox,
);

/**
 * @route   GET /api/v1/gmail/messages
 * @desc    Get stored emails from DB
 * @access  Private
 */
router.get(
  "/messages",
  RateLimitMiddleware.general,
  AuthMiddleware.authenticate,
  gmailController.getMessages,
);

export default router;
