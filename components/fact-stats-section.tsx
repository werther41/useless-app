"use client"

import { useEffect, useState } from "react"
import {
  BarChart3,
  Calendar,
  Clock,
  RefreshCw,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FactStatistics {
  total_facts: number
  total_ratings: number
  average_rating: number
  positive_ratings: number
  negative_ratings: number
  most_rated_fact: {
    id: string
    text: string
    rating_count: number
  } | null
  recent_activity: {
    ratings_last_24h: number
    ratings_last_7d: number
  }
}

interface ApiResponse {
  success: boolean
  data: FactStatistics
  error?: string
}

const fetchStatistics = async (): Promise<FactStatistics | null> => {
  try {
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime()
    const response = await fetch(`/api/facts/stats?t=${timestamp}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    })
    if (!response.ok) {
      throw new Error("Failed to fetch statistics")
    }
    const data: ApiResponse = await response.json()

    if (!data.success) {
      throw new Error(data.error || "Failed to fetch statistics")
    }

    return data.data
  } catch (error) {
    console.error("Error fetching statistics:", error)
    return null
  }
}

export default function FactStatsSection() {
  const [stats, setStats] = useState<FactStatistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadStats = async () => {
    setIsLoading(true)
    const data = await fetchStatistics()
    setStats(data)
    setIsLoading(false)
  }

  useEffect(() => {
    loadStats()
  }, [])

  if (isLoading) {
    return (
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h3 className="mb-4 text-4xl font-bold text-foreground">
              Fun Fact Statistics
            </h3>
            <p className="text-pretty text-xl text-muted-foreground">
              Loading amazing useless data...
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="mb-2 h-4 w-3/4 rounded bg-muted"></div>
                  <div className="h-8 w-1/2 rounded bg-muted"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!stats) {
    return (
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h3 className="mb-4 text-4xl font-bold text-foreground">
              Fun Fact Statistics
            </h3>
            <p className="text-pretty text-xl text-muted-foreground">
              Unable to load statistics at this time.
            </p>
          </div>
        </div>
      </section>
    )
  }

  const positivePercentage =
    stats.total_ratings > 0
      ? Math.round((stats.positive_ratings / stats.total_ratings) * 100)
      : 0

  const negativePercentage =
    stats.total_ratings > 0
      ? Math.round((stats.negative_ratings / stats.total_ratings) * 100)
      : 0

  return (
    <section className="px-4 py-16">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h3 className="mb-4 text-4xl font-bold text-foreground">
            Fun Fact Statistics
          </h3>
          <p className="text-pretty text-xl text-muted-foreground">
            The numbers behind our wonderfully useless knowledge
          </p>
          <div className="mt-6">
            <Button
              onClick={loadStats}
              disabled={isLoading}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              {isLoading ? "Refreshing..." : "Refresh Stats"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Total Facts */}
          <Card className="border-primary/20 transition-shadow hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
                Total Facts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stats.total_facts.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                Useless facts in our database
              </p>
            </CardContent>
          </Card>

          {/* Total Ratings */}
          <Card className="border-primary/20 transition-shadow hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" />
                Total Ratings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stats.total_ratings.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                Votes cast by users
              </p>
            </CardContent>
          </Card>

          {/* Average Rating */}
          <Card className="border-primary/20 transition-shadow hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="h-5 w-5 text-primary" />
                Average Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stats.average_rating.toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground">
                Out of 1.0 (useful uselessness)
              </p>
            </CardContent>
          </Card>

          {/* Positive Ratings */}
          <Card className="border-green-200 transition-shadow hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Useful Uselessness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats.positive_ratings.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                {positivePercentage}% of all ratings
              </p>
            </CardContent>
          </Card>

          {/* Negative Ratings */}
          <Card className="border-red-200 transition-shadow hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Too Useless
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {stats.negative_ratings.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                {negativePercentage}% of all ratings
              </p>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-primary/20 transition-shadow hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Last 24h:
                  </span>
                  <span className="font-semibold text-foreground">
                    {stats.recent_activity.ratings_last_24h}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Last 7 days:
                  </span>
                  <span className="font-semibold text-foreground">
                    {stats.recent_activity.ratings_last_7d}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Most Rated Fact */}
        {stats.most_rated_fact && (
          <Card className="border-primary/20 mt-8 transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Most Rated Fact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-lg text-foreground">
                  &quot;{stats.most_rated_fact.text}&quot;
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="px-3 py-1">
                    {stats.most_rated_fact.rating_count} ratings
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Most discussed useless fact
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}
