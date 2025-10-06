export interface RSSFeed {
  url: string
  source: string
}

export const RSS_FEEDS: RSSFeed[] = [
  // --- General News (Working URL) ---
  {
    url: "http://feeds.bbci.co.uk/news/rss.xml",
    source: "BBC News",
  },
  // --- Science & Tech ---
  {
    url: "https://www.sciencedaily.com/rss/all.xml",
    source: "Science Daily",
  },
  {
    url: "https://www.nasa.gov/rss/dyn/breaking_news.rss",
    source: "NASA Breaking News",
  },
  {
    url: "https://techcrunch.com/feed/",
    source: "TechCrunch",
  },
  // --- Nature, History & Quirky (Excellent Replacement) ---
  {
    url: "https://www.atlasobscura.com/feeds/latest", // <-- REPLACEMENT for Guinness
    source: "Atlas Obscura",
  },
  {
    url: "https://www.smithsonianmag.com/rss/latest_articles/",
    source: "Smithsonian Magazine",
  },
  {
    url: "https://www.livescience.com/feeds/all",
    source: "Live Science",
  },
  {
    url: "https://hnrss.org/frontpage",
    source: "Hacker News",
  },
  {
    url: "https://github.blog/feed/",
    source: "GitHub Blog",
  },
  {
    url: "https://dev.to/feed",
    source: "Dev.to",
  },
]
