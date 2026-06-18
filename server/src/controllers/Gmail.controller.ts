import type { Request, Response, NextFunction } from "express";
import { GmailService } from "../services/Gmail.service.js";
import { ResponseHelper } from "../utils/responseHelper.js";
import { Logger } from "../utils/logger.js";
import type { Email as DbEmail } from "../config/schema.js";

type EmailCategory = DbEmail["category"];
type EmailFolder = DbEmail["folder"];

const logger = Logger.getInstance();

export class GmailController {
  private gmailService: GmailService;

  constructor() {
    this.gmailService = GmailService.getInstance();
  }

  /**
   * POST /api/v1/gmail/sync
   * Fetch latest inbox messages from Gmail API and store in DB.
   */
  public syncInbox = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const limit = Math.min(Number(req.query.limit) || 10, 50);

      logger.info("Gmail sync requested", { userId, limit });
      const result = await this.gmailService.syncInbox(userId, limit);

      ResponseHelper.success(res, result, "Gmail inbox synced");
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/gmail/messages
   * Return stored emails from DB (optionally filtered).
   */
  public getMessages = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user!.id;
      const limit = Math.min(Number(req.query.limit) || 10, 50);
      const folder = (req.query.folder as EmailFolder) || "inbox";
      const category = req.query.category as EmailCategory | undefined;
      const emails = await this.gmailService.getStoredEmails(
        userId,
        limit,
        folder,
        category,
      );
      ResponseHelper.success(res, { emails }, "Emails fetched");
    } catch (error) {
      next(error);
    }
  };
}
