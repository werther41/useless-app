import { normalizeEntityText } from "./entity-normalize"
import { ExtractedEntity } from "./schema"

export function calculateTermFrequencyScores(
  entities: ExtractedEntity[],
  articleText: string
): Map<string, number> {
  const words = normalizeEntityText(articleText).split(/\s+/).filter(Boolean)
  const scores = new Map<string, number>()

  for (const entity of entities) {
    const normalizedEntity = normalizeEntityText(entity.text)
    const entityWords = normalizedEntity.split(/\s+/).filter(Boolean)

    if (entityWords.length === 0 || words.length === 0) {
      continue
    }

    let occurrences = 0
    for (let i = 0; i <= words.length - entityWords.length; i++) {
      if (entityWords.every((word, offset) => words[i + offset] === word)) {
        occurrences++
      }
    }

    scores.set(normalizedEntity, occurrences / words.length)
  }

  return scores
}

export function deduplicateEntities(
  entities: ExtractedEntity[]
): ExtractedEntity[] {
  const entitiesByText = new Map<string, ExtractedEntity>()

  for (const entity of entities) {
    const normalized = normalizeEntityText(entity.text)
    if (!normalized) continue

    const existing = entitiesByText.get(normalized)
    if (!existing || entity.confidence > existing.confidence) {
      entitiesByText.set(normalized, entity)
    }
  }

  return Array.from(entitiesByText.values())
}
