import CryptoJS from "crypto-js";
import { env } from "../env.js";
import { Logger } from "./logger.js";

const logger = Logger.getInstance();

// ─────────────────────────────────────────────
// ENCRYPTION UTILITY CLASS
// ─────────────────────────────────────────────

export class Encryption {
  private static readonly KEY = env.ENCRYPTION_KEY;

  /**
   * Encrypts a plain text string using AES-256
   */
  public static encrypt(plainText: string): string {
    try {
      if (!plainText) throw new Error("Cannot encrypt empty string");
      const encrypted = CryptoJS.AES.encrypt(plainText, Encryption.KEY);
      return encrypted.toString();
    } catch (error) {
      logger.error("Encryption failed", {
        error: error instanceof Error ? error.message : "Unknown",
      });
      throw new Error("Failed to encrypt data");
    }
  }

  /**
   * Decrypts an AES-256 encrypted string
   */
  public static decrypt(encryptedText: string): string {
    try {
      if (!encryptedText) throw new Error("Cannot decrypt empty string");
      const decrypted = CryptoJS.AES.decrypt(encryptedText, Encryption.KEY);
      const plainText = decrypted.toString(CryptoJS.enc.Utf8);
      if (!plainText) throw new Error("Decryption produced empty result");
      return plainText;
    } catch (error) {
      logger.error("Decryption failed", {
        error: error instanceof Error ? error.message : "Unknown",
      });
      throw new Error("Failed to decrypt data");
    }
  }

  /**
   * Generates a cryptographically secure random string
   */
  public static generateRandomToken(length: number = 64): string {
    const wordArray = CryptoJS.lib.WordArray.random(length);
    return wordArray.toString(CryptoJS.enc.Hex);
  }

  /**
   * Hash a value using SHA-256 (for non-reversible operations like token fingerprints)
   */
  public static hash(value: string): string {
    return CryptoJS.SHA256(value).toString(CryptoJS.enc.Hex);
  }

  /**
   * Safely encrypt if value exists, return null otherwise
   */
  public static safeEncrypt(value: string | null | undefined): string | null {
    if (!value) return null;
    return Encryption.encrypt(value);
  }

  /**
   * Safely decrypt if value exists, return null otherwise
   */
  public static safeDecrypt(value: string | null | undefined): string | null {
    if (!value) return null;
    try {
      return Encryption.decrypt(value);
    } catch {
      return null;
    }
  }
}
