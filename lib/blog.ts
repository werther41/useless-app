import fs from "fs"
import path from "path"
import matter from "gray-matter"

import { BlogPost, BlogPostMeta } from "@/types/blog"

const postsDirectory = path.join(process.cwd(), "content/blog")

export function getAllPosts(): BlogPostMeta[] {
  try {
    const fileNames = fs.readdirSync(postsDirectory)
    const allPostsData = fileNames
      .filter((name) => name.endsWith(".md"))
      .map((fileName) => {
        const slug = fileName.replace(/\.md$/, "")
        const fullPath = path.join(postsDirectory, fileName)
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
      .filter((post) => post.published)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return allPostsData
  } catch (error) {
    console.error("Error reading blog posts:", error)
    return []
  }
}

export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`)
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
    console.error(`Error reading post ${slug}:`, error)
    return null
  }
}

export function getAllPostSlugs(): string[] {
  try {
    const fileNames = fs.readdirSync(postsDirectory)
    return fileNames
      .filter((name) => name.endsWith(".md"))
      .map((fileName) => fileName.replace(/\.md$/, ""))
  } catch (error) {
    console.error("Error reading post slugs:", error)
    return []
  }
}
