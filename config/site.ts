export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Useless",
  description: "Trying Next.js and use it to build a useless site",
  url: "https://useless-app-nu.vercel.app", // Add your actual domain
  mainNav: [
    {
      title: "Quick Facts",
      href: "/",
    },
    {
      title: "Fun Fact Stats",
      href: "/statistics",
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
    github: "https://github.com/werther41",
    docs: "https://ui.shadcn.com",
  },
}
