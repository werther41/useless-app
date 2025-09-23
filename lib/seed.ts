import { createFact } from "./facts"

const initialFacts = [
  {
    id: "fact-1",
    text: "Bananas are berries, but strawberries aren't.",
    source: "Botanical Facts",
    source_url: "https://example.com",
  },
  {
    id: "fact-2",
    text: 'A group of flamingos is called a "flamboyance".',
    source: "Animal Facts",
    source_url: "https://example.com",
  },
  {
    id: "fact-3",
    text: "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3000 years old and still perfectly edible.",
    source: "Food Facts",
    source_url: "https://example.com",
  },
  {
    id: "fact-4",
    text: "The shortest war in history was between Britain and Zanzibar on August 27, 1896. Zanzibar surrendered after 38 minutes.",
    source: "Historical Facts",
    source_url: "https://example.com",
  },
  {
    id: "fact-5",
    text: "A jiffy is an actual unit of time. It's 1/100th of a second.",
    source: "Science Facts",
    source_url: "https://example.com",
  },
]

export async function seedDatabase() {
  try {
    for (const fact of initialFacts) {
      await createFact(fact)
    }
    console.log("Database seeded successfully")
  } catch (error) {
    console.error("Error seeding database:", error)
  }
}
