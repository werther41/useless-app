"use client"

import { useState } from "react"
import { Clock, ExternalLink, Wand2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

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

  const generateRealTimeFact = async () => {
    setIsLoading(true)
    setError("")
    setFact("")
    setArticleSource("")
    setArticleTitle("")
    setArticleUrl("")
    setArticleDate("")

    try {
      const response = await fetch("/api/facts/real-time", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

      setArticleSource(source)
      setArticleTitle(title)
      setArticleUrl(url)
      setArticleDate(date)

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
      try {
        const jsonResponse: FunFactResponse = JSON.parse(fullResponse)
        if (jsonResponse.funFact) {
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
          setFact(funFactMatch[1])
        } else {
          // If all else fails, keep the raw response
          console.log("Could not extract funFact, using raw text")
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
  }

  return (
    <section className={`px-2 sm:px-4 py-12 ${className || ""}`}>
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Wand2 className="h-6 w-6 text-primary" />
            <Badge variant="outline" className="px-4 py-2 text-lg">
              Real-Time News Facts
            </Badge>
          </div>
          <h2 className="text-balance mb-4 text-2xl font-semibold text-foreground">
            Facts from Today&apos;s News
          </h2>
          <p className="text-pretty text-lg text-muted-foreground">
            Get quirky fun facts generated from the latest news articles using
            AI
          </p>
        </div>

        <Card className="border-primary/20 border-2 shadow-lg">
          <CardContent className="p-4 sm:p-8">
            <div className="text-center">
              <div className="mb-8">
                <Button
                  onClick={generateRealTimeFact}
                  size="lg"
                  className="w-full sm:w-auto whitespace-nowrap px-6 py-3 text-base sm:px-8 sm:text-lg"
                  disabled={isLoading}
                >
                  <Wand2 className="mr-2 h-5 w-5" />
                  {isLoading ? "Generating from News..." : "Get Real-Time Fact"}
                </Button>
              </div>

              <div className="mb-8 flex min-h-[200px] items-center justify-center">
                {isLoading ? (
                  <div className="space-y-4 w-full max-w-2xl mx-auto">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-lg text-muted-foreground">
                        Analyzing news articles...
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This may take a few moments
                    </p>
                  </div>
                ) : error ? (
                  <div className="space-y-4 w-full max-w-2xl mx-auto">
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
                  <div className="space-y-4 w-full max-w-2xl mx-auto">
                    <h3 className="text-balance text-xl font-semibold leading-relaxed text-foreground sm:text-2xl lg:text-3xl">
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
                            <ExternalLink className="h-3 w-3" />
                            Read original article
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full max-w-2xl mx-auto">
                    <h3 className="text-balance text-xl font-semibold leading-relaxed text-foreground sm:text-2xl lg:text-3xl">
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
