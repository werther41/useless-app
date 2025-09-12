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

interface Fact {
  id: string
  text: string
  rating: number
  source?: string
  source_url?: string
}

interface ApiFactResponse {
  id: string
  text: string
  source: string
  source_url: string
  language: string
  permalink: string
}

const fetchRandomFact = async (): Promise<Fact> => {
  try {
    const response = await fetch(
      "https://uselessfacts.jsph.pl/api/v2/facts/random?language=en"
    )
    if (!response.ok) {
      throw new Error("Failed to fetch fact")
    }
    const data: ApiFactResponse = await response.json()

    // Generate a random rating between -5 and 5 for the new fact
    const randomRating = Math.floor(Math.random() * 11) - 5

    return {
      id: data.id,
      text: data.text,
      rating: randomRating,
      source: data.source,
      source_url: data.source_url,
    }
  } catch (error) {
    console.error("Error fetching fact:", error)
    // Fallback to a default fact if API fails
    return {
      id: "fallback-1",
      text: "The API is currently unavailable, but here's a fun fact: Bananas are berries, but strawberries aren't.",
      rating: 0,
      source: "Fallback",
      source_url: "#",
    }
  }
}

export default function UselessFactsHome() {
  const [currentFact, setCurrentFact] = useState<Fact | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [isCardFocused, setIsCardFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const factCardRef = useRef<HTMLDivElement>(null)

  const generateNewFact = async () => {
    setIsLoading(true)
    setHasVoted(false)
    setIsCardFocused(true)

    try {
      const randomFact = await fetchRandomFact()
      setCurrentFact(randomFact)
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

  const handleVote = (vote: "up" | "down") => {
    if (!currentFact || hasVoted) return

    const updatedFact = {
      ...currentFact,
      rating: currentFact.rating + (vote === "up" ? 1 : -1),
    }
    setCurrentFact(updatedFact)
    setHasVoted(true)
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
                    className="px-8 py-3 text-lg"
                    disabled={isLoading}
                  >
                    <Wand2 className="mr-2 h-5 w-5" />
                    {isLoading ? "Generating..." : "Generate New Fact"}
                  </Button>
                </div>

                <div className="mb-8 flex min-h-[200px] items-center justify-center">
                  {currentFact ? (
                    <div className="space-y-4">
                      <h3 className="text-balance text-3xl font-semibold leading-relaxed text-foreground">
                        {currentFact.text}
                      </h3>
                      {currentFact.source && (
                        <p className="text-sm text-muted-foreground">
                          Source:{" "}
                          <a
                            href={currentFact.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {currentFact.source}
                          </a>
                        </p>
                      )}
                    </div>
                  ) : (
                    <h3 className="text-balance text-3xl font-semibold leading-relaxed text-foreground">
                      Ready to discover something completely useless?
                    </h3>
                  )}
                </div>

                {currentFact && (
                  <>
                    <div className="mb-6 flex items-center justify-center gap-2">
                      <span className="text-muted-foreground">Rating:</span>
                      <span className="text-lg font-semibold">
                        {currentFact.rating}
                      </span>
                      {currentFact.rating > 0 && (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-4">
                      <Button
                        onClick={() => handleVote("up")}
                        disabled={hasVoted}
                        variant={hasVoted ? "secondary" : "default"}
                        size="lg"
                        className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 disabled:bg-muted disabled:text-muted-foreground"
                      >
                        <ThumbsUp className="h-5 w-5" />
                        Useful Uselessness
                      </Button>
                      <Button
                        onClick={() => handleVote("down")}
                        disabled={hasVoted}
                        variant="outline"
                        size="lg"
                        className="flex items-center gap-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white disabled:border-muted disabled:text-muted-foreground disabled:hover:bg-muted disabled:hover:text-muted-foreground"
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

      {/* Infographics Preview Section */}
      <section id="infographics" className="bg-muted/30 px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h3 className="mb-4 text-4xl font-bold text-foreground">
              Deep Dive Infographics
            </h3>
            <p className="text-pretty text-xl text-muted-foreground">
              Explore complex useless topics with beautiful, detailed
              infographics
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Sample Infographic Cards */}
            <Link href="/burger-infographic">
              <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="from-primary/20 to-accent/20 mb-4 flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br">
                    <BookOpen className="h-12 w-12 text-primary" />
                  </div>
                  <h4 className="mb-2 text-xl font-semibold">
                    Should You Flip Your Burger?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    A comprehensive analysis of burger flipping techniques and
                    their impact on taste.
                  </p>
                  <Badge variant="default" className="mt-3">
                    Available Now
                  </Badge>
                </CardContent>
              </Card>
            </Link>

            <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="from-accent/20 to-primary/20 mb-4 flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br">
                  <BookOpen className="h-12 w-12 text-accent" />
                </div>
                <h4 className="mb-2 text-xl font-semibold">
                  The Science of Sock Pairing
                </h4>
                <p className="text-sm text-muted-foreground">
                  Mathematical models for optimal sock matching strategies in
                  your drawer.
                </p>
                <Badge variant="outline" className="mt-3">
                  Coming Soon
                </Badge>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="from-primary/20 to-accent/20 mb-4 flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br">
                  <BookOpen className="h-12 w-12 text-primary" />
                </div>
                <h4 className="mb-2 text-xl font-semibold">
                  Optimal Cereal-to-Milk Ratios
                </h4>
                <p className="text-sm text-muted-foreground">
                  A data-driven approach to achieving breakfast perfection.
                </p>
                <Badge variant="outline" className="mt-3">
                  Coming Soon
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

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
