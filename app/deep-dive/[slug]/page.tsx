import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Calendar, Clock, User } from "lucide-react"

import {
  getAllDeepDiveArticleSlugs,
  getDeepDiveArticleBySlug,
} from "@/lib/deep-dive"
import { markdownToHtml } from "@/lib/markdown"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface DeepDiveArticlePageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  const slugs = getAllDeepDiveArticleSlugs()
  return slugs.map((slug) => ({
    slug,
  }))
}

export async function generateMetadata({
  params,
}: DeepDiveArticlePageProps): Promise<Metadata> {
  const article = getDeepDiveArticleBySlug(params.slug)

  if (!article) {
    return {
      title: "Article Not Found",
    }
  }

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.date,
      modifiedTime: article.updatedDate,
      authors: [article.author],
    },
  }
}

export default async function DeepDiveArticlePage({
  params,
}: DeepDiveArticlePageProps) {
  const article = getDeepDiveArticleBySlug(params.slug)

  if (!article) {
    notFound()
  }

  const content = await markdownToHtml(article.content)

  return (
    <article className="container max-w-4xl py-8">
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/deep-dive" className="flex items-center gap-2">
            <ArrowLeft className="size-4" />
            Back to Deep Dive
          </Link>
        </Button>

        <header className="mb-8">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">
            {article.title}
          </h1>

          <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="size-4" />
              <time dateTime={article.date}>
                {new Date(article.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>

            {article.updatedDate && article.updatedDate !== article.date && (
              <div className="flex items-center gap-1">
                <Clock className="size-4" />
                <span>
                  Updated{" "}
                  {new Date(article.updatedDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <User className="size-4" />
              <span>{article.author}</span>
            </div>
          </div>

          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </header>
      </div>

      <div
        className="prose prose-gray dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />

      <div className="mt-12 border-t pt-8">
        <Button variant="outline" asChild>
          <Link href="/deep-dive" className="flex items-center gap-2">
            <ArrowLeft className="size-4" />
            Back to Deep Dive
          </Link>
        </Button>
      </div>
    </article>
  )
}
