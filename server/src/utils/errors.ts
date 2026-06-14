// ─────────────────────────────────────────────
// CUSTOM APPLICATION ERROR CLASSES
// ─────────────────────────────────────────────

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string | undefined;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string | undefined,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    Error.captureStackTrace(this);
  }
}

// ─── HTTP Error Subclasses ───────────────────

export class BadRequestError extends AppError {
  constructor(message: string = "Bad Request", code?: string) {
    super(message, 400, true, code);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized", code?: string) {
    super(message, 401, true, code);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden", code?: string) {
    super(message, 403, true, code);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found", code?: string) {
    super(message, 404, true, code);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource already exists", code?: string) {
    super(message, 409, true, code);
    this.name = "ConflictError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation failed", code?: string) {
    super(message, 422, true, code);
    this.name = "ValidationError";
  }
}

export class TooManyRequestsError extends AppError {
  constructor(
    message: string = "Too many requests, please slow down",
    code?: string,
  ) {
    super(message, 429, true, code);
    this.name = "TooManyRequestsError";
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = "Internal Server Error", code?: string) {
    super(message, 500, false, code);
    this.name = "InternalServerError";
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(
    message: string = "Service temporarily unavailable",
    code?: string,
  ) {
    super(message, 503, true, code);
    this.name = "ServiceUnavailableError";
  }
}

// ─── Domain-Specific Errors ──────────────────

export class TokenExpiredError extends UnauthorizedError {
  constructor(message: string = "Token has expired") {
    super(message, "TOKEN_EXPIRED");
    this.name = "TokenExpiredError";
  }
}

export class TokenInvalidError extends UnauthorizedError {
  constructor(message: string = "Invalid token") {
    super(message, "TOKEN_INVALID");
    this.name = "TokenInvalidError";
  }
}

export class GoogleAuthError extends AppError {
  constructor(message: string = "Google authentication failed") {
    super(message, 401, true, "GOOGLE_AUTH_FAILED");
    this.name = "GoogleAuthError";
  }
}

export class CorsairApiError extends AppError {
  constructor(message: string = "Corsair API error", statusCode: number = 502) {
    super(message, statusCode, true, "CORSAIR_API_ERROR");
    this.name = "CorsairApiError";
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = "Database operation failed") {
    super(message, 500, false, "DATABASE_ERROR");
    this.name = "DatabaseError";
  }
}
