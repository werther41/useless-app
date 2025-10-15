# Feature planning and Change log

## Change log

- At the very begining - 2024 - chatGPT generated the code with Next.js and Shadcn for this site as demo.
- Earlier 2025 - Look and feel update - redesigned with v0.dev
- Sep 11 - external API, Added Info-graphic for burger flipping
- Sep 22 - implemented SQLite based back-end and API, real-rating, imported 1000+ fun fact into DB.
- Sep 28 - added Markdown driven Blog
- Sep 29 - Fun fact stats section: total rating, top 10 facts...
- Sep 30 - Optimize Mobile view, added favicon
- Oct 2 - Created dedicated deep dive section, with Markdown driven article for detailed articles.
- Oct 2 - Submitted to Google search console for index
- Oct 3 - Added deep dive page and article related to math on socks paring.
- Oct 4 - Generate fun fact based on recent news with AI feature
- Oct 5 - fine tuned AI generation: RSS feed source update, vector DB query text update and query, system prompt update.
- Oct 14 - Implemented Topic picker: Topic extraction with NER extraction (Gemini), Allow user to pick the news topic for generating real-time facts.
- Oct 15 - Fixed TF-IDF Scoring.

### Todo and future improvement Ideas

1. [x] Adding real blog, markdown based could be.
2. [x] some state for the facts: total, top useless, top helpfulness by rating... ✅ 2025-09-29
3. [x] better Mobile view on the phone ✅ 2025-09-30
4. [x] Deep dive / rabbit hole section. ✅ 2025-10-02
5. [ ] Useless things on Amazon, or other place, such as toys...
6. [x] submit to Google search console for Index ✅ 2025-10-02
7. [ ] 3D three.js based useless machine animation.
8. [x] SEO optimization
9. [x] Generate fun fact based on recent news feature
   - Feature is implemented, however it's less engaging. the search and generate works this way: search vector db with "**interesting and unusual recent event**", find relevant news (mathematically closed), get top 5, randomly pick one, and generate fun fact based on that. need to fix this.
     - [x] fine tune done, externalized Vector DB query array, updated system and user prompt.
       - [x] To implement more engaging/interactive features.
10. [ ] Try to combine the fixed fun fact in DB with dynamicaaly generated real-time fun fact. Store the generated fact as well.

### Feature & Improvement candidate

- On existing real-time news base fun fact feature:
  - choose your topic and search query: during RSS feed retrival and embedding, identify 3-5 distinct and interesting topics from the latest news articles, display as search query for the end-user to pick before generate the real-time fun fact.
  - Follow up Fun fact explorer: Below the fact, generate three new, related tags. once clicked, Generating more related facts.
- utilizing nano model built in to Chrome for this, free? - Gemini flash is pretty cheap already.
- generate random idea for you to ask AI for deep dive into rabit hole?
