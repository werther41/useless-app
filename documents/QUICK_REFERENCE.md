# Quick Reference: Topic Extraction Feature

## 🚀 Quick Start

### For Users

1. Visit homepage → Scroll to "Real-Time News Facts"
2. Select up to 2 topics from trending topics
3. Click "Get Real-Time Fact"
4. See fact with matched topics

### For Developers

```bash
# Run tests
./scripts/test-all.sh

# Trigger news ingestion
curl http://localhost:3000/api/cron/retrieve-news

# Check topics
curl http://localhost:3000/api/topics
```

---

## 📊 Key Metrics

- **Max Topic Selection**: 2 topics
- **Topic Cache Duration**: 15 minutes
- **News Fetch Window**: 48 hours
- **Confidence Threshold**: 0.3 (30%)
- **API Rate Limit**: 2 seconds between calls
- **Target Coverage**: 70%+ articles

---

## 🎨 Entity Types

| Type     | Color  | Examples                       |
| -------- | ------ | ------------------------------ |
| TECH     | Blue   | AI, Machine Learning, Software |
| ORG      | Purple | Google, Meta, Apple            |
| PERSON   | Green  | CEO names, Scientists          |
| LOCATION | Orange | Silicon Valley, California     |
| CONCEPT  | Yellow | Neural Networks, Algorithms    |
| EVENT    | Red    | Conferences, Launches          |
| OTHER    | Gray   | Miscellaneous                  |

---

## 📡 API Endpoints

### Get Trending Topics

```bash
GET /api/topics?limit=10&timeWindow=48
```

### Generate Fact with Topics

```bash
POST /api/facts/real-time
Content-Type: application/json

{
  "selectedTopics": ["AI", "Google"]
}
```

### Trigger News Ingestion

```bash
GET /api/cron/retrieve-news
Authorization: Bearer YOUR_CRON_SECRET
```

### View Admin Dashboard

```
http://localhost:3000/admin/topics
```

---

## 🔧 Configuration

### Environment Variables

```env
GOOGLE_API_KEY=your_gemini_api_key
TURSO_DATABASE_URL=your_database_url
TURSO_AUTH_TOKEN=your_auth_token
CRON_SECRET=your_cron_secret
```

### Adjustable Parameters

**Topic Selector** (`components/real-time-fact-section.tsx`):

```typescript
maxSelection={2}  // Change to adjust max topics
```

**Topics API** (`app/api/topics/route.ts`):

```typescript
export const revalidate = 900 // Cache duration (seconds)
```

**Topic Extraction** (`lib/topic-extraction.ts`):

```typescript
.filter((entity) => entity.confidence > 0.3)  // Confidence threshold
```

---

## 🧪 Testing Commands

```bash
# Complete test suite
chmod +x scripts/test-all.sh && ./scripts/test-all.sh

# Service tests
npx tsx scripts/test-topic-extraction.ts

# Check database
npx tsx -e "import {getTopicStats} from './lib/topic-extraction'; console.log(await getTopicStats())"

# View trending
npx tsx -e "import {getTrendingTopics} from './lib/topic-extraction'; const t = await getTrendingTopics({limit:10}); console.table(t)"
```

---

## 📂 Key Files

### New Files

- `lib/topic-extraction.ts` - NER + TF-IDF logic
- `lib/topic-search.ts` - Topic-based search
- `app/api/topics/route.ts` - Topics API
- `components/topic-selector.tsx` - UI component
- `app/admin/topics/page.tsx` - Admin dashboard
- `app/api/cron/cleanup-topics/route.ts` - Cleanup cron

### Modified Files

- `lib/news-ingestion.ts` - Added topic extraction
- `components/real-time-fact-section.tsx` - Integrated selector
- `app/api/facts/real-time/route.ts` - Topic filtering
- `lib/schema.ts` - New types
- `lib/init-db.ts` - New tables

---

## 🗄️ Database Queries

### Check Topic Coverage

```sql
SELECT
  COUNT(DISTINCT article_id) * 100.0 / (SELECT COUNT(*) FROM news_articles) as coverage_percent
FROM article_topics;
```

### Top Topics by Score

```sql
SELECT topic_text, entity_type, occurrence_count, avg_tfidf_score,
       (occurrence_count * avg_tfidf_score) as combined_score
FROM trending_topics
ORDER BY combined_score DESC
LIMIT 10;
```

### Topics by Entity Type

```sql
SELECT entity_type, COUNT(*) as count
FROM article_topics
GROUP BY entity_type
ORDER BY count DESC;
```

---

## 🐛 Common Issues

### No Topics Showing

**Cause**: No articles processed  
**Fix**: `curl http://localhost:3000/api/cron/retrieve-news`

### TF-IDF Scores Are Zero

**Cause**: Old implementation (fixed)  
**Fix**: Re-run ingestion with updated code

### UNIQUE Constraint Error

**Cause**: Race condition (fixed)  
**Fix**: Update to latest `topic-extraction.ts`

### Topic Selector Not Loading

**Cause**: API timeout or error  
**Check**: Browser console, network tab  
**Fix**: Verify `/api/topics` responds

---

## 📈 Performance Tips

1. **Cache Topics**: API caches for 15 minutes
2. **Async Extraction**: Runs in background, doesn't block
3. **Batch Processing**: Process 15 articles at a time
4. **Rate Limiting**: 2s delay between API calls
5. **Database Indexes**: Already optimized

---

## 🔍 Monitoring

### Check Statistics

```bash
# Via API
curl http://localhost:3000/api/topics

# Via TypeScript
npx tsx -e "import {getTopicStats} from './lib/topic-extraction'; const s = await getTopicStats(); console.log('Coverage:', s.coveragePercentage.toFixed(1) + '%')"

# Via Admin Dashboard
http://localhost:3000/admin/topics
```

### Check Logs

```bash
# Look for these in npm run dev output:
📊 Extracted N entities from article
✅ Stored N topics for article...
✅ Updated trending topics for N entities
```

---

## 📚 Documentation

- **README**: [../README.md](../README.md)
- **Testing Guide**: [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- **Feature Overview**: [FEATURE_OVERVIEW.md](./FEATURE_OVERVIEW.md)
- **Implementation Summary**: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **API Docs**: [api-docs.md](./api-docs.md)

---

## 🎯 Success Checklist

- [ ] Topics API returns data
- [ ] Topic selector displays on homepage
- [ ] Can select/deselect topics (max 2)
- [ ] Fact generation works with topics
- [ ] Matched topics display correctly
- [ ] Admin dashboard shows statistics
- [ ] TF-IDF scores > 0 for new articles
- [ ] No UNIQUE constraint errors in logs

---

**Quick Help**: For detailed info, see [TESTING_GUIDE.md](./TESTING_GUIDE.md) or [FEATURE_OVERVIEW.md](./FEATURE_OVERVIEW.md)
