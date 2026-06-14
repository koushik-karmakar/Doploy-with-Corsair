import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { Logger } from "../utils/logger";

const logger = Logger.getInstance();

// ─────────────────────────────────────────────
// ZOD VALIDATION MIDDLEWARE
// ─────────────────────────────────────────────

/**
 * Validates req.body, req.params, req.query against a Zod schema
 * Usage: router.post('/route', validate(schema), controller)
 */
export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn("Request validation failed", {
          path: req.path,
          method: req.method,
          errors: error.issues,
        });
        next(error);
      } else {
        next(error);
      }
    }
  };
