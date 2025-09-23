import { createFact } from "./facts"
import { factSchema } from "./validation"

export interface FactImport {
  id: string
  text: string
  source?: string
  source_url?: string
}

export async function importFacts(facts: FactImport[], skipDuplicates = true) {
  const results = {
    imported: 0,
    skipped: 0,
    errors: 0,
    errors_list: [] as string[],
  }

  for (const fact of facts) {
    try {
      // Validate the fact
      const validatedFact = factSchema.parse(fact)

      // Check if fact already exists (if skipDuplicates is true)
      if (skipDuplicates) {
        const { db } = await import("./db")
        const existing = await db.execute("SELECT id FROM facts WHERE id = ?", [
          validatedFact.id,
        ])

        if (existing.rows.length > 0) {
          results.skipped++
          continue
        }
      }

      await createFact(validatedFact)
      results.imported++
    } catch (error) {
      results.errors++
      results.errors_list.push(
        `Fact ${fact.id}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      )
    }
  }

  return results
}
