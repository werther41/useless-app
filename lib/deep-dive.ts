import fs from "fs"
import path from "path"
import matter from "gray-matter"

import { BlogPost, BlogPostMeta } from "@/types/blog"

const articlesDirectory = path.join(process.cwd(), "content/deep-dive")

export function getAllDeepDiveArticles(): BlogPostMeta[] {
  try {
    const fileNames = fs.readdirSync(articlesDirectory)
    const allArticlesData = fileNames
      .filter((name) => name.endsWith(".md"))
      .map((fileName) => {
        const slug = fileName.replace(/\.md$/, "")
        const fullPath = path.join(articlesDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, "utf8")
        const { data } = matter(fileContents)

        return {
          slug,
          title: data.title || "Untitled",
          date: data.date || new Date().toISOString(),
          updatedDate: data.updatedDate,
          author: data.author || "Anonymous",
          excerpt: data.excerpt || "",
          tags: data.tags || [],
          published: data.published !== false,
        } as BlogPostMeta
      })
      .filter((article) => article.published)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return allArticlesData
  } catch (error) {
    console.error("Error reading deep-dive articles:", error)
    return []
  }
}

export function getDeepDiveArticleBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(articlesDirectory, `${slug}.md`)
    const fileContents = fs.readFileSync(fullPath, "utf8")
    const { data, content } = matter(fileContents)

    return {
      slug,
      title: data.title || "Untitled",
      date: data.date || new Date().toISOString(),
      updatedDate: data.updatedDate,
      author: data.author || "Anonymous",
      excerpt: data.excerpt || "",
      content,
      tags: data.tags || [],
      published: data.published !== false,
    } as BlogPost
  } catch (error) {
    console.error(`Error reading deep-dive article ${slug}:`, error)
    return null
  }
}

export function getAllDeepDiveArticleSlugs(): string[] {
  try {
    const fileNames = fs.readdirSync(articlesDirectory)
    return fileNames
      .filter((name) => name.endsWith(".md"))
      .map((fileName) => fileName.replace(/\.md$/, ""))
  } catch (error) {
    console.error("Error reading deep-dive article slugs:", error)
    return []
  }
}
