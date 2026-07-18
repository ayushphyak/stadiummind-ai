import DOMPurify from "isomorphic-dompurify";

/**
 * Strips any HTML/script content — use for any user text rendered as HTML.
 *
 * Kept in its own module, separate from the Zod schemas in `sanitize.ts`:
 * isomorphic-dompurify pulls in a jsdom instance, which is unnecessary
 * weight for routes (like /api/chat) that only need request validation and
 * never render user text as HTML. Import this module only where HTML
 * sanitization is actually needed.
 */
export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}
