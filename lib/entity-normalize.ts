/**
 * Normalize entity/topic text for storage and matching (single source of truth).
 */
export function normalizeEntityText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove punctuation
    .trim()
    .replace(/\s+/g, " ") // Normalize whitespace
}
