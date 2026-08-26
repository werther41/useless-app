import { describe, expect, it } from "vitest"

import { normalizeEntityText, normalizeTopicInputs } from "./entity-normalize"
import {
  calculateTermFrequencyScores,
  deduplicateEntities,
} from "./topic-scoring"

describe("normalizeEntityText", () => {
  it("normalizes punctuation and whitespace consistently", () => {
    expect(normalizeEntityText("  New-York\tCity! ")).toBe("new york city")
  })

  it("preserves Unicode letters and numbers", () => {
    expect(normalizeEntityText("São Paulo — 東京 2026")).toBe(
      "são paulo 東京 2026"
    )
  })

  it("deduplicates and removes empty topic inputs", () => {
    expect(normalizeTopicInputs([" AI ", "ai", "!!!", "New York"])).toEqual([
      "ai",
      "new york",
    ])
  })
})

describe("calculateTermFrequencyScores", () => {
  it("matches complete tokens instead of substrings", () => {
    const scores = calculateTermFrequencyScores(
      [{ text: "art", type: "CONCEPT", confidence: 0.9 }],
      "Art makes an article about art."
    )

    expect(scores.get("art")).toBeCloseTo(2 / 6)
  })

  it("counts multi-word entities across punctuation", () => {
    const scores = calculateTermFrequencyScores(
      [{ text: "New York", type: "LOCATION", confidence: 0.9 }],
      "New York, then New York."
    )

    expect(scores.get("new york")).toBeCloseTo(2 / 5)
  })
})

describe("deduplicateEntities", () => {
  it("keeps the highest-confidence form of each normalized entity", () => {
    const entities = deduplicateEntities([
      { text: "OpenAI", type: "ORGANIZATION", confidence: 0.7 },
      { text: "openai!", type: "ORGANIZATION", confidence: 0.95 },
      { text: "!!!", type: "CONCEPT", confidence: 1 },
    ])

    expect(entities).toEqual([
      { text: "openai!", type: "ORGANIZATION", confidence: 0.95 },
    ])
  })
})
