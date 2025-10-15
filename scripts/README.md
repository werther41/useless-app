# NER + TF-IDF Topic Extraction - Scripts & Testing

This directory contains scripts for testing and managing the topic extraction feature, including TypeScript tests and shell scripts for API testing.

## Quick Start

### 1. Start Development Server

```bash
npm run dev
```

### 2. Run All API Tests

```bash
# Make script executable
chmod +x scripts/test-all.sh

# Run all endpoint tests
./scripts/test-all.sh
```

### 3. Test Topic Extraction Service

```bash
# Run comprehensive topic extraction test
npx tsx scripts/test-topic-extraction.ts
```

## Available Scripts

### `test-all.sh` - Complete API Test Suite

Tests all API endpoints in sequence:

- Topics API (GET with various parameters)
- Topic suggestions (POST)
- Real-time facts without topics
- Real-time facts with topics
- Admin dashboard
- Cleanup cron job

**Usage:**

```bash
./scripts/test-all.sh
```

**Requirements:**

- Development server running on `http://localhost:3000`
- `curl` and `jq` installed (for pretty output)

### `test-topic-extraction.ts` - Service Testing

Comprehensive test of the topic extraction service:

- Entity extraction from sample articles
- Topic storage in database
- Trending topics aggregation
- Statistics generation
- Cleanup of test data

**Usage:**

```bash
npx tsx scripts/test-topic-extraction.ts
```

**What it tests:**

1. ✅ Extract entities using Gemini NER
2. ✅ Store topics in database
3. ✅ Update trending topics
4. ✅ Verify data integrity
5. ✅ Calculate statistics
6. ✅ Clean up test data

### Environment Variables

Required for testing:

- `TURSO_DATABASE_URL` - Your Turso database URL
- `TURSO_AUTH_TOKEN` - Your Turso auth token
- `GOOGLE_API_KEY` - Your Google Gemini API key

## Notebook Structure

### Cell 1: Setup and Configuration

- Loads environment variables
- Configures batch processing parameters
- Initializes database and Gemini clients

### Cell 2: Database Functions

- `get_articles_without_topics()` - Find articles needing topic extraction
- `store_article_topics()` - Save extracted topics to database
- `update_trending_topics()` - Update trending topics aggregation

### Cell 3: NER with Gemini

- `extract_topics_with_gemini()` - Extract entities using Gemini AI
- Tests extraction on a sample article

### Cell 4: TF-IDF Calculation

- `calculate_tfidf_scores()` - Calculate TF-IDF scores across all articles
- `update_topic_tfidf_scores()` - Match topics with TF-IDF scores

### Cell 5: Main Processing Loop

- Processes articles in batches
- Extracts topics for each article
- Updates database with results
- Includes progress tracking and error handling

### Cell 6: Results and Statistics

- Shows processing statistics
- Displays top trending topics
- Shows topic distribution by type

## Configuration Options

You can modify these variables in the first cell:

```python
BATCH_SIZE = 10              # Articles per batch
MAX_ARTICLES = None          # None = process all articles
DAYS_BACK = 7               # None = all time, 7 = last 7 days
DELAY_BETWEEN_CALLS = 1    # Seconds between API calls
DELAY_BETWEEN_BATCHES = 3  # Seconds between batches
```

## Expected Results

After running the notebook, you should see:

- Articles processed with topics extracted
- New entries in `article_topics` table
- Updated `trending_topics` table
- Statistics showing coverage percentage

## Troubleshooting

### Common Issues

1. **API Rate Limits**: Increase `DELAY_BETWEEN_CALLS` if you hit rate limits
2. **Memory Issues**: Reduce `BATCH_SIZE` for large datasets
3. **Database Connection**: Verify your Turso credentials in `.env`
4. **Gemini API**: Check your Google API key and quota

### Error Handling

The notebook includes comprehensive error handling:

- Retries failed API calls
- Skips problematic articles
- Logs all errors for review
- Continues processing even if some articles fail

## Next Steps

After successful topic extraction:

1. Verify results in your database
2. Implement the TypeScript API endpoints
3. Create the frontend topic selector
4. Update the real-time fact generation

## Files

- `backfill_topics.ipynb` - Main processing notebook
- `requirements.txt` - Python dependencies
- `setup_env.sh` - Environment setup script
- `README.md` - This documentation
