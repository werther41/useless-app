# Testing Guide: NER + TF-IDF Topic Extraction

This guide will walk you through testing the complete topic extraction feature implementation.

## Prerequisites

Before testing, ensure:

- ✅ Database tables are created (via `lib/init-db.ts`)
- ✅ Environment variables are set (`GOOGLE_API_KEY`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`)
- ✅ You have some news articles in the database

## Testing Phases

### Phase 1: Database Schema Verification

**Goal**: Confirm database tables exist and are properly structured.

#### Test 1.1: Check Tables Exist

```bash
# Run the app to initialize tables
npm run dev
```

Visit `http://localhost:3000` - this will trigger `initializeDatabase()` and create tables.

**Expected Result**:

- No errors in console
- Tables `article_topics` and `trending_topics` created

---

### Phase 2: API Endpoint Testing

**Goal**: Verify all API endpoints work correctly.

#### Test 2.1: Topics API (GET)

```bash
# Test basic topics endpoint
curl http://localhost:3000/api/topics

# Test with parameters
curl "http://localhost:3000/api/topics?limit=5&timeWindow=48"

# Test with entity type filter
curl "http://localhost:3000/api/topics?entityType=TECH"
```

**Expected Response**:

```json
{
  "topics": [],
  "metadata": {
    "timeWindow": 48,
    "limit": 10,
    "totalTopics": 0,
    "generatedAt": "2025-10-15T..."
  }
}
```

**Note**: Empty array is normal if no topics extracted yet.

#### Test 2.2: Topic Suggestions (POST)

```bash
curl -X POST http://localhost:3000/api/topics \
  -H "Content-Type: application/json" \
  -d '{"query": "tech", "limit": 5}'
```

**Expected Response**:

```json
{
  "suggestions": [],
  "query": "tech",
  "total": 0
}
```

#### Test 2.3: Real-Time Facts without Topics (Backward Compatibility)

```bash
curl -X POST http://localhost:3000/api/facts/real-time \
  -H "Content-Type: application/json"
```

**Expected Result**:

- Streaming response with fun fact
- No `X-Matched-Topics` header
- Falls back to random query behavior

#### Test 2.4: Real-Time Facts with Topics

```bash
curl -X POST http://localhost:3000/api/facts/real-time \
  -H "Content-Type: application/json" \
  -d '{"selectedTopics": ["AI", "technology"]}'
```

**Expected Result**:

- Streaming response with fun fact
- May have `X-Matched-Topics` header if matches found
- Falls back to random query if no topic matches

---

### Phase 3: Topic Extraction Testing

**Goal**: Test the topic extraction service manually.

#### Test 3.1: Manual Topic Extraction

Create a test file: `scripts/test-topic-extraction.ts`

```typescript
import { db } from "../lib/db"
import {
  extractEntitiesFromArticle,
  storeArticleTopics,
  updateTrendingTopics,
} from "../lib/topic-extraction"

async function testTopicExtraction() {
  console.log("🧪 Testing topic extraction...")

  // Test data
  const testTitle = "Google Announces New AI Model Gemini 2.0"
  const testContent =
    "Google has unveiled Gemini 2.0, a groundbreaking artificial intelligence model that promises to revolutionize natural language processing. The new model was developed at Google's headquarters in Mountain View, California."

  // Extract entities
  console.log("\n1. Extracting entities...")
  const entities = await extractEntitiesFromArticle(testTitle, testContent)
  console.log(`✅ Extracted ${entities.length} entities:`)
  entities.forEach((entity, i) => {
    console.log(
      `   ${i + 1}. ${entity.text} (${entity.type}) - confidence: ${
        entity.confidence
      }`
    )
  })

  // Store topics
  if (entities.length > 0) {
    console.log("\n2. Storing topics...")
    const testArticleId = `test_${Date.now()}`
    await storeArticleTopics(testArticleId, entities)
    console.log(`✅ Topics stored for article ${testArticleId}`)

    // Update trending
    console.log("\n3. Updating trending topics...")
    await updateTrendingTopics(entities)
    console.log("✅ Trending topics updated")

    // Verify storage
    console.log("\n4. Verifying storage...")
    const result = await db.execute(
      "SELECT * FROM article_topics WHERE article_id = ?",
      [testArticleId]
    )
    console.log(`✅ Found ${result.rows.length} stored topics`)
  }
}

testTopicExtraction().catch(console.error)
```

Run it:

```bash
npx tsx scripts/test-topic-extraction.ts
```

**Expected Output**:

```
🧪 Testing topic extraction...

1. Extracting entities...
✅ Extracted 4 entities:
   1. Google (ORG) - confidence: 0.95
   2. Gemini 2.0 (TECH) - confidence: 0.90
   3. AI (TECH) - confidence: 0.85
   4. Mountain View (LOCATION) - confidence: 0.80

2. Storing topics...
✅ Topics stored for article test_...

3. Updating trending topics...
✅ Trending topics updated

4. Verifying storage...
✅ Found 4 stored topics
```

---

### Phase 4: News Ingestion Integration

**Goal**: Verify topic extraction works during news ingestion.

#### Test 4.1: Trigger News Ingestion

```bash
# Call the news ingestion cron job
curl http://localhost:3000/api/cron/retrieve-news
```

**Expected Result**:

- New articles fetched from RSS feeds
- Console logs showing topic extraction (fire-and-forget)
- No blocking of article ingestion if extraction fails

**Check logs for**:

```
📊 Extracted N entities from article
✅ Stored N topics for article news_...
✅ Updated trending topics for N entities
```

Or if extraction fails:

```
Topic extraction failed for news_...: [error]
```

#### Test 4.2: Verify Topics in Database

After ingestion, check database:

```bash
# Create a simple check script
npx tsx -e "
import { db } from './lib/db'
const result = await db.execute('SELECT COUNT(*) as count FROM article_topics')
console.log('Total topics:', result.rows[0].count)
const trending = await db.execute('SELECT COUNT(*) as count FROM trending_topics')
console.log('Trending topics:', trending.rows[0].count)
"
```

**Expected Output**:

```
Total topics: 50+
Trending topics: 20+
```

---

### Phase 5: Frontend Testing

**Goal**: Test the user interface and user flows.

#### Test 5.1: Topic Selector Component

1. Visit `http://localhost:3000`
2. Scroll to "Real-Time News Facts" section

**Verify**:

- ✅ Topic selector loads (may show "No trending topics" if none extracted yet)
- ✅ Shows loading state initially
- ✅ Shows error state if API fails
- ✅ Topics display as colored badges

#### Test 5.2: Topic Selection

If topics are available:

1. Click on a topic badge
   - **Expected**: Badge becomes primary color, added to selection
2. Click on 5 different topics
   - **Expected**: All 5 selected, others become disabled
3. Click on a 6th topic
   - **Expected**: Oldest selection replaced with new one
4. Click "Clear" button
   - **Expected**: All selections cleared

#### Test 5.3: Fact Generation with Topics

1. Select 2-3 topics
2. Click "Get Real-Time Fact"
3. Wait for response

**Expected**:

- ✅ Loading state shows "Generating from News..."
- ✅ Fact generates successfully
- ✅ If matched, "Matched topics" badges appear below article info
- ✅ Selected topics remain selected after generation

#### Test 5.4: Fact Generation without Topics

1. Clear all topic selections
2. Click "Get Real-Time Fact"

**Expected**:

- ✅ Falls back to random query behavior
- ✅ No "Matched topics" displayed
- ✅ Works exactly like before (backward compatible)

---

### Phase 6: Admin Dashboard

**Goal**: Verify admin monitoring interface.

#### Test 6.1: Access Admin Dashboard

Visit `http://localhost:3000/admin/topics`

**Expected**:

- ✅ Statistics cards show:
  - Total articles
  - Articles with topics
  - Coverage percentage
  - Total topics
  - Trending topics count
- ✅ Top 20 trending topics list with:
  - Entity type icons
  - Occurrence counts
  - Combined scores

#### Test 6.2: Verify Statistics

The statistics should match database state:

- Coverage % = (articles with topics / total articles) × 100
- Should update when new articles are processed

---

### Phase 7: Cleanup Cron Job

**Goal**: Test the cleanup functionality.

#### Test 7.1: Manual Cleanup Trigger

```bash
curl http://localhost:3000/api/cron/cleanup-topics
```

**Expected Response**:

```json
{
  "success": true,
  "message": "Topic cleanup completed",
  "results": {
    "deletedTopics": 0,
    "deletedTrendingTopics": 0,
    "recalculatedTrending": 1,
    "errors": 0
  }
}
```

---

### Phase 8: Error Handling & Edge Cases

#### Test 8.1: Invalid API Requests

```bash
# Invalid timeWindow
curl "http://localhost:3000/api/topics?timeWindow=200"
# Expected: 400 error

# Invalid limit
curl "http://localhost:3000/api/topics?limit=100"
# Expected: 400 error

# Empty topic query
curl -X POST http://localhost:3000/api/topics \
  -H "Content-Type: application/json" \
  -d '{"query": "a"}'
# Expected: 400 error (too short)
```

#### Test 8.2: Network Resilience

1. Disable internet temporarily
2. Try to generate facts

   - **Expected**: Existing behavior works (uses cached articles)

3. Re-enable internet
4. Trigger news ingestion
   - **Expected**: New articles fetched and processed

---

## Success Criteria Checklist

### ✅ Core Functionality

- [ ] Database tables created successfully
- [ ] Topics API returns expected data structure
- [ ] Topic extraction service extracts entities
- [ ] Topics stored in database correctly
- [ ] Trending topics aggregation works

### ✅ Integration

- [ ] News ingestion triggers topic extraction
- [ ] Topic extraction doesn't block ingestion
- [ ] Failed extractions are logged but don't crash

### ✅ Frontend

- [ ] Topic selector displays trending topics
- [ ] Topic selection works (multi-select)
- [ ] Max selection limit enforced (5 topics)
- [ ] Clear button works
- [ ] Loading/error states display correctly

### ✅ User Flow

- [ ] Fact generation with topics works
- [ ] Matched topics display correctly
- [ ] Fallback to random query works
- [ ] Backward compatibility maintained

### ✅ Admin

- [ ] Admin dashboard loads
- [ ] Statistics display correctly
- [ ] Trending topics list shows data

### ✅ Performance

- [ ] API responses < 2 seconds
- [ ] Topic extraction completes in background
- [ ] No blocking on main user flows
- [ ] Caching works (15 min for topics API)

### ✅ Error Handling

- [ ] Invalid requests return proper errors
- [ ] Failed extractions don't crash app
- [ ] Empty states handled gracefully
- [ ] Network failures handled properly

---

## Common Issues & Solutions

### Issue 1: No Topics Showing

**Cause**: No articles have been processed yet
**Solution**:

```bash
# Trigger news ingestion
curl http://localhost:3000/api/cron/retrieve-news
# Wait 2-3 minutes for processing
```

### Issue 2: Topic Extraction Fails

**Cause**: Gemini API key issues
**Solution**:

- Check `.env` file has valid `GOOGLE_API_KEY`
- Verify API key has necessary permissions
- Check rate limits

### Issue 3: Database Errors

**Cause**: Tables not created
**Solution**:

- Visit homepage to trigger `initializeDatabase()`
- Check console for SQL errors
- Verify Turso credentials

### Issue 4: Topics Not Matching Articles

**Cause**: Text normalization mismatch
**Solution**:

- Check normalized topic text in database
- Verify search queries use same normalization
- May need to adjust `normalizeEntityText()` function

---

## Performance Benchmarks

Expected performance metrics:

| Operation                        | Expected Time    | Notes                       |
| -------------------------------- | ---------------- | --------------------------- |
| GET /api/topics                  | < 500ms (cached) | First request may take 1-2s |
| Topic extraction                 | 2-5s per article | Includes Gemini API call    |
| News ingestion                   | 30-60s total     | Processes 10-20 articles    |
| Fact generation (with topics)    | 3-5s             | Includes search + Gemini    |
| Fact generation (without topics) | 3-5s             | Same as before              |
| Admin dashboard load             | < 1s             | Aggregates statistics       |

---

## Next Steps After Testing

Once all tests pass:

1. **Monitor in Production**

   - Watch topic extraction success rate
   - Track user engagement with topic selection
   - Monitor API response times

2. **Optimize if Needed**

   - Adjust rate limiting
   - Fine-tune entity confidence thresholds
   - Optimize database queries

3. **Iterate on UX**

   - Gather user feedback
   - A/B test topic selection placement
   - Refine entity type categorization

4. **Schedule Cleanup**
   - Set up cron job for daily cleanup
   - Monitor database growth
   - Adjust retention periods

---

## Quick Test Script

Here's a quick script to test all endpoints:

```bash
#!/bin/bash

echo "🧪 Testing NER + TF-IDF Implementation"
echo "======================================"

echo "\n1. Testing Topics API..."
curl -s http://localhost:3000/api/topics?limit=5 | jq .metadata

echo "\n2. Testing Real-time Facts (no topics)..."
curl -X POST http://localhost:3000/api/facts/real-time \
  -H "Content-Type: application/json" \
  -s -o /dev/null -w "Status: %{http_code}\n"

echo "\n3. Testing Real-time Facts (with topics)..."
curl -X POST http://localhost:3000/api/facts/real-time \
  -H "Content-Type: application/json" \
  -d '{"selectedTopics": ["AI"]}' \
  -s -o /dev/null -w "Status: %{http_code}\n"

echo "\n4. Testing Admin Dashboard..."
curl -s http://localhost:3000/admin/topics -o /dev/null -w "Status: %{http_code}\n"

echo "\n5. Testing Cleanup Cron..."
curl -s http://localhost:3000/api/cron/cleanup-topics | jq .success

echo "\n✅ All tests complete!"
```

Save as `scripts/test-all.sh` and run:

```bash
chmod +x scripts/test-all.sh
./scripts/test-all.sh
```

---

## Troubleshooting Commands

```bash
# Check database state
npx tsx -e "import {getTopicStats} from './lib/topic-extraction'; console.log(await getTopicStats())"

# Check trending topics
npx tsx -e "import {getTrendingTopics} from './lib/topic-extraction'; console.log(await getTrendingTopics({limit:10}))"

# Test entity extraction
npx tsx -e "import {extractEntitiesFromArticle} from './lib/topic-extraction'; console.log(await extractEntitiesFromArticle('Test AI Article', 'This article discusses artificial intelligence and machine learning.'))"

# Check article topics
npx tsx -e "import {db} from './lib/db'; const r = await db.execute('SELECT COUNT(*) as c FROM article_topics'); console.log(r.rows[0])"
```

---

## Contact & Support

If you encounter issues not covered in this guide:

1. Check console logs for detailed error messages
2. Verify all environment variables are set
3. Ensure database connection is working
4. Check Gemini API quota/limits
