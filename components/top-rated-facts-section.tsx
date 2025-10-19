"use client"

import { useEffect, useState } from "react"
import { ExternalLink, Star, ThumbsUp, TrendingUp, Trophy } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Fact {
  id: string
  text: string
  source?: string
  source_url?: string
  created_at: string
  updated_at: string
  total_rating: number
  rating_count: number
  user_rating?: number
}

interface ApiResponse {
  success: boolean
  data: Fact[]
  meta: {
    limit: number
    count: number
  }
  error?: string
}

const fetchTopRatedFacts = async (limit = 10): Promise<Fact[]> => {
  try {
    // Add timestamp and random nonce to prevent caching
    const timestamp = new Date().getTime()
    const nonce = Math.random().toString(36).substring(7)
    const response = await fetch(
      `/api/facts/top-rated?limit=${limit}&t=${timestamp}&n=${nonce}`,
      {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          "X-Requested-With": "XMLHttpRequest",
        },
      }
    )
    if (!response.ok) {
      throw new Error("Failed to fetch top rated facts")
    }
    const data: ApiResponse = await response.json()

    if (!data.success) {
      throw new Error(data.error || "Failed to fetch top rated facts")
    }

    return data.data
  } catch (error) {
    console.error("Error fetching top rated facts:", error)
    return []
  }
}

export default function TopRatedFactsSection() {
  const [facts, setFacts] = useState<Fact[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadFacts = async () => {
      setIsLoading(true)
      const data = await fetchTopRatedFacts(10)
      setFacts(data)
      setIsLoading(false)
    }

    loadFacts()
  }, [])

  if (isLoading) {
    return (
      <section className="bg-muted/30 px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h3 className="mb-4 text-4xl font-bold text-foreground">
              Top Rated Facts
            </h3>
            <p className="text-pretty text-xl text-muted-foreground">
              Loading the most loved useless facts...
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="mb-4 h-4 w-1/4 rounded bg-muted"></div>
                  <div className="mb-2 h-6 w-full rounded bg-muted"></div>
                  <div className="mb-4 h-4 w-3/4 rounded bg-muted"></div>
                  <div className="h-8 w-1/3 rounded bg-muted"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (facts.length === 0) {
    return (
      <section className="bg-muted/30 px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h3 className="mb-4 text-4xl font-bold text-foreground">
              Top Rated Facts
            </h3>
            <p className="text-pretty text-xl text-muted-foreground">
              No rated facts available at this time.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-muted/30 px-4 py-16">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h3 className="mb-4 text-4xl font-bold text-foreground">
            Top Rated Facts
          </h3>
          <p className="text-pretty text-xl text-muted-foreground">
            The most loved useless facts that users find &quot;Useful
            Uselessness&quot;
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {facts.map((fact, index) => (
            <Card
              key={fact.id}
              className={`border-primary/20 transition-all duration-300 hover:shadow-lg ${
                index < 3 ? "ring-primary/20 ring-2" : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {index < 3 ? (
                      <Trophy
                        className={`size-5 ${
                          index === 0
                            ? "text-yellow-500"
                            : index === 1
                            ? "text-gray-400"
                            : "text-amber-600"
                        }`}
                      />
                    ) : (
                      <Star className="size-5 text-primary" />
                    )}
                    #{index + 1} Most Loved
                  </CardTitle>
                  <Badge
                    variant={index < 3 ? "default" : "outline"}
                    className="px-3 py-1"
                  >
                    {fact.total_rating} points
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 leading-relaxed text-foreground">
                  {fact.text}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="size-4 text-green-600" />
                      <span className="text-sm text-muted-foreground">
                        {fact.rating_count} votes
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="size-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600">
                        {fact.total_rating > 0 ? "+" : ""}
                        {fact.total_rating}
                      </span>
                    </div>
                  </div>

                  {fact.source && (
                    <p className="text-sm text-muted-foreground">
                      Category: {fact.source}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            These facts have received the highest ratings for being &quot;Useful
            Uselessness&quot;
          </p>
        </div>
      </div>
    </section>
  )
}
