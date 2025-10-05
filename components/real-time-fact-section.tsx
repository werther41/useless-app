"use client"

import { useState } from "react"
import { Clock, ExternalLink, Wand2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface RealTimeFactProps {
  className?: string
}

export function RealTimeFactSection({ className }: RealTimeFactProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [fact, setFact] = useState<string>("")
  const [articleSource, setArticleSource] = useState<string>("")
  const [articleTitle, setArticleTitle] = useState<string>("")
  const [articleUrl, setArticleUrl] = useState<string>("")
  const [error, setError] = useState<string>("")

  const generateRealTimeFact = async () => {
    setIsLoading(true)
    setError("")
    setFact("")
    setArticleSource("")
    setArticleTitle("")
    setArticleUrl("")

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

      setArticleSource(source)
      setArticleTitle(title)
      setArticleUrl(url)

      // Handle streaming response
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No response body")
      }

      let fullFact = ""
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.type === "text-delta" && data.textDelta) {
                fullFact += data.textDelta
                setFact(fullFact)
              }
            } catch (e) {
              // Ignore JSON parse errors for streaming
            }
          }
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
    <section className={`px-4 py-12 ${className || ""}`}>
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
          <CardContent className="p-8">
            <div className="text-center">
              <div className="mb-8">
                <Button
                  onClick={generateRealTimeFact}
                  size="lg"
                  className="whitespace-nowrap px-6 py-3 text-base sm:px-8 sm:text-lg"
                  disabled={isLoading}
                >
                  <Wand2 className="mr-2 h-5 w-5" />
                  {isLoading ? "Generating from News..." : "Get Real-Time Fact"}
                </Button>
              </div>

              <div className="mb-8 flex min-h-[200px] items-center justify-center">
                {isLoading ? (
                  <div className="space-y-4">
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
                  <div className="space-y-4">
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
                  <div className="space-y-4">
                    <h3 className="text-balance text-xl font-semibold leading-relaxed text-foreground sm:text-2xl lg:text-3xl">
                      {fact}
                    </h3>
                    {articleSource && (
                      <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                        <p>
                          Based on news from: <strong>{articleSource}</strong>
                        </p>
                        {articleTitle && (
                          <p className="max-w-md text-center text-xs">
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
                  <h3 className="text-balance text-xl font-semibold leading-relaxed text-foreground sm:text-2xl lg:text-3xl">
                    Ready to discover a fact from today&apos;s news?
                  </h3>
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
