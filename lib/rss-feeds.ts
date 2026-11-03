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
  // --- Science ---
  {
    url: "https://www.sciencedaily.com/rss/all.xml",
    source: "Science Daily",
  },
  {
    url: "https://www.nasa.gov/rss/dyn/breaking_news.rss",
    source: "NASA Breaking News",
  },
  {
    url: "https://www.quantamagazine.org/feed/",
    source: "Quanta Magazine",
  },
  {
    url: "https://news.mit.edu/rss/feed",
    source: "MIT News",
  },
  // --- Engineering & Making ---
  {
    url: "https://spectrum.ieee.org/feeds/feed.rss",
    source: "IEEE Spectrum",
  },
  {
    url: "https://hackaday.com/blog/feed/",
    source: "Hackaday",
  },
  // --- EVs & Cars ---
  {
    url: "https://electrek.co/feed/",
    source: "Electrek",
  },
  // --- Aviation ---
  {
    url: "https://www.avweb.com/feed/",
    source: "AVweb",
  },
  // --- Tech ---
  {
    url: "https://techcrunch.com/feed/",
    source: "TechCrunch",
  },
  {
    url: "https://feeds.arstechnica.com/arstechnica/index",
    source: "Ars Technica",
  },
  {
    url: "https://www.theregister.com/headlines.atom",
    source: "The Register",
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
  // --- Community ---
  {
    url: "https://hnrss.org/frontpage",
    source: "Hacker News",
  },
  {
    url: "https://lobste.rs/rss",
    source: "Lobsters",
  },
  {
    url: "https://github.blog/feed/",
    source: "GitHub Blog",
  },
  // --- Personal ---
  {
    url: "https://milo.4167360.xyz/feed.xml",
    source: "Milo's Corner",
  },
]
