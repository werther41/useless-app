"use client"

import { useState } from "react"
import Link from "next/link"
import { Calendar, ExternalLink, Hash, Loader2, TrendingUp } from "lucide-react"

import { ArticleWithRelevance } from "@/lib/schema"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ArticleListProps {
  articles: ArticleWithRelevance[]
  isLoading?: boolean
  sortBy?: "time" | "score"
  onSortChange?: (sortBy: "time" | "score") => void
}

// Icon mapping for entity types (reused from TopicSelector)
const getEntityIcon = (type: string) => {
  switch (type) {
    case "PERSON":
      return "👤"
    case "ORG":
      return "🏢"
    case "LOCATION":
      return "📍"
    case "PRODUCT":
      return "📦"
    case "PROGRAMMING_LANGUAGE":
      return "💻"
    case "SCIENTIFIC_TERM":
      return "🔬"
    case "FIELD_OF_STUDY":
      return "💡"
    case "EVENT":
      return "📅"
    case "WORK_OF_ART":
      return "🎨"
    case "LAW_OR_POLICY":
      return "⚖️"
    case "TECH":
      return "🔧"
    case "CONCEPT":
      return "💭"
    default:
      return "📊"
  }
}

// Color mapping for entity types (reused from TopicSelector)
const getEntityColor = (type: string) => {
  switch (type) {
    case "PERSON":
      return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-900/30"
    case "ORG":
      return "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800 dark:hover:bg-purple-900/30"
    case "LOCATION":
      return "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800 dark:hover:bg-orange-900/30"
    case "PRODUCT":
      return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/30"
    case "PROGRAMMING_LANGUAGE":
      return "bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800 dark:hover:bg-cyan-900/30"
    case "SCIENTIFIC_TERM":
      return "bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-900/30"
    case "FIELD_OF_STUDY":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800 dark:hover:bg-yellow-900/30"
    case "EVENT":
      return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-900/30"
    case "WORK_OF_ART":
      return "bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800 dark:hover:bg-pink-900/30"
    case "LAW_OR_POLICY":
      return "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200 dark:bg-slate-800/20 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800/30"
    case "TECH":
      return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/30"
    case "CONCEPT":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800 dark:hover:bg-yellow-900/30"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 dark:bg-gray-800/20 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-800/30"
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  )

  if (diffInHours < 1) {
    return "Just now"
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`
  } else if (diffInHours < 168) {
    const days = Math.floor(diffInHours / 24)
    return `${days}d ago`
  } else {
    return date.toLocaleDateString()
  }
}

function formatScore(score: number): string {
  return (score * 100).toFixed(1) + "%"
}

export function ArticleList({
  articles,
  isLoading = false,
  sortBy = "score",
  onSortChange,
}: ArticleListProps) {
  const [showAllTopics, setShowAllTopics] = useState<Record<string, boolean>>(
    {}
  )

  const toggleTopics = (articleId: string) => {
    setShowAllTopics((prev) => ({
      ...prev,
      [articleId]: !prev[articleId],
    }))
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="h-6 w-3/4 animate-pulse rounded bg-muted"></div>
                <div className="h-6 w-16 animate-pulse rounded bg-muted"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted"></div>
              </div>
              <div className="mt-3 flex gap-2">
                <div className="h-5 w-20 animate-pulse rounded bg-muted"></div>
                <div className="h-5 w-16 animate-pulse rounded bg-muted"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <Card className="border-muted">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="bg-muted/50 mx-auto mb-4 flex size-12 items-center justify-center rounded-full">
              <TrendingUp className="size-6 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No articles found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or selecting different topics.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Sort Controls */}
      {onSortChange && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {articles.length} article{articles.length !== 1 ? "s" : ""} found
          </div>
          <div className="flex gap-1 sm:gap-2">
            <Button
              variant={sortBy === "score" ? "default" : "outline"}
              size="sm"
              onClick={() => onSortChange("score")}
              className="flex-1 sm:flex-none"
            >
              <TrendingUp className="mr-1 h-4 w-4 sm:h-4" />
              <span className="xs:inline hidden">Most Relevant</span>
              <span className="xs:hidden">Relevant</span>
            </Button>
            <Button
              variant={sortBy === "time" ? "default" : "outline"}
              size="sm"
              onClick={() => onSortChange("time")}
              className="flex-1 sm:flex-none"
            >
              <Calendar className="mr-1 size-3 w-4 sm:h-4" />
              <span className="xs:inline hidden">Most Recent</span>
              <span className="xs:hidden">Recent</span>
            </Button>
          </div>
        </div>
      )}

      {/* Articles List */}
      <div className="space-y-3">
        {articles.map((article) => {
          const showAll = showAllTopics[article.id] || false
          const displayTopics = showAll
            ? article.matchedTopics
            : article.matchedTopics.slice(0, 3)
          const hasMoreTopics = article.matchedTopics.length > 3

          return (
            <Card
              key={article.id}
              className="border-primary/20 hover:border-primary/40 transition-colors"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-lg leading-tight">
                    {article.title}
                  </CardTitle>
                  <Badge variant="secondary" className="shrink-0">
                    {article.source}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-3 leading-relaxed text-muted-foreground">
                  {article.snippet}
                </p>

                {/* Read Original Article Link */}
                <div className="mb-3">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary/80 inline-flex items-center gap-1 text-sm text-primary transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Read original article
                  </a>
                </div>

                {/* Metadata Row */}
                <div className="mb-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(article.published_at)}
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    {formatScore(article.relevanceScore)}
                  </div>
                </div>

                {/* Matched Topics */}
                {article.matchedTopics.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {displayTopics.map((topic, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="border-blue-200 bg-blue-100 text-xs text-blue-800 hover:bg-blue-200 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
                        >
                          <Hash className="mr-1 size-3" />
                          {topic}
                        </Badge>
                      ))}
                      {hasMoreTopics && !showAll && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleTopics(article.id)}
                          className="h-6 px-2 text-xs"
                        >
                          +{article.matchedTopics.length - 3} more
                        </Button>
                      )}
                    </div>
                    {hasMoreTopics && showAll && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTopics(article.id)}
                        className="h-6 px-2 text-xs"
                      >
                        Show less
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
