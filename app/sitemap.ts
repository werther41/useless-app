import { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://useless-app-nu.vercel.app"

  // Use a static date to avoid dynamic generation issues
  const lastModified = new Date("2024-01-01")

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/statistics`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/burger-infographic`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ]
}
