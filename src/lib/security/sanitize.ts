import { z } from "zod";

/** HTML sanitization (sanitizeHtml) lives in ./sanitizeHtml.ts — kept separate
 * so routes that only need these schemas don't bundle jsdom. */

/** Shared Zod schema for chat requests — single source of truth for validation. */
export const chatRequestSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message is too long"),
  locale: z
    .string()
    .regex(/^[a-z]{2}(-[A-Z]{2})?$/, "Invalid locale format")
    .default("en"),
  conversationId: z.string().uuid().optional(),
});

export const crowdPredictRequestSchema = z.object({
  gateId: z.string().min(1).max(50),
  currentOccupancy: z.number().int().min(0).max(200_000),
  capacity: z.number().int().min(1).max(200_000),
  minutesToKickoff: z.number().int().min(-180).max(300),
});

/** SQL-injection prevention note: this app uses parameterized queries only
 * (see docs/DATABASE.md) — never string-concatenated SQL. This validator
 * is an additional layer that rejects obviously malicious identifiers
 * before they ever reach a query builder. */
export function isSafeIdentifier(value: string): boolean {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(value);
}
