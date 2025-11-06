import Link from "next/link"
import { Calendar, Clock, User } from "lucide-react"

import { getAllDeepDiveArticles } from "@/lib/deep-dive"
import { Button } from "@/components/ui/button"
import { DeepDiveSection } from "@/components/deep-dive-section"
import { Footer } from "@/components/footer"

export default function DeepDivePage() {
  const articles = getAllDeepDiveArticles()
  return (
    <div>
      {/* Hero Section */}
      <section className="px-4 py-8">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold text-foreground">Deep Dive</h1>
          <p className="text-pretty mb-12 text-xl text-muted-foreground">
            Immerse yourself in comprehensive explorations of the most
            wonderfully pointless topics. From detailed infographics to in-depth
            articles, discover the hidden depths of useless knowledge.
          </p>
        </div>
      </section>

      {/* Featured Deep Dive Section */}
      <DeepDiveSection
        title="Featured Deep Dive Infographics"
        subtitle="Explore complex useless topics with beautiful, detailed infographics"
      />

      {/* Deep Dive Articles Section */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Deep Dive Articles
            </h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive explorations of wonderfully pointless topics
            </p>
          </div>

          <div className="max-w-4xl">
            {articles.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No deep-dive articles available yet. Check back soon!
              </p>
            ) : (
              articles.map((article) => (
                <article
                  key={article.slug}
                  className="mb-8 border-b pb-6 last:border-b-0"
                >
                  <h3 className="text-xl font-semibold leading-snug">
                    <Link
                      href={`/deep-dive/${article.slug}`}
                      className="hover:text-primary"
                    >
                      {article.title}
                    </Link>
                  </h3>
                  <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <time dateTime={article.date}>
                        {new Date(article.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </time>
                    </span>
                    {article.updatedDate &&
                    article.updatedDate !== article.date ? (
                      <>
                        {" · Updated "}
                        {new Date(article.updatedDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </>
                    ) : null}
                    {" · "}
                    <span className="inline-flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {article.author}
                    </span>
                  </p>
                  <p className="mt-3 text-base leading-relaxed">
                    {article.excerpt}
                  </p>
                  {article.tags && article.tags.length > 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Tags: {article.tags.join(", ")}
                    </p>
                  ) : null}
                  <p className="mt-3">
                    <Button variant="ghost" asChild className="mb-6">
                      <Link
                        href={`/deep-dive/${article.slug}`}
                        className="flex items-center gap-2"
                      >
                        Read more →
                      </Link>
                    </Button>
                  </p>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
