// `app/blog/page.tsx` is the UI for the `/blog` URL
import Link from "next/link"
import { Calendar, Clock, User } from "lucide-react"

import { getAllPosts } from "@/lib/blog"
import { Button } from "@/components/ui/button"

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Blog
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          Stay updated with our latest insights, features, and behind-the-scenes
          content.
        </p>
      </div>

      <div className="max-w-[980px]">
        {posts.length === 0 ? (
          <p className="text-muted-foreground">
            No blog posts available yet. Check back soon!
          </p>
        ) : (
          posts.map((post) => (
            <article
              key={post.slug}
              className="mb-8 border-b pb-6 last:border-b-0"
            >
              <h2 className="text-xl font-semibold leading-snug">
                <Link
                  href={`/blog/${post.slug}`}
                  className="hover:text-primary"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-4" />
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </span>
                {post.updatedDate && post.updatedDate !== post.date ? (
                  <>
                    {" · Updated "}
                    {new Date(post.updatedDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </>
                ) : null}
                {" · "}
                <span className="inline-flex items-center gap-1">
                  <User className="size-4" />
                  {post.author}
                </span>
              </p>
              <p className="mt-3 text-base leading-relaxed">{post.excerpt}</p>
              {post.tags && post.tags.length > 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Tags: {post.tags.join(", ")}
                </p>
              ) : null}
              <p className="mt-3">
                <Button variant="ghost" asChild className="mb-6">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="flex items-center gap-2"
                  >
                    Read more →
                  </Link>
                </Button>
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
