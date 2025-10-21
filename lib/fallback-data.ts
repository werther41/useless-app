/**
 * Fallback data for when the database is unavailable
 */

export const FALLBACK_TOPICS = [
  {
    id: "fallback_1",
    text: "artificial intelligence",
    type: "TECH",
    occurrenceCount: 1,
    avgTfidfScore: 0.5,
    lastSeenAt: new Date().toISOString(),
    combinedScore: 0.5,
  },
  {
    id: "fallback_2",
    text: "climate change",
    type: "SCIENTIFIC_TERM",
    occurrenceCount: 1,
    avgTfidfScore: 0.4,
    lastSeenAt: new Date().toISOString(),
    combinedScore: 0.4,
  },
  {
    id: "fallback_3",
    text: "space exploration",
    type: "SCIENTIFIC_TERM",
    occurrenceCount: 1,
    avgTfidfScore: 0.3,
    lastSeenAt: new Date().toISOString(),
    combinedScore: 0.3,
  },
  {
    id: "fallback_4",
    text: "renewable energy",
    type: "SCIENTIFIC_TERM",
    occurrenceCount: 1,
    avgTfidfScore: 0.2,
    lastSeenAt: new Date().toISOString(),
    combinedScore: 0.2,
  },
  {
    id: "fallback_5",
    text: "quantum computing",
    type: "TECH",
    occurrenceCount: 1,
    avgTfidfScore: 0.1,
    lastSeenAt: new Date().toISOString(),
    combinedScore: 0.1,
  },
]

export const FALLBACK_ARTICLES = [
  {
    id: "fallback_article_1",
    title: "The Science of Useless Facts: Why We Love Pointless Information",
    content:
      "Research shows that useless facts serve an important psychological purpose...",
    url: "https://example.com/useless-facts-science",
    source: "Scientific American",
    published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    created_at: new Date().toISOString(),
    embedding: [],
    snippet:
      "Research shows that useless facts serve an important psychological purpose in our daily lives...",
    relevanceScore: 0.8,
    matchedTopics: ["psychology", "research"],
  },
  {
    id: "fallback_article_2",
    title: "Why Your Brain Loves Random Trivia",
    content:
      "Neuroscientists have discovered that random facts activate specific brain regions...",
    url: "https://example.com/brain-trivia",
    source: "Psychology Today",
    published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    created_at: new Date().toISOString(),
    embedding: [],
    snippet:
      "Neuroscientists have discovered that random facts activate specific brain regions associated with memory...",
    relevanceScore: 0.7,
    matchedTopics: ["neuroscience", "memory"],
  },
]

/**
 * Check if we should use fallback data
 */
export function shouldUseFallback(error: any): boolean {
  if (!error) return false

  const errorMessage = error.message?.toLowerCase() || ""
  const errorCode = error.code || ""

  return (
    errorCode === "UND_ERR_SOCKET" ||
    errorCode === "ECONNRESET" ||
    errorCode === "ENOTFOUND" ||
    errorCode === "ETIMEDOUT" ||
    errorMessage.includes("socket") ||
    errorMessage.includes("connection") ||
    errorMessage.includes("network") ||
    errorMessage.includes("timeout") ||
    errorMessage.includes("fetch failed") ||
    errorMessage.includes("database query failed")
  )
}
