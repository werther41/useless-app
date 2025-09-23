import { db } from "./db"

export async function initializeDatabase() {
  try {
    // Create facts table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS facts (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        source TEXT,
        source_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create fact_ratings table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS fact_ratings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fact_id TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating IN (-1, 1)),
        user_ip TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (fact_id) REFERENCES facts (id) ON DELETE CASCADE
      )
    `)

    // Create indexes for better performance
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_fact_ratings_fact_id ON fact_ratings(fact_id)
    `)

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_fact_ratings_created_at ON fact_ratings(created_at)
    `)

    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Error initializing database:", error)
    throw error
  }
}
