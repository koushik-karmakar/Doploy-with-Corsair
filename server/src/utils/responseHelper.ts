import type { Response } from "express";

// ─────────────────────────────────────────────
// RESPONSE SHAPE TYPES
// ─────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: Record<string, unknown>;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ─────────────────────────────────────────────
// RESPONSE HELPER CLASS
// ─────────────────────────────────────────────

export class ResponseHelper {
  /**
   * Send a successful 200 response
   */
  public static success<T>(
    res: Response,
    data: T,
    message: string = "Success",
    statusCode: number = 200,
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Send a 201 Created response
   */
  public static created<T>(
    res: Response,
    data: T,
    message: string = "Resource created successfully",
  ): Response {
    return ResponseHelper.success(res, data, message, 201);
  }

  /**
   * Send a paginated response
   */
  public static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message: string = "Success",
  ): Response {
    const totalPages = Math.ceil(total / limit);
    const response: PaginatedResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
    return res.status(200).json(response);
  }

  /**
   * Send a 400 Bad Request error
   */
  public static badRequest(
    res: Response,
    message: string = "Bad Request",
    error?: string,
  ): Response {
    return ResponseHelper.sendError(res, 400, message, error);
  }

  /**
   * Send a 401 Unauthorized error
   */
  public static unauthorized(
    res: Response,
    message: string = "Unauthorized - Authentication required",
  ): Response {
    return ResponseHelper.sendError(res, 401, message);
  }

  /**
   * Send a 403 Forbidden error
   */
  public static forbidden(
    res: Response,
    message: string = "Forbidden - Insufficient permissions",
  ): Response {
    return ResponseHelper.sendError(res, 403, message);
  }

  /**
   * Send a 404 Not Found error
   */
  public static notFound(
    res: Response,
    message: string = "Resource not found",
  ): Response {
    return ResponseHelper.sendError(res, 404, message);
  }

  /**
   * Send a 409 Conflict error
   */
  public static conflict(
    res: Response,
    message: string = "Resource already exists",
  ): Response {
    return ResponseHelper.sendError(res, 409, message);
  }

  /**
   * Send a 422 Unprocessable Entity error
   */
  public static unprocessable(
    res: Response,
    message: string = "Validation failed",
    error?: string,
  ): Response {
    return ResponseHelper.sendError(res, 422, message, error);
  }

  /**
   * Send a 429 Too Many Requests error
   */
  public static tooManyRequests(
    res: Response,
    message: string = "Too many requests, please slow down",
  ): Response {
    return ResponseHelper.sendError(res, 429, message);
  }

  /**
   * Send a 500 Internal Server Error
   */
  public static internalError(
    res: Response,
    message: string = "Internal server error",
  ): Response {
    return ResponseHelper.sendError(res, 500, message);
  }

  /**
   * Generic error sender
   */
  private static sendError(
    res: Response,
    statusCode: number,
    message: string,
    error?: string,
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      error: error || message,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(response);
  }

  /**
   * No content - 204
   */
  public static noContent(res: Response): Response {
    return res.status(204).send();
  }
}
