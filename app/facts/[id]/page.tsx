import { Metadata } from "next"
import { notFound } from "next/navigation"
import { ExternalLink, TrendingUp } from "lucide-react"

import { getFactById } from "@/lib/facts"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FactRatingButtons } from "@/components/fact-rating-buttons"
import { ShareButton } from "@/components/share-button"

interface FactPageProps {
  params: { id: string }
}

export async function generateMetadata({
  params,
}: FactPageProps): Promise<Metadata> {
  const fact = await getFactById(params.id)

  if (!fact) {
    return {
      title: "Fact Not Found",
    }
  }

  const title = `Useless Fact: ${fact.text.slice(0, 60)}${
    fact.text.length > 60 ? "..." : ""
  }`
  const description = fact.text

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `/facts/${params.id}`,
      siteName: "Useless Facts",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  }
}

export default async function FactPage({ params }: FactPageProps) {
  const fact = await getFactById(params.id)

  if (!fact) {
    notFound()
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card className="border-primary/20 border-2 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="px-3 py-1">
              {fact.fact_type === "realtime" ? "Real-Time Fact" : "Static Fact"}
            </Badge>
            <ShareButton factId={params.id} factText={fact.text} />
          </div>
          <CardTitle className="text-2xl leading-relaxed">
            {fact.text}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rating Display */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Rating:</span>
              <span className="text-2xl font-bold">{fact.total_rating}</span>
              <span className="text-sm text-muted-foreground">
                ({fact.rating_count} votes)
              </span>
              {fact.total_rating > 0 && (
                <TrendingUp className="h-5 w-5 text-green-500" />
              )}
            </div>
          </div>

          {/* Rating Buttons */}
          <FactRatingButtons factId={params.id} userRating={fact.user_rating} />

          {/* Source Information */}
          {fact.source && (
            <div className="border-t pt-4">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <p>
                  Based on: <strong>{fact.source}</strong>
                  <span className="ml-2 text-sm">
                    ({new Date(fact.created_at).toLocaleDateString()})
                  </span>
                </p>
                {fact.source_url && (
                  <a
                    href={fact.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary/80 inline-flex items-center gap-1 text-primary transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Read original article
                  </a>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Call to Action for Shared Link Visitors */}
      <div className="mt-8 text-center">
        <div className="bg-muted/30 rounded-lg border p-6">
          <h3 className="mb-3 text-xl font-semibold text-foreground">
            Enjoying this fact? 🎉
          </h3>
          <p className="mb-4 text-muted-foreground">
            This fact was shared with you from our collection of useless
            knowledge. Want to discover more amazing facts generated from
            today&apos;s news?
          </p>
          <a
            href="/#quick-facts"
            className="hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Explore Real-Time Facts
          </a>
        </div>
      </div>
    </div>
  )
}
