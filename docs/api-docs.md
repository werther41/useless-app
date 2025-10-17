# API Documentation

Complete API reference for the Useless Facts App.

## 🌐 Base URL

```
Production: https://useless-app-nu.vercel.app/api
Development: http://localhost:3000/api
```

## 🔐 Authentication

### Public Endpoints

Most endpoints are public and require no authentication.

### Admin Endpoints

Admin endpoints require authentication via:

- **Header**: `Authorization: Bearer YOUR_ADMIN_SECRET`
- **Query Parameter**: `?admin_secret=YOUR_ADMIN_SECRET`

## 📊 Public Endpoints

### Get Random Fact

```http
GET /api/facts/random?type=static|realtime
```

**Parameters:**

- `type` (optional): `static` or `realtime` - defaults to random

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "fact-123",
    "text": "Bananas are berries, but strawberries aren't.",
    "source": "Botanical Facts",
    "source_url": "https://example.com",
    "total_rating": 5,
    "rating_count": 10,
    "user_rating": 1
  }
}
```

### Get All Facts

```http
GET /api/facts?page=1&limit=10&type=top-rated
```

**Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `type` (optional): `top-rated` for highest rated facts

### Rate a Fact

```http
POST /api/facts/{id}/rate
Content-Type: application/json

{
  "rating": 1
}
```

**Parameters:**

- `rating`: `1` (upvote) or `-1` (downvote)

### Get Trending Topics

```http
GET /api/topics?limit=10&timeWindow=48
```

**Parameters:**

- `limit` (optional): Number of topics (default: 10)
- `timeWindow` (optional): Hours to look back (default: 48)

### Generate AI Fact

```http
POST /api/facts/real-time
Content-Type: application/json

{
  "selectedTopics": ["AI", "Technology"]
}
```

**Parameters:**

- `selectedTopics` (optional): Array of topic strings

## 🔒 Admin Endpoints

### Seed Database

```http
POST /api/seed
Authorization: Bearer YOUR_ADMIN_SECRET
```

### Import Facts

```http
POST /api/facts/import
Authorization: Bearer YOUR_ADMIN_SECRET
Content-Type: application/json

{
  "facts": [
    {
      "id": "fact-123",
      "text": "Your fact here",
      "source": "Source Name",
      "source_url": "https://example.com"
    }
  ],
  "skipDuplicates": true
}
```

### Test Database

```http
GET /api/test-db
Authorization: Bearer YOUR_ADMIN_SECRET
```

## 📝 Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Error Response

```json
{
  "error": "Error message",
  "status": 400
}
```

## 🚀 Example Usage

### JavaScript/TypeScript

```javascript
// Get a random fact
const response = await fetch("/api/facts/random")
const data = await response.json()

// Rate a fact
await fetch("/api/facts/fact-123/rate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ rating: 1 }),
})

// Generate AI fact
await fetch("/api/facts/real-time", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ selectedTopics: ["AI", "Technology"] }),
})
```

### cURL Examples

```bash
# Get random fact
curl https://useless-app-nu.vercel.app/api/facts/random

# Get trending topics
curl https://useless-app-nu.vercel.app/api/topics?limit=5

# Rate a fact
curl -X POST https://useless-app-nu.vercel.app/api/facts/fact-123/rate \
  -H "Content-Type: application/json" \
  -d '{"rating": 1}'
```

## 🔧 Rate Limiting

- **Public endpoints**: No rate limiting (consider implementing for production)
- **Admin endpoints**: Protected by authentication
- **AI endpoints**: Built-in delays to prevent abuse

## 📊 Status Codes

| Code | Description           |
| ---- | --------------------- |
| 200  | Success               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 404  | Not Found             |
| 500  | Internal Server Error |

## 🐛 Error Handling

All endpoints return consistent error responses with appropriate HTTP status codes. Check the `error` field in the response for details.

## 📞 Support

For API issues or questions:

1. Check this documentation
2. Open an issue on GitHub
3. Review the main README for setup instructions
