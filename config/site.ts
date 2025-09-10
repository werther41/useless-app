export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Useless",
  description: "Trying Next.js and use it to build a useless site",
  mainNav: [
    {
      title: "Quick Facts",
      href: "/",
    },
    {
      title: "Infographics",
      href: "#infographics",
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
