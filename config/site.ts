export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Useless Facts",
  description:
    "Discover completely useless facts, explore pointless knowledge with interactive infographics, and dive deep into wonderfully irrelevant topics. Rate facts, view statistics, and enjoy the most entertaining collection of useless information on the web.",
  url: "https://useless-app-nu.vercel.app",
  keywords: [
    "useless facts",
    "pointless knowledge",
    "fun facts",
    "trivia",
    "random facts",
    "useless information",
    "entertainment",
    "humor",
    "interactive infographics",
    "data visualization",
    "useless statistics",
    "pointless trivia",
    "fun data",
    "entertaining facts",
    "random knowledge",
  ],
  author: "Useless Facts Team",
  ogImage: "/og-image.png",
  twitterCard: "summary_large_image" as const,
  mainNav: [
    {
      title: "Quick Facts",
      href: "/",
    },
    {
      title: "Discover",
      href: "/discover",
    },
    {
      title: "Deep Dive",
      href: "/deep-dive",
    },
    {
      title: "Blog",
      href: "/blog",
    },
  ],
  links: {
    github: "https://github.com/werther41/useless-app",
  },
}
