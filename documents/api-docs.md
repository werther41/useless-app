# Useless Facts API Documentation

## Overview

The Useless Facts API provides endpoints for managing and retrieving useless facts with user rating functionality. Built with Next.js API routes and powered by Turso (libSQL) database.

## Base URL

All API endpoints are prefixed with `/api/facts`

## Authentication

Currently, no authentication is required. User tracking is done via IP address for rating purposes.

## Endpoints

### 1. Get Random Fact

**GET** `/api/facts/random`

Returns a random fact with rating information.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "fact-123",
    "text": "Bananas are berries, but strawberries aren't.",
    "source": "Botanical Facts",
    "source_url": "https://example.com",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "total_rating": 5,
    "rating_count": 10,
    "user_rating": 1
  }
}
```

**Error Response:**
```json
{
  "error": "No facts available"
}
```

### 2. Get Specific Fact

**GET** `/api/facts/{id}`

Returns a specific fact by ID with rating information.

**Parameters:**
- `id` (string): The fact ID

**Response:** Same format as random fact endpoint.

**Error Response:**
```json
{
  "error": "Fact not found"
}
```

### 3. Rate a Fact

**POST** `/api/facts/{id}/rate`

Submit a rating for a fact.

**Parameters:**
- `id` (string): The fact ID

**Request Body:**
```json
{
  "rating": 1
}
```

**Rating Values:**
- `1`: "Useful Uselessness" (thumbs up)
- `-1`: "Too Useless" (thumbs down)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "fact_id": "fact-123",
    "rating": 1,
    "user_ip": "192.168.1.1",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "Rating submitted successfully"
}
```

**Error Response:**
```json
{
  "error": "Rating must be -1 (too useless) or 1 (useful uselessness)"
}
```

### 4. Get All Facts

**GET** `/api/facts`

Get paginated list of all facts.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `type` (string, optional): "top-rated" for top rated facts

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "fact-1",
      "text": "Bananas are berries, but strawberries aren't.",
      "source": "Botanical Facts",
      "source_url": "https://example.com",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "total_rating": 5,
      "rating_count": 10,
      "user_rating": 1
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

### 5. Import Facts (Admin)

**POST** `/api/facts/import`

Bulk import facts into the database. Used by the admin interface.

**Request Body:**
```json
{
  "facts": [
    {
      "id": "fact-6",
      "text": "The human brain contains approximately 86 billion neurons.",
      "source": "Neuroscience Facts",
      "source_url": "https://example.com"
    }
  ],
  "skipDuplicates": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Import completed",
  "results": {
    "imported": 1,
    "skipped": 0,
    "errors": 0,
    "errors_list": []
  }
}
```

### 6. Seed Database (Admin)

**POST** `/api/seed`

Initialize the database with sample facts.

**Response:**
```json
{
  "success": true,
  "message": "Database seeded successfully"
}
```

## Data Models

### Fact

```typescript
interface Fact {
  id: string
  text: string
  source?: string
  source_url?: string
  created_at: string
  updated_at: string
}
```

### Fact with Rating

```typescript
interface FactWithRating extends Fact {
  total_rating: number
  rating_count: number
  user_rating?: number
}
```

### Fact Rating

```typescript
interface FactRating {
  id: number
  fact_id: string
  rating: number // -1 or 1
  user_ip?: string
  created_at: string
}
```

## Error Handling

All endpoints return errors in this format:
```json
{
  "error": "Error message"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting

Currently no rate limiting is implemented. Consider implementing rate limiting for production use.

## Database Schema

### Facts Table
```sql
CREATE TABLE facts (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  source TEXT,
  source_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Fact Ratings Table
```sql
CREATE TABLE fact_ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fact_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating IN (-1, 1)),
  user_ip TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (fact_id) REFERENCES facts (id) ON DELETE CASCADE
);
```

## Usage Examples

### JavaScript/TypeScript

```typescript
// Get a random fact
const response = await fetch('/api/facts/random')
const { data: fact } = await response.json()

// Rate a fact
await fetch(`/api/facts/${fact.id}/rate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ rating: 1 })
})

// Get top rated facts
const topFacts = await fetch('/api/facts?type=top-rated&limit=5')
```

### cURL

```bash
# Get random fact
curl http://localhost:3000/api/facts/random

# Rate a fact
curl -X POST http://localhost:3000/api/facts/fact-1/rate \
  -H "Content-Type: application/json" \
  -d '{"rating": 1}'

# Get all facts with pagination
curl "http://localhost:3000/api/facts?page=1&limit=10"
```

## Development

To test the API locally:

1. Start the development server: `npm run dev`
2. Visit `http://localhost:3000/api/facts/random` to test
3. Use the admin interface at `/admin/import` to manage facts

## Production Considerations

- Implement proper authentication for admin endpoints
- Add rate limiting to prevent abuse
- Set up monitoring and logging
- Consider caching for frequently accessed endpoints
- Implement proper error tracking
