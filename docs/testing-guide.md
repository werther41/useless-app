# Testing Guide

This guide explains how to test the Useless Facts App locally and in production.

## 🧪 Quick Test

### 1. Basic Functionality Test

```bash
# Start the development server
npm run dev

# Test basic endpoints
curl http://localhost:3000/api/facts/random
curl http://localhost:3000/api/topics
```

### 2. Admin Features Test

```bash
# Test admin authentication (replace YOUR_SECRET)
curl -X POST "http://localhost:3000/api/seed" \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"

# Test admin pages (replace YOUR_SECRET)
open "http://localhost:3000/admin/import?admin_secret=YOUR_SECRET"
open "http://localhost:3000/admin/topics?admin_secret=YOUR_SECRET"
```

## 🔧 Automated Testing

### Run Test Suite

```bash
# Make test script executable
chmod +x scripts/test-all.sh

# Run all tests
./scripts/test-all.sh
```

### Individual Tests

```bash
# Test topic extraction
npx tsx scripts/test-topic-extraction.ts

# Test database connection
curl http://localhost:3000/api/test-db \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"
```

## 📊 Feature Testing

### 1. Fact Generation

- Visit homepage
- Click "Get Random Fact"
- Verify fact appears with rating buttons
- Test rating functionality

### 2. Real-Time Facts

- Scroll to "Real-Time News Facts" section
- Select topics from trending list
- Click "Get Real-Time Fact"
- Verify AI-generated fact appears

### 3. Topic Selection

- Check trending topics load
- Verify topic categories (TECH, ORG, PERSON, etc.)
- Test topic selection limits (max 2)

### 4. Admin Interface

- Access admin pages with secret
- Test fact import functionality
- Verify topic statistics display
- Check database operations

## 🐛 Debugging

### Common Issues

#### Database Connection

```bash
# Check environment variables
echo $TURSO_DATABASE_URL
echo $TURSO_AUTH_TOKEN

# Test connection
curl http://localhost:3000/api/test-db \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"
```

#### AI Features

```bash
# Check Gemini API key
echo $GOOGLE_API_KEY

# Test topic extraction
npx tsx scripts/test-topic-extraction.ts
```

#### Admin Authentication

```bash
# Verify admin secret is set
echo $ADMIN_SECRET

# Test admin endpoint
curl -X POST "http://localhost:3000/api/seed" \
  -H "Authorization: Bearer $ADMIN_SECRET"
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Check console for detailed logs
```

## 🚀 Production Testing

### 1. Vercel Deployment

- Check environment variables in Vercel dashboard
- Verify all secrets are set correctly
- Test production URLs

### 2. Performance Testing

```bash
# Test response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/api/facts/random

# Load testing (install artillery first)
npm install -g artillery
artillery quick --count 10 --num 5 http://localhost:3000/api/facts/random
```

### 3. Security Testing

- Verify admin endpoints are protected
- Test with invalid authentication
- Check for information disclosure

## 📝 Test Data

### Sample Facts for Import

```json
[
  {
    "id": "test-fact-1",
    "text": "A group of flamingos is called a 'flamboyance'.",
    "source": "Animal Facts",
    "source_url": "https://example.com"
  },
  {
    "id": "test-fact-2",
    "text": "Honey never spoils.",
    "source": "Food Facts",
    "source_url": "https://example.com"
  }
]
```

### Sample Topics

- **TECH**: AI, Machine Learning, Software
- **ORG**: Google, Meta, Apple
- **PERSON**: Scientists, CEOs
- **LOCATION**: Silicon Valley, California

## 🔍 Monitoring

### Health Checks

```bash
# API health
curl http://localhost:3000/api/facts/random

# Database health
curl http://localhost:3000/api/test-db \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"

# Admin health
curl http://localhost:3000/admin/topics?admin_secret=YOUR_SECRET
```

### Log Monitoring

- Check console logs for errors
- Monitor API response times
- Watch for authentication failures

## 📞 Troubleshooting

### Common Problems

1. **Database Connection Failed**

   - Check TURSO_DATABASE_URL and TURSO_AUTH_TOKEN
   - Verify database is accessible
   - Check network connectivity

2. **AI Features Not Working**

   - Verify GOOGLE_API_KEY is set
   - Check API quota and limits
   - Test with simple requests

3. **Admin Access Denied**

   - Confirm ADMIN_SECRET is set
   - Check authentication method
   - Verify secret matches

4. **Build Errors**
   - Run `npm run typecheck`
   - Check for TypeScript errors
   - Verify all dependencies installed

### Getting Help

1. Check this guide first
2. Review error messages carefully
3. Check environment variables
4. Open an issue on GitHub with details
