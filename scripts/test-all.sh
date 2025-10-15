#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  NER + TF-IDF Topic Extraction - Test Suite   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Check if server is running
echo -e "${YELLOW}🔍 Checking if dev server is running...${NC}"
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${RED}❌ Dev server not running. Please start it with: npm run dev${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dev server is running${NC}"
echo ""

# Test 1: Topics API (GET)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 1: Topics API (GET)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3000/api/topics?limit=5)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Status: $HTTP_CODE${NC}"
    echo -e "Response preview:"
    echo "$BODY" | jq -r '.metadata | "   Time Window: \(.timeWindow)h | Limit: \(.limit) | Total Topics: \(.totalTopics)"' 2>/dev/null || echo "   $BODY"
else
    echo -e "${RED}❌ Status: $HTTP_CODE${NC}"
    echo "$BODY"
fi
echo ""

# Test 2: Topics API with invalid parameters
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 2: Topics API (Invalid Parameters)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "http://localhost:3000/api/topics?timeWindow=200")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "400" ]; then
    echo -e "${GREEN}✅ Correctly rejected invalid timeWindow (Status: $HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ Should return 400 for invalid parameters (Got: $HTTP_CODE)${NC}"
fi
echo ""

# Test 3: Topic Suggestions (POST)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 3: Topic Suggestions (POST)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/topics \
  -H "Content-Type: application/json" \
  -d '{"query": "tech", "limit": 5}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Status: $HTTP_CODE${NC}"
    echo -e "Response preview:"
    echo "$BODY" | jq -r '"   Query: \(.query) | Suggestions: \(.total)"' 2>/dev/null || echo "   $BODY"
else
    echo -e "${RED}❌ Status: $HTTP_CODE${NC}"
fi
echo ""

# Test 4: Real-time Facts (No Topics - Backward Compatibility)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 4: Real-time Facts (No Topics - Backward Compatible)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/facts/real-time \
  -H "Content-Type: application/json" \
  --max-time 30)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Status: $HTTP_CODE (Streaming response received)${NC}"
else
    echo -e "${RED}❌ Status: $HTTP_CODE${NC}"
fi
echo ""

# Test 5: Real-time Facts (With Topics)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 5: Real-time Facts (With Topics)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/facts/real-time \
  -H "Content-Type: application/json" \
  -d '{"selectedTopics": ["AI", "technology"]}' \
  --max-time 30)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Status: $HTTP_CODE (Streaming response with topics)${NC}"
else
    echo -e "${RED}❌ Status: $HTTP_CODE${NC}"
fi
echo ""

# Test 6: Admin Dashboard
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 6: Admin Dashboard${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/admin/topics)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Admin dashboard accessible (Status: $HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ Status: $HTTP_CODE${NC}"
fi
echo ""

# Test 7: Cleanup Cron
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 7: Cleanup Cron Job${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3000/api/cron/cleanup-topics)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Status: $HTTP_CODE${NC}"
    echo -e "Cleanup results:"
    echo "$BODY" | jq -r '.results | "   Deleted Topics: \(.deletedTopics) | Deleted Trending: \(.deletedTrendingTopics) | Errors: \(.errors)"' 2>/dev/null || echo "   $BODY"
else
    echo -e "${RED}❌ Status: $HTTP_CODE${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Test Suite Complete               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📊 Next Steps:${NC}"
echo -e "   1. Visit http://localhost:3000 to test the UI"
echo -e "   2. Run: npx tsx scripts/test-topic-extraction.ts"
echo -e "   3. Check: http://localhost:3000/admin/topics for statistics"
echo -e "   4. Trigger news ingestion to populate topics"
echo ""

