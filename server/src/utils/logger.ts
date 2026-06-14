import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

// ─────────────────────────────────────────────
// LOGGER CLASS - SINGLETON
// ─────────────────────────────────────────────

export class Logger {
  private static instance: Logger;
  private logger: winston.Logger;

  private constructor() {
    const logDir = path.join(process.cwd(), "logs");

    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json(),
    );

    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: "HH:mm:ss" }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length
          ? ` ${JSON.stringify(meta)}`
          : "";
        return `[${timestamp}] ${level}: ${message}${metaStr}`;
      }),
    );

    const transports: winston.transport[] = [
      // Console transport
      new winston.transports.Console({
        format: consoleFormat,
        silent: process.env.NODE_ENV === "test",
      }),
    ];

    // File transports (only in non-test environments)
    if (process.env.NODE_ENV !== "test") {
      // Error log - persistent daily rotate
      transports.push(
        new DailyRotateFile({
          filename: path.join(logDir, "error-%DATE%.log"),
          datePattern: "YYYY-MM-DD",
          level: "error",
          maxSize: "20m",
          maxFiles: "14d",
          format: logFormat,
        }),
      );

      // Combined log
      transports.push(
        new DailyRotateFile({
          filename: path.join(logDir, "combined-%DATE%.log"),
          datePattern: "YYYY-MM-DD",
          maxSize: "20m",
          maxFiles: "7d",
          format: logFormat,
        }),
      );
    }

    this.logger = winston.createLogger({
      level: process.env.NODE_ENV === "production" ? "info" : "debug",
      format: logFormat,
      transports,
      exitOnError: false,
    });
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public info(message: string, meta?: Record<string, unknown>): void {
    this.logger.info(message, meta);
  }

  public error(message: string, meta?: Record<string, unknown>): void {
    this.logger.error(message, meta);
  }

  public warn(message: string, meta?: Record<string, unknown>): void {
    this.logger.warn(message, meta);
  }

  public debug(message: string, meta?: Record<string, unknown>): void {
    this.logger.debug(message, meta);
  }

  public http(message: string, meta?: Record<string, unknown>): void {
    this.logger.http(message, meta);
  }
}
