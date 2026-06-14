import {
  parseISO,
  format,
  addDays,
  addMinutes,
  isValid,
  startOfDay,
  endOfDay,
} from "date-fns";

// ─────────────────────────────────────────────
// DATE HELPER UTILITIES
// ─────────────────────────────────────────────

export class DateHelper {
  /**
   * Parse natural language date references
   * e.g. "next Thursday", "tomorrow", "9 AM next Thursday"
   */
  public static parseNaturalDate(input: string): Date | null {
    const now = new Date();
    const lower = input.toLowerCase().trim();

    // "today"
    if (lower.includes("today")) return now;

    // "tomorrow"
    if (lower.includes("tomorrow")) return addDays(now, 1);

    // "next [day]"
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    for (let i = 0; i < days.length; i++) {
      if (lower.includes(days[i]!)) {
        const targetDay = i;
        const currentDay = now.getDay();
        let daysUntil = targetDay - currentDay;
        if (daysUntil <= 0) daysUntil += 7;
        if (lower.includes("next")) daysUntil += 7;
        return addDays(now, daysUntil);
      }
    }

    // Try ISO parse
    try {
      const parsed = parseISO(input);
      if (isValid(parsed)) return parsed;
    } catch {
      // ignore
    }

    return null;
  }

  /**
   * Extract time from natural language
   * e.g. "9 AM", "3:30 PM", "14:00"
   */
  public static extractTime(
    input: string,
  ): { hours: number; minutes: number } | null {
    // Match patterns like "9 AM", "9:30 AM", "14:00", "2pm"
    const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
    const match = input.match(timeRegex);
    if (!match) return null;

    let hours = parseInt(match[1]!);
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const meridiem = match[3]?.toLowerCase();

    if (meridiem === "pm" && hours < 12) hours += 12;
    if (meridiem === "am" && hours === 12) hours = 0;

    return { hours, minutes };
  }

  /**
   * Build a full datetime from date + time string
   */
  public static buildDateTime(
    dateInput: string,
    timeInput?: string,
  ): Date | null {
    const date = DateHelper.parseNaturalDate(dateInput);
    if (!date) return null;

    if (timeInput) {
      const time = DateHelper.extractTime(timeInput);
      if (time) {
        date.setHours(time.hours, time.minutes, 0, 0);
      }
    }

    return date;
  }

  /**
   * Format date for display
   */
  public static formatDisplay(date: Date): string {
    return format(date, "EEEE, MMMM d, yyyy 'at' h:mm a");
  }

  /**
   * Format date for Google Calendar API (ISO 8601)
   */
  public static formatISO(date: Date): string {
    return date.toISOString();
  }

  /**
   * Get start and end of today
   */
  public static getTodayRange(): { start: Date; end: Date } {
    const now = new Date();
    return { start: startOfDay(now), end: endOfDay(now) };
  }

  /**
   * Check if a date is today
   */
  public static isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Add minutes to a date
   */
  public static addMinutes(date: Date, minutes: number): Date {
    return addMinutes(date, minutes);
  }

  /**
   * Get relative time description for AI voice agent
   * e.g. "in 30 minutes", "at 3 PM today"
   */
  public static getRelativeDescription(date: Date): string {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins < 0) return `${Math.abs(diffMins)} minutes ago`;
    if (diffMins < 60) return `in ${diffMins} minutes`;
    if (diffMins < 1440) {
      const hours = Math.round(diffMins / 60);
      return `in ${hours} hour${hours > 1 ? "s" : ""}`;
    }
    return `on ${format(date, "EEEE")} at ${format(date, "h:mm a")}`;
  }
}
