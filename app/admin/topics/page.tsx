import { Suspense } from "react"
import {
  Building,
  Calendar,
  Hash,
  Lightbulb,
  MapPin,
  TrendingUp,
  User,
} from "lucide-react"

import { getTopicStats, getTrendingTopics } from "@/lib/topic-extraction"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Icon mapping for entity types
const getEntityIcon = (type: string) => {
  switch (type) {
    case "TECH":
      return <Hash className="size-4" />
    case "ORG":
      return <Building className="size-4" />
    case "PERSON":
      return <User className="size-4" />
    case "LOCATION":
      return <MapPin className="size-4" />
    case "CONCEPT":
      return <Lightbulb className="size-4" />
    case "EVENT":
      return <Calendar className="size-4" />
    default:
      return <TrendingUp className="size-4" />
  }
}

async function TopicStats() {
  const stats = await getTopicStats()

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
          <TrendingUp className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalArticles}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Articles with Topics
          </CardTitle>
          <Hash className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.articlesWithTopics}</div>
          <p className="text-xs text-muted-foreground">
            {stats.coveragePercentage.toFixed(1)}% coverage
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Topics</CardTitle>
          <Lightbulb className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalTopics}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Trending Topics</CardTitle>
          <TrendingUp className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.trendingTopics}</div>
        </CardContent>
      </Card>
    </div>
  )
}

async function TrendingTopicsList() {
  const topics = await getTrendingTopics({ limit: 20 })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Trending Topics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topics.map((topic, index) => (
            <div
              key={topic.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">
                  #{index + 1}
                </span>
                {getEntityIcon(topic.entity_type)}
                <div>
                  <p className="font-medium">{topic.topic_text}</p>
                  <p className="text-sm text-muted-foreground">
                    {topic.entity_type} • {topic.occurrence_count} occurrences
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary">
                  Score:{" "}
                  {(topic.occurrence_count * topic.avg_tfidf_score).toFixed(2)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function TopicsAdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Topic Extraction Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Monitor topic extraction statistics and trending topics
        </p>
      </div>

      <Suspense
        fallback={
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="h-4 animate-pulse rounded bg-muted"></div>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 h-8 animate-pulse rounded bg-muted"></div>
                  <div className="h-3 w-1/2 animate-pulse rounded bg-muted"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        }
      >
        <TopicStats />
      </Suspense>

      <Suspense
        fallback={
          <Card>
            <CardHeader>
              <div className="h-6 w-1/3 animate-pulse rounded bg-muted"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-4 animate-pulse rounded bg-muted"></div>
                      <div className="size-4 animate-pulse rounded bg-muted"></div>
                      <div>
                        <div className="mb-2 h-4 w-32 animate-pulse rounded bg-muted"></div>
                        <div className="h-3 w-24 animate-pulse rounded bg-muted"></div>
                      </div>
                    </div>
                    <div className="h-6 w-16 animate-pulse rounded bg-muted"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        }
      >
        <TrendingTopicsList />
      </Suspense>
    </div>
  )
}
