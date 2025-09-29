"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Skull, 
  ThumbsDown, 
  TrendingDown,
  AlertTriangle,
  ExternalLink
} from "lucide-react"

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

const fetchBottomRatedFacts = async (limit = 10): Promise<Fact[]> => {
  try {
    const response = await fetch(`/api/facts/bottom-rated?limit=${limit}`)
    if (!response.ok) {
      throw new Error("Failed to fetch bottom rated facts")
    }
    const data: ApiResponse = await response.json()

    if (!data.success) {
      throw new Error(data.error || "Failed to fetch bottom rated facts")
    }

    return data.data
  } catch (error) {
    console.error("Error fetching bottom rated facts:", error)
    return []
  }
}

export default function BottomRatedFactsSection() {
  const [facts, setFacts] = useState<Fact[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadFacts = async () => {
      setIsLoading(true)
      const data = await fetchBottomRatedFacts(10)
      setFacts(data)
      setIsLoading(false)
    }

    loadFacts()
  }, [])

  if (isLoading) {
    return (
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h3 className="mb-4 text-4xl font-bold text-foreground">
              Bottom Rated Facts
            </h3>
            <p className="text-pretty text-xl text-muted-foreground">
              Loading the most hated useless facts...
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
                  <div className="h-6 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-muted rounded w-1/3"></div>
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
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h3 className="mb-4 text-4xl font-bold text-foreground">
              Bottom Rated Facts
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
    <section className="px-4 py-16">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h3 className="mb-4 text-4xl font-bold text-foreground">
            Bottom Rated Facts
          </h3>
          <p className="text-pretty text-xl text-muted-foreground">
            The most hated useless facts that users find "Too Useless"
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {facts.map((fact, index) => (
            <Card 
              key={fact.id} 
              className={`border-red-200 hover:shadow-lg transition-all duration-300 ${
                index < 3 ? "ring-2 ring-red-200" : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {index < 3 ? (
                      <Skull className={`h-5 w-5 ${
                        index === 0 ? "text-red-600" : 
                        index === 1 ? "text-red-500" : 
                        "text-red-400"
                      }`} />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                    #{index + 1} Most Hated
                  </CardTitle>
                  <Badge 
                    variant="destructive"
                    className="px-3 py-1"
                  >
                    {fact.total_rating} points
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground mb-4 leading-relaxed">
                  {fact.text}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <ThumbsDown className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-muted-foreground">
                        {fact.rating_count} votes
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium text-red-600">
                        {fact.total_rating}
                      </span>
                    </div>
                  </div>
                  
                  {fact.source && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="text-primary hover:text-primary/80"
                    >
                      <a
                        href={fact.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {fact.source}
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            These facts have received the lowest ratings for being "Too Useless"
          </p>
        </div>
      </div>
    </section>
  )
}