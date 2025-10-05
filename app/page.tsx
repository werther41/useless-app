"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import {
  BookOpen,
  Star,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  Wand2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DeepDiveSection } from "@/components/deep-dive-section"
import { RealTimeFactSection } from "@/components/real-time-fact-section"

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
  data: Fact
  error?: string
}

const fetchRandomFact = async (): Promise<Fact> => {
  try {
    const response = await fetch("/api/facts/random")
    if (!response.ok) {
      throw new Error("Failed to fetch fact")
    }
    const data: ApiResponse = await response.json()

    if (!data.success) {
      throw new Error(data.error || "Failed to fetch fact")
    }

    return data.data
  } catch (error) {
    console.error("Error fetching fact:", error)
    // Fallback to a default fact if API fails
    return {
      id: "fallback-1",
      text: "The API is currently unavailable, but here's a fun fact: Bananas are berries, but strawberries aren't.",
      source: "Fallback",
      source_url: "#",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      total_rating: 0,
      rating_count: 0,
    }
  }
}

const rateFact = async (factId: string, rating: number): Promise<boolean> => {
  try {
    const response = await fetch(`/api/facts/${factId}/rate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rating }),
    })

    if (!response.ok) {
      throw new Error("Failed to submit rating")
    }

    const data = await response.json()
    return data.success
  } catch (error) {
    console.error("Error rating fact:", error)
    return false
  }
}

export default function UselessFactsHome() {
  const [currentFact, setCurrentFact] = useState<Fact | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [isCardFocused, setIsCardFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRating, setIsRating] = useState(false)
  const factCardRef = useRef<HTMLDivElement>(null)

  const generateNewFact = async () => {
    setIsLoading(true)
    setHasVoted(false)
    setIsCardFocused(true)

    try {
      const randomFact = await fetchRandomFact()
      setCurrentFact(randomFact)
      setHasVoted(!!randomFact.user_rating) // Set hasVoted if user already rated
    } catch (error) {
      console.error("Error generating fact:", error)
    } finally {
      setIsLoading(false)
    }

    // Scroll to the fact card with smooth behavior
    setTimeout(() => {
      factCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }, 100)
  }

  const handleVote = async (vote: "up" | "down") => {
    if (!currentFact || hasVoted || isRating) return

    setIsRating(true)
    const rating = vote === "up" ? 1 : -1

    try {
      const success = await rateFact(currentFact.id, rating)

      if (success) {
        // Update local state optimistically
        const updatedFact = {
          ...currentFact,
          total_rating: currentFact.total_rating + rating,
          rating_count: currentFact.rating_count + 1,
          user_rating: rating,
        }
        setCurrentFact(updatedFact)
        setHasVoted(true)
      }
    } catch (error) {
      console.error("Error submitting vote:", error)
    } finally {
      setIsRating(false)
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="px-4 py-8">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-6 flex items-center justify-center gap-2">
            <Star className="h-8 w-8 text-primary" />
            <Badge variant={"outline"} className="px-4 py-2 text-lg">
              Completely Useless Knowledge
            </Badge>
          </div>
          <h2 className="text-balance mb-6 text-3xl font-semibold text-foreground">
            Discover Facts You&apos;ll Never Need
          </h2>
          <p className="text-pretty mb-12 text-xl text-muted-foreground">
            Expand your mind with wonderfully pointless information that&apos;s
            guaranteed to impress absolutely no one.
          </p>
        </div>
      </section>

      {/* Main Fact Display */}
      <section id="quick-facts" className="p-4">
        <div className="container mx-auto max-w-3xl">
          <Card
            ref={factCardRef}
            className={`border-primary/20 border-2 shadow-lg transition-all duration-500 hover:shadow-xl ${
              isCardFocused
                ? "border-primary/40 ring-primary/10 scale-110 shadow-2xl"
                : "scale-100"
            }`}
          >
            <CardContent className="p-8">
              <div className="text-center">
                <div className="mb-8">
                  <Button
                    onClick={generateNewFact}
                    size="lg"
                    className="whitespace-nowrap px-4 py-3 text-base sm:px-8 sm:text-lg"
                    disabled={isLoading}
                  >
                    <Wand2 className="mr-2 h-5 w-5" />
                    {isLoading ? "Generating..." : "Generate New Fact"}
                  </Button>
                </div>

                <div className="mb-8 flex min-h-[200px] items-center justify-center">
                  {currentFact ? (
                    <div className="space-y-4">
                      <h3 className="text-balance text-xl font-semibold leading-relaxed text-foreground sm:text-2xl lg:text-3xl">
                        {currentFact.text}
                      </h3>
                      {currentFact.source && (
                        <p className="text-sm text-muted-foreground">
                          Category: {currentFact.source}
                        </p>
                      )}
                    </div>
                  ) : (
                    <h3 className="text-balance text-xl font-semibold leading-relaxed text-foreground sm:text-2xl lg:text-3xl">
                      Ready to discover something completely useless?
                    </h3>
                  )}
                </div>

                {currentFact && (
                  <>
                    <div className="mb-6 flex items-center justify-center gap-2">
                      <span className="text-muted-foreground">Rating:</span>
                      <span className="text-lg font-semibold">
                        {currentFact.total_rating}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({currentFact.rating_count} votes)
                      </span>
                      {currentFact.total_rating > 0 && (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      )}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
                      <Button
                        onClick={() => handleVote("up")}
                        disabled={hasVoted || isRating}
                        variant={
                          hasVoted && currentFact.user_rating === 1
                            ? "default"
                            : "outline"
                        }
                        size="lg"
                        className={`flex w-full items-center justify-center gap-2 whitespace-nowrap sm:w-auto ${
                          hasVoted && currentFact.user_rating === 1
                            ? "bg-green-600 text-white"
                            : "border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                        } disabled:bg-muted disabled:text-muted-foreground`}
                      >
                        <ThumbsUp className="h-5 w-5" />
                        Useful Uselessness
                      </Button>
                      <Button
                        onClick={() => handleVote("down")}
                        disabled={hasVoted || isRating}
                        variant={
                          hasVoted && currentFact.user_rating === -1
                            ? "default"
                            : "outline"
                        }
                        size="lg"
                        className={`flex w-full items-center justify-center gap-2 whitespace-nowrap sm:w-auto ${
                          hasVoted && currentFact.user_rating === -1
                            ? "bg-red-600 text-white"
                            : "border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                        } disabled:bg-muted disabled:text-muted-foreground`}
                      >
                        <ThumbsDown className="h-5 w-5" />
                        Too Useless
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Statistics Link Section */}
      <section className="px-4 py-12">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-pretty text-lg text-muted-foreground">
            Want to see how our useless facts are performing? Check out our{" "}
            <Link
              href="/statistics"
              className="hover:text-primary/80 text-primary underline underline-offset-4 transition-colors"
            >
              comprehensive statistics and rankings
            </Link>{" "}
            to discover the most loved and hated facts in our collection.
          </p>
        </div>
      </section>

      {/* Real-Time News Facts Section */}
      <RealTimeFactSection />

      {/* Infographics Preview Section */}
      <DeepDiveSection sectionId="infographics" />

      {/* Footer */}
      <footer className="border-t border-border px-4 py-12">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-muted-foreground">
            © 2024 Useless Facts. Making the world slightly more informed about
            completely irrelevant things.
          </p>
        </div>
      </footer>
    </div>
  )
}
