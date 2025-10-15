// Load environment variables first
import { config } from "dotenv"

import { db } from "../lib/db"
import {
  extractAndStoreTopics,
  extractEntitiesFromArticle,
  getTopicStats,
  getTrendingTopics,
  storeArticleTopics,
  updateTrendingTopics,
} from "../lib/topic-extraction"

config()

async function testTopicExtraction() {
  console.log("🧪 Testing Topic Extraction Service")
  console.log("=".repeat(50))

  // Test data
  const testTitle = "Google Announces New AI Model Gemini 2.0 Flash"
  const testContent = `Google has unveiled Gemini 2.0 Flash, a groundbreaking artificial intelligence model 
  that promises to revolutionize natural language processing. The new model was developed at Google's 
  headquarters in Mountain View, California. CEO Sundar Pichai announced the release at a special event 
  in San Francisco. The technology incorporates advanced machine learning algorithms and neural networks, 
  setting new benchmarks in the AI industry.`

  try {
    // Step 1: Extract entities
    console.log("\n📊 Step 1: Extracting entities...")
    const entities = await extractEntitiesFromArticle(testTitle, testContent)

    if (entities.length === 0) {
      console.log("⚠️  No entities extracted. This could mean:")
      console.log("   - Gemini API key not configured")
      console.log("   - API quota exceeded")
      console.log("   - Network connectivity issues")
      return
    }

    console.log(`✅ Extracted ${entities.length} entities:`)
    entities.forEach((entity, i) => {
      console.log(
        `   ${i + 1}. "${entity.text}" [${
          entity.type
        }] - confidence: ${entity.confidence.toFixed(2)}`
      )
    })

    // Step 2: Store topics
    console.log("\n💾 Step 2: Storing article topics...")
    const testArticleId = `test_${Date.now()}`
    await storeArticleTopics(testArticleId, entities)
    console.log(`✅ Stored topics for article: ${testArticleId}`)

    // Step 3: Update trending topics
    console.log("\n🔥 Step 3: Updating trending topics...")
    await updateTrendingTopics(entities)
    console.log("✅ Trending topics updated")

    // Step 4: Verify storage
    console.log("\n🔍 Step 4: Verifying storage...")
    const articleTopicsResult = await db.execute(
      "SELECT * FROM article_topics WHERE article_id = ?",
      [testArticleId]
    )
    console.log(
      `✅ Found ${articleTopicsResult.rows.length} topics in article_topics table`
    )

    articleTopicsResult.rows.forEach((row: any, i) => {
      console.log(
        `   ${i + 1}. ${row.entity_text} (${row.entity_type}) - TF-IDF: ${
          row.tfidf_score?.toFixed(3) || "0.000"
        }`
      )
    })

    // Step 5: Check trending topics
    console.log("\n📈 Step 5: Checking trending topics...")
    const trendingTopicsResult = await db.execute(
      "SELECT * FROM trending_topics ORDER BY (occurrence_count * avg_tfidf_score) DESC LIMIT 10"
    )
    console.log(`✅ Found ${trendingTopicsResult.rows.length} trending topics:`)

    trendingTopicsResult.rows.forEach((row: any, i) => {
      const score = row.occurrence_count * row.avg_tfidf_score
      console.log(
        `   ${i + 1}. "${row.topic_text}" [${row.entity_type}] - ${
          row.occurrence_count
        }x, score: ${score.toFixed(3)}`
      )
    })

    // Step 6: Get statistics
    console.log("\n📊 Step 6: Getting topic statistics...")
    const stats = await getTopicStats()
    console.log("✅ Topic Statistics:")
    console.log(`   Total Articles: ${stats.totalArticles}`)
    console.log(`   Articles with Topics: ${stats.articlesWithTopics}`)
    console.log(`   Coverage: ${stats.coveragePercentage.toFixed(1)}%`)
    console.log(`   Total Topics: ${stats.totalTopics}`)
    console.log(`   Trending Topics: ${stats.trendingTopics}`)

    // Step 7: Test trending topics API function
    console.log("\n🔥 Step 7: Testing getTrendingTopics function...")
    const topTopics = await getTrendingTopics({ limit: 5, timeWindow: 48 })
    console.log(`✅ Got ${topTopics.length} trending topics:`)
    topTopics.forEach((topic, i) => {
      const score = topic.occurrence_count * topic.avg_tfidf_score
      console.log(
        `   ${i + 1}. "${topic.topic_text}" [${topic.entity_type}] - ${
          topic.occurrence_count
        }x, score: ${score.toFixed(3)}`
      )
    })

    // Step 8: Test convenience function
    console.log("\n🚀 Step 8: Testing extractAndStoreTopics...")
    const testArticleId2 = `test_${Date.now()}_2`
    const testTitle2 = "Apple Releases iPhone 16 with Revolutionary Camera"
    const testContent2 = `Apple Inc. has announced the iPhone 16 with groundbreaking camera technology. 
    The device was unveiled at Apple Park in Cupertino. Tim Cook, Apple's CEO, demonstrated the new features.`

    await extractAndStoreTopics(testArticleId2, testTitle2, testContent2)
    console.log(`✅ Successfully processed article: ${testArticleId2}`)

    // Cleanup test data
    console.log("\n🧹 Cleanup: Removing test articles...")
    await db.execute(
      "DELETE FROM article_topics WHERE article_id LIKE 'test_%'"
    )
    console.log("✅ Test data cleaned up")

    console.log("\n" + "=".repeat(50))
    console.log("✅ All tests passed successfully!")
    console.log("=".repeat(50))
  } catch (error) {
    console.error("\n❌ Test failed with error:")
    console.error(error)
    process.exit(1)
  }
}

// Run the test
testTopicExtraction()
  .then(() => {
    console.log("\n✨ Testing complete!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("\n💥 Fatal error:", error)
    process.exit(1)
  })
