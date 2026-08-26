import { afterAll, beforeAll, describe, expect, it } from "vitest"

describe("database read optimizations", () => {
  let database: typeof import("./db").db

  beforeAll(async () => {
    process.env.TURSO_DATABASE_URL = "file::memory:"
    process.env.TURSO_AUTH_TOKEN = ""

    const [{ db }, { initializeDatabase }] = await Promise.all([
      import("./db"),
      import("./init-db"),
    ])
    database = db

    await initializeDatabase()

    const embedding = JSON.stringify(Array(768).fill(0.1))
    await database.execute({
      sql: `
        INSERT INTO news_articles (
          id, title, content, url, source, published_at, embedding
        )
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, vector32(?))
      `,
      args: [
        "article-1",
        "Title",
        "Content",
        "https://example.com/1",
        "Test",
        embedding,
      ],
    })
    await database.execute({
      sql: `
        INSERT INTO article_topics (
          id, article_id, entity_text, entity_text_normalized,
          entity_type, tfidf_score, ner_confidence
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        "topic-1",
        "article-1",
        "Artificial Intelligence",
        "artificial intelligence",
        "TECH",
        0.5,
        0.9,
      ],
    })
  })

  afterAll(() => {
    database.close()
  })

  it("uses the publication-date index for recent article candidates", async () => {
    const plan = await database.execute(`
      EXPLAIN QUERY PLAN
      SELECT id
      FROM news_articles
      WHERE published_at > datetime('now', '-48 hours')
      ORDER BY published_at DESC
      LIMIT 20
    `)

    expect(plan.rows.map((row) => String(row.detail)).join("\n")).toContain(
      "idx_news_articles_published_at"
    )
  })

  it("uses normalized topic lookup instead of scanning article_topics", async () => {
    const plan = await database.execute(`
      EXPLAIN QUERY PLAN
      SELECT article_id
      FROM article_topics
      WHERE entity_text_normalized = 'artificial intelligence'
    `)
    const details = plan.rows.map((row) => String(row.detail)).join("\n")

    expect(details).toContain("idx_article_topics_entity_text_normalized")
    expect(details).not.toContain("SCAN article_topics")
  })

  it("retrieves nearest neighbors through the vector index", async () => {
    const embedding = JSON.stringify(Array(768).fill(0.1))
    const result = await database.execute({
      sql: `
        SELECT na.id
        FROM vector_top_k(
          'idx_news_articles_embedding',
          vector32(?),
          5
        ) AS nearest
        INNER JOIN news_articles na ON na.rowid = nearest.id
      `,
      args: [embedding],
    })

    expect(result.rows).toEqual([{ id: "article-1" }])
  })

  it("executes bounded recent and normalized-topic article queries", async () => {
    const [
      { getArticlesByTopics, getRecentArticles },
      { findArticlesByTopicsFuzzy },
    ] = await Promise.all([import("./articles"), import("./topic-search")])

    const [recent, exact, prefix] = await Promise.all([
      getRecentArticles({ timeWindow: 48, limit: 10 }),
      getArticlesByTopics(["Artificial Intelligence"], {
        timeWindow: 48,
        limit: 10,
      }),
      findArticlesByTopicsFuzzy(["artificial"], {
        timeWindow: 48,
        limit: 10,
      }),
    ])

    expect(recent.map((article) => article.id)).toEqual(["article-1"])
    expect(exact.map((article) => article.id)).toEqual(["article-1"])
    expect(prefix.map((article) => article.id)).toEqual(["article-1"])
  })

  it("updates trending aggregates with one atomic upsert per topic", async () => {
    const { getTrendingTopics, updateTrendingTopics } = await import(
      "./topic-extraction"
    )
    const entity = {
      text: "Artificial Intelligence",
      type: "TECH",
      confidence: 0.9,
      tfidfScore: 0.5,
    }

    await updateTrendingTopics([entity])
    await updateTrendingTopics([entity])

    const topics = await getTrendingTopics({ timeWindow: 48, limit: 10 })
    expect(topics).toHaveLength(1)
    expect(topics[0].occurrence_count).toBe(2)
    expect(topics[0].avg_tfidf_score).toBeCloseTo(0.5)
    expect(topics[0].ranking_score).toBeGreaterThan(0)
  })
})
