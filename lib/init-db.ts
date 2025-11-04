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

    // Check if fact_type column exists, if not add it
    try {
      await db.execute(`
        ALTER TABLE facts ADD COLUMN fact_type TEXT DEFAULT 'static'
      `)
      console.log("Added fact_type column to facts table")
    } catch (error: any) {
      // If column already exists, this will fail - that's expected
      if (!error.message?.includes("duplicate column name")) {
        console.log("fact_type column may already exist:", error.message)
      }
    }

    // Add new columns for enhanced fact generation
    const newColumns = [
      { name: "why_interesting", type: "TEXT" },
      { name: "source_snippet", type: "TEXT" },
      { name: "tone", type: "TEXT" },
      { name: "article_id", type: "TEXT" },
    ]

    for (const column of newColumns) {
      try {
        await db.execute(`
          ALTER TABLE facts ADD COLUMN ${column.name} ${column.type}
        `)
        console.log(`Added ${column.name} column to facts table`)
      } catch (error: any) {
        // If column already exists, this will fail - that's expected
        if (!error.message?.includes("duplicate column name")) {
          console.log(`${column.name} column may already exist:`, error.message)
        }
      }
    }

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

    // Add index for fact_type after column is created
    try {
      await db.execute(`
        CREATE INDEX IF NOT EXISTS idx_facts_fact_type ON facts(fact_type)
      `)
    } catch (error: any) {
      console.log("Index creation for fact_type:", error.message)
    }

    // Create news_articles table with vector support
    await db.execute(`
      CREATE TABLE IF NOT EXISTS news_articles (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        url TEXT UNIQUE NOT NULL,
        source TEXT NOT NULL,
        published_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        embedding F32_BLOB
      )
    `)

    // Create indexes for news_articles table
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_news_articles_url ON news_articles(url)
    `)

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_news_articles_created_at ON news_articles(created_at)
    `)

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_news_articles_source ON news_articles(source)
    `)

    // Create article_topics table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS article_topics (
        id TEXT PRIMARY KEY,
        article_id TEXT NOT NULL,
        entity_text TEXT NOT NULL,
        entity_type TEXT,
        tfidf_score REAL,
        ner_confidence REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (article_id) REFERENCES news_articles (id) ON DELETE CASCADE
      )
    `)

    // Create trending_topics table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS trending_topics (
        id TEXT PRIMARY KEY,
        topic_text TEXT UNIQUE NOT NULL,
        entity_type TEXT,
        occurrence_count INTEGER DEFAULT 1,
        avg_tfidf_score REAL,
        article_ids TEXT,
        last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create indexes for article_topics table
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_article_topics_article_id ON article_topics(article_id)
    `)

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_article_topics_tfidf_score ON article_topics(tfidf_score DESC)
    `)

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_article_topics_entity_type ON article_topics(entity_type)
    `)

    // Create indexes for trending_topics table
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_trending_topics_score ON trending_topics(avg_tfidf_score DESC)
    `)

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_trending_topics_count ON trending_topics(occurrence_count DESC)
    `)

    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Error initializing database:", error)
    throw error
  }
}
