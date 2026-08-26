/**
 * Normalize entity/topic text for storage and matching (single source of truth).
 */
export function normalizeEntityText(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_\s]/gu, " ")
    .trim()
    .replace(/\s+/g, " ")
}

export function normalizeTopicInputs(topics: string[]): string[] {
  return Array.from(
    new Set(topics.map(normalizeEntityText).filter((topic) => topic.length > 0))
  )
}
