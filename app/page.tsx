import Link from "next/link"
import { Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { DeepDiveSection } from "@/components/deep-dive-section"
import { FactTabs } from "@/components/fact-tabs"
import { Footer } from "@/components/footer"

export default function UselessFactsHome() {
  return (
    <div>
      {/* Hero Section */}
      <section className="px-4 py-8">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-balance text-3xl font-semibold text-foreground">
            Discover Facts You&apos;ll Never Need
          </h2>
          <p className="mb-6 text-pretty text-xl text-muted-foreground">
            Expand your mind with wonderfully pointless information that&apos;s
            guaranteed to impress absolutely no one.
          </p>
        </div>
      </section>

      {/* Fact Tabs Section */}
      <FactTabs />

      {/* Statistics Link Section */}
      <section className="px-4 py-8">
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
          <p className="mt-6 text-pretty text-lg text-muted-foreground">
            Prefer to browse everything yourself? Explore our full catalog on
            the{" "}
            <Link
              href="/facts"
              className="hover:text-primary/80 text-primary underline underline-offset-4 transition-colors"
            >
              All Facts
            </Link>{" "}
            page, or discover trending news articles with our{" "}
            <Link
              href="/discover"
              className="hover:text-primary/80 text-primary underline underline-offset-4 transition-colors"
            >
              Article Discovery
            </Link>{" "}
            feature.
          </p>
        </div>
      </section>

      {/* Infographics Preview Section */}
      <DeepDiveSection sectionId="infographics" />

      {/* Footer */}
      <Footer />
    </div>
  )
}
