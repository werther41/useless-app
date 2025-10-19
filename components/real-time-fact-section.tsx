"use client"

import { useRef, useState } from "react"
import {
  Clock,
  ExternalLink,
  Share2,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  Wand2,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TopicSelector } from "@/components/topic-selector"

interface FunFactResponse {
  funFact: string
}

interface RealTimeFactProps {
  className?: string
}

export function RealTimeFactSection({ className }: RealTimeFactProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [fact, setFact] = useState<string>("")
  const [articleSource, setArticleSource] = useState<string>("")
  const [articleTitle, setArticleTitle] = useState<string>("")
  const [articleUrl, setArticleUrl] = useState<string>("")
  const [articleDate, setArticleDate] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [matchedTopics, setMatchedTopics] = useState<string[]>([])
  const [savedFactId, setSavedFactId] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [isRating, setIsRating] = useState(false)
  const [isCardFocused, setIsCardFocused] = useState(false)
  const factCardRef = useRef<HTMLDivElement>(null)

  const generateRealTimeFact = async () => {
    setIsLoading(true)
    setError("")
    setFact("")
    setArticleSource("")
    setArticleTitle("")
    setArticleUrl("")
    setArticleDate("")
    setMatchedTopics([])
    setSavedFactId(null)
    setHasVoted(false)
    setIsCardFocused(true)

    try {
      const response = await fetch("/api/facts/real-time", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedTopics: selectedTopics,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate fact")
      }

      // Get metadata from headers
      const source = response.headers.get("X-Article-Source") || "Unknown"
      const url = response.headers.get("X-Article-URL") || ""
      const title = response.headers.get("X-Article-Title") || ""
      const date = response.headers.get("X-Article-Date") || ""
      const matchedTopicsHeader = response.headers.get("X-Matched-Topics") || ""

      setArticleSource(source)
      setArticleTitle(title)
      setArticleUrl(url)
      setArticleDate(date)
      setMatchedTopics(
        matchedTopicsHeader ? matchedTopicsHeader.split(", ") : []
      )

      // Store these values for later use in saving
      // Use article title as source since we only have source and source_url fields
      const articleSourceForSave = title || source
      const articleUrlForSave = url

      // Handle streaming response
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No response body")
      }

      let fullResponse = ""
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        // For toTextStreamResponse(), the content comes directly as text
        if (chunk.trim()) {
          fullResponse += chunk
          // Show streaming text while building
          setFact(fullResponse)
        }
      }

      // Try to parse the final response as JSON
      let finalFactText = ""
      try {
        const jsonResponse: FunFactResponse = JSON.parse(fullResponse)
        if (jsonResponse.funFact) {
          finalFactText = jsonResponse.funFact
          setFact(jsonResponse.funFact)
        }
      } catch (error) {
        // If JSON parsing fails, try to extract the funFact from the text
        console.log(
          "Could not parse JSON response, trying to extract funFact:",
          error
        )
        const funFactMatch = fullResponse.match(/"funFact":\s*"([^"]+)"/)
        if (funFactMatch && funFactMatch[1]) {
          finalFactText = funFactMatch[1]
          setFact(funFactMatch[1])
        } else {
          // If all else fails, keep the raw response
          finalFactText = fullResponse.trim()
          console.log("Could not extract funFact, using raw text")
        }
      }

      // Save the fact to database
      if (finalFactText) {
        try {
          const saveResponse = await fetch("/api/facts/save-realtime", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: finalFactText,
              source: articleSourceForSave,
              source_url: articleUrlForSave,
            }),
          })

          if (saveResponse.ok) {
            const saveData = await saveResponse.json()
            if (saveData.success) {
              setSavedFactId(saveData.data.id)
              console.log("Fact saved with ID:", saveData.data.id)
            }
          }
        } catch (saveError) {
          console.error("Error saving fact:", saveError)
        }
      }
    } catch (error) {
      console.error("Error generating real-time fact:", error)
      setError(
        error instanceof Error ? error.message : "Failed to generate fact"
      )
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

  const rateFact = async (rating: number) => {
    if (!savedFactId || hasVoted || isRating) return

    setIsRating(true)
    try {
      const response = await fetch(`/api/facts/${savedFactId}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating }),
      })

      if (response.ok) {
        setHasVoted(true)
      }
    } catch (error) {
      console.error("Error rating fact:", error)
    } finally {
      setIsRating(false)
    }
  }

  const handleShare = async () => {
    if (!savedFactId) return

    const shareUrl = `${window.location.origin}/facts/${savedFactId}`
    const shareData = {
      title: "Useless Fact",
      text: fact,
      url: shareUrl,
    }

    try {
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData)
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl)
        alert("Link copied to clipboard!")
      }
    } catch (error) {
      console.error("Error sharing:", error)
      // Final fallback
      try {
        await navigator.clipboard.writeText(shareUrl)
        alert("Link copied to clipboard!")
      } catch (clipboardError) {
        console.error("Error copying to clipboard:", clipboardError)
        alert("Unable to share. Please copy the URL manually.")
      }
    }
  }

  return (
    <section className={`p-2 ${className || ""}`}>
      <div className="container mx-auto max-w-5xl">
        <div className="mb-6 text-center">
          <h2 className="mb-4 text-balance text-2xl font-semibold text-foreground">
            Facts from Today&apos;s News
          </h2>
          <p className="text-pretty text-lg text-muted-foreground">
            Get quirky fun facts generated from the latest news articles using
            AI
          </p>
        </div>

        <Card
          ref={factCardRef}
          className={`border-primary/20 border-2 shadow-lg transition-all duration-500 hover:shadow-xl ${
            isCardFocused
              ? "border-primary/40 ring-primary/10 scale-110 shadow-2xl"
              : "scale-100"
          }`}
        >
          <CardContent className="p-4 sm:p-8">
            <div className="text-center">
              {/* Topic Selector */}
              <div className="mb-6">
                <TopicSelector
                  onTopicsChange={setSelectedTopics}
                  maxSelection={2}
                  className="mb-4"
                />
              </div>

              <div className="mb-8">
                <Button
                  onClick={generateRealTimeFact}
                  size="lg"
                  className="w-full whitespace-nowrap px-6 py-3 text-base sm:w-auto sm:px-8 sm:text-lg"
                  disabled={isLoading}
                >
                  <Wand2 className="mr-2 h-5 w-5" />
                  {isLoading ? "Generating from News..." : "Get Real-Time Fact"}
                </Button>
              </div>

              <div className="mb-8 flex min-h-[200px] items-center justify-center">
                {isLoading ? (
                  <div className="mx-auto w-full max-w-2xl space-y-4">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-base text-muted-foreground sm:text-lg">
                        Analyzing news articles...
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      This may take a few moments
                    </p>
                  </div>
                ) : error ? (
                  <div className="mx-auto w-full max-w-2xl space-y-4">
                    <h3 className="text-xl font-semibold text-red-600">
                      Error generating fact
                    </h3>
                    <p className="text-muted-foreground">{error}</p>
                    <Button
                      onClick={generateRealTimeFact}
                      variant="outline"
                      size="sm"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : fact ? (
                  <div className="mx-auto w-full max-w-2xl space-y-4">
                    <h3 className="text-balance text-lg font-semibold leading-relaxed text-foreground sm:text-2xl lg:text-3xl">
                      {fact}
                    </h3>
                    {articleSource && (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <p>
                          Based on news from: <strong>{articleSource}</strong>
                          {articleDate && (
                            <span className="ml-2 text-sm">
                              ({new Date(articleDate).toLocaleDateString()})
                            </span>
                          )}
                        </p>
                        {articleTitle && (
                          <p className="max-w-md text-center">
                            &quot;{articleTitle}&quot;
                          </p>
                        )}
                        {articleUrl && (
                          <a
                            href={articleUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary/80 inline-flex items-center gap-1 text-primary transition-colors"
                          >
                            <ExternalLink className="size-3" />
                            Read original article
                          </a>
                        )}
                        {matchedTopics.length > 0 && (
                          <div className="mt-3">
                            <p className="mb-2 text-sm text-muted-foreground">
                              Matched topics:
                            </p>
                            <div className="flex flex-wrap justify-center gap-1">
                              {matchedTopics.map((topic, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="bg-primary/10 text-xs text-primary"
                                >
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Rating and Share Buttons */}
                    {savedFactId && (
                      <div className="mt-6 space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
                          <Button
                            onClick={() => rateFact(1)}
                            disabled={hasVoted || isRating}
                            variant="outline"
                            size="lg"
                            className={`flex w-full items-center justify-center gap-2 whitespace-nowrap sm:w-auto ${
                              hasVoted
                                ? "bg-green-600 text-white"
                                : "border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                            } disabled:bg-muted disabled:text-muted-foreground`}
                          >
                            <ThumbsUp className="h-5 w-5" />
                            Useful Uselessness
                          </Button>
                          <Button
                            onClick={() => rateFact(-1)}
                            disabled={hasVoted || isRating}
                            variant="outline"
                            size="lg"
                            className={`flex w-full items-center justify-center gap-2 whitespace-nowrap sm:w-auto ${
                              hasVoted
                                ? "bg-red-600 text-white"
                                : "border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                            } disabled:bg-muted disabled:text-muted-foreground`}
                          >
                            <ThumbsDown className="h-5 w-5" />
                            Too Useless
                          </Button>
                        </div>

                        <div className="flex justify-center">
                          <Button
                            onClick={handleShare}
                            variant="outline"
                            size="lg"
                            className="flex items-center gap-2"
                          >
                            <Share2 className="h-5 w-5" />
                            Share This Fact
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mx-auto w-full max-w-2xl">
                    <h3 className="text-balance text-lg font-semibold leading-relaxed text-foreground sm:text-2xl lg:text-3xl">
                      Ready to discover a fact from today&apos;s news?
                    </h3>
                  </div>
                )}
              </div>

              {!isLoading && !fact && !error && (
                <div className="text-center">
                  <p className="mb-4 text-sm text-muted-foreground">
                    Our AI analyzes recent news articles to create surprising
                    and useless fun facts
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
